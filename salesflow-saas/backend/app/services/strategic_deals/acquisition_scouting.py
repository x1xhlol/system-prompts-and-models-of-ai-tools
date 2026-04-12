"""
Acquisition Scouting Engine — AI-powered M&A target identification for Saudi B2B.
محرك استكشاف الاستحواذ: تحديد أهداف الاندماج والاستحواذ بالذكاء الاصطناعي للسوق السعودي
"""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select, and_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import CompanyProfile
from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.strategic_deals.acquisition_scouting")

# ── Saudi sector synergy map ────────────────────────────────────────────────

SECTOR_SYNERGY = {
    "technology": ["consulting", "telecom", "media", "education"],
    "construction": ["real_estate", "manufacturing", "energy", "logistics"],
    "real_estate": ["construction", "finance", "tourism"],
    "retail": ["wholesale", "logistics", "food_beverage", "marketing"],
    "healthcare": ["technology", "manufacturing", "consulting"],
    "finance": ["technology", "real_estate", "consulting"],
    "logistics": ["retail", "wholesale", "manufacturing", "food_beverage"],
    "energy": ["construction", "manufacturing", "technology"],
    "food_beverage": ["logistics", "retail", "agriculture", "tourism"],
    "consulting": ["technology", "finance", "healthcare", "education"],
    "manufacturing": ["construction", "wholesale", "logistics", "energy"],
    "marketing": ["technology", "media", "retail", "telecom"],
    "telecom": ["technology", "media", "consulting"],
    "education": ["technology", "consulting", "media"],
    "tourism": ["food_beverage", "real_estate", "marketing"],
    "media": ["marketing", "technology", "telecom", "tourism"],
    "agriculture": ["food_beverage", "logistics", "manufacturing"],
    "automotive": ["manufacturing", "logistics", "finance"],
    "government": ["technology", "consulting", "construction"],
    "wholesale": ["retail", "manufacturing", "logistics"],
}

# ── Valid status transitions ────────────────────────────────────────────────

VALID_STATUSES = ("scouted", "qualified", "briefed", "intro_sent", "in_discussion")

STATUS_TRANSITIONS = {
    "scouted": ["qualified", "briefed"],
    "qualified": ["briefed", "intro_sent"],
    "briefed": ["intro_sent", "in_discussion"],
    "intro_sent": ["in_discussion"],
    "in_discussion": [],
}


# ── Models ──────────────────────────────────────────────────────────────────


