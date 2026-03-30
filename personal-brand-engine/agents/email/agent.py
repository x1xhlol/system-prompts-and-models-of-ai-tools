"""EmailAgent -- monitors, classifies, and responds to Gmail messages."""

from __future__ import annotations

import email
import imaplib
import smtplib
import ssl
from email.header import decode_header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from agents.base_agent import BaseAgent
from agents.email.classifier import classify_email
from agents.email.responder import draft_response
from storage.models import Email
from utils.logger import get_logger

logger = get_logger(__name__)


def _decode_header_value(raw: str | None) -> str:
    """Safely decode an RFC-2047 encoded header value."""
    if raw is None:
        return ""
    decoded_parts: list[str] = []
    for part, charset in decode_header(raw):
        if isinstance(part, bytes):
            decoded_parts.append(part.decode(charset or "utf-8", errors="replace"))
        else:
            decoded_parts.append(part)
    return " ".join(decoded_parts)


def _extract_body(msg: email.message.Message) -> str:
    """Extract the plain-text body from a potentially multipart message."""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))
            if content_type == "text/plain" and "attachment" not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    return payload.decode(charset, errors="replace")
        # Fallback: try text/html if no plain text found
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    return payload.decode(charset, errors="replace")
        return ""
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            charset = msg.get_content_charset() or "utf-8"
            return payload.decode(charset, errors="replace")
        return ""


