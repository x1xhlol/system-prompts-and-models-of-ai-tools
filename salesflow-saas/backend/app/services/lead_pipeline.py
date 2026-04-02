"""
Dealix End-to-End Lead-to-Meeting Pipeline
==========================================
الهدف النهائي: تحويل كل عميل محتمل إلى اجتماع محجوز
مع تقرير تنفيذي كامل عن الشركة قبل وبعد الاجتماع.

Pipeline:
1. Lead Capture (WhatsApp/Web/LinkedIn)
2. Company Research (AI web scraping)
3. Lead Qualification (AI scoring)
4. Personalized Outreach (Arabic WhatsApp)
5. Meeting Booking (Cal.com integration)
6. Pre-Meeting Presentation (auto-generated)
7. Sales Team Notification
8. Post-Meeting Executive Report
"""
import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass

from groq import AsyncGroq


@dataclass
class Company:
    name: str
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    revenue: Optional[str] = None
    pain_points: Optional[list] = None
    opportunities: Optional[list] = None


@dataclass
class Lead:
    id: str
    contact_name: str
    contact_phone: str
    contact_title: Optional[str] = None
    company: Optional[Company] = None
    source: str = "whatsapp"
    score: Optional[float] = None
    stage: str = "new"
    conversation_history: list = None

    def __post_init__(self):
        if self.conversation_history is None:
            self.conversation_history = []


class CompanyResearcher:
    """AI-powered company research using available tools."""

    def __init__(self, groq_client: AsyncGroq):
        self.client = groq_client

    async def research_company(self, company_name: str, website: str = None) -> dict:
        """Deep research on a company to prepare for sales approach."""

        prompt = f"""أنت باحث تجاري متخصص في السوق السعودي.

ابحث وحلّل الشركة التالية:
- الاسم: {company_name}
- الموقع: {website or 'غير معروف'}

قدّم تحليلاً شاملاً بصيغة JSON:
{{
  "company_profile": {{
    "industry": "القطاع",
    "size": "حجم الشركة (SMB/Enterprise/Startup)",
    "estimated_revenue": "الإيرادات التقديرية",
    "employees_count": "عدد الموظفين التقديري",
    "market_position": "موقعها في السوق",
    "founded": "تاريخ التأسيس التقريبي"
  }},
  "business_challenges": [
    "تحدي 1 محتمل",
    "تحدي 2 محتمل"
  ],
  "sales_opportunities": [
    {{
      "opportunity": "فرصة البيع",
      "rationale": "السبب",
      "dealix_solution": "كيف تحل ديليكس هذا"
    }}
  ],
  "decision_makers": [
    {{
      "role": "المنصب المحتمل للمقرر",
      "how_to_approach": "أسلوب التعامل معه"
    }}
  ],
  "saudi_market_context": "سياق السوق السعودي لهذه الشركة",
  "recommended_pitch": "أفضل زاوية للتقديم لهذه الشركة",
  "risk_factors": ["خطر 1", "خطر 2"],
  "overall_score": 85
}}"""

        response = await self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )

        try:
            return json.loads(response.choices[0].message.content)
        except Exception:
            return {"company_name": company_name, "error": "Research failed"}


class LeadQualifier:
    """AI lead qualification with Saudi market scoring."""

    def __init__(self, groq_client: AsyncGroq):
        self.client = groq_client

    async def qualify(self, lead: Lead, company_research: dict) -> dict:
        prompt = f"""أنت خبير تأهيل عملاء في السوق العقاري السعودي لديليكس.

بيانات العميل:
- الاسم: {lead.contact_name}
- المسمى: {lead.contact_title or 'غير محدد'}
- الشركة: {lead.company.name if lead.company else 'غير محدد'}
- المصدر: {lead.source}

بحث الشركة:
{json.dumps(company_research, ensure_ascii=False, indent=2)}

قيّم هذا العميل وأعطني:
{{
  "score": 0-100,
  "qualification": "hot/warm/cold",
  "budget_likelihood": "high/medium/low",
  "decision_power": "high/medium/low",
  "urgency": "high/medium/low",
  "best_contact_time": "أفضل وقت للتواصل",
  "recommended_approach": "الأسلوب المقترح",
  "talking_points": ["نقطة 1", "نقطة 2", "نقطة 3"],
  "red_flags": ["أي علامات تحذيرية"],
  "next_action": "الإجراء التالي الموصى به"
}}"""

        response = await self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)


