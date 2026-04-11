"""
Analytics Service — ROI tracking, conversion funnels, channel performance.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select, func, and_, case, extract
from sqlalchemy.ext.asyncio import AsyncSession


class AnalyticsService:
    """Platform-wide analytics and ROI tracking for B2B clients."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_kpi_summary(self, tenant_id: str, days: int = 30) -> dict:
        from app.models.lead import Lead
        from app.models.deal import Deal

        tid = uuid.UUID(tenant_id)
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

        # Leads
        total_leads = await self._count(Lead, tid)
        new_leads = await self._count(Lead, tid, Lead.created_at >= cutoff)
        qualified = await self._count(Lead, tid, Lead.status == "qualified")
        converted = await self._count(Lead, tid, Lead.status == "converted")

        # Deals
        total_deals = await self._count(Deal, tid)
        won_deals = await self._count(Deal, tid, Deal.stage == "closed_won")
        total_revenue = await self._sum(Deal, Deal.value, tid, Deal.stage == "closed_won")
        pipeline_value = await self._sum(
            Deal, Deal.value, tid,
            Deal.stage.in_(["discovery", "proposal", "negotiation"])
        )

        # Rates
        conversion_rate = (converted / total_leads * 100) if total_leads > 0 else 0
        win_rate = (won_deals / total_deals * 100) if total_deals > 0 else 0

        return {
            "period_days": days,
            "leads": {
                "total": total_leads,
                "new": new_leads,
                "qualified": qualified,
                "converted": converted,
                "conversion_rate": round(conversion_rate, 1),
            },
            "deals": {
                "total": total_deals,
                "won": won_deals,
                "win_rate": round(win_rate, 1),
                "total_revenue": total_revenue,
                "pipeline_value": pipeline_value,
            },
            "roi": {
                "revenue": total_revenue,
                "cost_per_lead": 0,  # Calculated when billing is active
                "cost_per_meeting": 0,
                "cost_per_deal": 0,
            },
        }

    async def get_conversion_funnel(self, tenant_id: str) -> dict:
        from app.models.lead import Lead

        tid = uuid.UUID(tenant_id)
        stages = {
            "total_leads": await self._count(Lead, tid),
            "contacted": await self._count(Lead, tid, Lead.status.in_(["contacted", "qualified", "converted"])),
            "qualified": await self._count(Lead, tid, Lead.status.in_(["qualified", "converted"])),
            "converted": await self._count(Lead, tid, Lead.status == "converted"),
        }

        total = stages["total_leads"] or 1
        funnel = [
            {"stage": "العملاء المحتملين", "stage_en": "Leads", "count": stages["total_leads"], "rate": 100},
            {"stage": "تم التواصل", "stage_en": "Contacted", "count": stages["contacted"], "rate": round(stages["contacted"] / total * 100, 1)},
            {"stage": "مؤهل", "stage_en": "Qualified", "count": stages["qualified"], "rate": round(stages["qualified"] / total * 100, 1)},
            {"stage": "تم التحويل", "stage_en": "Converted", "count": stages["converted"], "rate": round(stages["converted"] / total * 100, 1)},
        ]

        return {"funnel": funnel}

    async def get_channel_performance(self, tenant_id: str) -> dict:
        from app.models.lead import Lead

        tid = uuid.UUID(tenant_id)
        q = (
            select(
                Lead.source,
                func.count().label("count"),
                func.avg(Lead.score).label("avg_score"),
            )
            .where(Lead.tenant_id == tid)
            .group_by(Lead.source)
            .order_by(func.count().desc())
        )
        rows = (await self.db.execute(q)).all()

        channels = []
        for row in rows:
            converted_q = select(func.count()).where(
                Lead.tenant_id == tid,
                Lead.source == row.source,
                Lead.status == "converted",
            )
            converted = (await self.db.execute(converted_q)).scalar() or 0
            channels.append({
                "channel": row.source,
                "leads": row.count,
                "avg_score": round(float(row.avg_score or 0), 1),
                "converted": converted,
                "conversion_rate": round(converted / row.count * 100, 1) if row.count > 0 else 0,
            })

        return {"channels": channels}

    async def get_sector_performance(self, tenant_id: str) -> dict:
        from app.models.lead import Lead

        tid = uuid.UUID(tenant_id)
        q = (
            select(
                Lead.sector,
                func.count().label("total"),
                func.avg(Lead.score).label("avg_score"),
            )
            .where(Lead.tenant_id == tid, Lead.sector != "")
            .group_by(Lead.sector)
            .order_by(func.count().desc())
        )
        rows = (await self.db.execute(q)).all()

        sectors = []
        for row in rows:
            converted_q = select(func.count()).where(
                Lead.tenant_id == tid,
                Lead.sector == row.sector,
                Lead.status == "converted",
            )
            converted = (await self.db.execute(converted_q)).scalar() or 0
            sectors.append({
                "sector": row.sector,
                "total_leads": row.total,
                "avg_score": round(float(row.avg_score or 0), 1),
                "converted": converted,
                "conversion_rate": round(converted / row.total * 100, 1) if row.total > 0 else 0,
            })

        return {"sectors": sectors}

    async def get_agent_performance(self, tenant_id: str) -> dict:
        from app.models.lead import Lead
        from app.models.user import User

        tid = uuid.UUID(tenant_id)
        agents_q = select(User).where(
            User.tenant_id == tid,
            User.role.in_(["agent", "manager"]),
            User.is_active == True,
        )
        agents = (await self.db.execute(agents_q)).scalars().all()

        performance = []
        for agent in agents:
            total = await self._count(Lead, tid, Lead.assigned_to == agent.id)
            converted = await self._count(
                Lead, tid, Lead.assigned_to == agent.id, Lead.status == "converted"
            )
            performance.append({
                "agent_id": str(agent.id),
                "name": agent.full_name,
                "total_leads": total,
                "converted": converted,
                "conversion_rate": round(converted / total * 100, 1) if total > 0 else 0,
            })

        performance.sort(key=lambda x: x["converted"], reverse=True)
        return {"agents": performance}

    async def get_trends(self, tenant_id: str, days: int = 90) -> dict:
        from app.models.lead import Lead

        tid = uuid.UUID(tenant_id)
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

        q = (
            select(
                func.date_trunc("day", Lead.created_at).label("day"),
                func.count().label("count"),
            )
            .where(Lead.tenant_id == tid, Lead.created_at >= cutoff)
            .group_by("day")
            .order_by("day")
        )
        rows = (await self.db.execute(q)).all()

        return {
            "daily_leads": [
                {"date": str(row.day), "count": row.count} for row in rows
            ],
        }

    # ── Helpers ───────────────────────────────────

    async def _count(self, model, tenant_id, *filters):
        q = select(func.count()).where(model.tenant_id == tenant_id, *filters)
        return (await self.db.execute(q)).scalar() or 0

    async def _sum(self, model, field, tenant_id, *filters):
        q = select(func.coalesce(func.sum(field), 0)).where(
            model.tenant_id == tenant_id, *filters
        )
        return float((await self.db.execute(q)).scalar() or 0)
