"""CRM integrations API — Salesforce & HubSpot sync (JWT)."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.config import get_settings
from app.database import get_db
from app.models.tenant import Tenant
from app.models.user import User
from app.services.crm_sync_service import CRMSyncService
from app.services.lead_service import LeadService
from app.services.operations_hub import upsert_connector_status

router = APIRouter(prefix="/integrations/crm", tags=["Integrations — CRM"])
settings = get_settings()


class TenantCRMUpdate(BaseModel):
    """Store non-secret CRM overrides on tenant.settings['crm'] (encrypt at rest in production)."""

    salesforce: dict | None = None
    hubspot: dict | None = None


async def _tenant(db: AsyncSession, tenant_id: UUID) -> Tenant:
    r = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    t = r.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return t


@router.get("/status")
async def crm_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Which CRM keys are present (env vs tenant) — no secrets returned."""
    tenant = await _tenant(db, current_user.tenant_id)
    crm = (tenant.settings or {}).get("crm") or {}
    sf_t = (crm.get("salesforce") or {})
    hs_t = (crm.get("hubspot") or {})
    return {
        "salesforce": {
            "env_refresh_configured": bool(
                settings.SALESFORCE_CLIENT_ID
                and settings.SALESFORCE_CLIENT_SECRET
                and settings.SALESFORCE_REFRESH_TOKEN
            ),
            "tenant_refresh_override": bool(sf_t.get("refresh_token")),
            "domain": sf_t.get("domain") or settings.SALESFORCE_DOMAIN or "login.salesforce.com",
        },
        "hubspot": {
            "env_token_configured": bool(settings.HUBSPOT_API_KEY),
            "tenant_token_override": bool(hs_t.get("private_app_token") or hs_t.get("access_token")),
        },
        "docs": {
            "integration_master_ar": "/strategy/INTEGRATION_MASTER_AR.md",
            "api_map": "docs/API-MAP.md",
        },
    }


@router.put("/tenant-settings", dependencies=[Depends(require_role("owner", "manager", "admin"))])
async def put_tenant_crm_settings(
    body: TenantCRMUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant = await _tenant(db, current_user.tenant_id)
    base = dict(tenant.settings or {})
    crm = dict(base.get("crm") or {})
    if body.salesforce is not None:
        crm["salesforce"] = {**(crm.get("salesforce") or {}), **body.salesforce}
    if body.hubspot is not None:
        crm["hubspot"] = {**(crm.get("hubspot") or {}), **body.hubspot}
    base["crm"] = crm
    tenant.settings = base
    await db.flush()
    return {"status": "ok"}


@router.post("/salesforce/test", dependencies=[Depends(require_role("owner", "manager", "admin"))])
async def salesforce_test(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = CRMSyncService(db)
    try:
        creds = await svc._get_crm_credentials(str(current_user.tenant_id), "salesforce")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)[:500]) from e
    if not creds:
        raise HTTPException(status_code=400, detail="Salesforce not configured (refresh token + client id/secret)")
    probe = await svc.salesforce_identity_probe(creds)
    ok = bool(probe.get("ok"))
    await upsert_connector_status(
        db,
        current_user.tenant_id,
        "crm_salesforce",
        status="ok" if ok else "error",
        success=ok,
        last_error=None if ok else str(probe.get("detail") or probe)[:500],
    )
    return probe


@router.post("/salesforce/push-lead/{lead_id}", dependencies=[Depends(require_role("owner", "manager", "admin"))])
async def salesforce_push_lead(
    lead_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = CRMSyncService(db)
    res = await svc.sync_lead_to_crm(str(current_user.tenant_id), str(lead_id), "salesforce")
    if res.get("status") == "success" and res.get("salesforce_id"):
        ls = LeadService(db)
        await ls.merge_lead_extra_metadata(
            str(current_user.tenant_id),
            str(lead_id),
            {"salesforce_lead_id": res["salesforce_id"]},
        )
        await upsert_connector_status(
            db, current_user.tenant_id, "crm_salesforce", status="ok", success=True,
        )
    elif res.get("status") == "error":
        await upsert_connector_status(
            db,
            current_user.tenant_id,
            "crm_salesforce",
            status="error",
            last_error=str(res.get("message", res))[:500],
        )
    return res


class PullBody(BaseModel):
    since: str | None = Field(None, description="Ignored for Salesforce MVP; reserved for SOQL")


@router.post("/salesforce/pull-leads", dependencies=[Depends(require_role("owner", "manager", "admin"))])
async def salesforce_pull_leads(
    body: PullBody | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _ = body
    svc = CRMSyncService(db)
    res = await svc.full_sync(str(current_user.tenant_id), "salesforce")
    if res.get("status") == "completed":
        await upsert_connector_status(
            db, current_user.tenant_id, "crm_salesforce", status="ok", success=True,
        )
    return res


@router.post("/hubspot/test", dependencies=[Depends(require_role("owner", "manager", "admin"))])
async def hubspot_test(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = CRMSyncService(db)
    creds = await svc._get_crm_credentials(str(current_user.tenant_id), "hubspot")
    if not creds:
        raise HTTPException(status_code=400, detail="HubSpot token not configured")
    probe = await svc.hubspot_identity_probe(creds.get("api_key", ""))
    ok = bool(probe.get("ok"))
    await upsert_connector_status(
        db,
        current_user.tenant_id,
        "crm_hubspot",
        status="ok" if ok else "error",
        success=ok,
        last_error=None if ok else str(probe.get("detail") or probe)[:500],
    )
    return probe


@router.post("/hubspot/push-lead/{lead_id}", dependencies=[Depends(require_role("owner", "manager", "admin"))])
async def hubspot_push_lead(
    lead_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = CRMSyncService(db)
    res = await svc.sync_lead_to_crm(str(current_user.tenant_id), str(lead_id), "hubspot")
    if res.get("status") == "success" and res.get("hubspot_id"):
        ls = LeadService(db)
        await ls.merge_lead_extra_metadata(
            str(current_user.tenant_id),
            str(lead_id),
            {"hubspot_contact_id": res["hubspot_id"]},
        )
        await upsert_connector_status(
            db, current_user.tenant_id, "crm_hubspot", status="ok", success=True,
        )
    elif res.get("status") == "error":
        await upsert_connector_status(
            db,
            current_user.tenant_id,
            "crm_hubspot",
            status="error",
            last_error=str(res.get("message", res))[:500],
        )
    return res


@router.post("/hubspot/pull-contacts", dependencies=[Depends(require_role("owner", "manager", "admin"))])
async def hubspot_pull_contacts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    svc = CRMSyncService(db)
    res = await svc.full_sync(str(current_user.tenant_id), "hubspot")
    if res.get("status") == "completed":
        await upsert_connector_status(
            db, current_user.tenant_id, "crm_hubspot", status="ok", success=True,
        )
    return res
