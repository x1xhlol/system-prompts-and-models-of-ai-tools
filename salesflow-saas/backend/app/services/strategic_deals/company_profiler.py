"""
Company Profiler — Builds rich company profiles for B2B matching.
محلل الشركات: يبني ملفات شركات غنية للمطابقة بين الشركات
"""

import json
import logging
from typing import Optional
from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import CompanyProfile
from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.strategic_deals.profiler")

# ── ISIC industry mapping (common Saudi sectors) ─────────────────────────────

SAUDI_INDUSTRIES = {
    "construction": {"ar": "مقاولات وبناء", "isic": "F"},
    "real_estate": {"ar": "عقارات", "isic": "L"},
    "retail": {"ar": "تجارة تجزئة", "isic": "G"},
    "wholesale": {"ar": "تجارة جملة", "isic": "G"},
    "technology": {"ar": "تقنية معلومات", "isic": "J"},
    "manufacturing": {"ar": "صناعة", "isic": "C"},
    "healthcare": {"ar": "رعاية صحية", "isic": "Q"},
    "education": {"ar": "تعليم وتدريب", "isic": "P"},
    "food_beverage": {"ar": "أغذية ومشروبات", "isic": "I"},
    "logistics": {"ar": "نقل ولوجستيات", "isic": "H"},
    "finance": {"ar": "خدمات مالية", "isic": "K"},
    "energy": {"ar": "طاقة", "isic": "D"},
    "tourism": {"ar": "سياحة وضيافة", "isic": "I"},
    "consulting": {"ar": "استشارات", "isic": "M"},
    "marketing": {"ar": "تسويق وإعلان", "isic": "M"},
    "agriculture": {"ar": "زراعة", "isic": "A"},
    "telecom": {"ar": "اتصالات", "isic": "J"},
    "media": {"ar": "إعلام وترفيه", "isic": "R"},
    "automotive": {"ar": "سيارات", "isic": "G"},
    "government": {"ar": "قطاع حكومي", "isic": "O"},
}

SAUDI_REGIONS = [
    "الرياض", "مكة المكرمة", "المنطقة الشرقية", "المدينة المنورة",
    "القصيم", "عسير", "تبوك", "حائل", "الحدود الشمالية",
    "جازان", "نجران", "الباحة", "الجوف",
]


