"""
Deal Service — Pipeline management, stage transitions, forecasting.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession


VALID_STAGES = ["discovery", "proposal", "negotiation", "closed_won", "closed_lost"]
STAGE_PROBABILITIES = {
    "discovery": 20,
    "proposal": 40,
    "negotiation": 60,
    "closed_won": 100,
    "closed_lost": 0,
}


class DealService:
    """Manages the deal pipeline from discovery to close."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── CRUD ──────────────────────────────────────

    async def create_deal(
        self,
        tenant_id: str,
        lead_id: str = None,
        assigned_to: str = None,
        title: str = "",
        stage: str = "discovery",
        value: float = 0,
        currency: str = "SAR",
        expected_close: str = None,
    ) -> dict:
        from app.models.deal import Deal

        deal = Deal(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(tenant_id),
            lead_id=uuid.UUID(lead_id) if lead_id else None,
            assigned_to=uuid.UUID(assigned_to) if assigned_to else None,
            title=title,
            stage=stage,
            value=Decimal(str(value)),
            currency=currency,
            probability=STAGE_PROBABILITIES.get(stage, 20),
            expected_close=datetime.fromisoformat(expected_close) if expected_close else None,
        )
        self.db.add(deal)
        await self.db.flush()
        return self._to_dict(deal)

    async def get_deal(self, tenant_id: str, deal_id: str) -> Optional[dict]:
        from app.models.deal import Deal

        result = await self.db.execute(
            select(Deal).where(
                Deal.id == uuid.UUID(deal_id),
                Deal.tenant_id == uuid.UUID(tenant_id),
            )
        )
        deal = result.scalar_one_or_none()
        return self._to_dict(deal) if deal else None

    async def list_deals(
        self,
        tenant_id: str,
        stage: str = None,
        assigned_to: str = None,
        min_value: float = None,
        page: int = 1,
        per_page: int = 25,
    ) -> dict:
        from app.models.deal import Deal

        query = select(Deal).where(Deal.tenant_id == uuid.UUID(tenant_id))

        if stage:
            query = query.where(Deal.stage == stage)
        if assigned_to:
            query = query.where(Deal.assigned_to == uuid.UUID(assigned_to))
        if min_value is not None:
            query = query.where(Deal.value >= Decimal(str(min_value)))

        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_q)).scalar() or 0

        query = query.order_by(Deal.created_at.desc())
        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await self.db.execute(query)
        deals = [self._to_dict(d) for d in result.scalars().all()]

        return {
            "items": deals,
            "total": total,
            "page": page,
            "per_page": per_page,
        }

    async def update_deal(self, tenant_id: str, deal_id: str, **updates) -> Optional[dict]:
        from app.models.deal import Deal

        result = await self.db.execute(
            select(Deal).where(
                Deal.id == uuid.UUID(deal_id),
                Deal.tenant_id == uuid.UUID(tenant_id),
            )
        )
        deal = result.scalar_one_or_none()
        if not deal:
            return None

        for key, value in updates.items():
            if hasattr(deal, key) and value is not None:
                setattr(deal, key, value)

        deal.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return self._to_dict(deal)

    # ── Stage Management ──────────────────────────

    async def move_stage(
        self,
        tenant_id: str,
        deal_id: str,
        new_stage: str,
        lost_reason: str = None,
    ) -> Optional[dict]:
        if new_stage not in VALID_STAGES:
            return None

        updates = {
            "stage": new_stage,
            "probability": STAGE_PROBABILITIES[new_stage],
        }

        if new_stage == "closed_won":
            updates["closed_at"] = datetime.now(timezone.utc)
        elif new_stage == "closed_lost":
            updates["closed_at"] = datetime.now(timezone.utc)
            if lost_reason:
                updates["lost_reason"] = lost_reason

        return await self.update_deal(tenant_id, deal_id, **updates)

    # ── Pipeline Analytics ────────────────────────

    async def get_pipeline(self, tenant_id: str) -> dict:
        from app.models.deal import Deal

        pipeline = {}
        for stage in VALID_STAGES:
            count_q = select(func.count()).where(
                Deal.tenant_id == uuid.UUID(tenant_id),
                Deal.stage == stage,
            )
            value_q = select(func.coalesce(func.sum(Deal.value), 0)).where(
                Deal.tenant_id == uuid.UUID(tenant_id),
                Deal.stage == stage,
            )
            count = (await self.db.execute(count_q)).scalar() or 0
            value = (await self.db.execute(value_q)).scalar() or 0
            pipeline[stage] = {
                "count": count,
                "value": float(value),
                "weighted": float(value) * STAGE_PROBABILITIES[stage] / 100,
            }

        total_value = sum(s["value"] for s in pipeline.values())
        total_weighted = sum(s["weighted"] for s in pipeline.values())

        return {
            "stages": pipeline,
            "total_deals": sum(s["count"] for s in pipeline.values()),
            "total_value": total_value,
            "weighted_value": total_weighted,
        }

    async def get_forecast(self, tenant_id: str) -> dict:
        from app.models.deal import Deal

        open_stages = ["discovery", "proposal", "negotiation"]
        monthly = {}

        for stage in open_stages:
            q = select(
                func.date_trunc("month", Deal.expected_close).label("month"),
                func.sum(Deal.value).label("value"),
                func.count().label("count"),
            ).where(
                Deal.tenant_id == uuid.UUID(tenant_id),
                Deal.stage == stage,
                Deal.expected_close.isnot(None),
            ).group_by("month")

            rows = (await self.db.execute(q)).all()
            for row in rows:
                key = str(row.month)
                if key not in monthly:
                    monthly[key] = {"value": 0, "weighted": 0, "count": 0}
                monthly[key]["value"] += float(row.value or 0)
                monthly[key]["weighted"] += float(row.value or 0) * STAGE_PROBABILITIES[stage] / 100
                monthly[key]["count"] += row.count

        return {"monthly_forecast": monthly}

    # ── Helpers ───────────────────────────────────

    @staticmethod
    def _to_dict(deal) -> dict:
        if not deal:
            return {}
        return {
            "id": str(deal.id),
            "tenant_id": str(deal.tenant_id),
            "lead_id": str(deal.lead_id) if deal.lead_id else None,
            "assigned_to": str(deal.assigned_to) if deal.assigned_to else None,
            "title": deal.title,
            "stage": deal.stage,
            "value": float(deal.value) if deal.value else 0,
            "currency": deal.currency,
            "probability": deal.probability,
            "expected_close": deal.expected_close.isoformat() if deal.expected_close else None,
            "closed_at": deal.closed_at.isoformat() if deal.closed_at else None,
            "lost_reason": deal.lost_reason,
            "created_at": deal.created_at.isoformat() if deal.created_at else None,
            "updated_at": deal.updated_at.isoformat() if deal.updated_at else None,
        }
