"""
Company Twin — Deep structured digital twin of a company's identity, capabilities, and needs.
التوأم الرقمي للشركة: ملف تعريفي عميق يصف هوية الشركة وقدراتها واحتياجاتها
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import CompanyProfile
from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.strategic_deals.company_twin")


# ── Node Models ─────────────────────────────────────────────────────────────


class CapabilityNode(BaseModel):
    """A single capability that the company can offer to partners."""
    category: str = Field(
        ...,
        description="service, product, expertise, capacity, distribution, technology",
    )
    name: str
    name_ar: str
    description: str = ""
    capacity_available: float = Field(
        default=0.5,
        ge=0.0, le=1.0,
        description="Spare capacity ratio: 0 = fully booked, 1 = fully available",
    )
    quality_level: str = Field(
        default="standard",
        description="premium, standard, or budget",
    )
    sectors_served: list[str] = Field(default_factory=list)
    geographic_coverage: list[str] = Field(
        default_factory=list,
        description="Saudi administrative regions covered",
    )


class NeedNode(BaseModel):
    """A single business need that the company is seeking from partners."""
    category: str = Field(
        ...,
        description="marketing, sales, delivery, technology, capital, distribution, talent",
    )
    name: str
    name_ar: str
    urgency: str = Field(
        default="medium",
        description="critical, high, medium, or low",
    )
    budget_range_sar: tuple[float, float] = Field(
        default=(0.0, 0.0),
        description="Min and max SAR budget for this need",
    )
    preferred_deal_type: str = ""
    description: str = ""


class AuthorityMatrix(BaseModel):
    """Defines what the AI agent can commit to autonomously vs what requires human approval."""
    auto_approve: list[str] = Field(
        default_factory=lambda: [
            "send_intro",
            "share_capability_doc",
            "schedule_call",
            "answer_general_questions",
        ],
    )
    requires_approval: list[str] = Field(
        default_factory=lambda: [
            "pricing_commitment",
            "exclusivity",
            "equity_discussion",
            "revenue_share_terms",
            "contract_duration",
        ],
    )
    forbidden: list[str] = Field(
        default_factory=lambda: [
            "sign_contract",
            "transfer_funds",
            "share_financials",
            "grant_data_access",
            "commit_legal_terms",
        ],
    )
    max_commitment_sar: float = Field(
        default=0.0,
        description="Maximum SAR value the AI may discuss without escalation",
    )
    identity_mode: str = Field(
        default="transparent_ai",
        description="transparent_ai, delegated_sender, or operator_shadow",
    )


class CompanyTwin(BaseModel):
    """Complete digital twin of a company for the Dealix Deal Exchange OS."""
    twin_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    tenant_id: str

    # Identity
    name: str
    name_ar: str = ""
    industry: str = ""
    sub_industry: str = ""
    cr_number: str = ""
    website: str = ""
    size: str = ""  # micro, small, medium, large
    annual_revenue_sar: float = 0.0

    # Capability and Need Graphs
    capabilities: list[CapabilityNode] = Field(default_factory=list)
    needs: list[NeedNode] = Field(default_factory=list)

    # Authority
    authority: AuthorityMatrix = Field(default_factory=AuthorityMatrix)

    # Deal preferences
    deal_types_allowed: list[str] = Field(default_factory=list)
    deal_types_blocked: list[str] = Field(default_factory=list)
    sectors_preferred: list[str] = Field(default_factory=list)
    sectors_blocked: list[str] = Field(default_factory=list)
    min_deal_value_sar: float = 0.0
    max_deal_value_sar: float = 10_000_000.0

    # Red lines — things AI must never agree to
    red_lines: list[str] = Field(default_factory=list)
    # Pre-approved marketing claims
    approved_claims: list[str] = Field(default_factory=list)

    # Compliance
    pdpl_consent_status: str = "pending"  # granted, pending, revoked
    whatsapp_opt_in: bool = False
    email_opt_in: bool = False

    # Metadata
    created_at: str = ""
    updated_at: str = ""


# ── Size Heuristic ──────────────────────────────────────────────────────────

_SIZE_THRESHOLDS = [
    (10, "micro"),
    (50, "small"),
    (250, "medium"),
]


def _infer_size(employee_count: Optional[float]) -> str:
    if employee_count is None or employee_count <= 0:
        return "small"
    for threshold, label in _SIZE_THRESHOLDS:
        if employee_count < threshold:
            return label
    return "large"


# ── Builder ─────────────────────────────────────────────────────────────────


class CompanyTwinBuilder:
    """
    Constructs, enriches, and manages CompanyTwin instances.
    يبني ويثري ويدير التوائم الرقمية للشركات
    """

    def __init__(self):
        self.llm = get_llm()

    # ── Build Twin ──────────────────────────────────────────────────────────

    async def build_twin(
        self,
        company_data: dict,
        user_description_ar: str,
        db: AsyncSession,
    ) -> CompanyTwin:
        """
        Build a full CompanyTwin from profile data and an Arabic description.
        بناء توأم رقمي كامل من بيانات الشركة ووصف عربي
        """
        company_id = str(company_data.get("company_id", company_data.get("id", "")))
        tenant_id = str(company_data.get("tenant_id", ""))
        name = company_data.get("company_name", company_data.get("name", ""))
        industry = company_data.get("industry", "")
        employee_count = company_data.get("employee_count")

        capabilities = await self.extract_capabilities(
            description=user_description_ar,
            industry=industry,
            db=db,
        )
        needs = await self.infer_needs(
            description=user_description_ar,
            capabilities=capabilities,
            db=db,
        )
        authority = await self.suggest_authority_matrix(
            company_size=_infer_size(float(employee_count) if employee_count else None),
            industry=industry,
        )

        now_iso = datetime.now(timezone.utc).isoformat()
        twin = CompanyTwin(
            company_id=company_id,
            tenant_id=tenant_id,
            name=name,
            name_ar=company_data.get("company_name_ar", ""),
            industry=industry,
            sub_industry=company_data.get("sub_industry", ""),
            cr_number=company_data.get("cr_number", ""),
            website=company_data.get("website", ""),
            size=_infer_size(float(employee_count) if employee_count else None),
            annual_revenue_sar=float(company_data.get("annual_revenue_sar", 0) or 0),
            capabilities=capabilities,
            needs=needs,
            authority=authority,
            deal_types_allowed=company_data.get("deal_types_allowed", []),
            deal_types_blocked=company_data.get("deal_types_blocked", []),
            sectors_preferred=company_data.get("sectors_preferred", []),
            sectors_blocked=company_data.get("sectors_blocked", []),
            min_deal_value_sar=float(company_data.get("min_deal_value_sar", 0) or 0),
            max_deal_value_sar=float(company_data.get("max_deal_value_sar", 10_000_000) or 10_000_000),
            red_lines=company_data.get("red_lines", []),
            approved_claims=company_data.get("approved_claims", []),
            pdpl_consent_status=company_data.get("pdpl_consent_status", "pending"),
            whatsapp_opt_in=company_data.get("whatsapp_opt_in", False),
            email_opt_in=company_data.get("email_opt_in", False),
            created_at=now_iso,
            updated_at=now_iso,
        )

        # Persist the twin as JSONB on the company profile
        profile_result = await db.execute(
            select(CompanyProfile).where(CompanyProfile.id == company_id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile:
            existing = dict(profile.deal_preferences or {})
            existing["twin"] = twin.model_dump(mode="json")
            profile.deal_preferences = existing
            await db.flush()

        logger.info("Built CompanyTwin %s for company %s", twin.twin_id, company_id)
        return twin

    # ── Extract Capabilities ────────────────────────────────────────────────

    async def extract_capabilities(
        self,
        description: str,
        industry: str,
        db: AsyncSession,
    ) -> list[CapabilityNode]:
        """
        Extract structured capability nodes from an Arabic free-text description.
        استخراج قدرات مهيكلة من وصف عربي حر
        """
        if not description.strip():
            return []

        system_prompt = """أنت محلل أعمال سعودي متخصص في تحليل قدرات الشركات.
