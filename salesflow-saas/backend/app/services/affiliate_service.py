"""
Affiliate Service — Recruitment, commissions, career path, performance tracking.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession


TIER_THRESHOLDS = {
    "bronze": {"min_deals": 0, "commission_rate": 10.0},
    "silver": {"min_deals": 5, "commission_rate": 12.5},
    "gold": {"min_deals": 15, "commission_rate": 15.0},
    "platinum": {"min_deals": 30, "commission_rate": 20.0},
}

CAREER_PATH = {
    "affiliate": {"next": "senior_affiliate", "deals_required": 10, "months": 3},
    "senior_affiliate": {"next": "team_lead", "deals_required": 25, "months": 6},
    "team_lead": {"next": "employee", "deals_required": 50, "months": 12},
}


class AffiliateService:
    """Full affiliate lifecycle: recruitment, performance, commissions, career path."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Recruitment ───────────────────────────────

    async def apply(
        self,
        tenant_id: str,
        user_id: str,
        referral_code: str = None,
    ) -> dict:
        from app.models.affiliate import Affiliate
        import secrets

        affiliate = Affiliate(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(tenant_id),
            user_id=uuid.UUID(user_id),
            status="applied",
            tier="bronze",
            referral_code=referral_code or secrets.token_urlsafe(8).upper()[:8],
            commission_rate=Decimal("10.0"),
        )
        self.db.add(affiliate)
        await self.db.flush()
        return self._to_dict(affiliate)

    async def approve(self, tenant_id: str, affiliate_id: str) -> Optional[dict]:
        from app.models.affiliate import Affiliate

        result = await self.db.execute(
            select(Affiliate).where(
                Affiliate.id == uuid.UUID(affiliate_id),
                Affiliate.tenant_id == uuid.UUID(tenant_id),
            )
        )
        aff = result.scalar_one_or_none()
        if not aff:
            return None

        aff.status = "active"
        aff.approved_at = datetime.now(timezone.utc)
        await self.db.flush()
        return self._to_dict(aff)

    async def suspend(self, tenant_id: str, affiliate_id: str, reason: str = "") -> Optional[dict]:
        from app.models.affiliate import Affiliate

        result = await self.db.execute(
            select(Affiliate).where(
                Affiliate.id == uuid.UUID(affiliate_id),
                Affiliate.tenant_id == uuid.UUID(tenant_id),
            )
        )
        aff = result.scalar_one_or_none()
        if not aff:
            return None

        aff.status = "suspended"
        await self.db.flush()
        return self._to_dict(aff)

    # ── Commission Calculation ────────────────────

    async def calculate_commission(
        self,
        tenant_id: str,
        affiliate_id: str,
        deal_id: str,
        deal_value: float,
    ) -> dict:
        from app.models.commission import Commission
        from app.models.affiliate import Affiliate

        result = await self.db.execute(
            select(Affiliate).where(
                Affiliate.id == uuid.UUID(affiliate_id),
                Affiliate.tenant_id == uuid.UUID(tenant_id),
            )
        )
        aff = result.scalar_one_or_none()
        if not aff:
            return {}

        rate = float(aff.commission_rate)
        amount = round(deal_value * rate / 100, 2)

        commission = Commission(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(tenant_id),
            affiliate_id=uuid.UUID(affiliate_id),
            deal_id=uuid.UUID(deal_id),
            amount=Decimal(str(amount)),
            currency="SAR",
            rate=aff.commission_rate,
            status="pending",
            period=datetime.now(timezone.utc).date().replace(day=1),
        )
        self.db.add(commission)
        await self.db.flush()

        return {
            "commission_id": str(commission.id),
            "amount": amount,
            "rate": rate,
            "status": "pending",
        }

    # ── Tier Progression ──────────────────────────

    async def check_tier_upgrade(self, tenant_id: str, affiliate_id: str) -> Optional[dict]:
        from app.models.affiliate import Affiliate, AffiliatePerformance

        result = await self.db.execute(
            select(Affiliate).where(
                Affiliate.id == uuid.UUID(affiliate_id),
                Affiliate.tenant_id == uuid.UUID(tenant_id),
            )
        )
        aff = result.scalar_one_or_none()
        if not aff:
            return None

        # Get total deals closed
        perf_q = select(func.coalesce(func.sum(AffiliatePerformance.deals_closed), 0)).where(
            AffiliatePerformance.affiliate_id == uuid.UUID(affiliate_id),
        )
        total_deals = (await self.db.execute(perf_q)).scalar() or 0

        # Check upgrade
        tiers = ["bronze", "silver", "gold", "platinum"]
        current_idx = tiers.index(aff.tier) if aff.tier in tiers else 0

        for i in range(current_idx + 1, len(tiers)):
            tier = tiers[i]
            if total_deals >= TIER_THRESHOLDS[tier]["min_deals"]:
                aff.tier = tier
                aff.commission_rate = Decimal(str(TIER_THRESHOLDS[tier]["commission_rate"]))
                await self.db.flush()
                return {
                    "upgraded": True,
                    "new_tier": tier,
                    "new_rate": TIER_THRESHOLDS[tier]["commission_rate"],
                    "total_deals": total_deals,
                }

        return {
            "upgraded": False,
            "current_tier": aff.tier,
            "total_deals": total_deals,
            "next_tier": tiers[current_idx + 1] if current_idx < len(tiers) - 1 else None,
            "deals_needed": TIER_THRESHOLDS[tiers[min(current_idx + 1, len(tiers) - 1)]]["min_deals"] - total_deals,
        }

    # ── Career Path (Affiliate → Employee) ────────

    async def check_career_path(self, tenant_id: str, affiliate_id: str) -> dict:
        from app.models.affiliate import Affiliate, AffiliatePerformance

        result = await self.db.execute(
            select(Affiliate).where(
                Affiliate.id == uuid.UUID(affiliate_id),
                Affiliate.tenant_id == uuid.UUID(tenant_id),
            )
        )
        aff = result.scalar_one_or_none()
        if not aff:
            return {}

        perf_q = select(func.coalesce(func.sum(AffiliatePerformance.deals_closed), 0)).where(
            AffiliatePerformance.affiliate_id == uuid.UUID(affiliate_id),
        )
        total_deals = (await self.db.execute(perf_q)).scalar() or 0

        months_active = 0
        if aff.approved_at:
            delta = datetime.now(timezone.utc) - aff.approved_at.replace(tzinfo=timezone.utc)
            months_active = delta.days // 30

        # Employee eligibility
        eligible = total_deals >= 50 and months_active >= 12

        return {
            "affiliate_id": str(affiliate_id),
            "total_deals": total_deals,
            "months_active": months_active,
            "eligible_for_employment": eligible,
            "current_tier": aff.tier,
            "progress": {
                "deals": {"current": total_deals, "required": 50, "percent": min(100, total_deals * 100 // 50)},
                "months": {"current": months_active, "required": 12, "percent": min(100, months_active * 100 // 12)},
            },
        }

    # ── Leaderboard ───────────────────────────────

    async def get_leaderboard(self, tenant_id: str, limit: int = 20) -> list:
        from app.models.affiliate import Affiliate, AffiliatePerformance

        q = (
            select(
                Affiliate.id,
                Affiliate.tier,
                Affiliate.referral_code,
                func.coalesce(func.sum(AffiliatePerformance.deals_closed), 0).label("total_deals"),
                func.coalesce(func.sum(AffiliatePerformance.revenue_attributed), 0).label("total_revenue"),
                func.coalesce(func.sum(AffiliatePerformance.commission_earned), 0).label("total_commission"),
            )
            .outerjoin(AffiliatePerformance, Affiliate.id == AffiliatePerformance.affiliate_id)
            .where(
                Affiliate.tenant_id == uuid.UUID(tenant_id),
                Affiliate.status == "active",
            )
            .group_by(Affiliate.id, Affiliate.tier, Affiliate.referral_code)
            .order_by(func.sum(AffiliatePerformance.revenue_attributed).desc().nullslast())
            .limit(limit)
        )

        rows = (await self.db.execute(q)).all()
        return [
            {
                "rank": i + 1,
                "affiliate_id": str(row.id),
                "tier": row.tier,
                "referral_code": row.referral_code,
                "total_deals": int(row.total_deals),
                "total_revenue": float(row.total_revenue),
                "total_commission": float(row.total_commission),
            }
            for i, row in enumerate(rows)
        ]

    # ── Performance Summary ───────────────────────

    async def get_performance(self, tenant_id: str, affiliate_id: str) -> dict:
        from app.models.affiliate import AffiliatePerformance

        q = select(AffiliatePerformance).where(
            AffiliatePerformance.affiliate_id == uuid.UUID(affiliate_id),
        ).order_by(AffiliatePerformance.period.desc()).limit(12)

        rows = (await self.db.execute(q)).scalars().all()

        monthly = [
            {
                "period": row.period.isoformat() if row.period else None,
                "leads_generated": row.leads_generated,
                "deals_closed": row.deals_closed,
                "revenue_attributed": float(row.revenue_attributed) if row.revenue_attributed else 0,
                "commission_earned": float(row.commission_earned) if row.commission_earned else 0,
                "conversion_rate": float(row.conversion_rate) if row.conversion_rate else 0,
            }
            for row in rows
        ]

        return {
            "affiliate_id": str(affiliate_id),
            "monthly": monthly,
            "totals": {
                "leads": sum(m["leads_generated"] for m in monthly),
                "deals": sum(m["deals_closed"] for m in monthly),
                "revenue": sum(m["revenue_attributed"] for m in monthly),
                "commission": sum(m["commission_earned"] for m in monthly),
            },
        }

    @staticmethod
    def _to_dict(aff) -> dict:
        if not aff:
            return {}
        return {
            "id": str(aff.id),
            "tenant_id": str(aff.tenant_id),
            "user_id": str(aff.user_id),
            "status": aff.status,
            "tier": aff.tier,
            "referral_code": aff.referral_code,
            "commission_rate": float(aff.commission_rate) if aff.commission_rate else 0,
            "approved_at": aff.approved_at.isoformat() if aff.approved_at else None,
            "created_at": aff.created_at.isoformat() if aff.created_at else None,
        }
