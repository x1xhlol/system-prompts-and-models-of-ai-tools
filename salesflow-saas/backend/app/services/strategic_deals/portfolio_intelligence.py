"""
Portfolio Intelligence — AI-driven insights across the deal portfolio.
ذكاء المحفظة: رؤى مدعومة بالذكاء الاصطناعي عبر محفظة الصفقات
"""

import json
import logging
from collections import defaultdict
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import CompanyProfile, DealMatch, StrategicDeal
from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.strategic_deals.portfolio_intelligence")

# ── Vertical definitions (Saudi market) ─────────────────────────────────────

VERTICALS = {
    "technology": "تقنية المعلومات",
    "construction": "مقاولات وبناء",
    "real_estate": "عقارات",
    "retail": "تجارة تجزئة",
    "wholesale": "تجارة جملة",
    "healthcare": "رعاية صحية",
    "education": "تعليم وتدريب",
    "food_beverage": "أغذية ومشروبات",
    "logistics": "نقل ولوجستيات",
    "finance": "خدمات مالية",
    "energy": "طاقة",
    "tourism": "سياحة وضيافة",
    "consulting": "استشارات",
    "marketing": "تسويق وإعلان",
    "manufacturing": "صناعة",
    "telecom": "اتصالات",
    "media": "إعلام وترفيه",
    "agriculture": "زراعة",
    "automotive": "سيارات",
    "government": "قطاع حكومي",
}

DEAL_TYPE_LABELS = {
    "partnership": "شراكة",
    "distribution": "توزيع",
    "franchise": "امتياز",
    "jv": "مشروع مشترك",
    "referral": "إحالة",
    "acquisition": "استحواذ",
    "barter": "مقايضة",
    "reseller": "إعادة بيع",
}


# ── Models ──────────────────────────────────────────────────────────────────


class PortfolioInsight(BaseModel):
    """A single intelligence insight derived from portfolio analysis."""
    insight_type: str  # top_vertical, best_deal_type, best_partner_archetype, gap, productization
    title: str = ""
    title_ar: str = ""
    data: dict = Field(default_factory=dict)
    confidence: float = Field(0.5, ge=0.0, le=1.0)
    recommendation: str = ""
    recommendation_ar: str = ""

    class Config:
        json_schema_extra = {
            "example": {
                "insight_type": "top_vertical",
                "title": "Technology is the best-performing vertical",
                "title_ar": "قطاع التقنية هو الأفضل أداءً",
                "data": {"vertical": "technology", "deal_count": 15, "avg_score": 0.82},
                "confidence": 0.85,
                "recommendation_ar": "زيادة التركيز على صفقات قطاع التقنية",
            }
        }


# ── Portfolio Intelligence Engine ───────────────────────────────────────────


