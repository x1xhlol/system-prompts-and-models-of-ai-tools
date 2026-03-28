import httpx
from app.config import get_settings

settings = get_settings()

UNIFONIC_API_URL = "https://el.cloud.unifonic.com/rest/SMS/messages"


async def send_sms(phone: str, message: str) -> dict:
    """Send SMS via Unifonic (Saudi market)."""
    if not settings.UNIFONIC_APP_SID:
        return {"status": "error", "detail": "Unifonic SMS not configured"}

    payload = {
        "AppSid": settings.UNIFONIC_APP_SID,
        "SenderID": settings.UNIFONIC_SENDER_ID,
        "Recipient": phone,
        "Body": message,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(UNIFONIC_API_URL, data=payload)
        result = response.json()
        if result.get("success"):
            return {"status": "sent", "message_id": result.get("data", {}).get("MessageID")}
        return {"status": "error", "detail": result.get("message", "Unknown error")}