class EmailAgent(BaseAgent):
    """Agent that manages Sami Assiri's Gmail inbox.

    Supported tasks:
        - ``check_inbox``  -- fetch unread emails, classify, draft responses
        - ``send_scheduled`` -- send any queued draft responses via SMTP
    """

    agent_name: str = "email"

    _SUPPORTED_TASKS = {"check_inbox", "send_scheduled"}

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    async def run(self, task: str, **kwargs: Any) -> dict:
        """Dispatch *task* to the appropriate handler."""
        if task not in self._SUPPORTED_TASKS:
            self.log_action(
                f"unknown_task:{task}",
                details=f"Unsupported task: {task}",
                status="failed",
            )
            return {"status": "error", "message": f"Unknown task: {task}"}

        handler = getattr(self, task)
        with self.timer() as t:
            result = await handler(**kwargs)
        self.log_action(task, details=str(result), duration=t.elapsed)
        return result

    # ------------------------------------------------------------------
    # check_inbox
    # ------------------------------------------------------------------

    async def check_inbox(self, **kwargs: Any) -> dict:
        """Connect to IMAP, fetch unread emails, classify, and draft responses."""
        imap: imaplib.IMAP4_SSL | None = None
        processed = 0
        urgent_count = 0
        errors: list[str] = []

        try:
            imap = self._connect_imap()
            imap.select("INBOX")

            status, data = imap.search(None, "UNSEEN")
            if status != "OK" or not data or not data[0]:
                self.log_action("check_inbox", details="No unread emails found")
                return {"status": "ok", "processed": 0, "urgent": 0}

            message_ids = data[0].split()
            logger.info(
                "email_fetch",
                count=len(message_ids),
                message="Fetching unread emails",
            )

            for msg_id in message_ids:
                try:
                    await self._process_message(imap, msg_id)
                    processed += 1
                except Exception as exc:
                    err_msg = f"Failed to process message {msg_id}: {exc}"
                    logger.error("email_process_error", error=str(exc))
                    errors.append(err_msg)

            self.db.commit()

            # Count urgent emails from this batch
            urgent_count = (
                self.db.query(Email)
                .filter(
                    Email.classification == "urgent",
                    Email.status == "drafted",
                )
                .count()
            )

            if urgent_count > 0:
                await self.notify_owner(
                    f"You have {urgent_count} urgent email(s) "
                    f"requiring attention. {processed} total emails processed."
                )

        except imaplib.IMAP4.error as exc:
            self.log_action(
                "check_inbox",
                details=f"IMAP error: {exc}",
                status="failed",
            )
            return {"status": "error", "message": f"IMAP error: {exc}"}
        except Exception as exc:
            self.log_action(
                "check_inbox",
                details=f"Unexpected error: {exc}",
                status="failed",
            )
            return {"status": "error", "message": str(exc)}
        finally:
            if imap is not None:
                try:
                    imap.close()
                    imap.logout()
                except Exception:
                    pass

        return {
            "status": "ok",
            "processed": processed,
            "urgent": urgent_count,
            "errors": errors,
        }

    async def _process_message(
        self, imap: imaplib.IMAP4_SSL, msg_id: bytes
    ) -> None:
        """Fetch, classify, and optionally draft a reply for a single message."""
        status, msg_data = imap.fetch(msg_id, "(RFC822)")
        if status != "OK" or not msg_data or not msg_data[0]:
            return

        raw_email = msg_data[0][1]  # type: ignore[index]
        msg = email.message_from_bytes(raw_email)

        from_addr = _decode_header_value(msg.get("From", ""))
        to_addr = _decode_header_value(msg.get("To", ""))
        subject = _decode_header_value(msg.get("Subject", ""))
        body = _extract_body(msg)

        # Truncate body for classification to avoid token limits
        body_preview = body[:3000] if body else ""

        classification = await classify_email(
            self.llm, subject, body_preview, from_addr
        )

        email_record = Email(
            from_addr=from_addr,
            to_addr=to_addr,
            subject=subject,
            body=body,
            classification=classification,
            status="unread",
        )

        # Draft a response for urgent and reply_needed emails
        if classification in ("urgent", "reply_needed"):
            brand_profile = self.get_brand_profile()
            response_text = await draft_response(
                self.llm, subject, body_preview, brand_profile, classification
            )
            email_record.draft_response = response_text
            email_record.status = "drafted"
            logger.info(
                "email_drafted",
                subject=subject,
                classification=classification,
                from_addr=from_addr,
            )
        else:
            email_record.status = "archived"

        self.db.add(email_record)

    # ------------------------------------------------------------------
    # send_scheduled
    # ------------------------------------------------------------------

    async def send_scheduled(self, **kwargs: Any) -> dict:
        """Send all queued draft responses via SMTP."""
        drafts = (
            self.db.query(Email)
            .filter(Email.status == "drafted")
            .filter(Email.draft_response.isnot(None))
            .all()
        )

        if not drafts:
            self.log_action("send_scheduled", details="No drafts to send")
            return {"status": "ok", "sent": 0}

        sent = 0
        errors: list[str] = []

        try:
            smtp = self._connect_smtp()

            for record in drafts:
                try:
                    self._send_single(smtp, record)
                    record.status = "sent"
                    sent += 1
                    logger.info(
                        "email_sent",
                        to=record.from_addr,
                        subject=f"Re: {record.subject}",
                    )
                except Exception as exc:
                    err_msg = f"Failed to send reply to {record.from_addr}: {exc}"
                    logger.error("email_send_error", error=str(exc))
                    errors.append(err_msg)

            smtp.quit()
            self.db.commit()

        except smtplib.SMTPException as exc:
            self.log_action(
                "send_scheduled",
                details=f"SMTP error: {exc}",
                status="failed",
            )
            return {"status": "error", "message": f"SMTP error: {exc}"}
        except Exception as exc:
            self.log_action(
                "send_scheduled",
                details=f"Unexpected error: {exc}",
                status="failed",
            )
            return {"status": "error", "message": str(exc)}

        return {"status": "ok", "sent": sent, "errors": errors}

    def _send_single(self, smtp: smtplib.SMTP, record: Email) -> None:
        """Compose and send a single reply email."""
        msg = MIMEMultipart()
        msg["From"] = self.config.email_address
        msg["To"] = record.from_addr
        msg["Subject"] = f"Re: {record.subject}"
        msg["In-Reply-To"] = ""
        msg.attach(MIMEText(record.draft_response, "plain", "utf-8"))
        smtp.sendmail(
            self.config.email_address,
            [record.from_addr],
            msg.as_string(),
        )

    # ------------------------------------------------------------------
    # Connection helpers
    # ------------------------------------------------------------------

    def _connect_imap(self) -> imaplib.IMAP4_SSL:
        """Establish an authenticated IMAP-SSL connection."""
        ctx = ssl.create_default_context()
        imap = imaplib.IMAP4_SSL(
            self.config.imap_host,
            self.config.imap_port,
            ssl_context=ctx,
        )
        imap.login(self.config.email_address, self.config.email_password)
        return imap

    def _connect_smtp(self) -> smtplib.SMTP:
        """Establish an authenticated SMTP connection with STARTTLS."""
        smtp = smtplib.SMTP(self.config.smtp_host, self.config.smtp_port)
        smtp.ehlo()
        smtp.starttls(context=ssl.create_default_context())
        smtp.ehlo()
        smtp.login(self.config.email_address, self.config.email_password)
        return smtp
