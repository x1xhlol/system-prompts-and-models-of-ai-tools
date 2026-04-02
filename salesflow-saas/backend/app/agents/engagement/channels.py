"""
Layer 4: WhatsApp Agent (Standalone) + LinkedIn Agent
======================================================
Dedicated channel agents for the agent system.
"""
import json
import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, List
import httpx
from app.agents.base_agent import BaseAgent, AgentPriority

logger = logging.getLogger("dealix.agents.channels")


# ══════════════════════════════════════════════════════
# WhatsApp Agent — The Primary Sales Channel
# ══════════════════════════════════════════════════════

class WhatsAppSalesAgent(BaseAgent):
    """
    📱 WhatsApp Sales Agent — الذراع الأقوى لـ Dealix.
    يدير كل شيء عبر واتساب: حملات، ردود، متابعات، براودكاست.
    """

    MESSAGE_TEMPLATES = {
        "cold_intro_clinic": "السلام عليكم 👋\n\nمرحباً، أنا م. سامي من Dealix.\n\nلاحظت {clinic_name} من أفضل العيادات في {city} (تقييم {rating}⭐).\n\nعندنا نظام ذكاء اصطناعي يكتشف لكم مرضى جدد ويتواصل معهم تلقائياً — شركات مشابهة زادت مواعيدها 40%.\n\n15 دقيقة عرض سريع، يناسبكم؟",
        "cold_intro_realestate": "السلام عليكم 👋\n\nم. سامي — Dealix\n\nشركتكم {company_name} من أقوى شركات التطوير العقاري في {city}.\n\nنظامنا يكتشف مشترين محتملين ويتواصل معهم عبر واتساب تلقائياً — بدون تدخل.\n\nعقاريين استخدموا النظام باعوا 3x وحدات إضافية.\n\nمهتمين نعرض لكم كيف؟",
        "cold_intro_general": "السلام عليكم 👋\n\nأنا م. سامي، المؤسس والرئيس التنفيذي لـ Dealix.\n\nلاحظت {company_name} شركة مميزة في {city}.\n\nعندنا نظام AI يكتشف عملاء جدد ويتواصل معهم ويتابعهم تلقائياً — بدون أي تدخل بشري.\n\nشركات مشابهة حققت زيادة 40% في المبيعات.\n\nيناسبكم 10 دقائق لعرض سريع؟ 🚀",
        "followup_1": "مرحباً {name} 👋\n\nتابع لرسالتي السابقة — هل قدرتوا تطّلعون على Dealix؟\n\nأقدر أرسل لكم فيديو قصير (دقيقتين) يوضح كيف يشتغل النظام.\n\nوش رأيكم؟",
        "followup_2": "مرحباً {name}\n\nأبي أتأكد إن رسالتي وصلتكم.\n\nلو مو الوقت المناسب، أفهم تماماً. بس حبيت أشارككم إن عندنا عرض تجريبي مجاني 14 يوم.\n\nرد بـ 'مهتم' وأرسل لك التفاصيل 🙌",
        "hot_response": "ممتاز {name}! 🎉\n\nسعيد بالاهتمام. خلني أحجز لكم عرض مباشر:\n\n📅 متى يناسبكم؟\n• اليوم الساعة {time1}\n• بكرة الساعة {time2}\n• وقت ثاني تاختارونه\n\nالعرض 15 دقيقة فقط عبر Google Meet.",
        "proposal_sent": "مرحباً {name} 👋\n\nتم إرسال العرض التجاري لكم. يشمل:\n\n✅ الباقة المناسبة لحجم شركتكم\n✅ ROI المتوقع (تقدير)\n✅ ضمان النتائج خلال 30 يوم\n\nأي سؤال أنا موجود. متى نبدأ؟ 🚀",
        "voice_note_script": "مرحبا {name}، أنا سامي من ديليكس. حبيت أتواصل معاك شخصياً. نظامنا يكتشف لك عملاء جدد ويتواصل معاهم أوتوماتيك. شركات زيكم زادت مبيعاتها أربعين بالمية. لو مهتم رد علي وأرسل لك فيديو قصير يوضح الموضوع. شكراً.",
    }

    def __init__(self):
        super().__init__(
            name="whatsapp_agent", name_ar="وكيل واتساب للمبيعات", layer=4,
            description="إدارة كل اتصالات واتساب: حملات، ردود ذكية، متابعات، broadcast"
        )
        self.instance_id = os.getenv("ULTRAMSG_INSTANCE", "")
        self.token = os.getenv("ULTRAMSG_TOKEN", "")
        self.sent_count = 0
        self.reply_count = 0

    def get_capabilities(self) -> List[str]:
        return [
            "إرسال رسائل مخصصة لكل عميل", "قوالب جاهزة (6+ قالب لكل قطاع)",
            "رسائل صوتية AI", "ردود فورية ذكية", "متابعات مجدولة",
            "Broadcast لمجموعات", "إرسال صور وملفات PDF",
            "تتبع حالة التسليم والقراءة", "تقرير أداء الحملات",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "send")
        if action == "send":
            return await self._send_message(task.get("phone", ""), task.get("message", ""), task.get("lead", {}))
        elif action == "send_campaign":
            return await self._send_campaign(task.get("leads", []), task.get("template", "cold_intro_general"))
        elif action == "generate_message":
            return await self._generate_personalized(task.get("lead", {}), task.get("template", "cold_intro_general"))
        elif action == "process_reply":
            return await self._process_reply(task.get("message", ""), task.get("from_phone", ""), task.get("lead", {}))
        elif action == "run_followups":
            return await self._process_followups()
        elif action == "stats":
            return {"sent": self.sent_count, "replies": self.reply_count, "rate": f"{self.reply_count / max(self.sent_count, 1) * 100:.1f}%"}
        return {"error": f"Unknown action: {action}"}

    async def _send_message(self, phone: str, message: str, lead: Dict = None) -> Dict:
        if not self.instance_id or not self.token:
            logger.info(f"📱 [DRY RUN] WhatsApp → {phone}: {message[:80]}...")
            self.sent_count += 1
            return {"status": "dry_run", "phone": phone}
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"https://api.ultramsg.com/{self.instance_id}/messages/chat",
                    data={"token": self.token, "to": phone, "body": message}
                )
                self.sent_count += 1
                return {"status": "sent", "result": resp.json()}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def _send_campaign(self, leads: List[Dict], template: str) -> Dict:
        results = {"sent": 0, "failed": 0, "skipped": 0}
        for lead in leads:
            phone = lead.get("phone", "")
            if not phone:
                results["skipped"] += 1
                continue
            msg = await self._generate_personalized(lead, template)
            result = await self._send_message(phone, msg.get("message", ""), lead)
            if result.get("status") in ["sent", "dry_run"]:
                results["sent"] += 1
            else:
                results["failed"] += 1
            import asyncio
            await asyncio.sleep(3)
        return results

    async def _generate_personalized(self, lead: Dict, template: str = "cold_intro_general") -> Dict:
        base = self.MESSAGE_TEMPLATES.get(template, self.MESSAGE_TEMPLATES["cold_intro_general"])
        try:
            message = base.format(
                company_name=lead.get("name", lead.get("company", "")),
                clinic_name=lead.get("name", ""),
                name=lead.get("contact_name", lead.get("name", "")),
                city=lead.get("city", ""),
                rating=lead.get("rating", "4.5"),
                time1="4:00 مساءً", time2="10:00 صباحاً",
            )
        except KeyError:
            message = base
        return {"message": message, "template": template}

    async def _process_reply(self, message: str, from_phone: str, lead: Dict) -> Dict:
        self.reply_count += 1
        # Detect intent and respond
        self.send_message("intent_detector", "detect", {"message": message, "context": lead}, AgentPriority.HIGH)
        
        response = await self.think(f"""رد على هذا العميل السعودي بأسلوب CEO مباشر ومحترف:
رسالة العميل: "{message}"
بيانات العميل: {lead.get('name', '')} — {lead.get('sector', '')}
اكتب رد قصير (2-3 جمل) بالعربي السعودي العامي.""", task_type="reply_generation")
        
        return {"response": response, "intent_sent": True}

    async def _process_followups(self) -> Dict:
        return {"processed": 0, "message": "Follow-up processing delegated to scheduler"}


