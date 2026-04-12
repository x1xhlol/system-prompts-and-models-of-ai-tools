"""
Deal Matcher — AI-powered B2B matching engine.
محرك المطابقة: يجد الشركاء المثاليين باستخدام الذكاء الاصطناعي
"""

import json
import logging
from dataclasses import dataclass, field
from typing import Optional

from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import (
    CompanyProfile, DealMatch, MatchStatus, DealType,
)
from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.strategic_deals.matcher")

# ── Matching weights ─────────────────────────────────────────────────────────

MATCH_WEIGHTS = {
    "capability_complementarity": 0.30,
    "need_alignment": 0.25,
    "industry_fit": 0.15,
    "geographic_fit": 0.10,
    "size_compatibility": 0.10,
    "trust_score": 0.10,
}

# Industry adjacency: industries that typically partner together
INDUSTRY_ADJACENCY = {
    "technology": ["consulting", "finance", "healthcare", "education", "retail"],
    "construction": ["real_estate", "manufacturing", "logistics", "energy"],
    "real_estate": ["construction", "finance", "marketing"],
    "retail": ["wholesale", "logistics", "marketing", "technology"],
    "wholesale": ["retail", "manufacturing", "logistics"],
    "healthcare": ["technology", "consulting", "manufacturing"],
    "education": ["technology", "consulting", "media"],
    "food_beverage": ["logistics", "retail", "agriculture", "tourism"],
    "logistics": ["retail", "wholesale", "manufacturing", "food_beverage"],
    "finance": ["technology", "real_estate", "consulting"],
    "energy": ["construction", "manufacturing", "technology"],
    "tourism": ["food_beverage", "marketing", "media"],
    "consulting": ["technology", "finance", "healthcare", "education"],
    "marketing": ["technology", "media", "retail", "tourism"],
    "agriculture": ["food_beverage", "logistics", "manufacturing"],
    "telecom": ["technology", "media", "consulting"],
    "media": ["marketing", "technology", "telecom", "tourism"],
    "automotive": ["manufacturing", "logistics", "finance"],
    "manufacturing": ["construction", "wholesale", "logistics", "energy", "automotive"],
    "government": ["technology", "consulting", "construction"],
}

# Regions that commonly trade together
REGION_PROXIMITY = {
    "الرياض": ["القصيم", "المنطقة الشرقية"],
    "مكة المكرمة": ["المدينة المنورة", "الباحة", "عسير"],
    "المنطقة الشرقية": ["الرياض", "الحدود الشمالية"],
    "المدينة المنورة": ["مكة المكرمة", "تبوك"],
    "القصيم": ["الرياض", "حائل"],
    "عسير": ["مكة المكرمة", "جازان", "نجران", "الباحة"],
    "تبوك": ["المدينة المنورة", "الجوف"],
    "حائل": ["القصيم", "الحدود الشمالية", "الجوف"],
    "الحدود الشمالية": ["حائل", "الجوف", "المنطقة الشرقية"],
    "جازان": ["عسير", "نجران"],
    "نجران": ["عسير", "جازان"],
    "الباحة": ["عسير", "مكة المكرمة"],
    "الجوف": ["تبوك", "الحدود الشمالية", "حائل"],
}


@dataclass
class MatchScore:
    """Detailed breakdown of a match score."""
    total: float = 0.0
    capability_complementarity: float = 0.0
    need_alignment: float = 0.0
    industry_fit: float = 0.0
    geographic_fit: float = 0.0
    size_compatibility: float = 0.0
    trust_score: float = 0.0
    reasons_ar: list[str] = field(default_factory=list)
    reasons_en: list[str] = field(default_factory=list)


