from __future__ import annotations

from typing import Any, Dict
import httpx

from app.config import get_settings

settings = get_settings()


class ESignService:
    async def send_for_signature(self, document_name: str, signer_email: str, provider: str = "docusign") -> Dict[str, Any]:
        if provider == "adobe":
            return await self._adobe_send(document_name, signer_email)
        return await self._docusign_send(document_name, signer_email)

    async def _docusign_send(self, document_name: str, signer_email: str) -> Dict[str, Any]:
        if not settings.DOCUSIGN_ACCESS_TOKEN:
            return {"status": "mock", "provider": "docusign", "document_name": document_name, "signer_email": signer_email}
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{settings.DOCUSIGN_API_URL}/v2.1/accounts/me/envelopes",
                headers={"Authorization": f"Bearer {settings.DOCUSIGN_ACCESS_TOKEN}", "Content-Type": "application/json"},
                json={"emailSubject": f"Signature Request: {document_name}", "status": "sent"},
            )
            resp.raise_for_status()
            return {"status": "sent", "provider": "docusign", "response": resp.json()}

    async def _adobe_send(self, document_name: str, signer_email: str) -> Dict[str, Any]:
        if not settings.ADOBE_SIGN_ACCESS_TOKEN:
            return {"status": "mock", "provider": "adobe", "document_name": document_name, "signer_email": signer_email}
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{settings.ADOBE_SIGN_API_URL}/agreements",
                headers={"Authorization": f"Bearer {settings.ADOBE_SIGN_ACCESS_TOKEN}", "Content-Type": "application/json"},
                json={"name": document_name, "state": "IN_PROCESS"},
            )
            resp.raise_for_status()
            return {"status": "sent", "provider": "adobe", "response": resp.json()}


esign_service = ESignService()