# ══════════════════════════════════════════════════════
# LinkedIn Agent — Professional B2B Outreach
# ══════════════════════════════════════════════════════

class LinkedInAgent(BaseAgent):
    """🔗 LinkedIn Agent — تواصل احترافي B2B."""

    def __init__(self):
        super().__init__(
            name="linkedin_agent", name_ar="وكيل لنكدإن", layer=4,
            description="تواصل احترافي عبر LinkedIn مع صنّاع القرار"
        )

    def get_capabilities(self) -> List[str]:
        return [
            "إرسال Connection Requests مخصصة", "رسائل InMail بـ AI personalization",
            "زيارة بروفايلات تلقائياً", "تتبع القبول والرد",
            "مزامنة مع CRM", "اكتشاف صنّاع القرار",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "generate_message")
        if action == "generate_message":
            return await self._generate_linkedin_message(task.get("lead", {}))
        elif action == "find_decision_makers":
            return await self._find_decision_makers(task.get("company", ""))
        elif action == "connection_request":
            return await self._generate_connection_note(task.get("lead", {}))
        return {"status": "linkedin_ready", "note": "LinkedIn API integration pending"}

    async def _generate_linkedin_message(self, lead: Dict) -> Dict:
        message = await self.think(f"""اكتب رسالة LinkedIn InMail احترافية لهذا الشخص:
الاسم: {lead.get('name', '')}
المنصب: {lead.get('title', 'CEO')}
الشركة: {lead.get('company', '')}
القطاع: {lead.get('sector', '')}

اكتب بالإنجليزي (LinkedIn عادة إنجليزي). مختصر ومقنع. 3-4 جمل.""", task_type="linkedin_writing")
        return {"message": message, "type": "inmail"}

    async def _find_decision_makers(self, company: str) -> Dict:
        return await self.think_json(f"""ابحث عن صنّاع القرار في: {company}
{{"decision_makers": [{{"name": "...", "title": "...", "linkedin_url": "", "relevance": "high/medium"}}]}}""",
            task_type="linkedin_research")

    async def _generate_connection_note(self, lead: Dict) -> Dict:
        note = await self.think(f"""اكتب Connection Request note (300 حرف كحد أقصى) لـ:
{lead.get('name', '')} — {lead.get('title', '')} at {lead.get('company', '')}
Note must be in English, short, professional, and mention AI sales.""", task_type="linkedin_writing")
        return {"note": note[:300], "type": "connection_request"}


