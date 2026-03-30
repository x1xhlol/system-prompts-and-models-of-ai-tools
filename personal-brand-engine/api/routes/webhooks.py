"""Webhook endpoints for WhatsApp and other services."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Request, Response, Query

from config.settings import get_settings
from llm.client import get_llm_client
from storage.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/whatsapp")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    """Meta Cloud API webhook verification."""
    settings = get_settings()
    if hub_mode == "subscribe" and hub_verify_token == settings.whatsapp_verify_token:
        logger.info("WhatsApp webhook verified")
        return Response(content=hub_challenge, media_type="text/plain")
    return Response(content="Forbidden", status_code=403)


@router.post("/whatsapp")
async def handle_whatsapp_message(request: Request):
    """Handle incoming WhatsApp messages via Meta Cloud API."""
    try:
        body = await request.json()
        logger.info("WhatsApp webhook received")

        # Extract message from Meta Cloud API format
        entry = body.get("entry", [{}])[0]
        changes = entry.get("changes", [{}])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])

        if not messages:
            return {"status": "no_message"}

        message = messages[0]
        from_number = message.get("from", "")
        message_text = message.get("text", {}).get("body", "")

        if not message_text:
            return {"status": "non_text_message"}

        # Process with WhatsApp agent
        from agents.whatsapp import WhatsAppAgent

        settings = get_settings()
        llm_client = get_llm_client()
        db = get_db()

        agent = WhatsAppAgent(config=settings, llm_client=llm_client, db_session=db)
        result = await agent.run(
            task="handle_message",
            from_number=from_number,
            message_text=message_text,
        )

        # Send response back via Meta Cloud API
        response_text = result.get("response", "")
        if response_text and settings.whatsapp_api_token:
            import httpx
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"https://graph.facebook.com/v18.0/{settings.whatsapp_phone_number_id}/messages",
                    headers={"Authorization": f"Bearer {settings.whatsapp_api_token}"},
                    json={
                        "messaging_product": "whatsapp",
                        "to": from_number,
                        "type": "text",
                        "text": {"body": response_text},
                    },
                )

        db.close()
        return {"status": "processed"}

    except Exception as e:
        logger.error("WhatsApp webhook error: %s", e)
        return {"status": "error", "detail": str(e)}


@router.post("/whatsapp/twilio")
async def handle_twilio_whatsapp(request: Request):
    """Handle incoming WhatsApp messages via Twilio."""
    try:
        form = await request.form()
        from_number = form.get("From", "").replace("whatsapp:", "")
        message_text = form.get("Body", "")

        if not message_text:
            return Response(content="<Response></Response>", media_type="application/xml")

        from agents.whatsapp import WhatsAppAgent

        settings = get_settings()
        llm_client = get_llm_client()
        db = get_db()

        agent = WhatsAppAgent(config=settings, llm_client=llm_client, db_session=db)
        result = await agent.run(
            task="handle_message",
            from_number=from_number,
            message_text=message_text,
        )

        response_text = result.get("response", "شكراً لتواصلك!")
        db.close()

        # TwiML response
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{response_text}</Message>
</Response>"""
        return Response(content=twiml, media_type="application/xml")

    except Exception as e:
        logger.error("Twilio webhook error: %s", e)
        return Response(
            content="<Response><Message>عذراً، حدث خطأ. يرجى المحاولة لاحقاً.</Message></Response>",
            media_type="application/xml",
        )
