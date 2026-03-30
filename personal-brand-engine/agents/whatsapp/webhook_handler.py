"""FastAPI router for WhatsApp webhook endpoints.

Supports both Meta Cloud API and Twilio webhook formats.
"""

from __future__ import annotations

import hashlib
import hmac
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response

from config.settings import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["whatsapp"])


# ------------------------------------------------------------------
# Dependency: obtain a configured WhatsAppAgent instance
# ------------------------------------------------------------------

def _get_agent():
    """Return a ready-to-use :class:`WhatsAppAgent`.

    In production this should be wired through your DI container.
    Here we import lazily to avoid circular imports and create
    a fresh agent per request (or pull from a singleton pool).
    """
    from agents.whatsapp.agent import WhatsAppAgent
    from storage.database import get_db
    from llm.client import get_llm_client

    settings = get_settings()
    db = get_db()
    llm = get_llm_client()

    return WhatsAppAgent(config=settings, llm_client=llm, db_session=db)


# ------------------------------------------------------------------
# Meta Cloud API
# ------------------------------------------------------------------

@router.get("/webhooks/whatsapp")
async def verify_webhook(
    hub_mode: str | None = Query(None, alias="hub.mode"),
    hub_verify_token: str | None = Query(None, alias="hub.verify_token"),
    hub_challenge: str | None = Query(None, alias="hub.challenge"),
) -> Response:
    """Meta Cloud API webhook verification (subscribe handshake).

    Meta sends a GET request with ``hub.mode``, ``hub.verify_token``, and
    ``hub.challenge``.  We must echo back the challenge if the token matches.
    """
    settings = get_settings()

    if hub_mode == "subscribe" and hub_verify_token == settings.whatsapp_verify_token:
        logger.info("WhatsApp webhook verified successfully.")
        return Response(content=hub_challenge, media_type="text/plain")

    logger.warning(
        "WhatsApp webhook verification failed (mode=%s, token=%s).",
        hub_mode,
        hub_verify_token,
    )
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/webhooks/whatsapp")
async def incoming_message(request: Request) -> dict:
    """Handle incoming WhatsApp messages from either Meta or Twilio.

    The handler inspects the payload to determine the source format and
    dispatches accordingly.
    """
    content_type = request.headers.get("content-type", "")

    # Twilio sends application/x-www-form-urlencoded
    if "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        return await _handle_twilio(dict(form))

    # Meta Cloud API sends application/json
    body = await request.json()
    return await _handle_meta(body)


# ------------------------------------------------------------------
# Meta Cloud API handler
# ------------------------------------------------------------------

async def _handle_meta(body: dict[str, Any]) -> dict:
    """Parse a Meta Cloud API webhook payload and respond."""
    try:
        entry = body.get("entry", [])
        if not entry:
            return {"status": "ignored", "reason": "no entry"}

        changes = entry[0].get("changes", [])
        if not changes:
            return {"status": "ignored", "reason": "no changes"}

        value = changes[0].get("value", {})
        messages = value.get("messages", [])
        if not messages:
            # Could be a status update (delivered, read, etc.) -- acknowledge.
            return {"status": "ok", "reason": "status_update"}

        message = messages[0]
        msg_type = message.get("type")
        from_number = message.get("from", "")

        # Extract sender name from contacts if available
        contacts = value.get("contacts", [])
        sender_name = None
        if contacts:
            profile = contacts[0].get("profile", {})
            sender_name = profile.get("name")

        if msg_type != "text":
            logger.info("Ignoring non-text message type: %s", msg_type)
            return {"status": "ignored", "reason": f"unsupported_type:{msg_type}"}

        message_text = message.get("text", {}).get("body", "")
        if not message_text:
            return {"status": "ignored", "reason": "empty_body"}

        # Process message
        agent = _get_agent()
        response_text = await agent.handle_message(
            from_number=from_number,
            message_text=message_text,
            sender_name=sender_name,
        )

        # Send reply via Meta Cloud API
        await _send_meta_reply(from_number, response_text)

        return {"status": "ok", "to": from_number}

    except Exception as exc:
        logger.exception("Error processing Meta webhook: %s", exc)
        # Return 200 to avoid Meta retrying on transient errors
        return {"status": "error", "message": str(exc)}


async def _send_meta_reply(to_number: str, text: str) -> None:
    """Send a text message reply via Meta Cloud API."""
    import httpx

    settings = get_settings()
    token = settings.whatsapp_api_token
    phone_id = settings.whatsapp_phone_number_id

    if not token or not phone_id:
        logger.error("Meta Cloud API credentials not configured.")
        return

    url = f"https://graph.facebook.com/v21.0/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_number,
        "type": "text",
        "text": {"preview_url": False, "body": text},
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            logger.info("Meta reply sent to %s (status=%s)", to_number, resp.status_code)
    except httpx.HTTPError as exc:
        logger.error("Failed to send Meta reply to %s: %s", to_number, exc)


# ------------------------------------------------------------------
# Twilio handler
# ------------------------------------------------------------------

async def _handle_twilio(form: dict[str, Any]) -> dict:
    """Parse a Twilio WhatsApp webhook payload and respond."""
    try:
        from_number = form.get("From", "")
        message_text = form.get("Body", "")
        sender_name = form.get("ProfileName")

        # Strip Twilio's "whatsapp:" prefix
        if from_number.startswith("whatsapp:"):
            from_number = from_number[len("whatsapp:"):]

        if not message_text:
            return {"status": "ignored", "reason": "empty_body"}

        agent = _get_agent()
        response_text = await agent.handle_message(
            from_number=from_number,
            message_text=message_text,
            sender_name=sender_name,
        )

        # Send reply via Twilio
        await _send_twilio_reply(from_number, response_text)

        return {"status": "ok", "to": from_number}

    except Exception as exc:
        logger.exception("Error processing Twilio webhook: %s", exc)
        return {"status": "error", "message": str(exc)}


async def _send_twilio_reply(to_number: str, text: str) -> None:
    """Send a text message reply via the Twilio API."""
    import httpx

    settings = get_settings()
    sid = settings.twilio_account_sid
    auth = settings.twilio_auth_token
    from_number = settings.twilio_whatsapp_number

    if not sid or not auth or not from_number:
        logger.error("Twilio credentials not configured.")
        return

    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    payload = {
        "From": f"whatsapp:{from_number}",
        "To": f"whatsapp:{to_number}",
        "Body": text,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, data=payload, auth=(sid, auth))
            resp.raise_for_status()
            logger.info("Twilio reply sent to %s (status=%s)", to_number, resp.status_code)
    except httpx.HTTPError as exc:
        logger.error("Failed to send Twilio reply to %s: %s", to_number, exc)