# ══════════════════════════════════════════════════════
# Revenue Intelligence Agent — Deep Revenue Analysis
# ══════════════════════════════════════════════════════

class RevenueIntelAgent(BaseAgent):
    """📈 Revenue Intelligence — تحليل الإيرادات العميق مثل Clari."""

    def __init__(self):
        super().__init__(
            name="revenue_intel", name_ar="وكيل ذكاء الإيرادات", layer=6,
            description="تحليل عميق للإيرادات وصحة Pipeline وتوقعات الأداء"
        )

    def get_capabilities(self) -> List[str]:
        return [
            "توقع الإيرادات بدقة 85%+", "تحليل صحة Pipeline",
            "كشف الصفقات المعرضة للخطر", "حساب MRR/ARR",
            "تحليل sales velocity", "مقارنة بأداء الصناعة",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "analyze")
        if action == "pipeline_intelligence":
            return await self._pipeline_intelligence(task.get("deals", []))
        elif action == "mrr_analysis":
            return await self._mrr_analysis(task.get("subscriptions", []))
        elif action == "win_loss_analysis":
            return await self._win_loss_analysis(task.get("deals", []))
        return await self._pipeline_intelligence(task.get("deals", []))

    async def _pipeline_intelligence(self, deals: List[Dict]) -> Dict:
        return await self.think_json(f"""حلل ذكاء الإيرادات لهذه الصفقات:
عدد: {len(deals)}
بيانات: {json.dumps(deals[:5], ensure_ascii=False, default=str)}
{{"total_pipeline_sar": 0, "weighted_pipeline_sar": 0, "expected_close_this_month": 0,
"at_risk_value_sar": 0, "healthy_deals": 0, "stalled_deals": 0,
"avg_deal_size_sar": 0, "avg_sales_cycle_days": 0, "win_rate_percent": 0,
"recommendations": ["..."]}}""", task_type="revenue_intelligence")

    async def _mrr_analysis(self, subscriptions: List[Dict]) -> Dict:
        return await self.think_json(f"""حلل MRR/ARR:
الاشتراكات: {json.dumps(subscriptions[:10], ensure_ascii=False, default=str)}
{{"mrr_sar": 0, "arr_sar": 0, "mrr_growth_percent": 0, "churn_rate_percent": 0,
"net_revenue_retention_percent": 0, "ltv_sar": 0, "cac_sar": 0,
"ltv_cac_ratio": 0, "months_to_recover_cac": 0}}""", task_type="mrr_analysis")

    async def _win_loss_analysis(self, deals: List[Dict]) -> Dict:
        return await self.think_json(f"""حلل أسباب الفوز والخسارة:
{json.dumps(deals[:10], ensure_ascii=False, default=str)}
{{"win_reasons": [{{"reason": "...", "frequency": 0}}], "loss_reasons": [{{"reason": "...", "frequency": 0}}],
"competitive_losses": 0, "price_losses": 0, "timing_losses": 0,
"actionable_insights": ["..."]}}""", task_type="win_loss")


