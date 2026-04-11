from __future__ import annotations

from typing import Any, Dict

from app.openclaw.plugins.contract_intelligence_plugin import ContractIntelligencePlugin


class ContractIntelligenceService:
    def __init__(self) -> None:
        self.plugin = ContractIntelligencePlugin()

    async def generate_and_send(self, deal: Dict[str, Any], provider: str = "docusign") -> Dict[str, Any]:
        draft = await self.plugin.generate_contract(deal)
        signature = await self.plugin.request_signature(draft["document_id"], provider=provider)
        return {"draft": draft, "signature": signature}


contract_intelligence_service = ContractIntelligenceService()
