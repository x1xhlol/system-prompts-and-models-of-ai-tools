"""
Ecosystem Mapper — Maps and analyzes B2B partner ecosystems in the Saudi market.
خريطة المنظومة: رسم وتحليل منظومة الشركاء في السوق السعودي
"""

import json
import logging
import uuid
from collections import defaultdict
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import CompanyProfile
from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.strategic_deals.ecosystem_mapper")

# ── Entity type definitions ─────────────────────────────────────────────────

ENTITY_TYPES = {
    "agency": "وكالة",
    "integrator": "مُدمج أنظمة",
    "reseller": "موزع معتمد",
    "consultant": "مستشار",
    "distributor": "موزع",
    "supplier": "مورد",
    "customer": "عميل",
    "competitor": "منافس",
}

LINK_TYPES = ("partner", "competitor", "vendor", "client", "referral", "subsidiary")

# ── Capability clusters for gap analysis ────────────────────────────────────

CAPABILITY_CLUSTERS = {
    "تقنية": ["تطوير برمجيات", "حوسبة سحابية", "أمن سيبراني", "ذكاء اصطناعي", "تحليل بيانات"],
    "تسويق": ["تسويق رقمي", "إعلان", "علاقات عامة", "إدارة محتوى", "سوشل ميديا"],
    "عمليات": ["لوجستيات", "سلسلة إمداد", "إدارة مخازن", "نقل", "توزيع"],
    "مالية": ["محاسبة", "تدقيق", "استشارات مالية", "تمويل", "إدارة مخاطر"],
    "موارد بشرية": ["توظيف", "تدريب", "تطوير مهني", "رواتب", "شؤون موظفين"],
    "قانونية": ["استشارات قانونية", "عقود", "ملكية فكرية", "امتثال", "تراخيص"],
    "مبيعات": ["مبيعات مباشرة", "مبيعات قنوات", "تطوير أعمال", "إدارة حسابات", "عروض أسعار"],
}


# ── Models ──────────────────────────────────────────────────────────────────


