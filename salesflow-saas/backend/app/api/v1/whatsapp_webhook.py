"""
WhatsApp Webhook — Dealix AI Revenue OS
Handles incoming WhatsApp messages, verification, and delivery status.
"""
import logging
from typing import Any

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import PlainTextResponse

from app.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks/whatsapp", tags=["WhatsApp Webhook"])


@router.post("/incoming")
async def handle_incoming(request: Request, db=Depends(get_db)):
    """Handle incoming WhatsApp messages from Meta Cloud API or Twilio."""
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    phone = ""
    message = ""

    # Meta Cloud API format
    if "entry" in body:
        try:
            entry = body["entry"][0]
            changes = entry.get("changes", [{}])[0]
            value = changes.get("value", {})
            messages = value.get("messages", [])
            if messages:
                msg = messages[0]
                phone = msg.get("from", "")
                if msg.get("type") == "text":
                    message = msg.get("text", {}).get("body", "")
                elif msg.get("type") == "interactive":
                    interactive = msg.get("interactive", {})
                    if "button_reply" in interactive:
                        message = interactive["button_reply"].get("title", "")
                    elif "list_reply" in interactive:
                        message = interactive["list_reply"].get("title", "")
                else:
                    message = f"[{msg.get('type', 'unknown')} message]"
        except (IndexError, KeyError) as e:
            logger.warning(f"Failed to parse Meta webhook: {e}")
            return {"status": "ok"}

    # Twilio format
    elif "From" in body or "from" in body:
        phone = body.get("From", body.get("from", "")).replace("whatsapp:", "")
        message = body.get("Body", body.get("body", ""))

    if not phone or not message:
        logger.debug("Webhook received but no actionable message")
        return {"status": "ok"}

    # Process through WhatsApp Brain
    from app.services.whatsapp_brain import whatsapp_brain

    try:
        response = await whatsapp_brain.handle_incoming(phone, message, db)
    except Exception as e:
        logger.error(f"WhatsApp brain error for {phone}: {e}")
        response = "عذراً، حدث خطأ. حاول مرة أخرى أو تواصل مع support@dealix.sa"

    # Send response via WhatsApp API
    try:
        from app.integrations.whatsapp import send_whatsapp_message
        await send_whatsapp_message(phone, response)
    except Exception as e:
        logger.error(f"Failed to send WhatsApp response to {phone}: {e}")

    logger.info(f"[WhatsApp] {phone}: '{message[:50]}...' → response sent")
    return {"status": "ok", "phone": phone, "response_length": len(response)}


@router.get("/verify")
async def verify_webhook(request: Request):
    """Meta webhook verification challenge."""
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    import os
    verify_token = os.environ.get("WHATSAPP_VERIFY_TOKEN", "dealix-whatsapp-verify-2026")

    if mode == "subscribe" and token == verify_token:
        logger.info("WhatsApp webhook verified successfully")
        return PlainTextResponse(content=challenge or "", status_code=200)

    logger.warning(f"WhatsApp webhook verification failed: mode={mode}, token={token}")
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/status")
async def delivery_status(request: Request):
    """Handle delivery/read status updates from WhatsApp."""
    try:
        body = await request.json()
    except Exception:
        return {"status": "ok"}

    # Meta format
    if "entry" in body:
        try:
            entry = body["entry"][0]
            changes = entry.get("changes", [{}])[0]
            value = changes.get("value", {})
            statuses = value.get("statuses", [])

            for status in statuses:
                recipient = status.get("recipient_id", "")
                status_type = status.get("status", "")  # sent, delivered, read, failed
                timestamp = status.get("timestamp", "")
                logger.debug(
                    f"[WhatsApp Status] {recipient}: {status_type} at {timestamp}"
                )

                # Update message status in database if needed
                if status_type == "failed":
                    errors = status.get("errors", [])
                    error_msg = errors[0].get("title", "Unknown") if errors else "Unknown"
                    logger.error(
                        f"[WhatsApp] Message to {recipient} FAILED: {error_msg}"
                    )
        except (IndexError, KeyError) as e:
            logger.warning(f"Failed to parse status webhook: {e}")

    return {"status": "ok"}