class WhatsAppOutreach:
    """Personalized Arabic WhatsApp message generation."""

    def __init__(self, groq_client: AsyncGroq):
        self.client = groq_client

    async def generate_opening_message(self, lead: Lead, qualification: dict, company_research: dict) -> str:
        prompt = f"""أنت مسوق محترف من ديليكس للذكاء الاصطناعي في المبيعات.

اكتب رسالة واتساب افتتاحية لـ:
- الاسم: {lead.contact_name}
- الشركة: {lead.company.name if lead.company else ''}
- النقاط المهمة: {', '.join(qualification.get('talking_points', [])[:2])}
- الفرصة: {company_research.get('recommended_pitch', '')}

القواعد:
- باللهجة السعودية الخليجية الراقية
- لا تذكر ديليكس مباشرة في الرسالة الأولى
- ابدأ بالترحيب واستفسر عن وضع مبيعاتهم
- الرسالة قصيرة (3-4 أسطر)
- أضف emoji واحد بس مناسب
- لا تبدو كنص مكرر

أعطني الرسالة فقط بدون أي شرح."""

        response = await self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200
        )
        return response.choices[0].message.content.strip()

    async def generate_followup_message(self, lead: Lead, previous_reply: str, stage: str) -> str:
        prompt = f"""أنت مسوق ديليكس. رد العميل كان:
"{previous_reply}"

المرحلة الحالية: {stage}
اسم العميل: {lead.contact_name}

اكتب رد ذكي يدفع نحو حجز اجتماع.
- سعودي راقي
- قصير 2-3 أسطر
- اذكر فائدة محددة لشركتهم
- الهدف: حجز موعد"""

        response = await self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=150
        )
        return response.choices[0].message.content.strip()

    async def generate_meeting_invite(self, lead: Lead, calendar_link: str) -> str:
        prompt = f"""اكتب رسالة واتساب تدعو {lead.contact_name} من {lead.company.name if lead.company else 'شركته'} لحجز اجتماع.

الرابط: {calendar_link}

- سعودي محترم
- اذكر أن الاجتماع 20 دقيقة فقط
- وضح القيمة المباشرة للاجتماع
- الرابط في نهاية الرسالة
- 3-4 أسطر"""

        response = await self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=200
        )
        return response.choices[0].message.content.strip()


class PresentationGenerator:
    """Auto-generate presentations for planned meetings."""

    def __init__(self, groq_client: AsyncGroq):
        self.client = groq_client

    async def generate_pre_meeting_presentation(self, lead: Lead, company_research: dict) -> dict:
        """Generate a full presentation tailored to the client company."""

        prompt = f"""أنت خبير مبيعات في ديليكس. اصنع عرضاً تقديمياً لاجتماع مع:

الشركة: {lead.company.name if lead.company else 'الشركة'}
جهة الاتصال: {lead.contact_name} - {lead.contact_title or ''}
تحديات الشركة: {json.dumps(company_research.get('business_challenges', []), ensure_ascii=False)}
فرص ديليكس: {json.dumps(company_research.get('sales_opportunities', []), ensure_ascii=False)}

ابنِ عرضاً تقديمياً متكاملاً بـ JSON:
{{
  "title": "عنوان العرض",
  "slides": [
    {{
      "slide_number": 1,
      "title": "الافتتاحية",
      "content": ["نقطة 1", "نقطة 2"],
      "speaker_notes": "ملاحظات المقدم"
    }},
    {{
      "slide_number": 2,
      "title": "تحديات سمعناها في سوقكم",
      "content": ["تحدي مخصص لهم"],
      "speaker_notes": "..."
    }},
    {{
      "slide_number": 3,
      "title": "كيف تحل ديليكس هذا",
      "content": ["حل 1", "حل 2"],
      "speaker_notes": "..."
    }},
    {{
      "slide_number": 4,
      "title": "نتائج حقيقية من السوق السعودي",
      "content": ["ROI نموذجي", "توفير في الوقت"],
      "speaker_notes": "..."
    }},
    {{
      "slide_number": 5,
      "title": "الخطوات التالية",
      "content": ["تجربة مجانية 14 يوم", "إعداد خلال 48 ساعة"],
      "speaker_notes": "..."
    }}
  ],
  "key_message": "الرسالة الرئيسية",
  "expected_objections": [
    {{"objection": "اعتراض", "response": "رد"}}
  ],
  "closing_strategy": "استراتيجية الإغلاق المقترحة"
}}"""

        response = await self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)