class AcquisitionTarget(BaseModel):
    """Represents a scouted M&A target with strategic scoring."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    company_name_ar: str = ""
    industry: str = ""
    city: str = ""
    strategic_fit_score: float = Field(0.0, ge=0.0, le=1.0)
    market_adjacency: float = Field(0.0, ge=0.0, le=1.0)
    size_fit: float = Field(0.0, ge=0.0, le=1.0)
    estimated_value_sar: float = 0.0
    growth_signals: list[str] = Field(default_factory=list)
    risk_factors: list[str] = Field(default_factory=list)
    brief: str = ""
    status: str = "scouted"
    tenant_id: Optional[str] = None
    scouted_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    class Config:
        json_schema_extra = {
            "example": {
                "company_name": "TechVision Co",
                "company_name_ar": "شركة تك فيجن",
                "industry": "technology",
                "city": "الرياض",
                "strategic_fit_score": 0.85,
                "market_adjacency": 0.7,
                "size_fit": 0.6,
                "estimated_value_sar": 5_000_000.0,
                "growth_signals": ["نمو الإيرادات ٣٠٪ سنوياً", "توسع في ٣ مدن جديدة"],
                "risk_factors": ["اعتماد كبير على عميل واحد"],
                "status": "scouted",
            }
        }


class AcquisitionCriteria(BaseModel):
    """Filter criteria for scouting acquisition targets."""
    industries: list[str] = Field(default_factory=list)
    cities: list[str] = Field(default_factory=list)
    min_revenue_sar: float = 0.0
    max_revenue_sar: float = 0.0
    min_employees: int = 0
    max_employees: int = 0
    required_capabilities: list[str] = Field(default_factory=list)
    exclude_ids: list[str] = Field(default_factory=list)
    min_strategic_fit: float = 0.3


# ── Engine ──────────────────────────────────────────────────────────────────


class AcquisitionScoutingEngine:
    """
    AI-powered acquisition target scouting engine.
    Identifies, scores, and briefs potential M&A targets in the Saudi market.
    محرك استكشاف أهداف الاستحواذ بالذكاء الاصطناعي — يحدد ويقيّم ويلخص أهداف الاندماج والاستحواذ
    """

    def __init__(self):
        self.llm = get_llm()
        self._watchlists: dict[str, list[AcquisitionTarget]] = {}

    # ── Scout ───────────────────────────────────────────────────────────────

    async def scout(
        self,
        criteria: AcquisitionCriteria,
        tenant_id: str,
        db: AsyncSession,
    ) -> list[AcquisitionTarget]:
        """
        Scout potential acquisition targets matching criteria from the company pool.
        استكشاف أهداف الاستحواذ المحتملة التي تطابق المعايير من قاعدة الشركات
        """
        query = select(CompanyProfile).where(
            CompanyProfile.tenant_id == tenant_id,
            CompanyProfile.is_verified == True,  # noqa: E712
        )

        result = await db.execute(query)
        all_profiles = result.scalars().all()

        if not all_profiles:
            logger.info("No company profiles found for tenant %s", tenant_id)
            return []

        targets: list[AcquisitionTarget] = []

        for profile in all_profiles:
            if str(profile.id) in criteria.exclude_ids:
                continue

            # Industry filter
            if criteria.industries and (profile.industry or "") not in criteria.industries:
                adjacent = set()
                for ind in criteria.industries:
                    adjacent.update(SECTOR_SYNERGY.get(ind, []))
                if (profile.industry or "") not in adjacent:
                    continue

            # City filter
            if criteria.cities and (profile.region or "") not in criteria.cities:
                continue

            # Revenue filter
            revenue = float(profile.annual_revenue_sar or 0)
            if criteria.min_revenue_sar > 0 and revenue < criteria.min_revenue_sar:
                continue
            if criteria.max_revenue_sar > 0 and revenue > criteria.max_revenue_sar:
                continue

            # Employee count filter
            emp = int(profile.employee_count or 0)
            if criteria.min_employees > 0 and emp < criteria.min_employees:
                continue
            if criteria.max_employees > 0 and emp > criteria.max_employees:
                continue

            # Capability filter
            if criteria.required_capabilities:
                profile_caps = {c.lower() for c in (profile.capabilities or [])}
                required = {c.lower() for c in criteria.required_capabilities}
                if not required & profile_caps:
                    continue

            # Build raw target
            target = AcquisitionTarget(
                company_name=profile.company_name or "",
                company_name_ar=profile.company_name_ar if hasattr(profile, "company_name_ar") else "",
                industry=profile.industry or "",
                city=profile.region or "",
                estimated_value_sar=self._estimate_value(profile),
                status="scouted",
                tenant_id=tenant_id,
            )
            targets.append(target)

        # Score all targets using LLM for strategic fit
        if targets:
            acquirer_profile = await self._get_acquirer_profile(tenant_id, db)
            scored = []
            for target in targets:
                scored_target = await self.score_target(target, acquirer_profile, db)
                if scored_target.strategic_fit_score >= criteria.min_strategic_fit:
                    scored.append(scored_target)
            targets = sorted(scored, key=lambda t: t.strategic_fit_score, reverse=True)

        # Persist to watchlist
        self._watchlists.setdefault(tenant_id, []).extend(targets)

        logger.info(
            "Scouted %d acquisition targets for tenant %s (from %d candidates)",
            len(targets), tenant_id, len(all_profiles),
        )
        return targets

    # ── Score Target ────────────────────────────────────────────────────────

    async def score_target(
        self,
        target: AcquisitionTarget,
        acquirer_twin: Optional[CompanyProfile],
        db: AsyncSession,
    ) -> AcquisitionTarget:
        """
        Score a target against the acquirer's strategic profile.
        تقييم هدف الاستحواذ مقابل الملف الاستراتيجي للمستحوذ
        """
        acquirer_industry = acquirer_twin.industry if acquirer_twin else "unknown"
        acquirer_caps = acquirer_twin.capabilities if acquirer_twin else []
        acquirer_revenue = float(acquirer_twin.annual_revenue_sar or 0) if acquirer_twin else 0
        acquirer_name = acquirer_twin.company_name if acquirer_twin else "الشركة المستحوذة"

        # Market adjacency score
        target.market_adjacency = self._compute_adjacency(acquirer_industry, target.industry)

        # Size fit — ideal ratio between 0.05 and 0.5 of acquirer
        if acquirer_revenue > 0 and target.estimated_value_sar > 0:
            ratio = target.estimated_value_sar / acquirer_revenue
            if 0.05 <= ratio <= 0.5:
                target.size_fit = 1.0
            elif 0.01 <= ratio < 0.05 or 0.5 < ratio <= 1.0:
                target.size_fit = 0.6
            else:
                target.size_fit = 0.3
        else:
            target.size_fit = 0.5

        # Use LLM for strategic fit, growth signals, and risk factors
        context = f"""المستحوذ: {acquirer_name}