class DealMatcher:
    """
    AI-powered B2B matching engine that finds optimal partners.
    محرك مطابقة بالذكاء الاصطناعي يجد الشركاء المثاليين
    """

    def __init__(self):
        self.llm = get_llm()

    # ── Find Matches ─────────────────────────────────────────────────────────

    async def find_matches(
        self,
        profile_id,
        deal_type: Optional[str],
        db: AsyncSession,
        limit: int = 10,
    ) -> list[DealMatch]:
        """
        Score and rank potential matches for a company profile.
        تقييم وترتيب المطابقات المحتملة لملف شركة
        """
        result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == profile_id))
        source = result.scalar_one_or_none()
        if not source:
            raise ValueError(f"Profile {profile_id} not found")

        # Fetch candidate profiles from the same tenant, excluding self
        candidates_q = select(CompanyProfile).where(
            CompanyProfile.tenant_id == source.tenant_id,
            CompanyProfile.id != profile_id,
            CompanyProfile.is_verified == True,  # noqa: E712
        )
        candidates_result = await db.execute(candidates_q)
        candidates = candidates_result.scalars().all()

        if not candidates:
            logger.info("No verified candidate profiles found for tenant %s", source.tenant_id)
            return []

        # Score each candidate
        scored: list[tuple[CompanyProfile, MatchScore]] = []
        for candidate in candidates:
            match_score = await self.score_match(
                company_a=source,
                company_b=candidate,
                deal_type=deal_type,
            )
            if match_score.total >= 0.2:  # Minimum threshold
                scored.append((candidate, match_score))

        # Sort by score descending, take top N
        scored.sort(key=lambda x: x[1].total, reverse=True)
        scored = scored[:limit]

        # Persist matches
        matches = []
        for candidate, ms in scored:
            match = DealMatch(
                tenant_id=source.tenant_id,
                company_a_id=source.id,
                company_b_id=candidate.id,
                match_score=round(ms.total, 4),
                match_reasons=ms.reasons_ar,
                deal_type_suggested=deal_type or self._suggest_deal_type(source, candidate),
                terms_suggested={},
                status=MatchStatus.SUGGESTED.value,
            )
            db.add(match)
            matches.append(match)

        await db.flush()
        for m in matches:
            await db.refresh(m)

        logger.info(
            "Found %d matches for profile %s (from %d candidates)",
            len(matches), profile_id, len(candidates),
        )
        return matches

    # ── Detailed Scoring ─────────────────────────────────────────────────────

    async def score_match(
        self,
        company_a: CompanyProfile,
        company_b: CompanyProfile,
        deal_type: Optional[str] = None,
    ) -> MatchScore:
        """
        Compute detailed match score between two companies.
        حساب درجة المطابقة التفصيلية بين شركتين
        """
        ms = MatchScore()

        # 1. Capability complementarity (0.30): A offers what B needs
        cap_score = self._score_overlap(
            company_a.capabilities or [],
            company_b.needs or [],
        )
        ms.capability_complementarity = cap_score
        if cap_score > 0.5:
            ms.reasons_ar.append(
                f"شركة {company_a.company_name} تقدم خدمات تحتاجها شركة {company_b.company_name}"
            )
            ms.reasons_en.append(
                f"{company_a.company_name} offers what {company_b.company_name} needs"
            )

        # 2. Need alignment (0.25): B offers what A needs
        need_score = self._score_overlap(
            company_b.capabilities or [],
            company_a.needs or [],
        )
        ms.need_alignment = need_score
        if need_score > 0.5:
            ms.reasons_ar.append(
                f"شركة {company_b.company_name} تقدم خدمات تحتاجها شركة {company_a.company_name}"
            )
            ms.reasons_en.append(
                f"{company_b.company_name} offers what {company_a.company_name} needs"
            )

        # 3. Industry fit (0.15): same value chain or adjacent
        ind_score = self._score_industry_fit(company_a.industry, company_b.industry)
        ms.industry_fit = ind_score
        if ind_score > 0.5:
            ms.reasons_ar.append("القطاعان متكاملان في سلسلة القيمة")

        # 4. Geographic fit (0.10): same region or complementary
        geo_score = self._score_geographic_fit(company_a.region, company_b.region)
        ms.geographic_fit = geo_score
        if geo_score >= 1.0:
            ms.reasons_ar.append(f"الشركتان في نفس المنطقة: {company_a.region}")
        elif geo_score >= 0.7:
            ms.reasons_ar.append("الشركتان في مناطق متقاربة")

        # 5. Size compatibility (0.10): appropriate size ratio
        size_score = self._score_size_compatibility(company_a, company_b)
        ms.size_compatibility = size_score
        if size_score > 0.7:
            ms.reasons_ar.append("حجم الشركتين متناسب للشراكة")

        # 6. Trust score (0.10): verification and history
        trust_a = company_a.trust_score or 0.0
        trust_b = company_b.trust_score or 0.0
        ms.trust_score = (trust_a + trust_b) / 2.0
        if ms.trust_score > 0.7:
            ms.reasons_ar.append("كلا الشركتين حاصلتان على درجة ثقة عالية")

        # If keyword overlap is low, use LLM for semantic matching
        if cap_score < 0.3 and need_score < 0.3:
            semantic = await self._semantic_match(company_a, company_b, deal_type)
            ms.capability_complementarity = max(ms.capability_complementarity, semantic.get("cap", 0))
            ms.need_alignment = max(ms.need_alignment, semantic.get("need", 0))
            if semantic.get("reason_ar"):
                ms.reasons_ar.append(semantic["reason_ar"])

        # Weighted total
        ms.total = (
            ms.capability_complementarity * MATCH_WEIGHTS["capability_complementarity"]
            + ms.need_alignment * MATCH_WEIGHTS["need_alignment"]
            + ms.industry_fit * MATCH_WEIGHTS["industry_fit"]
            + ms.geographic_fit * MATCH_WEIGHTS["geographic_fit"]
            + ms.size_compatibility * MATCH_WEIGHTS["size_compatibility"]
            + ms.trust_score * MATCH_WEIGHTS["trust_score"]
        )
        ms.total = round(min(1.0, ms.total), 4)

        return ms

    # ── Suggest Deal Structure ───────────────────────────────────────────────

    async def suggest_deal_structure(
        self,
        match_id,
        db: AsyncSession,
    ) -> dict:
        """
        AI suggests deal type, key terms, pricing, timeline.
        الذكاء الاصطناعي يقترح هيكل الصفقة
        """
        result = await db.execute(select(DealMatch).where(DealMatch.id == match_id))
        match = result.scalar_one_or_none()
        if not match:
            raise ValueError(f"Match {match_id} not found")

        # Load both company profiles
        a_result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == match.company_a_id))
        company_a = a_result.scalar_one_or_none()

        company_b = None
        if match.company_b_id:
            b_result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == match.company_b_id))
            company_b = b_result.scalar_one_or_none()

        company_b_name = company_b.company_name if company_b else (match.company_b_name or "شركة خارجية")
        company_b_caps = company_b.capabilities if company_b else []
        company_b_needs = company_b.needs if company_b else []

        context = f"""Company A: {company_a.company_name}
Industry: {company_a.industry or 'unknown'}
Capabilities: {', '.join(company_a.capabilities or [])}
Needs: {', '.join(company_a.needs or [])}
Revenue SAR: {company_a.annual_revenue_sar or 'unknown'}

Company B: {company_b_name}
Industry: {(company_b.industry if company_b else 'unknown')}
Capabilities: {', '.join(company_b_caps)}
Needs: {', '.join(company_b_needs)}

Match score: {match.match_score}
Match reasons: {', '.join(match.match_reasons or [])}
Suggested deal type: {match.deal_type_suggested}"""

        system_prompt = """أنت مستشار صفقات استراتيجية سعودي خبير. اقترح هيكل صفقة مفصل بين الشركتين.

Return JSON:
{
    "deal_type": "partnership/distribution/franchise/jv/referral/acquisition/barter",
    "deal_title_ar": "عنوان الصفقة بالعربي",
    "deal_title_en": "Deal title in English",
    "proposed_terms": {
        "equity_split": "50/50 or other",
        "revenue_share": "percentage or fixed",
        "territory": "geographic scope",
        "exclusivity": true/false,
        "duration_months": 12,
        "payment_terms": "description",
        "kpis": ["key performance indicators"]
    },
    "estimated_value_sar": 0,
    "timeline": {
        "negotiation_weeks": 2,
        "due_diligence_weeks": 4,
        "launch_weeks": 8
    },
    "mutual_benefits_ar": ["المنفعة المشتركة 1", "المنفعة المشتركة 2"],
    "risks_ar": ["المخاطر المحتملة"],
    "proposal_summary_ar": "ملخص المقترح بالعربي",
    "next_steps_ar": ["الخطوة التالية 1", "الخطوة التالية 2"]
}"""

        llm_response = await self.llm.complete(
            system_prompt=system_prompt,
            user_message=context,
            json_mode=True,
            temperature=0.4,
        )
        structure = llm_response.parse_json() or {}

        # Persist suggested terms on the match
        if structure.get("proposed_terms"):
            match.terms_suggested = structure
            await db.flush()

        logger.info("Suggested deal structure for match %s", match_id)
        return structure

    # ── Barter Chain Discovery ───────────────────────────────────────────────

    async def find_barter_chains(
        self,
        profile_id,
        db: AsyncSession,
    ) -> list[list[dict]]:
        """
        Discover multi-party barter opportunities: A->B->C->A circular trades.
        اكتشاف فرص المقايضة المتعددة الأطراف: سلاسل تبادل دائرية
        شركتك عندها تسويق، الشركة ب تحتاج تسويق وعندها مساحات،
        والشركة ج تحتاج مساحات وعندها تطوير برمجي اللي أنت تحتاجه
        """
        result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == profile_id))
        source = result.scalar_one_or_none()
        if not source:
            raise ValueError(f"Profile {profile_id} not found")

        source_caps = set(c.lower() for c in (source.capabilities or []))
        source_needs = set(n.lower() for n in (source.needs or []))

        if not source_caps or not source_needs:
            return []

        # Fetch all profiles in tenant
        all_q = select(CompanyProfile).where(
            CompanyProfile.tenant_id == source.tenant_id,
            CompanyProfile.id != profile_id,
        )
        all_result = await db.execute(all_q)
        all_profiles = all_result.scalars().all()

        # Build capability/need index
        profiles_by_cap: dict[str, list[CompanyProfile]] = {}
        profiles_by_need: dict[str, list[CompanyProfile]] = {}
        for p in all_profiles:
            for cap in (p.capabilities or []):
                profiles_by_cap.setdefault(cap.lower(), []).append(p)
            for need in (p.needs or []):
                profiles_by_need.setdefault(need.lower(), []).append(p)

        chains: list[list[dict]] = []

        # Find 3-party chains: source->B->C->source
        for source_cap in source_caps:
            # B needs what source offers
            for b_profile in profiles_by_need.get(source_cap, []):
                b_caps = set(c.lower() for c in (b_profile.capabilities or []))
                for b_cap in b_caps:
                    # C needs what B offers and C has what source needs
                    for c_profile in profiles_by_need.get(b_cap, []):
                        if c_profile.id == source.id or c_profile.id == b_profile.id:
                            continue
                        c_caps = set(c.lower() for c in (c_profile.capabilities or []))
                        # Does C offer what source needs?
                        overlap = c_caps & source_needs
                        if overlap:
                            chain = [
                                {
                                    "company_id": str(source.id),
                                    "company_name": source.company_name,
                                    "offers": source_cap,
                                    "receives": list(overlap)[0],
                                },
                                {
                                    "company_id": str(b_profile.id),
                                    "company_name": b_profile.company_name,
                                    "offers": b_cap,
                                    "receives": source_cap,
                                },
                                {
                                    "company_id": str(c_profile.id),
                                    "company_name": c_profile.company_name,
                                    "offers": list(overlap)[0],
                                    "receives": b_cap,
                                },
                            ]
                            chains.append(chain)
                            if len(chains) >= 10:
                                break
                    if len(chains) >= 10:
                        break
                if len(chains) >= 10:
                    break
            if len(chains) >= 10:
                break

        # Deduplicate chains by company set
        seen_sets: set[frozenset] = set()
        unique_chains = []
        for chain in chains:
            company_set = frozenset(link["company_id"] for link in chain)
            if company_set not in seen_sets:
                seen_sets.add(company_set)
                unique_chains.append(chain)

        logger.info(
            "Found %d barter chains for profile %s", len(unique_chains), profile_id,
        )
        return unique_chains

    # ── Private Helpers ──────────────────────────────────────────────────────

    def _score_overlap(self, offers: list[str], needs: list[str]) -> float:
        """Score overlap between what one company offers and another needs."""
        if not offers or not needs:
            return 0.0
        offers_lower = {o.lower().strip() for o in offers}
        needs_lower = {n.lower().strip() for n in needs}
        if not needs_lower:
            return 0.0
        overlap = offers_lower & needs_lower
        # Also check partial substring matches
        partial = 0
        for o in offers_lower:
            for n in needs_lower:
                if n not in overlap and o not in overlap:
                    if o in n or n in o:
                        partial += 0.5
        total_matches = len(overlap) + partial
        return min(1.0, total_matches / len(needs_lower))

    def _score_industry_fit(self, ind_a: Optional[str], ind_b: Optional[str]) -> float:
        """Score industry compatibility."""
        if not ind_a or not ind_b:
            return 0.3  # Unknown = neutral
        if ind_a == ind_b:
            return 1.0
        adjacent = INDUSTRY_ADJACENCY.get(ind_a, [])
        if ind_b in adjacent:
            return 0.7
        # Check reverse
        adjacent_b = INDUSTRY_ADJACENCY.get(ind_b, [])
        if ind_a in adjacent_b:
            return 0.7
        return 0.2

    def _score_geographic_fit(self, region_a: Optional[str], region_b: Optional[str]) -> float:
        """Score geographic proximity."""
        if not region_a or not region_b:
            return 0.5  # Unknown = neutral
        if region_a == region_b:
            return 1.0
        nearby = REGION_PROXIMITY.get(region_a, [])
        if region_b in nearby:
            return 0.7
        return 0.3

    def _score_size_compatibility(
        self, a: CompanyProfile, b: CompanyProfile,
    ) -> float:
        """Score size compatibility for deals. Very large + very small = low fit."""
        emp_a = float(a.employee_count or 0)
        emp_b = float(b.employee_count or 0)
        if emp_a == 0 or emp_b == 0:
            return 0.5  # Unknown = neutral
        ratio = min(emp_a, emp_b) / max(emp_a, emp_b)
        # Ratios > 0.1 are generally workable
        if ratio >= 0.3:
            return 1.0
        elif ratio >= 0.1:
            return 0.7
        elif ratio >= 0.01:
            return 0.4
        return 0.2

    def _suggest_deal_type(self, a: CompanyProfile, b: CompanyProfile) -> str:
        """Heuristic deal-type suggestion based on profiles."""
        prefs_a = a.deal_preferences or {}
        prefs_b = b.deal_preferences or {}

        # Find mutually preferred deal type
        all_types = set(list(prefs_a.keys()) + list(prefs_b.keys()))
        if all_types:
            best_type = max(
                all_types,
                key=lambda t: (prefs_a.get(t, 0) + prefs_b.get(t, 0)),
            )
            return best_type

        # Default based on industry relationship
        if a.industry == b.industry:
            return DealType.REFERRAL.value
        return DealType.PARTNERSHIP.value

    async def _semantic_match(
        self,
        company_a: CompanyProfile,
        company_b: CompanyProfile,
        deal_type: Optional[str],
    ) -> dict:
        """Use LLM for semantic matching when keyword overlap is low."""
        context = f"""Company A: {company_a.company_name}
Capabilities: {', '.join(company_a.capabilities or ['unknown'])}
Needs: {', '.join(company_a.needs or ['unknown'])}
Industry: {company_a.industry or 'unknown'}

Company B: {company_b.company_name}
Capabilities: {', '.join(company_b.capabilities or ['unknown'])}
Needs: {', '.join(company_b.needs or ['unknown'])}
Industry: {company_b.industry or 'unknown'}

Deal type: {deal_type or 'any'}"""

        system_prompt = """أنت محلل مطابقة بين الشركات. قيم مدى تكامل هاتين الشركتين.

Return JSON:
{
    "cap": 0.0 to 1.0 (capability complementarity),
    "need": 0.0 to 1.0 (need alignment),
    "reason_ar": "سبب التكامل بالعربي أو null إذا لا يوجد تكامل"
}"""

        try:
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=context,
                json_mode=True,
                temperature=0.2,
                fast=True,
            )
            result = llm_response.parse_json()
            return result if result else {"cap": 0, "need": 0, "reason_ar": None}
        except Exception as e:
            logger.warning("Semantic match failed: %s", e)
            return {"cap": 0, "need": 0, "reason_ar": None}