class ExecutiveReportGenerator:
    """Generate executive reports after meetings."""

    def __init__(self, groq_client: AsyncGroq):
        self.client = groq_client

    async def generate_post_meeting_report(
        self,
        lead: Lead,
        company_research: dict,
        meeting_notes: str,
        outcome: str
    ) -> dict:
        """Generate comprehensive executive report after meeting."""

        prompt = f"""أنت مدير مبيعات تنفيذي. اكتب تقريراً تنفيذياً شاملاً عن الاجتماع:

الشركة: {lead.company.name if lead.company else ''}
جهة الاتصال: {lead.contact_name} - {lead.contact_title or ''}
ملاحظات الاجتماع: {meeting_notes}
النتيجة: {outcome}
بحث الشركة: {json.dumps(company_research, ensure_ascii=False)[:1000]}

قدّم تقريراً تنفيذياً:
{{
  "executive_summary": "ملخص تنفيذي في 3 جمل",
  "meeting_outcome": "hot_lead/warm_lead/not_interested/follow_up_needed",
  "company_analysis": {{
    "strengths": ["نقطة قوة"],
    "pain_points_confirmed": ["تحدي أكده الاجتماع"],
    "budget_indication": "high/medium/low",
    "decision_timeline": "الجدول الزمني للقرار"
  }},
  "what_happened": "ما الذي حدث بالاجتماع بالتفصيل",
  "client_sentiment": "positive/neutral/negative",
  "key_insights": ["رؤية 1", "رؤية 2"],
  "agreed_next_steps": ["خطوة متفق عليها"],
  "recommended_actions": [
    {{
      "action": "الإجراء",
      "timeline": "الجدول الزمني",
      "owner": "المسؤول"
    }}
  ],
  "deal_probability": 75,
  "estimated_deal_value": "قيمة الصفقة التقديرية بالريال",
  "follow_up_message": "رسالة متابعة مقترحة للإرسال",
  "sales_coaching_notes": "ملاحظات للفريق لتحسين النهج"
}}"""

        response = await self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2500,
            response_format={"type": "json_object"}
        )

        report = json.loads(response.choices[0].message.content)
        report["generated_at"] = datetime.utcnow().isoformat()
        report["lead_id"] = lead.id
        report["company_name"] = lead.company.name if lead.company else ""
        return report


class MeetingBookingService:
    """Meeting booking with Cal.com integration."""

    def __init__(self):
        self.cal_api_key = os.getenv("CAL_COM_API_KEY", "")
        self.cal_event_type_id = os.getenv("CAL_COM_EVENT_TYPE_ID", "")
        self.booking_link = os.getenv("CAL_COM_BOOKING_LINK", "https://cal.com/dealix/demo")

    def get_booking_link(self, lead: Lead) -> str:
        """Generate a personalized booking link."""
        base_link = self.booking_link
        params = f"?name={lead.contact_name}&email=&notes=Lead+from+{lead.source}"
        return f"{base_link}{params}"

    async def notify_sales_team(self, lead: Lead, meeting_time: str, company_research: dict):
        """Send notification to sales team about booked meeting."""
        # In production: send via WhatsApp/Slack/Email
        notification = {
            "type": "meeting_booked",
            "alert": "🚨 اجتماع جديد محجوز!",
            "lead_name": lead.contact_name,
            "company": lead.company.name if lead.company else "",
            "meeting_time": meeting_time,
            "lead_score": lead.score,
            "key_insight": company_research.get("recommended_pitch", ""),
            "preparation_link": f"http://localhost:3000/meetings/{lead.id}"
        }
        return notification


