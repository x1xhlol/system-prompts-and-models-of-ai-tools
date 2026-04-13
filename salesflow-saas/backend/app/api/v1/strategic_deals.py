"""
Strategic Deals API — B2B deal discovery, matching, negotiation, and outreach.
واجهة الصفقات الاستراتيجية: اكتشاف وتوفيق وتفاوض وتواصل الشراكات
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel as Schema, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.strategic_deal import (
    CompanyProfile, StrategicDeal, DealMatch,
    DealStatus, DealType, DealChannel, MatchStatus,
)
from app.services.strategic_deals.company_profiler import CompanyProfiler
from app.services.strategic_deals.deal_matcher import DealMatcher
from app.services.strategic_deals.deal_negotiator import DealNegotiator, NegotiationStrategy
from app.services.strategic_deals.deal_agent import DealAgent
from app.services.strategic_deals.operating_modes import OperatingMode, ModeEnforcer
from app.services.strategic_deals.deal_taxonomy import DealTaxonomyService
from app.services.dealix_os.vertical_playbooks import get_playbook, list_playbook_ids
from app.services.dealix_os.partner_archetypes import list_archetypes, archetype_for_deal_type
from app.services.dealix_os.policy_engine import evaluate_action, suggested_playbook_for_industry

router = APIRouter(prefix="/strategic-deals", tags=["Strategic Deals"])


# ── Pydantic Schemas ─────────────────────────────────────────────────────────


class ProfileCreate(Schema):
    company_name: str
    company_name_ar: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    cr_number: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    employee_count: Optional[int] = None
    annual_revenue_sar: Optional[float] = None
    capabilities: list[str] = []
    needs: list[str] = []
    deal_preferences: dict = {}
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    whatsapp_number: Optional[str] = None


class ProfileResponse(Schema):
    id: UUID
    tenant_id: UUID
    company_name: str
    company_name_ar: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    cr_number: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    employee_count: Optional[float] = None
    annual_revenue_sar: Optional[float] = None
    capabilities: list = []
    needs: list = []
    deal_preferences: dict = {}
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    whatsapp_number: Optional[str] = None
    trust_score: float = 0.0
    is_verified: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class NeedsAnalysisRequest(Schema):
    description: str = Field(..., description="وصف الاحتياجات بالعربي أو الإنجليزي")


class DealCreate(Schema):
    initiator_profile_id: UUID
    target_profile_id: Optional[UUID] = None
    target_company_name: Optional[str] = None
    target_contact_phone: Optional[str] = None
    target_contact_email: Optional[str] = None
    deal_type: str = "partnership"
    deal_title: str
    deal_title_ar: Optional[str] = None
    our_offer: Optional[str] = None
    our_need: Optional[str] = None
    proposed_terms: dict = {}
    estimated_value_sar: Optional[float] = None
    channel: str = "whatsapp"
    lead_id: Optional[UUID] = None
    sales_deal_id: Optional[UUID] = None


class DealResponse(Schema):
    id: UUID
    tenant_id: UUID
    initiator_profile_id: UUID
    target_profile_id: Optional[UUID] = None
    target_company_name: Optional[str] = None
    target_contact_phone: Optional[str] = None
    target_contact_email: Optional[str] = None
    deal_type: str
    deal_title: str
    deal_title_ar: Optional[str] = None
    our_offer: Optional[str] = None
    our_need: Optional[str] = None
    proposed_terms: dict = {}
    agreed_terms: dict = {}
    estimated_value_sar: Optional[float] = None
    status: str
    channel: str
    ai_confidence: float = 0.0
    negotiation_history: list = []
    notes: Optional[str] = None
    notes_ar: Optional[str] = None
    lead_id: Optional[UUID] = None
    sales_deal_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MatchResponse(Schema):
    id: UUID
    tenant_id: UUID
    company_a_id: UUID
    company_b_id: Optional[UUID] = None
    company_b_name: Optional[str] = None
    company_b_data: dict = {}
    match_score: float = 0.0
    match_reasons: list = []
    deal_type_suggested: Optional[str] = None
    terms_suggested: dict = {}
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class NegotiateRequest(Schema):
    their_terms: Optional[dict] = None
    message: Optional[str] = None
    strategy: Optional[NegotiationStrategy] = None


class OutreachRequest(Schema):
    channel: str = "whatsapp"
    style: str = "as_company"


class DiscoveryScanRequest(Schema):
    profile_id: UUID
    deal_type: Optional[str] = None


class BarterScanRequest(Schema):
    profile_id: UUID


class OperatingModeSet(Schema):
    mode: int = Field(..., ge=0, le=4, description="OperatingMode 0–4")


class PolicyEvaluateRequest(Schema):
    channel: str = "whatsapp"
    action: str = "send_custom_message"
    deal_value_sar: float = 0.0
    industry: Optional[str] = None


class DealLinksUpdate(Schema):
    lead_id: Optional[UUID] = None
    sales_deal_id: Optional[UUID] = None


# ── Profile Endpoints ────────────────────────────────────────────────────────


@router.get("/profiles", response_model=list[ProfileResponse])
async def list_profiles(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List company profiles for the tenant. | عرض ملفات الشركات"""
    q = (
        select(CompanyProfile)
        .where(CompanyProfile.tenant_id == current_user.tenant_id)
        .order_by(CompanyProfile.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    result = await db.execute(q)
    return [ProfileResponse.model_validate(p) for p in result.scalars().all()]


@router.post("/profiles", response_model=ProfileResponse, status_code=201)
async def create_profile(
    data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a company profile for B2B matching. | إنشاء ملف شركة للمطابقة"""
    profiler = CompanyProfiler()
    profile = await profiler.create_profile(
        company_data=data.model_dump(),
        tenant_id=current_user.tenant_id,
        db=db,
    )
    return ProfileResponse.model_validate(profile)


@router.put("/profiles/{profile_id}/enrich", response_model=ProfileResponse)
async def enrich_profile(
    profile_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """AI-enrich a company profile. | إثراء ملف الشركة بالذكاء الاصطناعي"""
    result = await db.execute(
        select(CompanyProfile).where(
            CompanyProfile.id == profile_id,
            CompanyProfile.tenant_id == current_user.tenant_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="الملف غير موجود | Profile not found")

    profiler = CompanyProfiler()
    profile = await profiler.enrich_profile(profile_id, db)
    return ProfileResponse.model_validate(profile)


@router.post("/profiles/{profile_id}/analyze-needs")
async def analyze_needs(
    profile_id: UUID,
    data: NeedsAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze what a company needs (Arabic input). | تحليل احتياجات الشركة"""
    result = await db.execute(
        select(CompanyProfile).where(
            CompanyProfile.id == profile_id,
            CompanyProfile.tenant_id == current_user.tenant_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="الملف غير موجود | Profile not found")

    profiler = CompanyProfiler()
    analysis = await profiler.analyze_needs(profile_id, data.description, db)
    return {"status": "ok", "analysis": analysis}


# ── Match Endpoints ──────────────────────────────────────────────────────────


@router.get("/matches", response_model=list[MatchResponse])
async def list_matches(
    profile_id: UUID = Query(None, description="Filter by company profile"),
    status: str = Query(None, description="Filter by match status"),
    min_score: float = Query(None, ge=0, le=1, description="Minimum match score"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get AI-suggested matches. | عرض المطابقات المقترحة بالذكاء الاصطناعي"""
    query = select(DealMatch).where(DealMatch.tenant_id == current_user.tenant_id)
    if profile_id:
        query = query.where(
            (DealMatch.company_a_id == profile_id) | (DealMatch.company_b_id == profile_id)
        )
    if status:
        query = query.where(DealMatch.status == status)
    if min_score is not None:
        query = query.where(DealMatch.match_score >= min_score)

    query = query.order_by(DealMatch.match_score.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    return [MatchResponse.model_validate(m) for m in result.scalars().all()]


@router.post("/matches/{match_id}/approve", response_model=MatchResponse)
async def approve_match(
    match_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Approve a match for outreach. | الموافقة على مطابقة للتواصل"""
    result = await db.execute(
        select(DealMatch).where(
            DealMatch.id == match_id,
            DealMatch.tenant_id == current_user.tenant_id,
        )
    )
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="المطابقة غير موجودة | Match not found")
    if match.status != MatchStatus.SUGGESTED.value:
        raise HTTPException(status_code=400, detail="المطابقة تمت الموافقة عليها مسبقاً | Match already processed")

    match.status = MatchStatus.APPROVED.value
    await db.flush()
    await db.refresh(match)
    return MatchResponse.model_validate(match)


# ── Discovery Scan ───────────────────────────────────────────────────────────


@router.post("/scan", response_model=list[MatchResponse])
async def run_discovery_scan(
    data: DiscoveryScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run a full AI discovery scan for partners. | تشغيل فحص اكتشاف شامل"""
    result = await db.execute(
        select(CompanyProfile).where(
            CompanyProfile.id == data.profile_id,
            CompanyProfile.tenant_id == current_user.tenant_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="الملف غير موجود | Profile not found")

    agent = DealAgent()
    matches = await agent.run_discovery_scan(data.profile_id, data.deal_type, db)
    return [MatchResponse.model_validate(m) for m in matches]


# ── Deal CRUD ────────────────────────────────────────────────────────────────


@router.post("", response_model=DealResponse, status_code=201)
async def create_deal(
    data: DealCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a strategic deal. | إنشاء صفقة استراتيجية"""
    # Verify initiator profile belongs to tenant
    init_result = await db.execute(
        select(CompanyProfile).where(
            CompanyProfile.id == data.initiator_profile_id,
            CompanyProfile.tenant_id == current_user.tenant_id,
        )
    )
    if not init_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="ملف المبادر غير موجود | Initiator profile not found")

    deal = StrategicDeal(
        tenant_id=current_user.tenant_id,
        initiator_profile_id=data.initiator_profile_id,
        target_profile_id=data.target_profile_id,
        target_company_name=data.target_company_name,
        target_contact_phone=data.target_contact_phone,
        target_contact_email=data.target_contact_email,
        deal_type=data.deal_type,
        deal_title=data.deal_title,
        deal_title_ar=data.deal_title_ar,
        our_offer=data.our_offer,
        our_need=data.our_need,
        proposed_terms=data.proposed_terms,
        estimated_value_sar=Decimal(str(data.estimated_value_sar)) if data.estimated_value_sar else None,
        status=DealStatus.DISCOVERY.value,
        channel=data.channel,
        ai_confidence=0.0,
        negotiation_history=[],
        lead_id=data.lead_id,
        sales_deal_id=data.sales_deal_id,
    )
    db.add(deal)
    await db.flush()
    await db.refresh(deal)
    return DealResponse.model_validate(deal)


@router.get("", response_model=list[DealResponse])
async def list_deals(
    status: str = Query(None),
    deal_type: str = Query(None),
    profile_id: UUID = Query(None, description="Filter by initiator or target profile"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List strategic deals with filters. | عرض الصفقات الاستراتيجية"""
    query = select(StrategicDeal).where(StrategicDeal.tenant_id == current_user.tenant_id)
    if status:
        query = query.where(StrategicDeal.status == status)
    if deal_type:
        query = query.where(StrategicDeal.deal_type == deal_type)
    if profile_id:
        query = query.where(
            (StrategicDeal.initiator_profile_id == profile_id)
            | (StrategicDeal.target_profile_id == profile_id)
        )

    query = query.order_by(StrategicDeal.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    return [DealResponse.model_validate(d) for d in result.scalars().all()]


@router.get("/operating-model")
async def get_operating_model(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Current AI operating mode and all mode definitions. | وضع التشغيل والأوصاف"""
    mode = await ModeEnforcer.get_current_mode(str(current_user.tenant_id), db)
    policy = ModeEnforcer.get_mode_policy(mode)
    return {
        "current": {
            "mode": mode.value,
            "name": mode.name,
            "label_ar": policy.label_ar,
            "description_ar": policy.description_ar,
            "auto_send": policy.auto_send,
            "auto_negotiate": policy.auto_negotiate,
            "max_auto_commitment_sar": policy.max_auto_commitment_sar,
            "allowed_channels": policy.allowed_channels,
        },
        "modes": ModeEnforcer.get_all_modes(),
        "roles_ar": [
            {"id": "owner", "label": "المالك", "scope": "تغيير وضع التشغيل، الالتزامات الكبرى"},
            {"id": "revops", "label": "عمليات الإيرادات", "scope": "القمع، السياسات، التقارير"},
            {"id": "partner_manager", "label": "مدير شراكات", "scope": "مسار الشراكات والتفاوض"},
            {"id": "compliance", "label": "الامتثال", "scope": "الموافقات الحساسة والقطاعات المنظمة"},
        ],
        "sla_hints_ar": {
            "response_window": "الرد على العملاء المؤهلين خلال ٢٤–٤٨ ساعة عمل",
            "followup_cap": "حد أقصى ٣ متابعات تلقائية ثم تصعيد بشري",
            "opt_out": "احترام طلب التوقف فوراً وتسجيله في السجل",
        },
    }


@router.put("/operating-model")
async def set_operating_model(
    data: OperatingModeSet,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Set tenant operating mode (stored on first company profile). | تعيين وضع التشغيل"""
    try:
        om = OperatingMode(data.mode)
    except ValueError:
        raise HTTPException(status_code=400, detail="وضع تشغيل غير صالح | Invalid mode")
    try:
        await ModeEnforcer.set_mode(str(current_user.tenant_id), om, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"status": "ok", "mode": om.value, "name": om.name}


@router.get("/taxonomy/deal-types")
async def taxonomy_deal_types():
    """Full 15-type partnership taxonomy for UI. | تصنيف أنواع الصفقات"""
    return [t.model_dump() for t in DealTaxonomyService.get_all_types()]


@router.get("/taxonomy/deal-types/{type_id}")
async def taxonomy_deal_type_detail(type_id: str):
    spec = DealTaxonomyService.get_deal_type(type_id)
    if not spec:
        raise HTTPException(status_code=404, detail="نوع غير معروف | Unknown type")
    return spec.model_dump()


@router.get("/partner-archetypes")
async def partner_archetypes():
    """Map DB deal_type values to operational archetypes. | أنماط الشراكات التشغيلية"""
    return {"archetypes": list_archetypes()}


@router.get("/playbooks")
async def playbooks_list():
    """Vertical playbooks (sector defaults). | قوالب قطاعية"""
    return {
        "ids": list_playbook_ids(),
        "items": [get_playbook(i) for i in list_playbook_ids()],
    }


@router.get("/playbooks/{playbook_id}")
async def playbook_detail(playbook_id: str):
    pb = get_playbook(playbook_id)
    if not pb:
        raise HTTPException(status_code=404, detail="playbook not found")
    return pb


@router.post("/policy/evaluate")
async def policy_evaluate(
    data: PolicyEvaluateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Graded policy: auto_execute | approval_required | blocked."""
    result = await evaluate_action(
        tenant_id=current_user.tenant_id,
        channel=data.channel,
        action=data.action,
        deal_value_sar=data.deal_value_sar,
        industry=data.industry,
        db=db,
    )
    sp = suggested_playbook_for_industry(data.industry)
    result["suggested_playbook_id"] = sp
    return result


@router.get("/identity/graph")
async def identity_graph(
    profile_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Counts and links for one company profile (light account graph)."""
    pr = await db.execute(
        select(CompanyProfile).where(
            CompanyProfile.id == profile_id,
            CompanyProfile.tenant_id == current_user.tenant_id,
        )
    )
    profile = pr.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    deals_init = await db.execute(
        select(func.count()).select_from(StrategicDeal).where(
            StrategicDeal.tenant_id == current_user.tenant_id,
            StrategicDeal.initiator_profile_id == profile_id,
        )
    )
    deals_tgt = await db.execute(
        select(func.count()).select_from(StrategicDeal).where(
            StrategicDeal.tenant_id == current_user.tenant_id,
            StrategicDeal.target_profile_id == profile_id,
        )
    )
    matches_a = await db.execute(
        select(func.count()).select_from(DealMatch).where(
            DealMatch.tenant_id == current_user.tenant_id,
            DealMatch.company_a_id == profile_id,
        )
    )
    matches_b = await db.execute(
        select(func.count()).select_from(DealMatch).where(
            DealMatch.tenant_id == current_user.tenant_id,
            DealMatch.company_b_id == profile_id,
        )
    )
    linked_leads = await db.execute(
        select(func.count()).select_from(StrategicDeal).where(
            StrategicDeal.tenant_id == current_user.tenant_id,
            (StrategicDeal.initiator_profile_id == profile_id)
            | (StrategicDeal.target_profile_id == profile_id),
            StrategicDeal.lead_id.isnot(None),
        )
    )
    linked_sales = await db.execute(
        select(func.count()).select_from(StrategicDeal).where(
            StrategicDeal.tenant_id == current_user.tenant_id,
            (StrategicDeal.initiator_profile_id == profile_id)
            | (StrategicDeal.target_profile_id == profile_id),
            StrategicDeal.sales_deal_id.isnot(None),
        )
    )

    return {
        "profile_id": str(profile_id),
        "company_name": profile.company_name,
        "suggested_playbook_id": suggested_playbook_for_industry(profile.industry),
        "archetype_hint": archetype_for_deal_type("partnership"),
        "counts": {
            "strategic_deals_as_initiator": deals_init.scalar() or 0,
            "strategic_deals_as_target": deals_tgt.scalar() or 0,
            "matches_as_party_a": matches_a.scalar() or 0,
            "matches_as_party_b": matches_b.scalar() or 0,
            "deals_with_lead_link": linked_leads.scalar() or 0,
            "deals_with_sales_deal_link": linked_sales.scalar() or 0,
        },
    }


@router.get("/governance/snapshot")
async def governance_snapshot(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """North-star style KPIs + policy posture for dashboards."""
    mode = await ModeEnforcer.get_current_mode(str(current_user.tenant_id), db)
    policy = ModeEnforcer.get_mode_policy(mode)

    tenant_id = current_user.tenant_id
    total_deals = (await db.execute(
        select(func.count()).select_from(StrategicDeal).where(StrategicDeal.tenant_id == tenant_id)
    )).scalar() or 0
    hist_rows = (
        await db.execute(
            select(StrategicDeal.negotiation_history).where(StrategicDeal.tenant_id == tenant_id)
        )
    ).all()
    deals_with_history = sum(
        1 for (h,) in hist_rows if isinstance(h, list) and len(h) > 0
    )

    return {
        "operating_mode": {"value": mode.value, "name": mode.name, "label_ar": policy.label_ar},
        "north_star_hints_ar": {
            "touch_to_meeting": "تقليل الزمن من أول لمسة إلى اجتماع مؤهل",
            "stage_conversion": "تحسين تحويل المراحل في القمع",
            "partner_attribution": "مساهمة الشراكات في خط الأنابيب",
        },
        "governance_kpis": {
            "auto_send_enabled": policy.auto_send,
            "auto_negotiate_enabled": policy.auto_negotiate,
            "max_auto_commitment_sar": policy.max_auto_commitment_sar,
            "strategic_deals_total": total_deals,
            "deals_with_negotiation_rounds": deals_with_history,
        },
    }


@router.get("/growth/checklist")
async def growth_ma_checklist():
    """Light M&A / expansion checklist (human decisions required)."""
    return {
        "disclaimer_ar": "قائمة إرشادية فقط — لا تغني عن مستشار قانوني أو مالي.",
        "phases": [
            {
                "id": "thesis",
                "title_ar": "أطروحة الاستثمار",
                "items_ar": [
                    "تحديد القطاع والجغرافيا والحجم المستهدف",
                    "ربط الصفقة بأهداف الشركة الاستراتيجية (٣–٥ نقاط)",
                ],
            },
            {
                "id": "screen",
                "title_ar": "فرز أولي",
                "items_ar": [
                    "تطبيق معايير إقصاء واضحة (حجم، نمو، تركيز)",
                    "تسجيل مصادر البيانات لكل هدف",
                ],
            },
            {
                "id": "dd_lite",
                "title_ar": "عناية واجبة خفيفة",
                "items_ar": [
                    "المالية: إيرادات، هامش، تدفقات",
                    "التقنية والمنتج: نضج، ديون تقنية، IP",
                    "العملاء: تركيز، انحراف، مخاطر تجميع",
                ],
            },
            {
                "id": "approval",
                "title_ar": "موافقة وإغلاق داخلي",
                "items_ar": [
                    "لجنة استثمار / مجلس إدارة حسب الحوكمة",
                    "توثيق الشروط الرئيسية قبل أي التزام",
                ],
            },
        ],
    }


@router.get("/agent-quality/snapshot")
async def agent_quality_snapshot(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Proxy metrics for QA / improvement loop (extend with real message logs later)."""
    tenant_id = current_user.tenant_id
    total = (await db.execute(
        select(func.count()).select_from(StrategicDeal).where(StrategicDeal.tenant_id == tenant_id)
    )).scalar() or 0
    with_hist = (await db.execute(
        select(StrategicDeal.negotiation_history).where(StrategicDeal.tenant_id == tenant_id)
    )).all()
    rounds = 0
    for row in with_hist:
        h = row[0] or []
        if isinstance(h, list):
            rounds += len(h)
    avg_rounds = (rounds / total) if total else 0.0
    high_conf = (await db.execute(
        select(func.count()).select_from(StrategicDeal).where(
            StrategicDeal.tenant_id == tenant_id,
            StrategicDeal.ai_confidence >= 0.7,
        )
    )).scalar() or 0

    return {
        "labels_ar": {
            "negotiation_depth": "عمق جولات التفاوض المسجّل",
            "high_confidence_deals": "صفقات بثقة نموذج مرتفعة",
        },
        "strategic_deals_total": total,
        "negotiation_rounds_total": rounds,
        "avg_negotiation_rounds_per_deal": round(avg_rounds, 2),
        "deals_high_ai_confidence": high_conf,
        "loop_hints_ar": [
            "اربط هذه المؤشرات لاحقاً بردود العملاء الفعلية ومعدلات التحويل",
            "استخدم وضع «مسودات» عند ارتفاع معدل التصعيد",
        ],
    }


@router.get("/{deal_id}", response_model=DealResponse)
async def get_deal(
    deal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get deal details with negotiation history. | تفاصيل الصفقة مع سجل التفاوض"""
    result = await db.execute(
        select(StrategicDeal).where(
            StrategicDeal.id == deal_id,
            StrategicDeal.tenant_id == current_user.tenant_id,
        )
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="الصفقة غير موجودة | Deal not found")
    return DealResponse.model_validate(deal)


@router.patch("/{deal_id}/links", response_model=DealResponse)
async def patch_deal_links(
    deal_id: UUID,
    data: DealLinksUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Link strategic deal to CRM lead and/or sales deal. | ربط الصفقة بعميل محتمل أو صفقة مبيعات"""
    result = await db.execute(
        select(StrategicDeal).where(
            StrategicDeal.id == deal_id,
            StrategicDeal.tenant_id == current_user.tenant_id,
        )
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="الصفقة غير موجودة | Deal not found")
    if data.lead_id is not None:
        deal.lead_id = data.lead_id
    if data.sales_deal_id is not None:
        deal.sales_deal_id = data.sales_deal_id
    await db.flush()
    await db.refresh(deal)
    return DealResponse.model_validate(deal)


# ── Negotiation ──────────────────────────────────────────────────────────────


@router.put("/{deal_id}/negotiate")
async def negotiate_deal(
    deal_id: UUID,
    data: NegotiateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit terms, counter-offer, or free-text message. | تقديم شروط أو عرض مضاد"""
    result = await db.execute(
        select(StrategicDeal).where(
            StrategicDeal.id == deal_id,
            StrategicDeal.tenant_id == current_user.tenant_id,
        )
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="الصفقة غير موجودة | Deal not found")

    negotiator = DealNegotiator()

    # Check if we should escalate
    should_escalate = await negotiator.should_escalate(deal_id, db)
    if should_escalate:
        return {
            "status": "escalation_required",
            "message_ar": "هذه الصفقة تحتاج تدخل بشري. يرجى التواصل مع مدير الحساب.",
            "message_en": "This deal requires human intervention. Please contact the account manager.",
        }

    # Start new negotiation
    if data.strategy and not deal.negotiation_history:
        round_data = await negotiator.start_negotiation(deal_id, data.strategy, db)
        return {
            "status": "negotiation_started",
            "round": round_data.round_number,
            "action": round_data.action,
            "our_terms": round_data.our_terms,
            "message_ar": round_data.message_ar,
            "message_en": round_data.message_en,
            "confidence": round_data.confidence,
        }

    # Handle counter-offer
    if data.their_terms:
        round_data = await negotiator.handle_counter_offer(deal_id, data.their_terms, db)
        return {
            "status": "counter_processed",
            "round": round_data.round_number,
            "action": round_data.action,
            "our_terms": round_data.our_terms,
            "message_ar": round_data.message_ar,
            "message_en": round_data.message_en,
            "within_range": round_data.within_range,
            "confidence": round_data.confidence,
        }

    # Handle free-text message
    if data.message:
        response = await negotiator.generate_response(deal_id, data.message, db)
        return {
            "status": "response_generated",
            "response": response,
        }

    raise HTTPException(
        status_code=400,
        detail="يرجى تقديم شروط أو رسالة أو استراتيجية | Provide terms, message, or strategy",
    )


# ── Outreach ─────────────────────────────────────────────────────────────────


@router.post("/{deal_id}/outreach")
async def send_outreach(
    deal_id: UUID,
    data: OutreachRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send outreach via channel. | إرسال تواصل عبر قناة"""
    # Find the deal and verify ownership
    deal_result = await db.execute(
        select(StrategicDeal).where(
            StrategicDeal.id == deal_id,
            StrategicDeal.tenant_id == current_user.tenant_id,
        )
    )
    deal = deal_result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="الصفقة غير موجودة | Deal not found")

    # Find or create a match for this deal to run outreach
    match_result = await db.execute(
        select(DealMatch).where(
            DealMatch.company_a_id == deal.initiator_profile_id,
            DealMatch.tenant_id == current_user.tenant_id,
        ).order_by(DealMatch.match_score.desc()).limit(1)
    )
    match = match_result.scalar_one_or_none()

    if not match:
        # Create a placeholder match for outreach
        match = DealMatch(
            tenant_id=current_user.tenant_id,
            company_a_id=deal.initiator_profile_id,
            company_b_id=deal.target_profile_id,
            company_b_name=deal.target_company_name,
            match_score=deal.ai_confidence or 0.5,
            match_reasons=["تواصل مباشر من المستخدم"],
            deal_type_suggested=deal.deal_type,
            status=MatchStatus.APPROVED.value,
        )
        db.add(match)
        await db.flush()

    agent = DealAgent()
    result = await agent.run_outreach_campaign(match.id, data.channel, db)

    return {
        "status": "sent" if result.success else "failed",
        "channel": result.channel,
        "message_sent": result.message_sent,
        "next_action_ar": result.next_action_ar,
        "error": result.error,
    }


# ── Proposal & Term Sheet ───────────────────────────────────────────────────


@router.post("/{deal_id}/proposal")
async def generate_proposal(
    deal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate an Arabic business proposal. | إنشاء مقترح أعمال بالعربي"""
    result = await db.execute(
        select(StrategicDeal).where(
            StrategicDeal.id == deal_id,
            StrategicDeal.tenant_id == current_user.tenant_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="الصفقة غير موجودة | Deal not found")

    agent = DealAgent()
    proposal = await agent.generate_proposal(deal_id, db)
    return {"status": "ok", "proposal": proposal}


@router.post("/{deal_id}/term-sheet")
async def generate_term_sheet(
    deal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate an Arabic term sheet. | إنشاء ورقة شروط بالعربي"""
    result = await db.execute(
        select(StrategicDeal).where(
            StrategicDeal.id == deal_id,
            StrategicDeal.tenant_id == current_user.tenant_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="الصفقة غير موجودة | Deal not found")

    negotiator = DealNegotiator()
    term_sheet = await negotiator.generate_term_sheet(deal_id, db)
    return {"status": "ok", "term_sheet": term_sheet}


# ── Analytics ────────────────────────────────────────────────────────────────


@router.get("/analytics/overview")
async def deal_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Deal flow analytics: match rate, close rate, avg deal value. | تحليلات الصفقات"""
    tenant_id = current_user.tenant_id

    # Total deals
    total_q = select(func.count()).select_from(StrategicDeal).where(
        StrategicDeal.tenant_id == tenant_id,
    )
    total_deals = (await db.execute(total_q)).scalar() or 0

    # By status
    status_q = select(
        StrategicDeal.status, func.count()
    ).where(
        StrategicDeal.tenant_id == tenant_id,
    ).group_by(StrategicDeal.status)
    status_rows = (await db.execute(status_q)).all()
    by_status = {row[0]: row[1] for row in status_rows}

    won = by_status.get(DealStatus.CLOSED_WON.value, 0)
    lost = by_status.get(DealStatus.CLOSED_LOST.value, 0)
    closed = won + lost
    close_rate = (won / closed * 100) if closed > 0 else 0.0

    # Average deal value (closed won)
    avg_val_q = select(func.avg(StrategicDeal.estimated_value_sar)).where(
        StrategicDeal.tenant_id == tenant_id,
        StrategicDeal.status == DealStatus.CLOSED_WON.value,
    )
    avg_value = (await db.execute(avg_val_q)).scalar()
    avg_value_float = float(avg_value) if avg_value else 0.0

    # Total matches and conversion
    total_matches_q = select(func.count()).select_from(DealMatch).where(
        DealMatch.tenant_id == tenant_id,
    )
    total_matches = (await db.execute(total_matches_q)).scalar() or 0

    converted_q = select(func.count()).select_from(DealMatch).where(
        DealMatch.tenant_id == tenant_id,
        DealMatch.status == MatchStatus.CONVERTED.value,
    )
    converted_matches = (await db.execute(converted_q)).scalar() or 0
    match_rate = (converted_matches / total_matches * 100) if total_matches > 0 else 0.0

    # By deal type
    type_q = select(
        StrategicDeal.deal_type, func.count()
    ).where(
        StrategicDeal.tenant_id == tenant_id,
    ).group_by(StrategicDeal.deal_type)
    type_rows = (await db.execute(type_q)).all()
    by_type = {row[0]: row[1] for row in type_rows}

    return {
        "total_deals": total_deals,
        "by_status": by_status,
        "close_rate_percent": round(close_rate, 1),
        "avg_deal_value_sar": round(avg_value_float, 2),
        "total_matches": total_matches,
        "converted_matches": converted_matches,
        "match_conversion_rate_percent": round(match_rate, 1),
        "by_deal_type": by_type,
        "labels_ar": {
            "total_deals": "إجمالي الصفقات",
            "close_rate": "نسبة الإغلاق",
            "avg_value": "متوسط قيمة الصفقة",
            "match_rate": "نسبة تحول المطابقات",
        },
    }


# ── Barter Scan ──────────────────────────────────────────────────────────────


@router.post("/barter-scan")
async def barter_scan(
    data: BarterScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Find multi-party barter opportunities. | اكتشاف فرص المقايضة المتعددة"""
    result = await db.execute(
        select(CompanyProfile).where(
            CompanyProfile.id == data.profile_id,
            CompanyProfile.tenant_id == current_user.tenant_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="الملف غير موجود | Profile not found")

    matcher = DealMatcher()
    chains = await matcher.find_barter_chains(data.profile_id, db)

    return {
        "status": "ok",
        "chains_found": len(chains),
        "chains": chains,
        "summary_ar": (
            f"تم العثور على {len(chains)} سلسلة مقايضة محتملة"
            if chains
            else "لم يتم العثور على فرص مقايضة. حاول إضافة المزيد من القدرات والاحتياجات في ملفك."
        ),
    }
