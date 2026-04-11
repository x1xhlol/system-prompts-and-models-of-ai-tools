from __future__ import annotations

from typing import Dict, Any

from app.services.voice_service import voice_service


class VoiceAgentsPlugin:
    name = "voice-agents"

    async def trigger_call(self, company_name: str, phone: str, objective: str) -> Dict[str, Any]:
        result = await voice_service.trigger_sales_call(phone, objective)
        return {"channel": "voice", "company_name": company_name, "phone": phone, "objective": objective, "provider_result": result}