class DealixLeadPipeline:
    """
    The complete end-to-end Dealix Lead-to-Meeting Pipeline.
    Inspired by Clay + Manus AI concepts.
    """

    def __init__(self, groq_api_key: str):
        self.client = AsyncGroq(api_key=groq_api_key)
        self.researcher = CompanyResearcher(self.client)
        self.qualifier = LeadQualifier(self.client)
        self.outreach = WhatsAppOutreach(self.client)
        self.presenter = PresentationGenerator(self.client)
        self.reporter = ExecutiveReportGenerator(self.client)
        self.meeting_service = MeetingBookingService()

    async def run_full_pipeline(self, lead: Lead) -> dict:
        """
        Run the complete pipeline from lead to meeting-ready package.

        Returns everything the sales team needs:
        1. Company research
        2. Qualification score
        3. WhatsApp opening message
        4. Meeting booking link
        5. Pre-meeting presentation
        """
        results = {"lead_id": lead.id, "pipeline_started_at": datetime.utcnow().isoformat()}

        # ── Stage 1: Company Research ────────────────────────
        print(f"🔍 [1/5] Researching {lead.company.name if lead.company else 'company'}...")
        company_research = await self.researcher.research_company(
            lead.company.name if lead.company else lead.contact_name,
            lead.company.website if lead.company else None
        )
        results["company_research"] = company_research

        # ── Stage 2: Lead Qualification ──────────────────────
        print(f"⚡ [2/5] Qualifying lead...")
        qualification = await self.qualifier.qualify(lead, company_research)
        lead.score = qualification.get("score", 0)
        results["qualification"] = qualification

        # ── Stage 3: Generate Opening WhatsApp Message ───────
        print(f"💬 [3/5] Crafting WhatsApp message...")
        opening_message = await self.outreach.generate_opening_message(
            lead, qualification, company_research
        )
        booking_link = self.meeting_service.get_booking_link(lead)
        meeting_invite = await self.outreach.generate_meeting_invite(lead, booking_link)

        results["outreach"] = {
            "opening_message": opening_message,
            "meeting_invite_message": meeting_invite,
            "booking_link": booking_link
        }

        # ── Stage 4: Pre-Meeting Presentation ────────────────
        if qualification.get("score", 0) >= 60:
            print(f"📊 [4/5] Generating presentation...")
            presentation = await self.presenter.generate_pre_meeting_presentation(
                lead, company_research
            )
            results["presentation"] = presentation
        else:
            results["presentation"] = None

        # ── Stage 5: Sales Team Package ──────────────────────
        print(f"📬 [5/5] Preparing sales team notification...")
        notification = await self.meeting_service.notify_sales_team(
            lead,
            meeting_time="TBD (awaiting booking)",
            company_research=company_research
        )
        results["sales_notification"] = notification
        results["pipeline_completed_at"] = datetime.utcnow().isoformat()
        results["status"] = "ready_for_outreach"

        print(f"✅ Pipeline complete! Lead score: {lead.score}")
        return results

    async def generate_executive_report(
        self,
        lead: Lead,
        meeting_notes: str,
        outcome: str = "follow_up_needed"
    ) -> dict:
        """Generate post-meeting executive report."""
        company_research = await self.researcher.research_company(
            lead.company.name if lead.company else lead.contact_name
        )
        return await self.reporter.generate_post_meeting_report(
            lead, company_research, meeting_notes, outcome
        )
