from __future__ import annotations

from typing import Dict, Any

from app.integrations.whatsapp import send_whatsapp_message


class WhatsAppCloudPlugin:
    name = "whatsapp-cloud"

    async def send_message(self, phone: str, text: str) -> Dict[str, Any]:
        result = await send_whatsapp_message(phone, text)
        return {"channel": "whatsapp", "phone": phone, "provider_result": result}
