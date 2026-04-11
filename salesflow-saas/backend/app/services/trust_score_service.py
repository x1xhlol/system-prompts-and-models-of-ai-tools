"""
Trust Score Service — AI-powered scoring for leads and affiliates.
"""

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession


class TrustScoreService:
    """Calculates trust scores for leads and affiliates to prioritize high-quality opportunities."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Lead Trust Score (0-100) ──────────────────

    async def calculate_lead_score(self, tenant_id: str, lead_id: str) -> dict:
        from app.models.lead import Lead
        from app.models.message import Message

        result = await self.db.execute(
            select(Lead).where(
                Lead.id == uuid.UUID(lead_id),
                Lead.tenant_id == uuid.UUID(tenant_id),
            )
        )
        lead = result.scalar_one_or_none()
        if not lead:
            return {}

        score = 0
        breakdown = {}

        # 1. Contact info completeness (+20 max)
        contact_score = 0
        if lead.phone and len(lead.phone) >= 9:
            contact_score += 10
        if lead.email and "@" in lead.email:
            contact_score += 10
        breakdown["contact_info"] = contact_score
        score += contact_score

        # 2. Company info (+25 max)
        company_score = 0
        if lead.company_name:
            company_score += 10
        if lead.sector:
            company_score += 5
        if lead.city:
            company_score += 5
        # CR number verification would add +5 more
        breakdown["company_info"] = company_score
        score += company_score

        # 3. Engagement level (+25 max)
        msg_count_q = select(func.count()).where(
            Message.lead_id == uuid.UUID(lead_id),
            Message.direction == "inbound",
        )
        msg_count = (await self.db.execute(msg_count_q)).scalar() or 0
        engagement_score = min(25, msg_count * 5)
        breakdown["engagement"] = engagement_score
        score += engagement_score

        # 4. Response speed (+15 max)
        if msg_count > 0:
            # Has responded = good sign
            response_score = 15
        else:
            response_score = 0
        breakdown["responsiveness"] = response_score
        score += response_score

        # 5. Source quality (+15 max)
        source_scores = {
            "referral": 15, "affiliate": 12, "web": 10,
            "whatsapp": 8, "import": 5, "cold": 3,
        }
        source_score = source_scores.get(lead.source, 5)
        breakdown["source_quality"] = source_score
        score += source_score

        # Normalize to 0-100
        score = min(100, score)

        # Classification
        if score >= 70:
            classification = "hot"
            classification_ar = "ساخن 🔥"
        elif score >= 40:
            classification = "warm"
            classification_ar = "دافئ ☀️"
        else:
            classification = "cold"
            classification_ar = "بارد ❄️"

        # Update lead score
        lead.score = score
        await self.db.flush()

        return {
            "lead_id": str(lead_id),
            "trust_score": score,
            "classification": classification,
            "classification_ar": classification_ar,
            "breakdown": breakdown,
            "recommendation": self._get_lead_recommendation(classification),
        }

    # ── Affiliate Trust Score (0-100) ─────────────

    async def calculate_affiliate_score(self, tenant_id: str, affiliate_id: str) -> dict:
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

        score = 0
        breakdown = {}

        # 1. Lead Quality — conversion rate (40% weight)
        perf_q = select(
            func.coalesce(func.sum(AffiliatePerformance.leads_generated), 0),
            func.coalesce(func.sum(AffiliatePerformance.deals_closed), 0),
        ).where(AffiliatePerformance.affiliate_id == uuid.UUID(affiliate_id))

        perf = (await self.db.execute(perf_q)).first()
        total_leads = int(perf[0]) if perf else 0
        total_deals = int(perf[1]) if perf else 0

        if total_leads > 0:
            conv_rate = total_deals / total_leads
            quality_score = min(40, int(conv_rate * 200))
        else:
            quality_score = 0
        breakdown["lead_quality"] = quality_score
        score += quality_score

        # 2. Activity Consistency (20% weight)
        recent_q = select(func.count()).where(
            AffiliatePerformance.affiliate_id == uuid.UUID(affiliate_id),
            AffiliatePerformance.leads_generated > 0,
        )
        active_months = (await self.db.execute(recent_q)).scalar() or 0
        consistency_score = min(20, active_months * 4)
        breakdown["consistency"] = consistency_score
        score += consistency_score

        # 3. Volume (20% weight)
        volume_score = min(20, total_deals * 2)
        breakdown["volume"] = volume_score
        score += volume_score

        # 4. Tier bonus (10% weight)
        tier_scores = {"bronze": 2, "silver": 5, "gold": 8, "platinum": 10}
        tier_score = tier_scores.get(aff.tier, 0)
        breakdown["tier_bonus"] = tier_score
        score += tier_score

        # 5. Longevity (10% weight)
        months_active = 0
        if aff.approved_at:
            delta = datetime.now(timezone.utc) - aff.approved_at.replace(tzinfo=timezone.utc)
            months_active = delta.days // 30
        longevity = min(10, months_active)
        breakdown["longevity"] = longevity
        score += longevity

        score = min(100, score)

        if score >= 75:
            tier_label = "Elite ⭐"
        elif score >= 50:
            tier_label = "Trusted ✅"
        elif score >= 25:
            tier_label = "Growing 📈"
        else:
            tier_label = "New 🆕"

        return {
            "affiliate_id": str(affiliate_id),
            "trust_score": score,
            "label": tier_label,
            "breakdown": breakdown,
            "stats": {
                "total_leads": total_leads,
                "total_deals": total_deals,
                "months_active": months_active,
                "conversion_rate": round(total_deals / total_leads * 100, 1) if total_leads > 0 else 0,
            },
        }

    # ── Batch Scoring ─────────────────────────────

    async def score_all_leads(self, tenant_id: str) -> dict:
        from app.models.lead import Lead

        result = await self.db.execute(
            select(Lead.id).where(
                Lead.tenant_id == uuid.UUID(tenant_id),
                Lead.status.in_(["new", "contacted"]),
            )
        )
        lead_ids = [str(lid) for lid in result.scalars().all()]

        scored = 0
        for lid in lead_ids:
            await self.calculate_lead_score(tenant_id, lid)
            scored += 1

        return {"scored": scored, "total": len(lead_ids)}

    # ── Helpers ───────────────────────────────────

    @staticmethod
    def _get_lead_recommendation(classification: str) -> dict:
        recommendations = {
            "hot": {
                "action": "book_meeting",
                "action_ar": "احجز موعد فوراً",
                "priority": "critical",
                "message": "This lead shows strong buying signals. Book a meeting immediately.",
            },
            "warm": {
                "action": "nurture",
                "action_ar": "تابع التواصل",
                "priority": "high",
                "message": "Engage with targeted content and schedule a follow-up.",
            },
            "cold": {
                "action": "drip_campaign",
                "action_ar": "أضف لحملة المتابعة",
                "priority": "low",
                "message": "Add to drip campaign. Re-evaluate in 2 weeks.",
            },
        }
        return recommendations.get(classification, recommendations["cold"])
