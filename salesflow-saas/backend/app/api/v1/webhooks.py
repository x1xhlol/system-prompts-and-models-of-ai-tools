"""
Webhook Routes — Receive events from WhatsApp, Email, CRM, Calendar, Payment.
"""

import hashlib
import hmac
import json
from fastapi import APIRouter, Request, HTTPException, Query, BackgroundTasks
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


# ── WhatsApp ──────────────────────────────────────

@router.get("/whatsapp")
async def whatsapp_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    """WhatsApp webhook verification (Meta Cloud API)."""
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        return int(hub_challenge)
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/whatsapp")
async def whatsapp_incoming(request: Request, background_tasks: BackgroundTasks):
    """
    Receive inbound WhatsApp messages from Meta Cloud API.
    Processes: text messages, media, reactions, status updates.
    """
    body = await request.json()

    entries = body.get("entry", [])
    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            messages = value.get("messages", [])
            statuses = value.get("statuses", [])

            # Process incoming messages
            for msg in messages:
                background_tasks.add_task(
                    _process_whatsapp_message,
                    phone=msg.get("from", ""),
                    message_type=msg.get("type", "text"),
                    content=_extract_whatsapp_content(msg),
                    message_id=msg.get("id", ""),
                    timestamp=msg.get("timestamp", ""),
                )

            # Process delivery statuses
            for status in statuses:
                background_tasks.add_task(
                    _process_whatsapp_status,
                    message_id=status.get("id", ""),
                    status=status.get("status", ""),
                    recipient=status.get("recipient_id", ""),
                )

    return {"status": "ok"}


async def _process_whatsapp_message(
    phone: str, message_type: str, content: str, message_id: str, timestamp: str
):
    """Background task to process WhatsApp message through AI pipeline."""
    # Will be connected to Orchestrator
    pass


async def _process_whatsapp_status(message_id: str, status: str, recipient: str):
    """Background task to update message delivery status."""
    pass


def _extract_whatsapp_content(msg: dict) -> str:
    """Extract text content from various WhatsApp message types."""
    msg_type = msg.get("type", "text")
    if msg_type == "text":
        return msg.get("text", {}).get("body", "")
    elif msg_type == "image":
        return f"[صورة: {msg.get('image', {}).get('caption', '')}]"
    elif msg_type == "document":
        return f"[ملف: {msg.get('document', {}).get('filename', '')}]"
    elif msg_type == "audio":
        return "[رسالة صوتية]"
    elif msg_type == "video":
        return "[فيديو]"
    elif msg_type == "location":
        loc = msg.get("location", {})
        return f"[موقع: {loc.get('latitude')}, {loc.get('longitude')}]"
    elif msg_type == "reaction":
        return f"[تفاعل: {msg.get('reaction', {}).get('emoji', '')}]"
    return ""


# ── Email ─────────────────────────────────────────

@router.post("/email/inbound")
async def email_inbound(request: Request, background_tasks: BackgroundTasks):
    """
    Receive inbound emails via SendGrid Inbound Parse.
    """
    form = await request.form()
    sender = form.get("from", "")
    subject = form.get("subject", "")
    body = form.get("text", form.get("html", ""))

    background_tasks.add_task(
        _process_inbound_email,
        sender=sender,
        subject=subject,
        body=body,
    )

    return {"status": "ok"}


async def _process_inbound_email(sender: str, subject: str, body: str):
    """Background task to process inbound email."""
    pass


# ── CRM Sync ─────────────────────────────────────

@router.post("/crm/salesforce")
async def salesforce_webhook(request: Request, background_tasks: BackgroundTasks):
    """Receive Salesforce outbound messages / platform events."""
    body = await request.json()
    background_tasks.add_task(_process_crm_sync, provider="salesforce", data=body)
    return {"status": "ok"}


@router.post("/crm/hubspot")
async def hubspot_webhook(request: Request, background_tasks: BackgroundTasks):
    """Receive HubSpot webhook events."""
    body = await request.json()
    background_tasks.add_task(_process_crm_sync, provider="hubspot", data=body)
    return {"status": "ok"}


async def _process_crm_sync(provider: str, data: dict):
    """Background task to sync CRM data."""
    pass


# ── Calendar ──────────────────────────────────────

@router.post("/calendar/google")
async def google_calendar_webhook(request: Request, background_tasks: BackgroundTasks):
    """Receive Google Calendar push notifications."""
    body = await request.json()
    background_tasks.add_task(_process_calendar_event, provider="google", data=body)
    return {"status": "ok"}


async def _process_calendar_event(provider: str, data: dict):
    """Background task to sync calendar events."""
    pass


# ── Payment ───────────────────────────────────────

@router.post("/payment/moyasar")
async def moyasar_webhook(request: Request, background_tasks: BackgroundTasks):
    """Receive Moyasar payment events."""
    body = await request.json()
    background_tasks.add_task(_process_payment, provider="moyasar", data=body)
    return {"status": "ok"}


@router.post("/payment/stripe")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks):
    """Receive Stripe webhook events."""
    body = await request.body()
    sig = request.headers.get("stripe-signature", "")
    background_tasks.add_task(
        _process_payment,
        provider="stripe",
        data={"body": body.decode(), "signature": sig},
    )
    return {"status": "ok"}


async def _process_payment(provider: str, data: dict):
    """Background task to process payment events."""
    pass