class EcosystemEntity(BaseModel):
    """A node in the ecosystem graph representing a company or organization."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_ar: str = ""
    entity_type: str = "partner"  # agency, integrator, reseller, consultant, distributor
    industry: str = ""
    city: str = ""
    capabilities: list[str] = Field(default_factory=list)
    relationship_strength: float = Field(0.0, ge=0.0, le=1.0)
    partner_potential: float = Field(0.0, ge=0.0, le=1.0)
    profile_id: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "DataSphere Solutions",
                "name_ar": "حلول داتا سفير",
                "entity_type": "integrator",
                "industry": "technology",
                "city": "الرياض",
                "capabilities": ["حوسبة سحابية", "أمن سيبراني"],
                "relationship_strength": 0.8,
                "partner_potential": 0.75,
            }
        }


class EcosystemLink(BaseModel):
    """An edge in the ecosystem graph representing a relationship."""
    source_id: str
    target_id: str
    link_type: str = "partner"  # partner, competitor, vendor, client
    strength: float = Field(0.5, ge=0.0, le=1.0)
    description_ar: str = ""


# ── Ecosystem Mapper Engine ─────────────────────────────────────────────────


class EcosystemMapper:
    """
    Builds, analyzes, and visualizes B2B ecosystem maps.
    Identifies gaps, suggests partners, and monitors ecosystem health.
    بناء وتحليل وعرض خرائط منظومة الأعمال — تحديد الفجوات واقتراح الشركاء
    """

    def __init__(self):
        self.llm = get_llm()

    # ── Build Map ───────────────────────────────────────────────────────────

    async def build_map(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> dict:
        """
        Build a complete ecosystem map from company profiles and deal history.
        بناء خريطة منظومة كاملة من ملفات الشركات وتاريخ الصفقات
        """
        result = await db.execute(
            select(CompanyProfile).where(CompanyProfile.tenant_id == tenant_id)
        )
        profiles = result.scalars().all()

        if not profiles:
            logger.info("No profiles found for tenant %s", tenant_id)
            return {"entities": [], "links": [], "stats": {}}

        entities: list[EcosystemEntity] = []
        links: list[EcosystemLink] = []

        # Build entity nodes from profiles
        entity_map: dict[str, EcosystemEntity] = {}
        for profile in profiles:
            entity_type = self._infer_entity_type(profile)
            entity = EcosystemEntity(
                name=profile.company_name or "",
                name_ar=profile.company_name_ar if hasattr(profile, "company_name_ar") else "",
                entity_type=entity_type,
                industry=profile.industry or "",
                city=profile.region or "",
                capabilities=[c for c in (profile.capabilities or [])],
                relationship_strength=float(profile.trust_score or 0.5),
                partner_potential=0.0,
                profile_id=str(profile.id),
            )
            entities.append(entity)
            entity_map[str(profile.id)] = entity

        # Infer links based on capability/need overlap and industry relationships
        profile_list = list(profiles)
        for i, prof_a in enumerate(profile_list):
            for prof_b in profile_list[i + 1:]:
                link_type, strength = self._infer_link(prof_a, prof_b)
                if strength >= 0.2:
                    entity_a = entity_map.get(str(prof_a.id))
                    entity_b = entity_map.get(str(prof_b.id))
                    if entity_a and entity_b:
                        link = EcosystemLink(
                            source_id=entity_a.id,
                            target_id=entity_b.id,
                            link_type=link_type,
                            strength=round(strength, 4),
                            description_ar=self._link_description(
                                prof_a.company_name, prof_b.company_name, link_type
                            ),
                        )
                        links.append(link)

        # Compute partner potential for each entity
        for entity in entities:
            incoming = [lk for lk in links if lk.target_id == entity.id]
            outgoing = [lk for lk in links if lk.source_id == entity.id]
            partner_links = [
                lk for lk in incoming + outgoing
                if lk.link_type in ("partner", "referral")
            ]
            if partner_links:
                entity.partner_potential = round(
                    sum(lk.strength for lk in partner_links) / len(partner_links), 4
                )

        stats = {
            "total_entities": len(entities),
            "total_links": len(links),
            "entity_types": defaultdict(int),
            "link_types": defaultdict(int),
            "avg_relationship_strength": 0.0,
        }
        for e in entities:
            stats["entity_types"][e.entity_type] += 1
        for lk in links:
            stats["link_types"][lk.link_type] += 1
        if entities:
            stats["avg_relationship_strength"] = round(
                sum(e.relationship_strength for e in entities) / len(entities), 4
            )
        stats["entity_types"] = dict(stats["entity_types"])
        stats["link_types"] = dict(stats["link_types"])

        logger.info(
            "Built ecosystem map for tenant %s: %d entities, %d links",
            tenant_id, len(entities), len(links),
        )

        return {
            "entities": [e.model_dump() for e in entities],
            "links": [lk.model_dump() for lk in links],
            "stats": stats,
        }

    # ── Find Gaps ───────────────────────────────────────────────────────────

    async def find_gaps(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> list[dict]:
        """
        Identify underserved areas in the ecosystem where partners are missing.
        تحديد المناطق غير المخدومة في المنظومة حيث ينقص الشركاء
        """
        result = await db.execute(
            select(CompanyProfile).where(CompanyProfile.tenant_id == tenant_id)
        )
        profiles = result.scalars().all()

        if not profiles:
            return []

        # Collect all capabilities and all needs across the ecosystem
        all_capabilities: set[str] = set()
        all_needs: set[str] = set()
        for profile in profiles:
            for cap in (profile.capabilities or []):
                all_capabilities.add(cap.lower().strip())
            for need in (profile.needs or []):
                all_needs.add(need.lower().strip())

        # Gaps: needs that no one in the ecosystem can fulfill
        unmet_needs = all_needs - all_capabilities

        # Cluster-level gaps: entire capability clusters with low coverage
        cluster_gaps: list[dict] = []
        for cluster_name, cluster_caps in CAPABILITY_CLUSTERS.items():
            cluster_lower = {c.lower() for c in cluster_caps}
            covered = cluster_lower & all_capabilities
            coverage = len(covered) / len(cluster_lower) if cluster_lower else 0
            if coverage < 0.3:
                cluster_gaps.append({
                    "gap_type": "cluster",
                    "cluster_name_ar": cluster_name,
                    "coverage": round(coverage, 4),
                    "missing_capabilities": list(cluster_lower - all_capabilities),
                    "recommendation_ar": f"المنظومة تفتقر لشركاء في مجال {cluster_name} — التغطية {coverage:.0%} فقط",
                })

        # Individual unmet needs
        individual_gaps = [
            {
                "gap_type": "unmet_need",
                "need": need,
                "recommendation_ar": f"لا يوجد شريك يقدم: {need}",
            }
            for need in sorted(unmet_needs)[:20]
        ]

        gaps = cluster_gaps + individual_gaps

        logger.info(
            "Found %d ecosystem gaps for tenant %s (%d cluster, %d individual)",
            len(gaps), tenant_id, len(cluster_gaps), len(individual_gaps),
        )
        return gaps

    # ── Suggest Partners ────────────────────────────────────────────────────

    async def suggest_partners(
        self,
        gap_type: str,
        tenant_id: str,
        db: AsyncSession,
    ) -> list[EcosystemEntity]:
        """
        Suggest potential partners to fill an ecosystem gap.
        اقتراح شركاء محتملين لسد فجوة في المنظومة
        """
        gaps = await self.find_gaps(tenant_id, db)

        matching_gaps = [g for g in gaps if g.get("gap_type") == gap_type]
        if not matching_gaps:
            matching_gaps = gaps[:3]

        gap_summary = json.dumps(matching_gaps[:5], ensure_ascii=False)

        context = f"""فجوات المنظومة:
{gap_summary}

