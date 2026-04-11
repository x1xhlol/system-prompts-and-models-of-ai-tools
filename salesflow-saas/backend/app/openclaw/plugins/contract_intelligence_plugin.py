from __future__ import annotations

from typing import Any, Dict

from app.services.esign_service import esign_service


class ContractIntelligencePlugin:
    name = "contract-intelligence"

    async def generate_contract(self, deal: Dict[str, Any]) -> Dict[str, Any]:
        company = deal.get("company_name", "Unknown")
        return {
            "status": "drafted",
            "document_id": f"contract-{company.lower().replace(' ', '-')}",
            "summary": f"AI-generated contract draft for {company}",
        }

    async def request_signature(self, document_id: str, provider: str = "docusign") -> Dict[str, Any]:
        return await esign_service.send_for_signature(
            document_name=document_id,
            signer_email="procurement@example.com",
            provider=provider,
        )
