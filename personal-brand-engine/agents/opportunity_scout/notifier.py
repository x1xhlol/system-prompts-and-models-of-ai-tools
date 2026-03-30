"""Notification helpers for the Opportunity Scout agent.

Sends opportunity alerts and daily digests via WhatsApp (Meta Cloud API
or Twilio), email (SMTP), and Telegram (via the shared notification util).
Messages are formatted bilingually (Arabic + English) with clear structure.
"""

from __future__ import annotations

import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

import httpx

from utils.logger import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Message formatting
# ---------------------------------------------------------------------------

def _format_opportunity_message(opp: dict) -> str:
    """Build a nicely formatted bilingual opportunity message."""
    score = opp.get("relevance_score", 0.0) or 0.0
    score_pct = int(score * 100)

    # Score-based indicator
    if score >= 0.8:
        indicator = "\U0001f525\U0001f525\U0001f525"  # fire
    elif score >= 0.6:
        indicator = "\u2b50\u2b50"  # stars
    elif score >= 0.4:
        indicator = "\U0001f4a1"  # lightbulb
    else:
        indicator = "\U0001f4cb"  # clipboard

    lines = [
        f"{indicator}  \u0641\u0631\u0635\u0629 \u062c\u062f\u064a\u062f\u0629 / New Opportunity",
        "",
        f"\U0001f4cc  {opp.get('title', 'N/A')}",
        f"\U0001f3e2  {opp.get('company', 'N/A')}",
        f"\U0001f4ca  \u0627\u0644\u062a\u0648\u0627\u0641\u0642 / Relevance: {score_pct}%",
        f"\U0001f310  {opp.get('source', 'N/A')}",
    ]

    if opp.get("url"):
        lines.append(f"\U0001f517  {opp['url']}")

    desc = (opp.get("description") or "")[:300]
    if desc:
        lines.append(f"\n\U0001f4dd  {desc}")

    return "\n".join(lines)


def _format_digest_message(opportunities: list[dict]) -> str:
    """Build a daily digest summarizing all opportunities found."""
    now = datetime.utcnow().strftime("%Y-%m-%d")

    header = (
        f"\U0001f4e8  \u0627\u0644\u0645\u0644\u062e\u0635 \u0627\u0644\u064a\u0648\u0645\u064a / Daily Digest -- {now}\n"
        f"\u2500" * 30 + "\n"
        f"\U0001f50d  \u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 {len(opportunities)} "
        f"\u0641\u0631\u0635\u0629 / {len(opportunities)} opportunities found\n"
    )

    if not opportunities:
        return header + "\n\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u0631\u0635 \u062c\u062f\u064a\u062f\u0629 \u0627\u0644\u064a\u0648\u0645 / No new opportunities today."

    # Sort by relevance descending
    sorted_opps = sorted(
        opportunities,
        key=lambda o: o.get("relevance_score", 0) or 0,
        reverse=True,
    )

    sections: list[str] = [header]
    for i, opp in enumerate(sorted_opps[:15], start=1):
        score = opp.get("relevance_score", 0.0) or 0.0
        score_pct = int(score * 100)
        sections.append(
            f"{i}. [{score_pct}%] {opp.get('title', 'N/A')}\n"
            f"   \U0001f3e2 {opp.get('company', 'N/A')}  |  \U0001f310 {opp.get('source', '')}\n"
            f"   {opp.get('url', '')}"
        )

    remaining = len(opportunities) - 15
    if remaining > 0:
        sections.append(f"\n... \u0648 {remaining} \u0641\u0631\u0635\u0629 \u0623\u062e\u0631\u0649 / and {remaining} more")

    sections.append(
        "\n\u2500" * 30
        + "\n\U0001f916  Opportunity Scout Bot -- Sami Assiri"
    )
    return "\n".join(sections)


# ---------------------------------------------------------------------------
# WhatsApp -- Meta Cloud API / Twilio
# ---------------------------------------------------------------------------

async def send_whatsapp_notification(settings: Any, opportunity: dict) -> bool:
    """Send a single opportunity alert via WhatsApp.

    Tries the Meta Cloud API first.  If ``whatsapp_provider`` is set to
    ``"twilio"``, uses the Twilio API instead.

    Required settings attributes
    ----------------------------
    whatsapp_phone_id : str      (Meta) or whatsapp_twilio_sid (Twilio)
    whatsapp_token : str         (Meta) or whatsapp_twilio_token (Twilio)
    whatsapp_recipient : str     Recipient phone in E.164 format
    """
    message = _format_opportunity_message(opportunity)
    provider = getattr(settings, "whatsapp_provider", "meta")

    if provider == "twilio":
        return await _send_whatsapp_twilio(settings, message)
    return await _send_whatsapp_meta(settings, message)


async def _send_whatsapp_meta(settings: Any, message: str) -> bool:
    """Send a WhatsApp message via the Meta Cloud API."""
    phone_id = getattr(settings, "whatsapp_phone_id", "") or ""
    token = getattr(settings, "whatsapp_token", "") or ""
    recipient = getattr(settings, "whatsapp_recipient", "") or ""

    if not all([phone_id, token, recipient]):
        logger.warning("whatsapp_meta_missing_creds")
        return False

    url = f"https://graph.facebook.com/v18.0/{phone_id}/messages"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "text",
        "text": {"body": message},
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            logger.info("whatsapp_meta_sent", recipient=recipient)
            return True
    except httpx.HTTPStatusError as exc:
        logger.error(
            "whatsapp_meta_http_error",
            status=exc.response.status_code,
            body=exc.response.text[:300],
        )
    except httpx.RequestError as exc:
        logger.error("whatsapp_meta_request_error", error=str(exc))
    return False


