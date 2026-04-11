from __future__ import annotations

from typing import Any, Dict

try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False

from app.config import get_settings

settings = get_settings()


class VoiceService:
    async def trigger_sales_call(self, to_number: str, objective: str) -> Dict[str, Any]:
        if not TWILIO_AVAILABLE:
            return {"status": "mock", "reason": "twilio_not_installed", "to": to_number, "objective": objective}
        if not (settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_NUMBER):
            return {"status": "mock", "to": to_number, "objective": objective}

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        call = client.calls.create(
            to=to_number,
            from_=settings.TWILIO_FROM_NUMBER,
            twiml=f"<Response><Say language='ar-SA'>مرحبا. هذه مكالمة مبيعات ذكية من Dealix. الهدف: {objective}</Say></Response>",
        )
        return {"status": "queued", "call_sid": call.sid, "to": to_number, "objective": objective}


voice_service = VoiceService()