قطاع المستحوذ: {acquirer_industry}
قدرات المستحوذ: {', '.join(acquirer_caps or ['غير محدد'])}
إيرادات المستحوذ: {acquirer_revenue:,.0f} ريال

الهدف: {target.company_name}
قطاع الهدف: {target.industry}
مدينة الهدف: {target.city}
القيمة التقديرية: {target.estimated_value_sar:,.0f} ريال"""

        system_prompt = """أنت مستشار اندماج واستحواذ سعودي خبير. قيّم هذا الهدف الاستحواذي.

Return JSON:
{
    "strategic_fit_score": 0.0 to 1.0,
    "growth_signals": ["إشارة نمو ١ بالعربي", "إشارة نمو ٢"],
    "risk_factors": ["عامل خطر ١ بالعربي", "عامل خطر ٢"],
    "rationale_ar": "سبب التوصية بالعربي"
}"""

        try:
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=context,
                json_mode=True,
                temperature=0.3,
            )
            result = llm_response.parse_json() or {}

            target.strategic_fit_score = min(1.0, max(0.0, float(result.get("strategic_fit_score", 0.5))))
            target.growth_signals = result.get("growth_signals", [])
            target.risk_factors = result.get("risk_factors", [])

            # Blend LLM fit with computed adjacency and size fit
            blended = (
                target.strategic_fit_score * 0.5
                + target.market_adjacency * 0.3
                + target.size_fit * 0.2
            )
            target.strategic_fit_score = round(min(1.0, blended), 4)

        except Exception as exc:
            logger.warning("LLM scoring failed for target %s: %s", target.company_name, exc)
            target.strategic_fit_score = round(
                target.market_adjacency * 0.6 + target.size_fit * 0.4, 4
            )
            target.growth_signals = ["لم يتم التحليل — يتطلب مراجعة يدوية"]
            target.risk_factors = ["لم يتم التحليل — يتطلب مراجعة يدوية"]

        logger.info(
            "Scored target %s: fit=%.2f adjacency=%.2f size=%.2f",
            target.company_name, target.strategic_fit_score,
            target.market_adjacency, target.size_fit,
        )
        return target

    # ── Generate Brief ──────────────────────────────────────────────────────

    async def generate_brief(
        self,
        target_id: str,
        db: AsyncSession,
    ) -> str:
        """
        Generate a detailed Arabic acquisition brief for a scouted target.
        إنشاء ملخص استحواذ تفصيلي بالعربي لهدف مُستكشَف
        """
        target = self._find_target(target_id)
        if not target:
            raise ValueError(f"Target {target_id} not found in watchlist")

        context = f"""الشركة المستهدفة: {target.company_name} ({target.company_name_ar})
القطاع: {target.industry}
المدينة: {target.city}
القيمة التقديرية: {target.estimated_value_sar:,.0f} ريال سعودي
درجة الملاءمة الاستراتيجية: {target.strategic_fit_score:.0%}
درجة القرب السوقي: {target.market_adjacency:.0%}
ملاءمة الحجم: {target.size_fit:.0%}
إشارات النمو: {', '.join(target.growth_signals)}
عوامل الخطر: {', '.join(target.risk_factors)}"""

        system_prompt = """أنت مستشار اندماج واستحواذ سعودي. اكتب ملخص استحواذ تنفيذي شامل بالعربي.

يجب أن يشمل الملخص:
١. نظرة عامة على الشركة المستهدفة
٢. المبرر الاستراتيجي للاستحواذ
٣. تحليل نقاط القوة والفرص
٤. المخاطر الرئيسية واستراتيجيات التخفيف
٥. التقييم المبدئي والهيكل المقترح
٦. الخطوات التالية الموصى بها
٧. الجدول الزمني المتوقع