# ══════════════════════════════════════════════════════
# Onboarding Agent — New Customer Setup
# ══════════════════════════════════════════════════════

class OnboardingAgent(BaseAgent):
    """🎓 Onboarding Agent — يُعِدّ العملاء الجدد للنجاح."""

    def __init__(self):
        super().__init__(
            name="onboarding_agent", name_ar="وكيل التأهيل والتدريب", layer=1,
            description="إعداد العملاء الجدد وتدريبهم على النظام لضمان النجاح والاستمرار"
        )

    def get_capabilities(self) -> List[str]:
        return [
            "إعداد حساب العميل الجديد تلقائياً",
            "تخصيص النظام حسب القطاع والحجم",
            "جولة تعليمية تفاعلية",
            "فيديوهات تدريبية مخصصة",
            "متابعة تفعيل الميزات",
            "قياس نجاح التأهيل (time-to-value)",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "setup")
        if action == "setup":
            return await self._setup_new_client(task.get("client", {}))
        elif action == "generate_welcome":
            return await self._generate_welcome_sequence(task.get("client", {}))
        elif action == "health_check":
            return await self._check_client_health(task.get("client_id", ""))
        return {"error": "Unknown action"}

    async def _setup_new_client(self, client: Dict) -> Dict:
        setup = await self.think_json(f"""أنشئ خطة إعداد لعميل جديد:
الشركة: {client.get('company', '')}
القطاع: {client.get('sector', '')}
الحجم: {client.get('size', '')}
الخطة: {client.get('plan', 'professional')}
{{"setup_steps": [{{"step": 1, "title": "...", "description": "...", "duration_min": 0}}],
"customizations": [{{"setting": "...", "value": "...", "reason": "..."}}],
"recommended_sectors": ["..."], "recommended_cities": ["..."],
"first_campaign_suggestion": "...", "expected_results_30days": "..."}}""",
            task_type="onboarding")
        return {"client": client.get("company", ""), "setup_plan": setup}

    async def _generate_welcome_sequence(self, client: Dict) -> Dict:
        welcome = await self.think(f"""اكتب سلسلة رسائل ترحيب للعميل الجديد:
{client.get('company', '')} — {client.get('sector', '')}
اكتب 3 رسائل (يوم 1, يوم 3, يوم 7) بالعربي.""", task_type="onboarding")
        return {"welcome_sequence": welcome}

    async def _check_client_health(self, client_id: str) -> Dict:
        return {
            "client_id": client_id,
            "health_score": 0,
            "features_activated": [],
            "recommendations": ["تفعيل الحملات", "إضافة قطاعات"],
        }