async def _send_whatsapp_twilio(settings: Any, message: str) -> bool:
    """Send a WhatsApp message via the Twilio API."""
    account_sid = getattr(settings, "whatsapp_twilio_sid", "") or ""
    auth_token = getattr(settings, "whatsapp_twilio_token", "") or ""
    from_number = getattr(settings, "whatsapp_twilio_from", "") or ""
    recipient = getattr(settings, "whatsapp_recipient", "") or ""

    if not all([account_sid, auth_token, from_number, recipient]):
        logger.warning("whatsapp_twilio_missing_creds")
        return False

    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    data = {
        "From": f"whatsapp:{from_number}",
        "To": f"whatsapp:{recipient}",
        "Body": message,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                url, data=data, auth=(account_sid, auth_token)
            )
            resp.raise_for_status()
            logger.info("whatsapp_twilio_sent", recipient=recipient)
            return True
    except httpx.HTTPStatusError as exc:
        logger.error(
            "whatsapp_twilio_http_error",
            status=exc.response.status_code,
            body=exc.response.text[:300],
        )
    except httpx.RequestError as exc:
        logger.error("whatsapp_twilio_request_error", error=str(exc))
    return False


# ---------------------------------------------------------------------------
# Email -- SMTP
# ---------------------------------------------------------------------------

async def send_email_notification(settings: Any, opportunity: dict) -> bool:
    """Send a single opportunity alert via SMTP email.

    Required settings attributes
    ----------------------------
    smtp_host, smtp_port, smtp_user, smtp_password, smtp_from, smtp_to
    """
    host = getattr(settings, "smtp_host", "") or ""
    port = int(getattr(settings, "smtp_port", 587) or 587)
    user = getattr(settings, "smtp_user", "") or ""
    password = getattr(settings, "smtp_password", "") or ""
    from_addr = getattr(settings, "smtp_from", user) or user
    to_addr = getattr(settings, "smtp_to", "") or ""

    if not all([host, user, password, to_addr]):
        logger.warning("email_missing_creds")
        return False

    text_body = _format_opportunity_message(opportunity)
    score_pct = int((opportunity.get("relevance_score", 0) or 0) * 100)
    subject = (
        f"[{score_pct}%] \u0641\u0631\u0635\u0629 \u062c\u062f\u064a\u062f\u0629: "
        f"{opportunity.get('title', 'Opportunity')} -- {opportunity.get('company', '')}"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to_addr
    msg.attach(MIMEText(text_body, "plain", "utf-8"))

    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(user, password)
            server.sendmail(from_addr, [to_addr], msg.as_string())
        logger.info("email_sent", to=to_addr, subject=subject)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error("email_send_error", error=str(exc))
        return False


# ---------------------------------------------------------------------------
# Daily digest (all channels)
# ---------------------------------------------------------------------------

async def send_daily_digest(settings: Any, opportunities: list[dict]) -> dict:
    """Compile and send the daily digest across all configured channels.

    Returns a dict mapping channel names to success booleans.
    """
    message = _format_digest_message(opportunities)
    results: dict[str, bool] = {}

    # WhatsApp
    whatsapp_recipient = getattr(settings, "whatsapp_recipient", "") or ""
    if whatsapp_recipient:
        results["whatsapp"] = await _send_digest_whatsapp(settings, message)

    # Email
    smtp_to = getattr(settings, "smtp_to", "") or ""
    if smtp_to:
        results["email"] = await _send_digest_email(settings, message)

    # Telegram (via shared notification util)
    telegram_token = getattr(settings, "telegram_bot_token", "") or ""
    telegram_chat = getattr(settings, "telegram_chat_id", "") or ""
    if telegram_token and telegram_chat:
        from utils.notifications import send_telegram

        results["telegram"] = await send_telegram(
            telegram_token, telegram_chat, message
        )

    if not results:
        logger.warning("digest_no_channels_configured")

    logger.info("daily_digest_sent", results=results, count=len(opportunities))
    return results


async def _send_digest_whatsapp(settings: Any, message: str) -> bool:
    """Send the digest message via WhatsApp."""
    provider = getattr(settings, "whatsapp_provider", "meta")
    if provider == "twilio":
        return await _send_whatsapp_twilio(settings, message)
    return await _send_whatsapp_meta(settings, message)


async def _send_digest_email(settings: Any, message: str) -> bool:
    """Send the digest message via SMTP email."""
    host = getattr(settings, "smtp_host", "") or ""
    port = int(getattr(settings, "smtp_port", 587) or 587)
    user = getattr(settings, "smtp_user", "") or ""
    password = getattr(settings, "smtp_password", "") or ""
    from_addr = getattr(settings, "smtp_from", user) or user
    to_addr = getattr(settings, "smtp_to", "") or ""

    if not all([host, user, password, to_addr]):
        logger.warning("digest_email_missing_creds")
        return False

    now = datetime.utcnow().strftime("%Y-%m-%d")
    subject = f"\U0001f4e8 \u0627\u0644\u0645\u0644\u062e\u0635 \u0627\u0644\u064a\u0648\u0645\u064a / Daily Digest -- {now}"

    email_msg = MIMEMultipart("alternative")
    email_msg["Subject"] = subject
    email_msg["From"] = from_addr
    email_msg["To"] = to_addr
    email_msg.attach(MIMEText(message, "plain", "utf-8"))

    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(user, password)
            server.sendmail(from_addr, [to_addr], email_msg.as_string())
        logger.info("digest_email_sent", to=to_addr)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error("digest_email_error", error=str(exc))
        return False