حلل الوصف التالي واستخرج قدرات الشركة بشكل مهيكل.

أعد النتائج بصيغة JSON:
{
    "capabilities": [
        {
            "category": "service|product|expertise|capacity|distribution|technology",
            "name": "Capability name in English",
            "name_ar": "اسم القدرة بالعربي",
            "description": "Brief description",
            "capacity_available": 0.0 to 1.0,
            "quality_level": "premium|standard|budget",
            "sectors_served": ["sector1", "sector2"],
            "geographic_coverage": ["الرياض", "المنطقة الشرقية"]
        }
    ]
}

قواعد:
- استخرج 3-8 قدرات
- صنف كل قدرة بدقة
- قدر نسبة السعة المتاحة بناءً على السياق
- حدد المناطق الجغرافية إن أمكن
"""

        user_message = f"القطاع: {industry or 'غير محدد'}\n\nالوصف:\n{description}"

        try:
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=user_message,
                json_mode=True,
                temperature=0.3,
            )
            result = llm_response.parse_json()
            if not result or "capabilities" not in result:
                return []
            nodes = []
            for cap_data in result["capabilities"]:
                try:
                    node = CapabilityNode(
                        category=cap_data.get("category", "service"),
                        name=cap_data.get("name", ""),
                        name_ar=cap_data.get("name_ar", ""),
                        description=cap_data.get("description", ""),
                        capacity_available=float(cap_data.get("capacity_available", 0.5)),
                        quality_level=cap_data.get("quality_level", "standard"),
                        sectors_served=cap_data.get("sectors_served", []),
                        geographic_coverage=cap_data.get("geographic_coverage", []),
                    )
                    nodes.append(node)
                except Exception as exc:
                    logger.warning("Skipping malformed capability node: %s", exc)
            logger.info("Extracted %d capability nodes from description", len(nodes))
            return nodes
        except Exception as exc:
            logger.error("Failed to extract capabilities: %s", exc)
            return []

    # ── Infer Needs ─────────────────────────────────────────────────────────

    async def infer_needs(
        self,
        description: str,
        capabilities: list[CapabilityNode],
        db: AsyncSession,
    ) -> list[NeedNode]:
        """
        Infer business needs from description and existing capabilities.
        استنتاج احتياجات الشركة من الوصف والقدرات الحالية
        """
        if not description.strip():
            return []

        caps_summary = ", ".join(c.name for c in capabilities) if capabilities else "غير محدد"

        system_prompt = """أنت مستشار أعمال سعودي متخصص في تحليل احتياجات الشركات.