نوع الفجوة المطلوب: {gap_type}"""

        system_prompt = """أنت مستشار تطوير أعمال سعودي. بناءً على فجوات المنظومة، اقترح شركاء محتملين.

Return JSON:
{
    "suggestions": [
        {
            "name": "اسم النوع المقترح بالإنجليزي",
            "name_ar": "اسم النوع المقترح بالعربي",
            "entity_type": "agency/integrator/reseller/consultant/distributor",
            "industry": "القطاع",
            "capabilities": ["قدرة ١", "قدرة ٢"],
            "rationale_ar": "سبب الاقتراح بالعربي",
            "partner_potential": 0.0 to 1.0
        }
    ]
}"""

        try:
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=context,
                json_mode=True,
                temperature=0.4,
            )
            result = llm_response.parse_json() or {}
            suggestions_data = result.get("suggestions", [])
        except Exception as exc:
            logger.warning("LLM partner suggestion failed: %s", exc)
            suggestions_data = [
                {
                    "name": f"Partner for {gap_type}",
                    "name_ar": f"شريك لسد فجوة {gap_type}",
                    "entity_type": "consultant",
                    "industry": "consulting",
                    "capabilities": [g.get("need", "") for g in matching_gaps if g.get("need")],
                    "rationale_ar": "اقتراح تلقائي بناءً على الفجوات المكتشفة",
                    "partner_potential": 0.5,
                }
            ]

        entities: list[EcosystemEntity] = []
        for s in suggestions_data:
            entity = EcosystemEntity(
                name=s.get("name", ""),
                name_ar=s.get("name_ar", ""),
                entity_type=s.get("entity_type", "consultant"),
                industry=s.get("industry", ""),
                capabilities=s.get("capabilities", []),
                relationship_strength=0.0,
                partner_potential=min(1.0, max(0.0, float(s.get("partner_potential", 0.5)))),
            )
            entities.append(entity)

        logger.info(
            "Suggested %d partners for gap '%s' in tenant %s",
            len(entities), gap_type, tenant_id,
        )
        return entities

    # ── Get Clusters ────────────────────────────────────────────────────────

    async def get_clusters(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> list[dict]:
        """
        Identify clusters of related entities in the ecosystem.
        تحديد تجمعات الكيانات المترابطة في المنظومة
        """
        eco_map = await self.build_map(tenant_id, db)
        entities = eco_map.get("entities", [])
        links = eco_map.get("links", [])

        if not entities:
            return []

        # Group entities by industry
        industry_groups: dict[str, list[dict]] = defaultdict(list)
        for entity in entities:
            industry_groups[entity.get("industry", "other")].append(entity)

        clusters: list[dict] = []
        for industry, members in industry_groups.items():
            if not members:
                continue

            member_ids = {m["id"] for m in members}
            internal_links = [
                lk for lk in links
                if lk.get("source_id") in member_ids and lk.get("target_id") in member_ids
            ]
            external_links = [
                lk for lk in links
                if (lk.get("source_id") in member_ids) != (lk.get("target_id") in member_ids)
            ]

            avg_strength = 0.0
            if internal_links:
                avg_strength = sum(lk.get("strength", 0) for lk in internal_links) / len(internal_links)

            all_caps: set[str] = set()
            for m in members:
                all_caps.update(m.get("capabilities", []))

            clusters.append({
                "cluster_name": industry,
                "cluster_name_ar": ENTITY_TYPES.get(industry, industry),
                "member_count": len(members),
                "internal_links": len(internal_links),
                "external_links": len(external_links),
                "avg_internal_strength": round(avg_strength, 4),
                "capabilities": sorted(all_caps),
                "members": [{"id": m["id"], "name": m["name"]} for m in members],
            })

        clusters.sort(key=lambda c: c["member_count"], reverse=True)

        logger.info("Identified %d clusters for tenant %s", len(clusters), tenant_id)
        return clusters

    # ── Ecosystem Health ────────────────────────────────────────────────────

    async def get_ecosystem_health(
        self,
        tenant_id: str,
        db: AsyncSession,
    ) -> dict:
        """
        Calculate ecosystem health metrics: coverage, concentration, resilience.
        حساب مؤشرات صحة المنظومة: التغطية والتركيز والمرونة
        """
        eco_map = await self.build_map(tenant_id, db)
        entities = eco_map.get("entities", [])
        links = eco_map.get("links", [])
        gaps = await self.find_gaps(tenant_id, db)

        total_entities = len(entities)
        total_links = len(links)
        total_gaps = len(gaps)

        if total_entities == 0:
            return {
                "overall_score": 0.0,
                "coverage": 0.0,
                "concentration_risk": 1.0,
                "resilience": 0.0,
                "diversity": 0.0,
                "gap_count": 0,
                "recommendations_ar": ["لا توجد بيانات كافية لتحليل صحة المنظومة"],
            }

        # Coverage: ratio of cluster gaps (lower = better coverage)
        cluster_gaps = [g for g in gaps if g.get("gap_type") == "cluster"]
        total_clusters = len(CAPABILITY_CLUSTERS)
        coverage = 1.0 - (len(cluster_gaps) / total_clusters) if total_clusters > 0 else 0.0

        # Concentration risk: how dependent the ecosystem is on few entities
        type_counts = defaultdict(int)
        for e in entities:
            type_counts[e.get("entity_type", "unknown")] += 1
        max_type_share = max(type_counts.values()) / total_entities if total_entities > 0 else 1.0
        concentration_risk = max_type_share

        # Diversity: number of distinct entity types / total possible
        diversity = len(type_counts) / len(ENTITY_TYPES) if ENTITY_TYPES else 0.0

        # Resilience: avg links per entity (more links = more resilient)
        avg_links = total_links / total_entities if total_entities > 0 else 0.0
        resilience = min(1.0, avg_links / 3.0)  # 3+ links per entity = max resilience

        # Overall health score
        overall = round(
            coverage * 0.35
            + (1.0 - concentration_risk) * 0.25
            + resilience * 0.25
            + diversity * 0.15,
            4,
        )

        # Generate recommendations
        recommendations_ar: list[str] = []
        if coverage < 0.5:
            recommendations_ar.append("تغطية المنظومة ضعيفة — يُنصح بإضافة شركاء في القطاعات الناقصة")
        if concentration_risk > 0.6:
            recommendations_ar.append("تركيز عالٍ على نوع واحد من الشركاء — يُنصح بالتنويع")
        if resilience < 0.4:
            recommendations_ar.append("مرونة المنظومة منخفضة — يُنصح بتعزيز الروابط بين الشركاء")
        if diversity < 0.5:
            recommendations_ar.append("تنوع أنواع الشركاء محدود — يُنصح بإضافة أنواع جديدة")
        if total_gaps > 10:
            recommendations_ar.append(f"يوجد {total_gaps} فجوة في المنظومة — يُنصح بمعالجة الفجوات الحرجة أولاً")
        if not recommendations_ar:
            recommendations_ar.append("المنظومة في حالة صحية جيدة — استمر في المراقبة الدورية")

        health = {
            "overall_score": overall,
            "coverage": round(coverage, 4),
            "concentration_risk": round(concentration_risk, 4),
            "resilience": round(resilience, 4),
            "diversity": round(diversity, 4),
            "gap_count": total_gaps,
            "total_entities": total_entities,
            "total_links": total_links,
            "entity_type_distribution": dict(type_counts),
            "recommendations_ar": recommendations_ar,
        }

        logger.info(
            "Ecosystem health for tenant %s: overall=%.2f coverage=%.2f risk=%.2f",
            tenant_id, overall, coverage, concentration_risk,
        )
        return health

    # ── Private Helpers ─────────────────────────────────────────────────────

    def _infer_entity_type(self, profile: CompanyProfile) -> str:
        """Infer entity type from company profile characteristics."""
        caps = {c.lower() for c in (profile.capabilities or [])}
        industry = (profile.industry or "").lower()

        if industry == "consulting" or "استشارات" in caps:
            return "consultant"
        if "توزيع" in caps or "distribution" in industry:
            return "distributor"
        if "تكامل" in caps or "integration" in industry or "تكامل أنظمة" in caps:
            return "integrator"
        if "إعادة بيع" in caps or "reselling" in industry:
            return "reseller"
        if industry in ("marketing", "media") or "تسويق" in caps:
            return "agency"
        return "partner"

    def _infer_link(
        self, prof_a: CompanyProfile, prof_b: CompanyProfile,
    ) -> tuple[str, float]:
        """Infer the link type and strength between two profiles."""
        caps_a = {c.lower() for c in (prof_a.capabilities or [])}
        caps_b = {c.lower() for c in (prof_b.capabilities or [])}
        needs_a = {n.lower() for n in (prof_a.needs or [])}
        needs_b = {n.lower() for n in (prof_b.needs or [])}

        # Check if they are in the same industry (potential competitors)
        same_industry = (prof_a.industry or "") == (prof_b.industry or "") and prof_a.industry

        # Check vendor/client: A offers what B needs
        a_serves_b = len(caps_a & needs_b)
        b_serves_a = len(caps_b & needs_a)

        if a_serves_b > 0 and b_serves_a > 0:
            # Mutual exchange = partnership
            strength = min(1.0, (a_serves_b + b_serves_a) / max(len(needs_a | needs_b), 1) * 2)
            return "partner", round(strength, 4)
        elif a_serves_b > 0:
            strength = min(1.0, a_serves_b / max(len(needs_b), 1))
            return "vendor", round(strength, 4)
        elif b_serves_a > 0:
            strength = min(1.0, b_serves_a / max(len(needs_a), 1))
            return "client", round(strength, 4)
        elif same_industry and caps_a & caps_b:
            overlap = len(caps_a & caps_b) / max(len(caps_a | caps_b), 1)
            return "competitor", round(overlap, 4)
        else:
            return "partner", 0.1

    def _link_description(self, name_a: str, name_b: str, link_type: str) -> str:
        """Generate Arabic description for a link."""
        descriptions = {
            "partner": f"{name_a} و{name_b} شركاء محتملون",
            "competitor": f"{name_a} و{name_b} في نفس المجال التنافسي",
            "vendor": f"{name_a} مورد محتمل لـ{name_b}",
            "client": f"{name_a} عميل محتمل لـ{name_b}",
            "referral": f"{name_a} و{name_b} في شبكة إحالات مشتركة",
        }
        return descriptions.get(link_type, f"علاقة بين {name_a} و{name_b}")
