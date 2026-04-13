"""Probe external integrations and persist status on IntegrationSyncState."""

from __future__ import annotations

import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.crm_sync_service import CRMSyncService
from app.services.operations_hub import upsert_connector_status

logger = logging.getLogger("dealix.integration_probe")


async def probe_and_persist_crm_connectors(db: AsyncSession, tenant_id: UUID) -> None:
    """Update crm_salesforce / crm_hubspot connector rows from live probes (best-effort)."""
    svc = CRMSyncService(db)
    tid = str(tenant_id)

    # Salesforce
    try:
        creds = await svc._get_crm_credentials(tid, "salesforce")
        if not creds:
            await upsert_connector_status(
                db, tenant_id, "crm_salesforce", status="unknown",
            )
        else:
            probe = await svc.salesforce_identity_probe(creds)
            if probe.get("ok"):
                await upsert_connector_status(
                    db, tenant_id, "crm_salesforce", status="ok", success=True,
                )
            else:
                await upsert_connector_status(
                    db,
                    tenant_id,
                    "crm_salesforce",
                    status="error",
                    last_error=str(probe.get("detail") or probe)[:500],
                )
    except Exception as e:
        logger.exception("Salesforce probe failed")
        await upsert_connector_status(
            db, tenant_id, "crm_salesforce", status="error", last_error=str(e)[:500],
        )

    # HubSpot
    try:
        creds = await svc._get_crm_credentials(tid, "hubspot")
        if not creds:
            await upsert_connector_status(
                db, tenant_id, "crm_hubspot", status="unknown",
            )
        else:
            probe = await svc.hubspot_identity_probe(creds.get("api_key", ""))
            if probe.get("ok"):
                await upsert_connector_status(
                    db, tenant_id, "crm_hubspot", status="ok", success=True,
                )
            else:
                await upsert_connector_status(
                    db,
                    tenant_id,
                    "crm_hubspot",
                    status="error",
                    last_error=str(probe.get("detail") or probe)[:500],
                )
    except Exception as e:
        logger.exception("HubSpot probe failed")
        await upsert_connector_status(
            db, tenant_id, "crm_hubspot", status="error", last_error=str(e)[:500],
        )