بناءً على الوصف والقدرات الحالية، حدد الاحتياجات التي يمكن أن تسدها شراكة B2B.

أعد النتائج بصيغة JSON:
{
    "needs": [
        {
            "category": "marketing|sales|delivery|technology|capital|distribution|talent",
            "name": "Need name in English",
            "name_ar": "اسم الاحتياج بالعربي",
            "urgency": "critical|high|medium|low",
            "budget_range_sar": [min_sar, max_sar],
            "preferred_deal_type": "service_barter|referral_partnership|co_selling|subcontracting|etc",
            "description": "وصف مختصر"
        }
    ]
}

قواعد:
- حدد 2-6 احتياجات واقعية
- لا تكرر القدرات الموجودة كاحتياجات
- قدر مدى الميزانية بالريال السعودي حسب السياق
- اقترح نوع الصفقة المناسب لكل احتياج
"""

        user_message = f"القدرات الحالية: {caps_summary}\n\nالوصف:\n{description}"

        try:
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=user_message,
                json_mode=True,
                temperature=0.3,
            )
            result = llm_response.parse_json()
            if not result or "needs" not in result:
                return []
            nodes = []
            for need_data in result["needs"]:
                try:
                    budget = need_data.get("budget_range_sar", [0, 0])
                    if isinstance(budget, list) and len(budget) == 2:
                        budget_tuple = (float(budget[0]), float(budget[1]))
                    else:
                        budget_tuple = (0.0, 0.0)
                    node = NeedNode(
                        category=need_data.get("category", "marketing"),
                        name=need_data.get("name", ""),
                        name_ar=need_data.get("name_ar", ""),
                        urgency=need_data.get("urgency", "medium"),
                        budget_range_sar=budget_tuple,
                        preferred_deal_type=need_data.get("preferred_deal_type", ""),
                        description=need_data.get("description", ""),
                    )
                    nodes.append(node)
                except Exception as exc:
                    logger.warning("Skipping malformed need node: %s", exc)
            logger.info("Inferred %d need nodes from description", len(nodes))
            return nodes
        except Exception as exc:
            logger.error("Failed to infer needs: %s", exc)
            return []

    # ── Suggest Authority Matrix ────────────────────────────────────────────

    async def suggest_authority_matrix(
        self,
        company_size: str,
        industry: str,
    ) -> AuthorityMatrix:
        """
        Suggest an authority matrix based on company size and industry.
        اقتراح مصفوفة صلاحيات بناءً على حجم الشركة والقطاع
        """
        # Base policies by company size
        size_policies = {
            "micro": {
                "max_commitment_sar": 5_000,
                "identity_mode": "transparent_ai",
                "auto_approve": [
                    "send_intro",
                    "share_capability_doc",
                    "schedule_call",
                    "answer_general_questions",
                ],
                "requires_approval": [
                    "pricing_commitment",
                    "exclusivity",
                    "equity_discussion",
                    "revenue_share_terms",
                ],
                "forbidden": [
                    "sign_contract",
                    "transfer_funds",
                    "share_financials",
                    "grant_data_access",
                ],
            },
            "small": {
                "max_commitment_sar": 25_000,
                "identity_mode": "transparent_ai",
                "auto_approve": [
                    "send_intro",
                    "share_capability_doc",
                    "schedule_call",
                    "answer_general_questions",
                    "send_proposal_draft",
                ],
                "requires_approval": [
                    "pricing_commitment",
                    "exclusivity",
                    "equity_discussion",
                    "revenue_share_terms",
                    "contract_duration",
                ],
                "forbidden": [
                    "sign_contract",
                    "transfer_funds",
                    "share_financials",
                    "grant_data_access",
                    "commit_legal_terms",
                ],
            },
            "medium": {
                "max_commitment_sar": 50_000,
                "identity_mode": "delegated_sender",
                "auto_approve": [
                    "send_intro",
                    "share_capability_doc",
                    "schedule_call",
                    "answer_general_questions",
                    "send_proposal_draft",
                    "negotiate_minor_terms",
                ],
                "requires_approval": [
                    "pricing_commitment",
                    "exclusivity",
                    "equity_discussion",
                    "revenue_share_terms",
                    "contract_duration",
                    "territory_expansion",
                ],
                "forbidden": [
                    "sign_contract",
                    "transfer_funds",
                    "share_financials",
                    "grant_data_access",
                    "commit_legal_terms",
                    "share_client_data",
                ],
            },
            "large": {
                "max_commitment_sar": 100_000,
                "identity_mode": "delegated_sender",
                "auto_approve": [
                    "send_intro",
                    "share_capability_doc",
                    "schedule_call",
                    "answer_general_questions",
                    "send_proposal_draft",
                    "negotiate_minor_terms",
                    "send_nda_template",
                ],
                "requires_approval": [
                    "pricing_commitment",
                    "exclusivity",
                    "equity_discussion",
                    "revenue_share_terms",
                    "contract_duration",
                    "territory_expansion",
                    "ip_licensing",
                    "joint_venture_terms",
                ],
                "forbidden": [
                    "sign_contract",
                    "transfer_funds",
                    "share_financials",
                    "grant_data_access",
                    "commit_legal_terms",
                    "share_client_data",
                    "waive_liability",
                ],
            },
        }

        policy = size_policies.get(company_size, size_policies["small"])

        # Industry-specific adjustments for regulated sectors
        regulated_industries = {"finance", "healthcare", "energy", "government"}
        if industry in regulated_industries:
            policy["max_commitment_sar"] = min(policy["max_commitment_sar"], 10_000)
            policy["forbidden"].extend([
                "discuss_regulatory_commitments",
                "promise_compliance_outcomes",
            ])
            # Deduplicate
            policy["forbidden"] = list(set(policy["forbidden"]))

        matrix = AuthorityMatrix(
            auto_approve=policy["auto_approve"],
            requires_approval=policy["requires_approval"],
            forbidden=policy["forbidden"],
            max_commitment_sar=policy["max_commitment_sar"],
            identity_mode=policy["identity_mode"],
        )
        logger.info(
            "Suggested authority matrix for %s %s company: max_commitment=%.0f SAR",
            company_size, industry or "general", matrix.max_commitment_sar,
        )
        return matrix

    # ── Update Twin ─────────────────────────────────────────────────────────

    async def update_twin(
        self,
        twin_id: str,
        updates: dict,
        db: AsyncSession,
    ) -> CompanyTwin:
        """
        Apply partial updates to an existing CompanyTwin.
        تحديث جزئي للتوأم الرقمي
        """
        twin = await self.get_twin_by_id(twin_id, db)
        if not twin:
            raise ValueError(f"التوأم الرقمي غير موجود: {twin_id}")

        twin_data = twin.model_dump(mode="json")

        # Apply updates, preserving existing values for keys not in updates
        for key, value in updates.items():
            if key in twin_data and key not in ("twin_id", "company_id", "tenant_id", "created_at"):
                twin_data[key] = value

        twin_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        updated_twin = CompanyTwin(**twin_data)

        # Persist
        profile_result = await db.execute(
            select(CompanyProfile).where(CompanyProfile.id == updated_twin.company_id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile:
            existing = dict(profile.deal_preferences or {})
            existing["twin"] = updated_twin.model_dump(mode="json")
            profile.deal_preferences = existing
            await db.flush()

        logger.info("Updated CompanyTwin %s", twin_id)
        return updated_twin

    # ── Get Twin ────────────────────────────────────────────────────────────

    async def get_twin(
        self,
        company_id: str,
        db: AsyncSession,
    ) -> Optional[CompanyTwin]:
        """
        Retrieve the CompanyTwin for a given company.
        استرجاع التوأم الرقمي لشركة معينة
        """
        profile_result = await db.execute(
            select(CompanyProfile).where(CompanyProfile.id == company_id)
        )
        profile = profile_result.scalar_one_or_none()
        if not profile:
            logger.warning("Company profile not found: %s", company_id)
            return None

        prefs = profile.deal_preferences or {}
        twin_data = prefs.get("twin")
        if not twin_data:
            logger.info("No twin found for company %s", company_id)
            return None

        try:
            return CompanyTwin(**twin_data)
        except Exception as exc:
            logger.error("Failed to deserialize twin for company %s: %s", company_id, exc)
            return None

    async def get_twin_by_id(
        self,
        twin_id: str,
        db: AsyncSession,
    ) -> Optional[CompanyTwin]:
        """
        Retrieve a CompanyTwin by its twin_id (scans all profiles).
        استرجاع التوأم الرقمي برقمه المعرف
        """
        all_profiles = await db.execute(select(CompanyProfile))
        for profile in all_profiles.scalars():
            prefs = profile.deal_preferences or {}
            twin_data = prefs.get("twin")
            if twin_data and twin_data.get("twin_id") == twin_id:
                try:
                    return CompanyTwin(**twin_data)
                except Exception:
                    continue
        return None

    # ── Deal Readiness Report ───────────────────────────────────────────────

    async def get_deal_readiness_report(
        self,
        twin_id: str,
        db: AsyncSession,
    ) -> dict:
        """
        Generate an Arabic deal-readiness report for the company twin.
        إنشاء تقرير جاهزية الصفقات بالعربي للتوأم الرقمي
        """
        twin = await self.get_twin_by_id(twin_id, db)
        if not twin:
            raise ValueError(f"التوأم الرقمي غير موجود: {twin_id}")

        issues: list[str] = []
        score = 0.0
        max_score = 100.0

        # 1. Capabilities completeness (0-25)
        cap_count = len(twin.capabilities)
        if cap_count == 0:
            issues.append("لم يتم تحديد أي قدرات للشركة — أضف قدراتك لتحسين فرص المطابقة")
            cap_score = 0.0
        elif cap_count < 3:
            issues.append(f"لديك {cap_count} قدرات فقط — يفضل إضافة 3 قدرات على الأقل")
            cap_score = cap_count * 8.0
        else:
            cap_score = 25.0
        score += cap_score

        # 2. Needs clarity (0-20)
        need_count = len(twin.needs)
        if need_count == 0:
            issues.append("لم يتم تحديد أي احتياجات — حدد احتياجاتك ليتمكن النظام من إيجاد شركاء")
            need_score = 0.0
        elif need_count < 2:
            issues.append(f"لديك احتياج واحد فقط — أضف المزيد لتوسيع خيارات الشراكة")
            need_score = 10.0
        else:
            need_score = 20.0
        score += need_score

        # 3. Authority matrix configured (0-15)
        authority_score = 0.0
        if twin.authority.max_commitment_sar > 0:
            authority_score += 5.0
        else:
            issues.append("لم يتم تحديد حد أقصى لصلاحيات الذكاء الاصطناعي")
        if len(twin.authority.auto_approve) > 0:
            authority_score += 5.0
        if len(twin.authority.forbidden) > 0:
            authority_score += 5.0
        else:
            issues.append("لم يتم تحديد الإجراءات المحظورة — مهم للحماية")
        score += authority_score

        # 4. Compliance readiness (0-20)
        compliance_score = 0.0
        if twin.pdpl_consent_status == "granted":
            compliance_score += 10.0
        else:
            issues.append("موافقة نظام حماية البيانات الشخصية (PDPL) غير مكتملة")
        if twin.whatsapp_opt_in:
            compliance_score += 5.0
        else:
            issues.append("لم يتم تفعيل الموافقة على التواصل عبر واتساب")
        if twin.email_opt_in:
            compliance_score += 5.0
        else:
            issues.append("لم يتم تفعيل الموافقة على التواصل عبر البريد الإلكتروني")
        score += compliance_score

        # 5. Deal preferences set (0-10)
        pref_score = 0.0
        if twin.deal_types_allowed:
            pref_score += 5.0
        else:
            issues.append("لم يتم تحديد أنواع الصفقات المسموحة")
        if twin.red_lines:
            pref_score += 5.0
        else:
            issues.append("لم يتم تحديد الخطوط الحمراء — يُنصح بتحديدها لحماية مصالحك")
        score += pref_score

        # 6. Profile completeness (0-10)
        profile_score = 0.0
        if twin.cr_number:
            profile_score += 3.0
        else:
            issues.append("أضف رقم السجل التجاري لزيادة الموثوقية")
        if twin.website:
            profile_score += 2.0
        if twin.name_ar:
            profile_score += 2.0
        if twin.annual_revenue_sar > 0:
            profile_score += 3.0
        score += profile_score

        # Readiness level
        if score >= 80:
            readiness = "جاهز للصفقات"
            readiness_level = "high"
        elif score >= 50:
            readiness = "يحتاج تحسين بسيط"
            readiness_level = "medium"
        else:
            readiness = "يحتاج اهتمام عاجل"
            readiness_level = "low"

        report = {
            "twin_id": twin.twin_id,
            "company_name": twin.name,
            "company_name_ar": twin.name_ar,
            "score": round(score, 1),
            "max_score": max_score,
            "readiness_level": readiness_level,
            "readiness_label_ar": readiness,
            "breakdown": {
                "capabilities": round(cap_score, 1),
                "needs": round(need_score, 1),
                "authority": round(authority_score, 1),
                "compliance": round(compliance_score, 1),
                "deal_preferences": round(pref_score, 1),
                "profile": round(profile_score, 1),
            },
            "issues_ar": issues,
            "summary_ar": (
                f"شركة {twin.name_ar or twin.name}: "
                f"درجة الجاهزية {score:.0f}/100 — {readiness}. "
                + (f"يوجد {len(issues)} ملاحظات تحتاج معالجة." if issues else "الملف مكتمل وجاهز.")
            ),
        }

        logger.info(
            "Deal readiness report for twin %s: score=%.1f level=%s",
            twin_id, score, readiness_level,
        )
        return report
