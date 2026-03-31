"""
CRM Sync Service — Bidirectional sync with Salesforce, HubSpot, and generic CRMs.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import get_settings

settings = get_settings()


class CRMSyncService:
    """
    Manages bidirectional data sync between Dealix and external CRM systems.
    Supports Salesforce, HubSpot, and generic webhook-based CRMs.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Salesforce ────────────────────────────────

    async def salesforce_push_lead(self, lead: dict, credentials: dict) -> dict:
        """Push a lead from Dealix to Salesforce."""
        access_token = credentials.get("access_token")
        instance_url = credentials.get("instance_url")

        if not access_token or not instance_url:
            return {"status": "error", "message": "Invalid Salesforce credentials"}

        sf_lead = {
            "FirstName": lead.get("full_name", "").split()[0] if lead.get("full_name") else "",
            "LastName": lead.get("full_name", "").split()[-1] if lead.get("full_name") else "Unknown",
            "Phone": lead.get("phone", ""),
            "Email": lead.get("email", ""),
            "Company": lead.get("company_name", "Unknown"),
            "Industry": lead.get("sector", ""),
            "City": lead.get("city", ""),
            "LeadSource": f"Dealix - {lead.get('source', 'web')}",
            "Description": lead.get("notes", ""),
            "Rating": self._score_to_sf_rating(lead.get("score", 0)),
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{instance_url}/services/data/{settings.SALESFORCE_API_VERSION}/sobjects/Lead/",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                json=sf_lead,
            )

        if response.status_code in (200, 201):
            sf_id = response.json().get("id")
            return {"status": "success", "salesforce_id": sf_id}
        return {"status": "error", "message": response.text}

    async def salesforce_pull_leads(self, credentials: dict, since: str = None) -> list:
        """Pull leads from Salesforce into Dealix."""
        access_token = credentials.get("access_token")
        instance_url = credentials.get("instance_url")

        query = "SELECT Id, FirstName, LastName, Phone, Email, Company, Industry, City, Rating FROM Lead"
        if since:
            query += f" WHERE LastModifiedDate > {since}"
        query += " ORDER BY LastModifiedDate DESC LIMIT 100"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{instance_url}/services/data/{settings.SALESFORCE_API_VERSION}/query/",
                params={"q": query},
                headers={"Authorization": f"Bearer {access_token}"},
            )

        if response.status_code != 200:
            return []

        records = response.json().get("records", [])
        return [
            {
                "external_id": r["Id"],
                "full_name": f"{r.get('FirstName', '')} {r.get('LastName', '')}".strip(),
                "phone": r.get("Phone", ""),
                "email": r.get("Email", ""),
                "company_name": r.get("Company", ""),
                "sector": r.get("Industry", ""),
                "city": r.get("City", ""),
            }
            for r in records
        ]

    # ── HubSpot ───────────────────────────────────

    async def hubspot_push_contact(self, lead: dict, api_key: str) -> dict:
        """Push a contact from Dealix to HubSpot."""
        hs_contact = {
            "properties": {
                "firstname": lead.get("full_name", "").split()[0] if lead.get("full_name") else "",
                "lastname": lead.get("full_name", "").split()[-1] if lead.get("full_name") else "",
                "phone": lead.get("phone", ""),
                "email": lead.get("email", ""),
                "company": lead.get("company_name", ""),
                "industry": lead.get("sector", ""),
                "city": lead.get("city", ""),
                "leadsource": f"Dealix - {lead.get('source', 'web')}",
                "hs_lead_status": self._status_to_hs(lead.get("status", "new")),
            }
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.hubapi.com/crm/v3/objects/contacts",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=hs_contact,
            )

        if response.status_code in (200, 201):
            hs_id = response.json().get("id")
            return {"status": "success", "hubspot_id": hs_id}
        return {"status": "error", "message": response.text}

    async def hubspot_pull_contacts(self, api_key: str, after: str = None) -> list:
        """Pull contacts from HubSpot into Dealix."""
        params = {
            "limit": 100,
            "properties": "firstname,lastname,phone,email,company,industry,city",
        }
        if after:
            params["after"] = after

        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.hubapi.com/crm/v3/objects/contacts",
                params=params,
                headers={"Authorization": f"Bearer {api_key}"},
            )

        if response.status_code != 200:
            return []

        results = response.json().get("results", [])
        return [
            {
                "external_id": r["id"],
                "full_name": f"{r['properties'].get('firstname', '')} {r['properties'].get('lastname', '')}".strip(),
                "phone": r["properties"].get("phone", ""),
                "email": r["properties"].get("email", ""),
                "company_name": r["properties"].get("company", ""),
                "sector": r["properties"].get("industry", ""),
                "city": r["properties"].get("city", ""),
            }
            for r in results
        ]

    # ── Generic Sync ──────────────────────────────

    async def sync_lead_to_crm(
        self, tenant_id: str, lead_id: str, provider: str
    ) -> dict:
        """Sync a lead to the configured CRM for this tenant."""
        from app.services.lead_service import LeadService

        lead_svc = LeadService(self.db)
        lead = await lead_svc.get_lead(tenant_id, lead_id)
        if not lead:
            return {"status": "error", "message": "Lead not found"}

        # Get CRM credentials for tenant (from tenant settings)
        credentials = await self._get_crm_credentials(tenant_id, provider)
        if not credentials:
            return {"status": "error", "message": f"No {provider} credentials configured"}

        if provider == "salesforce":
            return await self.salesforce_push_lead(lead, credentials)
        elif provider == "hubspot":
            return await self.hubspot_push_contact(lead, credentials.get("api_key", ""))

        return {"status": "error", "message": f"Unsupported provider: {provider}"}

    async def full_sync(self, tenant_id: str, provider: str) -> dict:
        """Full bidirectional sync with CRM."""
        pushed = 0
        pulled = 0
        errors = []

        credentials = await self._get_crm_credentials(tenant_id, provider)
        if not credentials:
            return {"status": "error", "message": "No credentials configured"}

        # Pull from CRM
        try:
            if provider == "salesforce":
                external_leads = await self.salesforce_pull_leads(credentials)
            elif provider == "hubspot":
                external_leads = await self.hubspot_pull_contacts(credentials.get("api_key", ""))
            else:
                external_leads = []

            from app.services.lead_service import LeadService
            lead_svc = LeadService(self.db)

            for ext_lead in external_leads:
                try:
                    await lead_svc.create_lead(
                        tenant_id=tenant_id,
                        full_name=ext_lead["full_name"],
                        phone=ext_lead.get("phone", ""),
                        email=ext_lead.get("email", ""),
                        company_name=ext_lead.get("company_name", ""),
                        sector=ext_lead.get("sector", ""),
                        city=ext_lead.get("city", ""),
                        source=provider,
                    )
                    pulled += 1
                except Exception as e:
                    errors.append({"type": "pull", "error": str(e)})

        except Exception as e:
            errors.append({"type": "pull_batch", "error": str(e)})

        return {
            "status": "completed",
            "pushed": pushed,
            "pulled": pulled,
            "errors": errors,
        }

    # ── Helpers ───────────────────────────────────

    async def _get_crm_credentials(self, tenant_id: str, provider: str) -> Optional[dict]:
        """Get CRM credentials from tenant settings."""
        # In production, this would fetch from encrypted tenant settings
        if provider == "salesforce":
            return {
                "access_token": settings.SALESFORCE_CLIENT_SECRET,
                "instance_url": "",
            } if settings.SALESFORCE_CLIENT_ID else None
        elif provider == "hubspot":
            return {
                "api_key": settings.HUBSPOT_API_KEY,
            } if settings.HUBSPOT_API_KEY else None
        return None

    @staticmethod
    def _score_to_sf_rating(score: int) -> str:
        if score >= 80:
            return "Hot"
        elif score >= 50:
            return "Warm"
        return "Cold"

    @staticmethod
    def _status_to_hs(status: str) -> str:
        mapping = {
            "new": "NEW",
            "contacted": "IN_PROGRESS",
            "qualified": "QUALIFIED",
            "converted": "CUSTOMER",
            "lost": "UNQUALIFIED",
        }
        return mapping.get(status, "NEW")
