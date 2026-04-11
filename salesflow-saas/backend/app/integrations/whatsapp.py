import httpx
from app.config import get_settings
import logging

logger = logging.getLogger("dealix.integrations.whatsapp")

settings = get_settings()

WHATSAPP_API_URL = "https://graph.facebook.com/v21.0"


async def send_whatsapp_message(phone: str, message: str) -> dict:
    """Send a text message via WhatsApp Business API."""
    if settings.WHATSAPP_MOCK_MODE:
        logger.info(f"[MOCK WHATSAPP] To: {phone} | Message: {message}")
        return {"status": "success", "mocked": True, "message_id": "mock_123"}

    if not settings.WHATSAPP_API_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        logger.error("WhatsApp credentials missing.")
        return {"status": "error", "detail": "WhatsApp not configured"}

    url = f"{WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "text",
        "text": {"body": message},
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        return response.json()


async def send_whatsapp_template(phone: str, template_name: str, language: str = "ar", components: list = None) -> dict:
    """Send a template message via WhatsApp Business API."""
    if not settings.WHATSAPP_API_TOKEN:
        return {"status": "error", "detail": "WhatsApp not configured"}

    url = f"{WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": language},
        },
    }
    if components:
        payload["template"]["components"] = components

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        return response.json()