class CompanyProfiler:
    """
    Builds, enriches, and scores company profiles for strategic B2B matching.
    يبني ملفات الشركات ويثريها ويقيمها للمطابقة الاستراتيجية
    """

    def __init__(self):
        self.llm = get_llm()

    # ── Create Profile ───────────────────────────────────────────────────────

    async def create_profile(
        self,
        company_data: dict,
        tenant_id,
        db: AsyncSession,
    ) -> CompanyProfile:
        """
        Create a company profile from user input.
        إنشاء ملف شركة من بيانات المستخدم
        """
        profile = CompanyProfile(
            tenant_id=tenant_id,
            company_name=company_data["company_name"],
            company_name_ar=company_data.get("company_name_ar"),
            industry=company_data.get("industry"),
            sub_industry=company_data.get("sub_industry"),
            cr_number=company_data.get("cr_number"),
            city=company_data.get("city"),
            region=company_data.get("region"),
            employee_count=company_data.get("employee_count"),
            annual_revenue_sar=company_data.get("annual_revenue_sar"),
            capabilities=company_data.get("capabilities", []),
            needs=company_data.get("needs", []),
            deal_preferences=company_data.get("deal_preferences", {}),
            website=company_data.get("website"),
            linkedin_url=company_data.get("linkedin_url"),
            whatsapp_number=company_data.get("whatsapp_number"),
            trust_score=0.0,
            is_verified=False,
        )
        db.add(profile)
        await db.flush()
        await db.refresh(profile)
        logger.info("Created company profile %s for tenant %s", profile.id, tenant_id)
        return profile

    # ── Enrich Profile with AI ───────────────────────────────────────────────

    async def enrich_profile(
        self,
        profile_id,
        db: AsyncSession,
    ) -> CompanyProfile:
        """
        Use LLM to enrich a company profile: analyze website, detect industry,
        extract capabilities, identify needs, estimate company size.
        إثراء ملف الشركة بالذكاء الاصطناعي
        """
        result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == profile_id))
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        # Build context from available data
        context_parts = [
            f"Company: {profile.company_name}",
        ]
        if profile.company_name_ar:
            context_parts.append(f"Arabic name: {profile.company_name_ar}")
        if profile.website:
            context_parts.append(f"Website: {profile.website}")
        if profile.industry:
            context_parts.append(f"Industry: {profile.industry}")
        if profile.city:
            context_parts.append(f"City: {profile.city}")
        if profile.cr_number:
            context_parts.append(f"CR Number: {profile.cr_number}")
        if profile.capabilities:
            context_parts.append(f"Known capabilities: {', '.join(profile.capabilities)}")

        company_context = "\n".join(context_parts)

        system_prompt = """أنت محلل شركات سعودي متخصص. حلل بيانات الشركة التالية وأعد تقريراً مفصلاً بصيغة JSON.

You are a Saudi company analyst. Analyze the following company data and return a detailed JSON report.

Return JSON with these fields:
{
    "industry": "industry code from the list",
    "sub_industry": "specific sub-industry",
    "capabilities": ["list of what this company can offer to partners"],
    "needs": ["list of what this company likely needs from partners"],
    "estimated_employee_range": "micro/small/medium/large",
    "deal_preferences": {
        "partnership": 0.0-1.0,
        "distribution": 0.0-1.0,
        "franchise": 0.0-1.0,
        "jv": 0.0-1.0,
        "referral": 0.0-1.0,
        "acquisition": 0.0-1.0,
        "barter": 0.0-1.0
    },
    "enrichment_notes_ar": "ملاحظات الإثراء بالعربي"
}

Available industries: """ + ", ".join(SAUDI_INDUSTRIES.keys())

        llm_response = await self.llm.complete(
            system_prompt=system_prompt,
            user_message=company_context,
            json_mode=True,
            temperature=0.3,
        )
        enrichment = llm_response.parse_json()

        if enrichment:
            if enrichment.get("industry") and not profile.industry:
                profile.industry = enrichment["industry"]
            if enrichment.get("sub_industry") and not profile.sub_industry:
                profile.sub_industry = enrichment["sub_industry"]
            if enrichment.get("capabilities"):
                existing_caps = set(profile.capabilities or [])
                new_caps = [c for c in enrichment["capabilities"] if c not in existing_caps]
                profile.capabilities = list(existing_caps) + new_caps
            if enrichment.get("needs"):
                existing_needs = set(profile.needs or [])
                new_needs = [n for n in enrichment["needs"] if n not in existing_needs]
                profile.needs = list(existing_needs) + new_needs
            if enrichment.get("deal_preferences") and not profile.deal_preferences:
                profile.deal_preferences = enrichment["deal_preferences"]

        await db.flush()
        await db.refresh(profile)
        logger.info("Enriched profile %s with AI analysis", profile_id)
        return profile

    # ── Analyze Needs (Arabic Input) ─────────────────────────────────────────

    async def analyze_needs(
        self,
        profile_id,
        user_description: str,
        db: AsyncSession,
    ) -> dict:
        """
        User describes needs in Arabic free-text. AI extracts structured needs.
        المستخدم يصف احتياجاته بالعربي والذكاء الاصطناعي يستخرج البيانات المهيكلة
        """
        result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == profile_id))
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        system_prompt = """أنت مستشار أعمال سعودي. المستخدم يصف احتياجاته بالعربي.
استخرج المعلومات التالية وأعدها بصيغة JSON:

{
    "deal_type": "partnership/distribution/franchise/jv/referral/acquisition/barter",
    "specific_needs": ["قائمة الاحتياجات المحددة"],
    "budget_range_sar": {"min": 0, "max": 0},
    "timeline": "فوري/1-3 أشهر/3-6 أشهر/6-12 شهر/أكثر من سنة",
    "priorities": ["الأولوية الأولى", "الأولوية الثانية"],
    "ideal_partner_profile": "وصف الشريك المثالي",
    "deal_breakers": ["الأمور التي لا يمكن التنازل عنها"],
    "summary_ar": "ملخص الاحتياجات بالعربي"
}

Company context:
- Name: """ + profile.company_name + """
- Industry: """ + (profile.industry or "unknown") + """
- City: """ + (profile.city or "unknown")

        llm_response = await self.llm.complete(
            system_prompt=system_prompt,
            user_message=user_description,
            json_mode=True,
            temperature=0.2,
        )
        analysis = llm_response.parse_json() or {}

        # Persist extracted needs onto the profile
        if analysis.get("specific_needs"):
            existing = set(profile.needs or [])
            for need in analysis["specific_needs"]:
                existing.add(need)
            profile.needs = list(existing)

        if analysis.get("deal_type") and not profile.deal_preferences:
            profile.deal_preferences = {analysis["deal_type"]: 1.0}

        await db.flush()
        logger.info("Analyzed needs for profile %s: %s", profile_id, analysis.get("summary_ar", ""))
        return analysis

    # ── Analyze Capabilities ─────────────────────────────────────────────────

    async def analyze_capabilities(
        self,
        profile_id,
        db: AsyncSession,
    ) -> dict:
        """
        Analyze what the company can offer to partners.
        تحليل ما يمكن للشركة تقديمه للشركاء
        """
        result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == profile_id))
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        context_parts = [
            f"Company: {profile.company_name}",
            f"Industry: {profile.industry or 'unknown'}",
            f"Sub-industry: {profile.sub_industry or 'unknown'}",
            f"City: {profile.city or 'unknown'}",
            f"Employees: {profile.employee_count or 'unknown'}",
            f"Revenue (SAR): {profile.annual_revenue_sar or 'unknown'}",
        ]
        if profile.capabilities:
            context_parts.append(f"Known capabilities: {', '.join(profile.capabilities)}")

        system_prompt = """أنت محلل قدرات شركات سعودي. حلل الشركة وحدد قدراتها التي يمكن تقديمها لشركاء.

You are a Saudi company capabilities analyst. Analyze the company and identify what it can offer to partners.

Return JSON:
{
    "core_capabilities": ["القدرات الأساسية"],
    "secondary_capabilities": ["القدرات الثانوية"],
    "unique_advantages": ["المزايا التنافسية الفريدة"],
    "capacity_utilization": "low/medium/high",
    "partnership_value_ar": "وصف القيمة التي يمكن تقديمها للشركاء بالعربي",
    "recommended_deal_types": ["أنواع الصفقات المقترحة"],
    "target_industries": ["القطاعات المستهدفة للشراكة"]
}"""

        llm_response = await self.llm.complete(
            system_prompt=system_prompt,
            user_message="\n".join(context_parts),
            json_mode=True,
            temperature=0.3,
        )
        analysis = llm_response.parse_json() or {}

        # Merge discovered capabilities into the profile
        if analysis.get("core_capabilities"):
            existing = set(profile.capabilities or [])
            for cap in analysis["core_capabilities"]:
                existing.add(cap)
            if analysis.get("secondary_capabilities"):
                for cap in analysis["secondary_capabilities"]:
                    existing.add(cap)
            profile.capabilities = list(existing)
            await db.flush()

        logger.info("Analyzed capabilities for profile %s", profile_id)
        return analysis

    # ── Deal Readiness Score ─────────────────────────────────────────────────

    async def get_deal_readiness(
        self,
        profile_id,
        db: AsyncSession,
    ) -> dict:
        """
        Score the company's readiness to engage in strategic deals.
        تقييم جاهزية الشركة للصفقات الاستراتيجية
        """
        from app.models.strategic_deal import StrategicDeal, DealStatus

        result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == profile_id))
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        score = 0.0
        breakdown = {}
        recommendations_ar = []

        # 1. Profile completeness (0-25)
        completeness = 0
        if profile.company_name:
            completeness += 3
        if profile.company_name_ar:
            completeness += 2
        if profile.industry:
            completeness += 3
        if profile.cr_number:
            completeness += 4
        if profile.city and profile.region:
            completeness += 2
        if profile.website:
            completeness += 2
        if profile.whatsapp_number:
            completeness += 2
        if profile.capabilities and len(profile.capabilities) >= 3:
            completeness += 4
        else:
            recommendations_ar.append("أضف 3 قدرات على الأقل لتحسين المطابقة")
        if profile.needs and len(profile.needs) >= 2:
            completeness += 3
        else:
            recommendations_ar.append("حدد احتياجاتك لنجد لك الشريك المناسب")
        breakdown["profile_completeness"] = completeness
        score += completeness

        # 2. Verification status (0-25)
        verification = 0
        if profile.is_verified:
            verification = 20
        if profile.cr_number:
            verification += 5
        else:
            recommendations_ar.append("أضف رقم السجل التجاري للتحقق من شركتك")
        breakdown["verification"] = verification
        score += verification

        # 3. Trust score (0-25)
        trust = int(profile.trust_score * 25)
        breakdown["trust"] = trust
        score += trust
        if profile.trust_score < 0.5:
            recommendations_ar.append("أكمل عملية التحقق لرفع درجة الثقة")

        # 4. Deal history (0-25)
        deal_count_q = select(func.count()).select_from(StrategicDeal).where(
            StrategicDeal.initiator_profile_id == profile_id,
        )
        total_deals = (await db.execute(deal_count_q)).scalar() or 0

        won_count_q = select(func.count()).select_from(StrategicDeal).where(
            StrategicDeal.initiator_profile_id == profile_id,
            StrategicDeal.status == DealStatus.CLOSED_WON.value,
        )
        won_deals = (await db.execute(won_count_q)).scalar() or 0

        history = min(25, total_deals * 3 + won_deals * 5)
        breakdown["deal_history"] = history
        score += history
        if total_deals == 0:
            recommendations_ar.append("ابدأ أول صفقة لبناء سجل تاريخي")

        readiness_level = "low"
        if score >= 70:
            readiness_level = "high"
        elif score >= 40:
            readiness_level = "medium"

        return {
            "score": round(score, 1),
            "max_score": 100,
            "readiness_level": readiness_level,
            "breakdown": breakdown,
            "recommendations_ar": recommendations_ar,
            "total_deals": total_deals,
            "won_deals": won_deals,
            "readiness_label_ar": {
                "high": "جاهز للصفقات",
                "medium": "يحتاج تحسين",
                "low": "يحتاج اهتمام",
            }[readiness_level],
        }