اكتب الملخص بأسلوب تنفيذي رسمي مناسب لعرضه على مجلس الإدارة."""

        try:
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=context,
                temperature=0.3,
            )
            brief_text = llm_response.content.strip()
        except Exception as exc:
            logger.error("Brief generation failed for target %s: %s", target_id, exc)
            brief_text = (
                f"ملخص استحواذ — {target.company_name}\n"
                f"القطاع: {target.industry} | المدينة: {target.city}\n"
                f"القيمة التقديرية: {target.estimated_value_sar:,.0f} ريال\n"
                f"درجة الملاءمة: {target.strategic_fit_score:.0%}\n"
                f"إشارات النمو: {', '.join(target.growth_signals)}\n"
                f"عوامل الخطر: {', '.join(target.risk_factors)}\n"
                f"الحالة: يتطلب تحليل يدوي إضافي"
            )

        target.brief = brief_text
        target.status = "briefed"

        logger.info("Generated acquisition brief for target %s", target_id)
        return brief_text

    # ── Get Watchlist ───────────────────────────────────────────────────────

    async def get_watchlist(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> list[AcquisitionTarget]:
        """
        Retrieve the current acquisition watchlist for a tenant.
        استرجاع قائمة مراقبة الاستحواذ الحالية للمستأجر
        """
        watchlist = self._watchlists.get(tenant_id, [])
        logger.info("Retrieved watchlist for tenant %s: %d targets", tenant_id, len(watchlist))
        return sorted(watchlist, key=lambda t: t.strategic_fit_score, reverse=True)

    # ── Update Status ───────────────────────────────────────────────────────

    async def update_status(
        self,
        target_id: str,
        status: str,
        db: AsyncSession,
    ) -> AcquisitionTarget:
        """
        Advance a target through the acquisition pipeline.
        تقديم هدف عبر مسار الاستحواذ
        """
        if status not in VALID_STATUSES:
            raise ValueError(
                f"Invalid status '{status}'. Must be one of: {', '.join(VALID_STATUSES)}"
            )

        target = self._find_target(target_id)
        if not target:
            raise ValueError(f"Target {target_id} not found in watchlist")

        allowed = STATUS_TRANSITIONS.get(target.status, [])
        if status != target.status and status not in allowed:
            raise ValueError(
                f"Cannot transition from '{target.status}' to '{status}'. "
                f"Allowed transitions: {', '.join(allowed) if allowed else 'none (terminal state)'}"
            )

        old_status = target.status
        target.status = status

        logger.info(
            "Updated target %s status: %s -> %s",
            target_id, old_status, status,
        )
        return target

    # ── Private Helpers ─────────────────────────────────────────────────────

    def _compute_adjacency(self, acquirer_industry: str, target_industry: str) -> float:
        """Compute market adjacency between two industries."""
        if not acquirer_industry or not target_industry:
            return 0.3
        if acquirer_industry == target_industry:
            return 1.0
        synergies = SECTOR_SYNERGY.get(acquirer_industry, [])
        if target_industry in synergies:
            return 0.7
        # Check reverse
        reverse = SECTOR_SYNERGY.get(target_industry, [])
        if acquirer_industry in reverse:
            return 0.6
        return 0.2

    def _estimate_value(self, profile: CompanyProfile) -> float:
        """Rough valuation heuristic: revenue * multiplier based on industry."""
        revenue = float(profile.annual_revenue_sar or 0)
        if revenue <= 0:
            emp = int(profile.employee_count or 0)
            revenue = emp * 120_000  # SAR 120k per employee as a rough proxy

        multipliers = {
            "technology": 5.0,
            "healthcare": 4.0,
            "finance": 3.5,
            "consulting": 3.0,
            "education": 3.0,
            "media": 3.0,
            "telecom": 3.5,
            "retail": 2.0,
            "wholesale": 1.5,
            "construction": 2.0,
            "real_estate": 2.5,
            "manufacturing": 2.0,
            "logistics": 2.5,
            "food_beverage": 2.0,
            "energy": 3.0,
            "marketing": 2.5,
            "tourism": 2.0,
            "agriculture": 1.5,
            "automotive": 2.0,
            "government": 1.0,
        }
        industry = profile.industry or ""
        mult = multipliers.get(industry, 2.0)
        return round(revenue * mult, 2)

    async def _get_acquirer_profile(
        self, tenant_id: str, db: AsyncSession,
    ) -> Optional[CompanyProfile]:
        """Get the primary company profile for the tenant (acquirer)."""
        result = await db.execute(
            select(CompanyProfile)
            .where(
                CompanyProfile.tenant_id == tenant_id,
                CompanyProfile.is_verified == True,  # noqa: E712
            )
            .order_by(CompanyProfile.created_at)
            .limit(1)
        )
        return result.scalar_one_or_none()

    def _find_target(self, target_id: str) -> Optional[AcquisitionTarget]:
        """Search all watchlists for a target by ID."""
        for targets in self._watchlists.values():
            for t in targets:
                if t.id == target_id:
                    return t
        return None
