from app.workers.celery_app import celery_app
from app.config import get_settings
from app.database import SessionLocal
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


@celery_app.task(name="app.workers.message_tasks.send_scheduled_messages")
def send_scheduled_messages():
    """Send messages that are scheduled for delivery."""
    from app.models.message import Message
    from sqlalchemy import select, and_

    logger.info("Processing scheduled messages...")

    with SessionLocal() as db:
        now = datetime.now(timezone.utc)

        pending_messages = db.execute(
            select(Message).where(
                and_(
                    Message.status == "pending",
                    Message.scheduled_at <= now if hasattr(Message, 'scheduled_at') else True,
                )
            ).limit(50)
        ).scalars().all()

        sent_count = 0
        failed_count = 0

        for msg in pending_messages:
            try:
                if msg.channel == "whatsapp":
                    result = _send_whatsapp_message(msg.lead_id, msg.content, str(msg.tenant_id))
                elif msg.channel == "email":
                    result = _send_email_message(msg)
                elif msg.channel == "sms":
                    result = _send_sms_message(msg)
                else:
                    logger.warning(f"Unknown channel: {msg.channel}")
                    continue

                msg.status = "sent"
                msg.sent_at = now
                sent_count += 1

            except Exception as e:
                logger.error(f"Failed to send message {msg.id}: {e}")
                msg.status = "failed"
                failed_count += 1

        db.commit()
        logger.info(f"Sent {sent_count}, failed {failed_count} of {len(pending_messages)} messages")

    return {"sent": sent_count, "failed": failed_count}


@celery_app.task(name="app.workers.message_tasks.send_whatsapp", bind=True, max_retries=3)
def send_whatsapp(self, phone: str, message: str, tenant_id: str):
    """Send a WhatsApp message via Business API."""
    from app.integrations.whatsapp import send_whatsapp_message
    from app.models.message import Message

    logger.info(f"Sending WhatsApp to {phone}")

    try:
        result = send_whatsapp_message(phone, message)

        # Store message record
        with SessionLocal() as db:
            msg = Message(
                tenant_id=tenant_id,
                channel="whatsapp",
                direction="outbound",
                content=message,
                status="sent",
                sent_at=datetime.now(timezone.utc),
                metadata={"phone": phone, "wa_message_id": result.get("messages", [{}])[0].get("id", "")},
            )
            db.add(msg)
            db.commit()

        logger.info(f"WhatsApp sent successfully to {phone}")
        return {"status": "sent", "phone": phone}

    except Exception as e:
        logger.error(f"WhatsApp send failed to {phone}: {e}")
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))


@celery_app.task(name="app.workers.message_tasks.send_email", bind=True, max_retries=3)
def send_email(self, to_email: str, subject: str, body: str, tenant_id: str):
    """Send an email via configured provider."""
    from app.integrations.email_sender import send_email as smtp_send
    from app.models.message import Message

    logger.info(f"Sending email to {to_email}")

    try:
        smtp_send(to_email, subject, body)

        with SessionLocal() as db:
            msg = Message(
                tenant_id=tenant_id,
                channel="email",
                direction="outbound",
                content=body,
                status="sent",
                sent_at=datetime.now(timezone.utc),
                metadata={"to": to_email, "subject": subject},
            )
            db.add(msg)
            db.commit()

        logger.info(f"Email sent successfully to {to_email}")
        return {"status": "sent", "email": to_email}

    except Exception as e:
        logger.error(f"Email send failed to {to_email}: {e}")
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))


@celery_app.task(name="app.workers.message_tasks.send_sms", bind=True, max_retries=3)
def send_sms(self, phone: str, message: str, tenant_id: str):
    """Send SMS via Unifonic."""
    from app.integrations.sms import send_sms as unifonic_send
    from app.models.message import Message

    logger.info(f"Sending SMS to {phone}")

    try:
        unifonic_send(phone, message)

        with SessionLocal() as db:
            msg = Message(
                tenant_id=tenant_id,
                channel="sms",
                direction="outbound",
                content=message,
                status="sent",
                sent_at=datetime.now(timezone.utc),
                metadata={"phone": phone},
            )
            db.add(msg)
            db.commit()

        logger.info(f"SMS sent successfully to {phone}")
        return {"status": "sent", "phone": phone}

    except Exception as e:
        logger.error(f"SMS send failed to {phone}: {e}")
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))


def _send_whatsapp_message(lead_id, content, tenant_id):
    """Helper to send WhatsApp from message record."""
    from app.integrations.whatsapp import send_whatsapp_message
    from app.models.lead import Lead

    with SessionLocal() as db:
        lead = db.get(Lead, lead_id)
        if lead and lead.phone:
            return send_whatsapp_message(lead.phone, content)
    return None


def _send_email_message(msg):
    """Helper to send email from message record."""
    from app.integrations.email_sender import send_email as smtp_send
    from app.models.lead import Lead

    with SessionLocal() as db:
        lead = db.get(Lead, msg.lead_id) if msg.lead_id else None
        if lead and lead.email:
            smtp_send(lead.email, "Dealix - متابعة", msg.content)
    return None


def _send_sms_message(msg):
    """Helper to send SMS from message record."""
    from app.integrations.sms import send_sms as unifonic_send
    from app.models.lead import Lead

    with SessionLocal() as db:
        lead = db.get(Lead, msg.lead_id) if msg.lead_id else None
        if lead and lead.phone:
            unifonic_send(lead.phone, msg.content)
    return None
