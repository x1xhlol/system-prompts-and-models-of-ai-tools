"""
Dealix Master API — Full Power Endpoints
أقوى وأشمل API في مجال المبيعات السعودية
"""
from fastapi import APIRouter, BackgroundTasks, Query
from pydantic import BaseModel
from typing import Optional, List
import os

router = APIRouter(prefix="/dealix", tags=["🏰 Dealix Master API"])

def _key():
    return os.getenv("GROQ_API_KEY", "")


# ── Lead Generation ───────────────────────────────────────────
@router.post("/generate-leads")
async def generate_leads(
    sector: str = Query(default="تقنية المعلومات", description="القطاع"),
    city: str = Query(default="الرياض", description="المدينة"),
    count: int = Query(default=10, le=50)
):
    """🎯 توليد leads مؤهلة تلقائياً لأي قطاع وأي مدينة سعودية."""
    from app.services.lead_generation import GoogleMapsLeadScraper
    scraper = GoogleMapsLeadScraper()
    leads = await scraper.generate_leads_for_sector(sector, city, count)
    return {"sector": sector, "city": city, "count": len(leads), "leads": leads}


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