class PortfolioIntelligence:
    """
    Analyzes the entire deal portfolio to surface actionable insights.
    Identifies top verticals, best deal structures, gaps, and productization opportunities.
    يحلل محفظة الصفقات بالكامل لاستخراج رؤى قابلة للتنفيذ
    """

    def __init__(self):
        self.llm = get_llm()

    # ── Full Analysis ───────────────────────────────────────────────────────

    async def analyze(
        self,
        tenant_id: str,
        period: str = "quarterly",
        db: AsyncSession = None,
    ) -> list[PortfolioInsight]:
        """
        Run a complete portfolio analysis and return all insights.
        تحليل شامل للمحفظة واستخراج جميع الرؤى
        """
        if db is None:
            raise ValueError("Database session is required")

        insights: list[PortfolioInsight] = []

        # Run all analysis types in sequence
        verticals = await self.get_top_verticals(tenant_id, db)
        if verticals:
            top = verticals[0]
            insights.append(PortfolioInsight(
                insight_type="top_vertical",
                title=f"Top vertical: {top.get('vertical', 'unknown')}",
                title_ar=f"القطاع الأفضل: {top.get('vertical_ar', 'غير محدد')}",
                data=top,
                confidence=min(0.95, top.get("deal_count", 0) / 20),
                recommendation=f"Increase focus on {top.get('vertical', '')} deals",
                recommendation_ar=f"زيادة التركيز على صفقات قطاع {top.get('vertical_ar', '')}",
            ))

        deal_types = await self.get_best_deal_types(tenant_id, db)
        if deal_types:
            best = deal_types[0]
            insights.append(PortfolioInsight(
                insight_type="best_deal_type",
                title=f"Best deal type: {best.get('deal_type', 'unknown')}",
                title_ar=f"أفضل نوع صفقة: {best.get('deal_type_ar', 'غير محدد')}",
                data=best,
                confidence=min(0.90, best.get("count", 0) / 15),
                recommendation=f"Prioritize {best.get('deal_type', '')} deals",
                recommendation_ar=f"إعطاء الأولوية لصفقات {best.get('deal_type_ar', '')}",
            ))

        archetypes = await self.get_best_partner_archetypes(tenant_id, db)
        if archetypes:
            best_arch = archetypes[0]
            insights.append(PortfolioInsight(
                insight_type="best_partner_archetype",
                title=f"Best partner type: {best_arch.get('archetype', 'unknown')}",
                title_ar=f"أفضل نوع شريك: {best_arch.get('archetype_ar', 'غير محدد')}",
                data=best_arch,
                confidence=min(0.85, best_arch.get("count", 0) / 10),
                recommendation_ar=f"البحث عن شركاء من نوع {best_arch.get('archetype_ar', '')}",
            ))

        gaps = await self.get_repeated_gaps(tenant_id, db)
        for gap in gaps[:3]:
            insights.append(PortfolioInsight(
                insight_type="repeated_gap",
                title=f"Repeated gap: {gap.get('gap', '')}",
                title_ar=f"فجوة متكررة: {gap.get('gap', '')}",
                data=gap,
                confidence=min(0.80, gap.get("frequency", 0) / 5),
                recommendation_ar=f"سد فجوة: {gap.get('gap', '')} — تكررت {gap.get('frequency', 0)} مرات",
            ))

        products = await self.get_productization_candidates(tenant_id, db)
        for prod in products[:2]:
            insights.append(PortfolioInsight(
                insight_type="productization",
                title=f"Productization candidate: {prod.get('capability', '')}",
                title_ar=f"فرصة تحويل لمنتج: {prod.get('capability', '')}",
                data=prod,
                confidence=min(0.75, prod.get("demand_count", 0) / 8),
                recommendation_ar=f"تحويل «{prod.get('capability', '')}» إلى منتج قابل للبيع",
            ))

        # Sort by confidence descending
        insights.sort(key=lambda i: i.confidence, reverse=True)

        logger.info(
            "Portfolio analysis for tenant %s (%s): %d insights",
            tenant_id, period, len(insights),
        )
        return insights

    # ── Top Verticals ───────────────────────────────────────────────────────

    async def get_top_verticals(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> list[dict]:
        """
        Identify the highest-performing industry verticals by deal volume and score.
        تحديد القطاعات الصناعية الأفضل أداءً حسب حجم الصفقات والتقييم
        """
        result = await db.execute(
            select(CompanyProfile).where(CompanyProfile.tenant_id == tenant_id)
        )
        profiles = result.scalars().all()

        # Count deals and avg scores per industry
        industry_stats: dict[str, dict] = defaultdict(
            lambda: {"deal_count": 0, "total_score": 0.0, "total_revenue": 0.0, "companies": 0}
        )

        for profile in profiles:
            industry = profile.industry or "other"
            industry_stats[industry]["companies"] += 1
            industry_stats[industry]["total_revenue"] += float(profile.annual_revenue_sar or 0)
            industry_stats[industry]["total_score"] += float(profile.trust_score or 0)

        # Get match counts per industry
        matches_result = await db.execute(
            select(DealMatch).where(DealMatch.tenant_id == tenant_id)
        )
        matches = matches_result.scalars().all()

        profile_industry: dict[str, str] = {}
        for p in profiles:
            profile_industry[str(p.id)] = p.industry or "other"

        for match in matches:
            industry_a = profile_industry.get(str(match.company_a_id), "other")
            industry_stats[industry_a]["deal_count"] += 1

        # Build ranked list
        verticals: list[dict] = []
        for industry, stats in industry_stats.items():
            companies = stats["companies"]
            avg_score = stats["total_score"] / companies if companies > 0 else 0
            verticals.append({
                "vertical": industry,
                "vertical_ar": VERTICALS.get(industry, industry),
                "deal_count": stats["deal_count"],
                "company_count": companies,
                "avg_trust_score": round(avg_score, 4),
                "total_revenue_sar": round(stats["total_revenue"], 2),
                "performance_score": round(
                    stats["deal_count"] * 0.4 + avg_score * 0.3 + min(companies / 10, 1) * 0.3, 4
                ),
            })

        verticals.sort(key=lambda v: v["performance_score"], reverse=True)

        logger.info("Top verticals for tenant %s: %d industries analyzed", tenant_id, len(verticals))
        return verticals

    # ── Best Deal Types ─────────────────────────────────────────────────────

    async def get_best_deal_types(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> list[dict]:
        """
        Determine which deal types yield the best results.
        تحديد أنواع الصفقات الأكثر نجاحاً
        """
        matches_result = await db.execute(
            select(DealMatch).where(DealMatch.tenant_id == tenant_id)
        )
        matches = matches_result.scalars().all()

        type_stats: dict[str, dict] = defaultdict(
            lambda: {"count": 0, "total_score": 0.0, "accepted": 0}
        )

        for match in matches:
            deal_type = match.deal_type_suggested or "unknown"
            type_stats[deal_type]["count"] += 1
            type_stats[deal_type]["total_score"] += float(match.match_score or 0)
            if match.status in ("accepted", "signed", "active"):
                type_stats[deal_type]["accepted"] += 1

        deal_types: list[dict] = []
        for dt, stats in type_stats.items():
            count = stats["count"]
            avg_score = stats["total_score"] / count if count > 0 else 0
            acceptance_rate = stats["accepted"] / count if count > 0 else 0

            deal_types.append({
                "deal_type": dt,
                "deal_type_ar": DEAL_TYPE_LABELS.get(dt, dt),
                "count": count,
                "avg_match_score": round(avg_score, 4),
                "acceptance_rate": round(acceptance_rate, 4),
                "effectiveness_score": round(
                    avg_score * 0.4 + acceptance_rate * 0.4 + min(count / 20, 1) * 0.2, 4
                ),
            })

        deal_types.sort(key=lambda d: d["effectiveness_score"], reverse=True)

        logger.info("Best deal types for tenant %s: %d types analyzed", tenant_id, len(deal_types))
        return deal_types

    # ── Best Partner Archetypes ─────────────────────────────────────────────

    async def get_best_partner_archetypes(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> list[dict]:
        """
        Identify the most successful partner archetypes (size, industry, type).
        تحديد أنماط الشركاء الأكثر نجاحاً (الحجم، القطاع، النوع)
        """
        result = await db.execute(
            select(CompanyProfile).where(CompanyProfile.tenant_id == tenant_id)
        )
        profiles = result.scalars().all()

        matches_result = await db.execute(
            select(DealMatch).where(DealMatch.tenant_id == tenant_id)
        )
        matches = matches_result.scalars().all()

        # Build profile lookup
        profile_map: dict[str, CompanyProfile] = {}
        for p in profiles:
            profile_map[str(p.id)] = p

        # Analyze successful matches to derive archetypes
        archetype_stats: dict[str, dict] = defaultdict(
            lambda: {"count": 0, "total_score": 0.0, "examples": []}
        )

        for match in matches:
            partner_id = str(match.company_b_id) if match.company_b_id else None
            if not partner_id or partner_id not in profile_map:
                continue

            partner = profile_map[partner_id]
            emp_count = int(partner.employee_count or 0)

            if emp_count > 500:
                size_bucket = "enterprise"
                size_ar = "مؤسسة كبيرة"
            elif emp_count > 50:
                size_bucket = "mid_market"
                size_ar = "سوق متوسط"
            elif emp_count > 10:
                size_bucket = "smb"
                size_ar = "أعمال صغيرة ومتوسطة"
            else:
                size_bucket = "startup"
                size_ar = "شركة ناشئة"

            archetype_key = f"{partner.industry or 'unknown'}_{size_bucket}"
            archetype_stats[archetype_key]["count"] += 1
            archetype_stats[archetype_key]["total_score"] += float(match.match_score or 0)
            archetype_stats[archetype_key]["industry"] = partner.industry or "unknown"
            archetype_stats[archetype_key]["size"] = size_bucket
            archetype_stats[archetype_key]["size_ar"] = size_ar
            archetype_stats[archetype_key]["industry_ar"] = VERTICALS.get(partner.industry or "", partner.industry or "")
            if len(archetype_stats[archetype_key]["examples"]) < 3:
                archetype_stats[archetype_key]["examples"].append(partner.company_name)

        archetypes: list[dict] = []
        for key, stats in archetype_stats.items():
            count = stats["count"]
            avg_score = stats["total_score"] / count if count > 0 else 0
            archetype_label = f"{stats.get('industry_ar', '')} - {stats.get('size_ar', '')}"

            archetypes.append({
                "archetype": key,
                "archetype_ar": archetype_label,
                "industry": stats.get("industry", ""),
                "size": stats.get("size", ""),
                "count": count,
                "avg_match_score": round(avg_score, 4),
                "examples": stats.get("examples", []),
                "score": round(avg_score * 0.6 + min(count / 10, 1) * 0.4, 4),
            })

        archetypes.sort(key=lambda a: a["score"], reverse=True)

        logger.info("Partner archetypes for tenant %s: %d archetypes", tenant_id, len(archetypes))
        return archetypes

    # ── Repeated Gaps ───────────────────────────────────────────────────────

    async def get_repeated_gaps(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> list[dict]:
        """
        Find needs that repeatedly appear but are never fulfilled in the portfolio.
        اكتشاف الاحتياجات التي تتكرر ولا يتم تلبيتها في المحفظة
        """
        result = await db.execute(
            select(CompanyProfile).where(CompanyProfile.tenant_id == tenant_id)
        )
        profiles = result.scalars().all()

        all_needs: dict[str, int] = defaultdict(int)
        all_caps: set[str] = set()

        for profile in profiles:
            for need in (profile.needs or []):
                all_needs[need.lower().strip()] += 1
            for cap in (profile.capabilities or []):
                all_caps.add(cap.lower().strip())

        # Gaps: needs that appear multiple times but nobody offers
        gaps: list[dict] = []
        for need, frequency in sorted(all_needs.items(), key=lambda x: x[1], reverse=True):
            if need not in all_caps and frequency >= 2:
                gaps.append({
                    "gap": need,
                    "frequency": frequency,
                    "severity": "high" if frequency >= 5 else ("medium" if frequency >= 3 else "low"),
                    "severity_ar": "عالية" if frequency >= 5 else ("متوسطة" if frequency >= 3 else "منخفضة"),
                    "recommendation_ar": f"البحث عن شريك يقدم «{need}» — مطلوب من {frequency} شركة",
                })

        logger.info("Repeated gaps for tenant %s: %d gaps found", tenant_id, len(gaps))
        return gaps

    # ── Productization Candidates ───────────────────────────────────────────

    async def get_productization_candidates(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> list[dict]:
        """
        Identify capabilities with high demand that could become standalone products.
        تحديد القدرات ذات الطلب العالي التي يمكن تحويلها لمنتجات مستقلة
        """
        result = await db.execute(
            select(CompanyProfile).where(CompanyProfile.tenant_id == tenant_id)
        )
        profiles = result.scalars().all()

        # Count how many companies need each capability vs how many offer it
        cap_supply: dict[str, int] = defaultdict(int)
        cap_demand: dict[str, int] = defaultdict(int)

        for profile in profiles:
            for cap in (profile.capabilities or []):
                cap_supply[cap.lower().strip()] += 1
            for need in (profile.needs or []):
                cap_demand[need.lower().strip()] += 1

        candidates: list[dict] = []
        for capability, demand_count in cap_demand.items():
            supply_count = cap_supply.get(capability, 0)
            if demand_count >= 3 and supply_count <= 1:
                demand_supply_ratio = demand_count / max(supply_count, 1)
                candidates.append({
                    "capability": capability,
                    "demand_count": demand_count,
                    "supply_count": supply_count,
                    "demand_supply_ratio": round(demand_supply_ratio, 2),
                    "market_potential": "عالي" if demand_supply_ratio > 5 else ("متوسط" if demand_supply_ratio > 2 else "منخفض"),
                    "recommendation_ar": (
                        f"فرصة لتحويل «{capability}» إلى منتج — "
                        f"مطلوب من {demand_count} شركة ومتوفر عند {supply_count} فقط"
                    ),
                })

        candidates.sort(key=lambda c: c["demand_supply_ratio"], reverse=True)

        logger.info(
            "Productization candidates for tenant %s: %d candidates",
            tenant_id, len(candidates),
        )
        return candidates

    # ── Quarterly Report ────────────────────────────────────────────────────

    async def generate_quarterly_report(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> str:
        """
        Generate a comprehensive Arabic quarterly portfolio intelligence report.
        إنشاء تقرير ذكاء محفظة ربع سنوي شامل بالعربي
        """
        insights = await self.analyze(tenant_id, period="quarterly", db=db)
        verticals = await self.get_top_verticals(tenant_id, db)
        deal_types = await self.get_best_deal_types(tenant_id, db)
        gaps = await self.get_repeated_gaps(tenant_id, db)
        products = await self.get_productization_candidates(tenant_id, db)

        # Build context for LLM
        context_parts = [
            f"عدد الرؤى المستخرجة: {len(insights)}",
            f"القطاعات الأفضل أداءً: {json.dumps(verticals[:5], ensure_ascii=False)}",
            f"أنواع الصفقات الأنجح: {json.dumps(deal_types[:5], ensure_ascii=False)}",
            f"الفجوات المتكررة: {json.dumps(gaps[:5], ensure_ascii=False)}",
            f"فرص التحويل لمنتجات: {json.dumps(products[:5], ensure_ascii=False)}",
        ]

        top_insights = []
        for ins in insights[:5]:
            top_insights.append(f"- {ins.title_ar} (ثقة: {ins.confidence:.0%}): {ins.recommendation_ar}")

        context_parts.append(f"أبرز الرؤى:\n" + "\n".join(top_insights))

        context = "\n\n".join(context_parts)

        system_prompt = """أنت محلل استراتيجي سعودي خبير. اكتب تقرير ذكاء محفظة ربع سنوي شامل بالعربي.

يجب أن يشمل التقرير:
١. ملخص تنفيذي
٢. أداء القطاعات — أي القطاعات تحقق أفضل النتائج
٣. تحليل أنواع الصفقات — أي الهياكل أنجح
٤. الفجوات الاستراتيجية — ما ينقص المنظومة
٥. فرص التحويل لمنتجات — خدمات يمكن تعبئتها كمنتجات
٦. التوصيات الاستراتيجية — ٣-٥ توصيات محددة
٧. خطة العمل للربع القادم

اكتب بأسلوب تنفيذي رسمي مناسب لمجلس الإدارة. استخدم الأرقام والنسب."""

        try:
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=context,
                temperature=0.3,
            )
            report = llm_response.content.strip()
        except Exception as exc:
            logger.error("Quarterly report generation failed: %s", exc)
            # Build a structured fallback report
            report_parts = [
                "تقرير ذكاء المحفظة — الربع الحالي",
                "=" * 40,
                "",
                "ملخص تنفيذي:",
                f"تم تحليل المحفظة واستخراج {len(insights)} رؤية استراتيجية.",
                "",
            ]

            if verticals:
                report_parts.append("القطاعات الأفضل أداءً:")
                for v in verticals[:3]:
                    report_parts.append(
                        f"  - {v.get('vertical_ar', '')}: "
                        f"{v.get('deal_count', 0)} صفقة، "
                        f"تقييم {v.get('avg_trust_score', 0):.2f}"
                    )
                report_parts.append("")

            if deal_types:
                report_parts.append("أنواع الصفقات الأنجح:")
                for dt in deal_types[:3]:
                    report_parts.append(
                        f"  - {dt.get('deal_type_ar', '')}: "
                        f"{dt.get('count', 0)} صفقة، "
                        f"فعالية {dt.get('effectiveness_score', 0):.2f}"
                    )
                report_parts.append("")

            if gaps:
                report_parts.append("الفجوات المتكررة:")
                for g in gaps[:3]:
                    report_parts.append(f"  - {g.get('gap', '')}: تكررت {g.get('frequency', 0)} مرات")
                report_parts.append("")

            if products:
                report_parts.append("فرص التحويل لمنتجات:")
                for p in products[:3]:
                    report_parts.append(
                        f"  - {p.get('capability', '')}: "
                        f"الطلب {p.get('demand_count', 0)} / العرض {p.get('supply_count', 0)}"
                    )

            report = "\n".join(report_parts)

        logger.info("Generated quarterly report for tenant %s", tenant_id)
        return report
