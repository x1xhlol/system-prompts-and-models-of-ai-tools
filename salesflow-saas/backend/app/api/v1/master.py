"""
Dealix Master API — Full Power Endpoints
أقوى وأشمل API في مجال المبيعات السعودية
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Optional, List
import hashlib
import json
import logging
import os
from pathlib import Path

from app.api.deps import get_optional_user
from app.database import async_session, get_db
from app.models.user import User
from app.schemas.dealix_master import EnrichExplorationBody

logger = logging.getLogger("dealix.api.master")

router = APIRouter(prefix="/dealix", tags=["🏰 Dealix Master API"])

def _key():
    return os.getenv("GROQ_API_KEY", "")


# ── Lead Generation ───────────────────────────────────────────
@router.post("/generate-leads")
async def generate_leads(
    request: Request,
    sector: str = Query(default="تقنية المعلومات", description="القطاع"),
    city: str = Query(default="الرياض", description="المدينة"),
    count: int = Query(default=10, le=50),
    user: Optional[User] = Depends(get_optional_user),
):
    """🎯 توليد leads مؤهلة تلقائياً لأي قطاع وأي مدينة سعودية."""
    from app.services.intelligence_plane_control import audit_ai_decision, check_rate_limit, cache_get, cache_set
    from app.services.lead_generation import GoogleMapsLeadScraper
    from app.services.revenue_discovery_service import attach_generation_provenance

    client = request.client.host if request.client else "unknown"
    xf = request.headers.get("x-forwarded-for")
    tenant_id = str(user.tenant_id) if user else None
    ok, reason = check_rate_limit(client_ip=client, x_forwarded_for=xf, tenant_id=tenant_id)
    if not ok:
        raise HTTPException(status_code=429, detail=reason)

    cache_key = f"genleads:{sector}:{city}:{count}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    scraper = GoogleMapsLeadScraper()
    leads, sector_insights = await scraper.generate_leads_for_sector(sector, city, count)
    manifest = attach_generation_provenance(leads, sector, city)
    out = {
        "sector": sector,
        "city": city,
        "count": len(leads),
        "leads": leads,
        "sector_insights": sector_insights,
        "discovery_manifest": manifest,
    }
    cache_set(cache_key, out)
    audit_ai_decision(
        operation="generate_leads",
        tenant_id=tenant_id,
        user_id=str(user.id) if user else None,
        model_id="llama-3.3-70b-versatile",
        extra={"count": len(leads), "sector": sector},
    )
    return out


async def _run_enrich_job(
    job_id: str,
    body_dict: dict[str, Any],
    tenant_id: str | None,
    tid_for_tavily: str | None,
) -> None:
    from app.services.dealix_enrichment_runner import compute_enrich_exploration
    from app.services.intel_async_jobs import mark_done, mark_error, mark_running
    from app.services.intelligence_plane_control import audit_ai_decision

    mark_running(job_id)
    try:
        body = EnrichExplorationBody(**body_dict)
        async with async_session() as db:
            out = await compute_enrich_exploration(
                db, body, tenant_id=tenant_id, tid_for_tavily=tid_for_tavily
            )
        mark_done(job_id, out)
        audit_ai_decision(
            operation="enrich_exploration_async",
            tenant_id=tenant_id,
            user_id=None,
            model_id=out.get("model_id"),
            extra={"job_id": job_id, "playbook": out.get("vertical_playbook_id")},
        )
    except Exception:
        logger.exception("enrich job failed job_id=%s", job_id)
        mark_error(job_id, "enrichment_failed")


@router.post("/enrich-exploration")
async def enrich_exploration(
    request: Request,
    body: EnrichExplorationBody,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """Structured enrichment + provenance + vertical playbook linkage (optional Tavily)."""
    from app.services.dealix_enrichment_runner import compute_enrich_exploration
    from app.services.intelligence_plane_control import audit_ai_decision, check_rate_limit

    client = request.client.host if request.client else "unknown"
    xf = request.headers.get("x-forwarded-for")
    tenant_id = str(user.tenant_id) if user else None
    ok, reason = check_rate_limit(client_ip=client, x_forwarded_for=xf, tenant_id=tenant_id)
    if not ok:
        raise HTTPException(status_code=429, detail=reason)

    tid_for_tavily = tenant_id or request.headers.get("x-tenant-id")
    out = await compute_enrich_exploration(db, body, tenant_id=tenant_id, tid_for_tavily=tid_for_tavily)
    audit_ai_decision(
        operation="enrich_exploration",
        tenant_id=tenant_id,
        user_id=str(user.id) if user else None,
        model_id=out.get("model_id"),
        extra={"sector": body.sector, "playbook": out.get("vertical_playbook_id")},
    )
    return out


@router.post("/enrich-exploration/async")
async def enrich_exploration_async(
    request: Request,
    background_tasks: BackgroundTasks,
    body: EnrichExplorationBody,
    user: Optional[User] = Depends(get_optional_user),
):
    """Queue enrichment after HTTP response; poll GET .../jobs/{job_id}."""
    if os.getenv("DEALIX_ASYNC_ENRICH_JOBS", "true").lower() in ("0", "false", "no"):
        raise HTTPException(status_code=404, detail="async enrich jobs disabled")
    from app.services.intel_async_jobs import create_job
    from app.services.intelligence_plane_control import check_rate_limit

    client = request.client.host if request.client else "unknown"
    xf = request.headers.get("x-forwarded-for")
    tenant_id = str(user.tenant_id) if user else None
    ok, reason = check_rate_limit(client_ip=client, x_forwarded_for=xf, tenant_id=tenant_id)
    if not ok:
        raise HTTPException(status_code=429, detail=reason)

    tid_for_tavily = tenant_id or request.headers.get("x-tenant-id")
    job_id = create_job()
    background_tasks.add_task(
        _run_enrich_job,
        job_id,
        body.model_dump(),
        tenant_id,
        tid_for_tavily,
    )
    return {
        "job_id": job_id,
        "status": "pending",
        "poll": f"/api/v1/dealix/enrich-exploration/jobs/{job_id}",
    }


@router.get("/enrich-exploration/jobs/{job_id}")
async def enrich_exploration_job_status(job_id: str):
    from app.services.intel_async_jobs import get_job

    row = get_job(job_id)
    if not row:
        raise HTTPException(status_code=404, detail="job not found")
    return {"job_id": job_id, **row}


@router.get("/intelligence-flags")
async def intelligence_flags(request: Request, user: Optional[User] = Depends(get_optional_user)):
    """Feature flags + intel config for workspace (no secrets)."""
    from app.services.intelligence_plane_control import intelligence_feature_snapshot

    tid = str(user.tenant_id) if user else request.headers.get("x-tenant-id")
    return intelligence_feature_snapshot(tenant_id=tid)


_GOLDEN_PATH = Path(__file__).resolve().parents[2] / "data" / "ai_eval_golden.json"


@router.get("/ai-eval/golden")
async def ai_eval_golden():
    """Golden / rubric JSON for regression & human-in-the-loop QA (no execution)."""
    if not _GOLDEN_PATH.is_file():
        return {"version": 0, "note": "ai_eval_golden.json missing"}
    return json.loads(_GOLDEN_PATH.read_text(encoding="utf-8"))


class ChannelDraftRequest(BaseModel):
    company_name: str
    partnership_angle_ar: str = ""
    contact_name: str = "فريق العمليات"


@router.post("/channel-drafts")
async def governed_channel_drafts(body: ChannelDraftRequest):
    """
    مسودات قنوات للمراجعة البشرية — واتساب/إيميل قابلة للتعديل؛ لينكدإن: موافقة بشرية إلزامية.
    """
    cn = body.company_name.strip() or "الفريق"
    angle = (body.partnership_angle_ar or "استكشاف فرص تعاون في مجال عملكم").strip()
    return {
        "whatsapp_draft_ar": (
            f"السلام عليكم، معكم {body.contact_name} من Dealix. "
            f"نودّ استكشاف تعاون مع {cn} بخصوص: {angle}. هل يُناسبكم موعد قصير الأسبوع القادم؟"
        ),
        "email_subject_ar": f"Dealix — استكشاف شراكة محتملة مع {cn}",
        "email_body_ar": (
            f"السلام عليكم،\n\nنتواصل من Dealix لاستكشاف {angle} مع {cn}. "
            f"نرحّب بمشاركة المسؤول المناسب لديكم.\n\nمع الشكر،\n{body.contact_name}"
        ),
        "linkedin": {
            "human_in_loop_required": True,
            "policy_note_ar": (
                "لا يُرسل هذا النص تلقائياً عبر LinkedIn — يتطلب موافقة بشرية واستخدام واجهات رسمية أو استيراد يدوي وفق سياسة المنصة."
            ),
            "draft_ar": (
                f"تحية طيبة، أتابع عمل {cn} وأودّ ربط نقاش مختصر حول {angle}. "
                f"هل يمكن توجيهي للمسؤول المناسب؟"
            ),
        },
        "governance": {
            "pdpl_note_ar": "تأكد من وجود أساس قانوني للتواصل والموافقة حيث تنطبق PDPL.",
            "approval_recommended": True,
        },
    }


@router.post("/daily-leads")
async def get_daily_leads(target_count: int = Query(default=50, le=100)):
    """📋 الحصة اليومية من الـ leads — يولّدها النظام تلقائياً."""
    from app.services.lead_generation import DealixLeadGenerationHub
    hub = DealixLeadGenerationHub()
    return await hub.generate_daily_leads(target_count)


@router.get("/bulk-generate")
async def bulk_generate(background_tasks: BackgroundTasks):
    """⚡ توليد leads من جميع القطاعات والمدن السعودية في الخلفية."""
    from app.services.lead_generation import DealixLeadGenerationHub
    hub = DealixLeadGenerationHub()
    background_tasks.add_task(hub.generate_daily_leads, 100)
    return {"status": "generating", "message": "جاري توليد 100 lead من 5 قطاعات..."}


# ── Company Research ──────────────────────────────────────────
class CompanyInput(BaseModel):
    company_name: str
    website: Optional[str] = None
    extra_info: Optional[str] = ""


@router.post("/research-company")
async def research_company(company: CompanyInput):
    """🔍 تحليل عميق لأي شركة — SWOT + درجة ملاءمة + استراتيجية البيع."""
    from app.services.company_research import DeepCompanyAnalyzer
    analyzer = DeepCompanyAnalyzer(_key())
    return await analyzer.analyze(company.company_name, company.website, company.extra_info)


@router.post("/research-person")
async def research_decision_maker(name: str, company: str):
    """👤 تحليل شخصية المقرر ونفسيته وأفضل أسلوب للتعامل معه."""
    from app.services.lead_generation import LinkedInIntelligence
    li = LinkedInIntelligence()
    return await li.research_decision_maker(name, company)


@router.post("/compare-companies")
async def compare_companies(company_a: str, company_b: str):
    """⚖️ مقارنة شركتين وتحديد الأفضل للاستهداف."""
    from app.services.company_research import DeepCompanyAnalyzer
    analyzer = DeepCompanyAnalyzer(_key())
    return await analyzer.compare_companies(company_a, company_b)


# ── WhatsApp ──────────────────────────────────────────────────
class OutreachCampaign(BaseModel):
    leads: List[dict]
    message_template: str = "أهلاً {name}، أنا من ديليكس وأتمنى التحدث معك عن تطوير مبيعات {company}"


@router.post("/whatsapp/campaign")
async def run_whatsapp_campaign(campaign: OutreachCampaign, background_tasks: BackgroundTasks):
    """📱 حملة واتساب تلقائية لقائمة leads."""
    from app.services.whatsapp_service import WhatsAppService
    wa = WhatsAppService()
    background_tasks.add_task(wa.run_outreach_campaign, campaign.leads, campaign.message_template)
    return {"status": "campaign_started", "leads_count": len(campaign.leads)}


@router.post("/whatsapp/reply")
async def generate_whatsapp_reply(phone: str, message: str, customer_name: str = ""):
    """💬 رد واتساب ذكي ومخصص باللهجة السعودية."""
    from app.services.whatsapp_service import WhatsAppService
    wa = WhatsAppService()
    reply = await wa._generate_intelligent_reply(phone, message)
    return {"reply": reply, "phone": phone}


# ── Meeting Intelligence ──────────────────────────────────────
class MeetingPrepInput(BaseModel):
    company_name: str
    contact_name: str
    contact_title: Optional[str] = ""
    meeting_time: Optional[str] = ""
    company_website: Optional[str] = None


@router.post("/meeting/prepare")
async def prepare_meeting(meeting: MeetingPrepInput):
    """📊 حقيبة تحضير الاجتماع الكاملة — نقاط الحوار + الشرائح + الاستراتيجية."""
    from app.services.meeting_intelligence import MeetingPreparationService
    from app.services.company_research import DeepCompanyAnalyzer
    analyzer = DeepCompanyAnalyzer(_key())
    research = await analyzer.analyze(meeting.company_name, meeting.company_website)
    prep_service = MeetingPreparationService()
    return await prep_service.prepare_meeting_package({
        "company_name": meeting.company_name,
        "contact_name": meeting.contact_name,
        "contact_title": meeting.contact_title,
        "meeting_time": meeting.meeting_time,
        "company_research": research
    })


@router.get("/meeting/slots")
async def get_meeting_slots():
    """📅 المواعيد المتاحة للاجتماعات (Cal.com)."""
    from app.services.meeting_intelligence import CalComService
    cal = CalComService()
    return {"slots": await cal.get_available_slots()}


# ── ZATCA Compliance ──────────────────────────────────────────
class DealForCompliance(BaseModel):
    id: Optional[str] = None
    amount: float
    company_name: str
    service_description: str = "خدمات ذكاء اصطناعي للمبيعات"
    buyer_vat: Optional[str] = ""
    buyer_cr: Optional[str] = ""
    city: Optional[str] = "الرياض"
    generate_invoice: bool = True


@router.post("/compliance/check")
async def check_compliance(deal: DealForCompliance):
    """⚖️ فحص امتثال كامل (ZATCA + عقاري + AML) لأي صفقة."""
    from app.services.zatca_compliance import DealixComplianceOrchestrator
    import asyncio
    orchestrator = DealixComplianceOrchestrator()
    return await orchestrator.full_compliance_check(deal.model_dump())


@router.post("/compliance/invoice")
async def generate_zatca_invoice(deal: DealForCompliance):
    """🧾 فاتورة ZATCA Phase 2 متوافقة — جاهزة للتقديم."""
    from app.services.zatca_compliance import ZATCAInvoiceEngine
    engine = ZATCAInvoiceEngine()
    return engine.generate_invoice(deal.model_dump())


@router.get("/compliance/validate-vat/{vat_number}")
async def validate_vat(vat_number: str):
    """✅ التحقق من صحة الرقم الضريبي السعودي."""
    from app.services.zatca_compliance import ZATCAInvoiceEngine
    engine = ZATCAInvoiceEngine()
    return engine.validate_vat_number(vat_number)


# ── Full Power Endpoint ───────────────────────────────────────
class MegaRequest(BaseModel):
    company_name: str
    contact_name: str
    contact_phone: str
    contact_title: Optional[str] = ""
    website: Optional[str] = None

@router.post("/full-power")
async def full_power_pipeline(req: MegaRequest):
    """
    🏰 FULL POWER — كل شيء في طلب واحد:
    Company Research + Qualification + WhatsApp Message
    + Meeting Prep + Compliance Check + Executive Strategy
    """
    from app.services.company_research import DeepCompanyAnalyzer
    from app.services.lead_pipeline import DealixLeadPipeline, Lead, Company
    from app.services.meeting_intelligence import MeetingPreparationService
    import asyncio

    # 1. Deep research
    analyzer = DeepCompanyAnalyzer(_key())
    research = await analyzer.analyze(req.company_name, req.website)

    # 2. Full pipeline
    pipeline = DealixLeadPipeline(_key())
    from app.services.lead_pipeline import Lead, Company
    lead = Lead(
        id=f"fp_{req.contact_phone}",
        contact_name=req.contact_name,
        contact_phone=req.contact_phone,
        contact_title=req.contact_title,
        company=Company(name=req.company_name, website=req.website)
    )
    pipeline_result = await pipeline.run_full_pipeline(lead)

    # 3. Meeting prep
    prep = MeetingPreparationService()
    meeting_prep = await prep.prepare_meeting_package({
        "company_name": req.company_name,
        "contact_name": req.contact_name,
        "contact_title": req.contact_title,
        "company_research": research
    })

    return {
        "status": "FULL_POWER_COMPLETE",
        "company": req.company_name,
        "research": research,
        "pipeline": pipeline_result,
        "meeting_preparation": meeting_prep,
        "generated_at": __import__('datetime').datetime.utcnow().isoformat()
    }
