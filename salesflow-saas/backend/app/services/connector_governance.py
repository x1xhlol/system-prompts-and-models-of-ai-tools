"""Connector Governance — health checks and governance for all integrations."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.operations import IntegrationSyncState


# Known connectors with their display names
KNOWN_CONNECTORS = {
    "whatsapp": {"name": "WhatsApp Business API", "name_ar": "واتساب بيزنس"},
    "salesforce": {"name": "Salesforce Agentforce", "name_ar": "سيلزفورس"},
    "stripe": {"name": "Stripe Payments", "name_ar": "سترايب للمدفوعات"},
    "voice": {"name": "Voice (Twilio)", "name_ar": "المكالمات الصوتية"},
    "email": {"name": "Email (SMTP/SendGrid)", "name_ar": "البريد الإلكتروني"},
    "docusign": {"name": "DocuSign / Adobe Sign", "name_ar": "التوقيع الإلكتروني"},
    "cal": {"name": "Cal.com Meetings", "name_ar": "حجز الاجتماعات"},
}


class ConnectorGovernanceService:
    """Manages connector health, governance, and monitoring."""

    async def get_governance_board(
        self, db: AsyncSession, *, tenant_id: str
    ) -> List[Dict[str, Any]]:
        stmt = (
            select(IntegrationSyncState)
            .where(IntegrationSyncState.tenant_id == tenant_id)
            .order_by(IntegrationSyncState.connector_key)
        )
        result = await db.execute(stmt)
        connectors = list(result.scalars().all())

        board = []
        seen_keys = set()
        for conn in connectors:
            seen_keys.add(conn.connector_key)
            info = KNOWN_CONNECTORS.get(conn.connector_key, {})
            board.append({
                "connector_key": conn.connector_key,
                "display_name": info.get("name", conn.connector_key),
                "display_name_ar": conn.display_name_ar or info.get("name_ar", ""),
                "status": conn.status,
                "last_success_at": conn.last_success_at.isoformat() if conn.last_success_at else None,
                "last_attempt_at": conn.last_attempt_at.isoformat() if conn.last_attempt_at else None,
                "last_error": conn.last_error,
                "registered": True,
            })

        # Add known but unregistered connectors
        for key, info in KNOWN_CONNECTORS.items():
            if key not in seen_keys:
                board.append({
                    "connector_key": key,
                    "display_name": info["name"],
                    "display_name_ar": info["name_ar"],
                    "status": "not_configured",
                    "last_success_at": None,
                    "last_attempt_at": None,
                    "last_error": None,
                    "registered": False,
                })

        return board

    async def update_connector_status(
        self,
        db: AsyncSession,
        *,
        tenant_id: str,
        connector_key: str,
        status: str,
        error: Optional[str] = None,
    ) -> IntegrationSyncState:
        stmt = (
            select(IntegrationSyncState)
            .where(IntegrationSyncState.tenant_id == tenant_id)
            .where(IntegrationSyncState.connector_key == connector_key)
        )
        result = await db.execute(stmt)
        conn = result.scalar_one_or_none()

        now = datetime.now(timezone.utc)
        if not conn:
            info = KNOWN_CONNECTORS.get(connector_key, {})
            conn = IntegrationSyncState(
                tenant_id=tenant_id,
                connector_key=connector_key,
                display_name_ar=info.get("name_ar"),
                status=status,
                last_attempt_at=now,
                last_error=error,
            )
            if status == "ok":
                conn.last_success_at = now
            db.add(conn)
        else:
            conn.status = status
            conn.last_attempt_at = now
            conn.last_error = error
            if status == "ok":
                conn.last_success_at = now

        await db.commit()
        await db.refresh(conn)
        return conn


connector_governance = ConnectorGovernanceService()