# ══════════════════════════════════════════════════════
# Content Agent — AI Sales Content Generation
# ══════════════════════════════════════════════════════

class ContentAgent(BaseAgent):
    """✍️ Content Agent — يُنشئ محتوى مبيعات احترافي."""

    def __init__(self):
        super().__init__(
            name="content_agent", name_ar="وكيل إنشاء المحتوى", layer=4,
            description="إنشاء محتوى مبيعات: رسائل، عروض، دراسات حالة، منشورات"
        )

    def get_capabilities(self) -> List[str]:
        return [
            "إنشاء رسائل مبيعات (واتساب + إيميل + لنكدإن)",
            "عروض أسعار PDF احترافية",
            "دراسات حالة (Case Studies)",
            "منشورات سوشيال ميديا",
            "blogs ومقالات قيادة فكرية",
            "سكربتات اتصال ومكالمات",
            "infographics نصية",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "generate")
        content_type = task.get("type", "message")
        
        if content_type == "case_study":
            return await self._generate_case_study(task.get("data", {}))
        elif content_type == "social_post":
            return await self._generate_social_post(task.get("topic", ""))
        elif content_type == "proposal":
            return await self._generate_proposal(task.get("lead", {}))
        elif content_type == "blog":
            return await self._generate_blog(task.get("topic", ""))
        
        return await self._generate_sales_message(task.get("lead", {}), task.get("channel", "whatsapp"))

    async def _generate_case_study(self, data: Dict) -> Dict:
        study = await self.think(f"""اكتب دراسة حالة احترافية:
العميل: {data.get('client', '')}
القطاع: {data.get('sector', '')}
التحدي: {data.get('challenge', '')}
الحل: Dealix AI
النتائج: {data.get('results', '')}
اكتب بالعربي المهني. شامل ومقنع.""", task_type="content_creation")
        return {"case_study": study, "type": "case_study"}

    async def _generate_social_post(self, topic: str) -> Dict:
        post = await self.think(f"""اكتب منشور LinkedIn/Twitter عن: {topic or 'AI في المبيعات'}
- مختصر وقوي
- يجذب الانتباه
- يشمل CTA
- هاشتاقات مناسبة
اكتب بالعربي.""", task_type="social_content")
        return {"post": post, "type": "social"}

    async def _generate_proposal(self, lead: Dict) -> Dict:
        proposal = await self.think(f"""اكتب عرض سعر تجاري احترافي لـ:
{lead.get('company', lead.get('name', ''))} — {lead.get('sector', '')}
يشمل: ملخص تنفيذي, الحل, القيمة, التسعير (3 خطط), ضمانات, CTA
اكتب بالعربي المهني العالي.""", task_type="proposal_creation")
        return {"proposal": proposal, "type": "proposal"}

    async def _generate_blog(self, topic: str) -> Dict:
        blog = await self.think(f"""اكتب مقالة قيادة فكرية عن: {topic or 'مستقبل المبيعات بالذكاء الاصطناعي في السعودية'}
800-1200 كلمة. عناوين ونقاط. اكتب بالعربي.""", task_type="blog_creation")
        return {"blog": blog, "type": "blog"}

    async def _generate_sales_message(self, lead: Dict, channel: str) -> Dict:
        message = await self.think(f"""اكتب رسالة مبيعات لقناة {channel}:
العميل: {lead.get('name', '')} — {lead.get('sector', '')} — {lead.get('city', '')}
اكتب بالعربي السعودي (لهجة ودية + مهنية). 3-5 جمل.""", task_type="message_creation")
        return {"message": message, "channel": channel}
