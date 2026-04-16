"""Contradiction Engine — detects and tracks conflicts across the platform."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.contradiction import (
    Contradiction,
    ContradictionSeverity,
    ContradictionStatus,
    ContradictionType,
)


class ContradictionEngine:
    """Manages contradiction lifecycle: detect → review → resolve."""

    async def register(
        self,
        db: AsyncSession,
        *,
        tenant_id: str,
        source_a: str,
        source_b: str,
        claim_a: str,
        claim_b: str,
        contradiction_type: str = "factual",
        severity: str = "medium",
        detected_by: str = "manual",
        evidence: Optional[Dict[str, Any]] = None,
    ) -> Contradiction:
        contradiction = Contradiction(
            tenant_id=tenant_id,
            source_a=source_a,
            source_b=source_b,
            claim_a=claim_a,
            claim_b=claim_b,
            contradiction_type=ContradictionType(contradiction_type),
            severity=ContradictionSeverity(severity),
            status=ContradictionStatus.DETECTED,
            detected_by=detected_by,
            evidence=evidence or {},
        )
        db.add(contradiction)
        await db.commit()
        await db.refresh(contradiction)
        return contradiction

    async def get_active(
        self, db: AsyncSession, *, tenant_id: str
    ) -> List[Contradiction]:
        stmt = (
            select(Contradiction)
            .where(Contradiction.tenant_id == tenant_id)
            .where(
                Contradiction.status.in_([
                    ContradictionStatus.DETECTED,
                    ContradictionStatus.REVIEWING,
                ])
            )
            .order_by(Contradiction.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(
        self, db: AsyncSession, *, tenant_id: str, contradiction_id: str
    ) -> Optional[Contradiction]:
        stmt = (
            select(Contradiction)
            .where(Contradiction.tenant_id == tenant_id)
            .where(Contradiction.id == contradiction_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def resolve(
        self,
        db: AsyncSession,
        *,
        tenant_id: str,
        contradiction_id: str,
        resolution: str,
        resolved_by_id: str,
        status: str = "resolved",
    ) -> Optional[Contradiction]:
        contradiction = await self.get_by_id(
            db, tenant_id=tenant_id, contradiction_id=contradiction_id
        )
        if not contradiction:
            return None
        contradiction.status = ContradictionStatus(status)
        contradiction.resolution = resolution
        contradiction.resolved_by_id = resolved_by_id
        contradiction.resolved_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(contradiction)
        return contradiction

    async def get_stats(
        self, db: AsyncSession, *, tenant_id: str
    ) -> Dict[str, Any]:
        base = select(func.count()).where(Contradiction.tenant_id == tenant_id)

        total_result = await db.execute(base)
        total = total_result.scalar() or 0

        active_result = await db.execute(
            base.where(
                Contradiction.status.in_([
                    ContradictionStatus.DETECTED,
                    ContradictionStatus.REVIEWING,
                ])
            )
        )
        active = active_result.scalar() or 0

        critical_result = await db.execute(
            base.where(Contradiction.severity == ContradictionSeverity.CRITICAL)
            .where(
                Contradiction.status.in_([
                    ContradictionStatus.DETECTED,
                    ContradictionStatus.REVIEWING,
                ])
            )
        )
        critical = critical_result.scalar() or 0

        return {
            "total": total,
            "active": active,
            "resolved": total - active,
            "critical_active": critical,
        }


contradiction_engine = ContradictionEngine()
