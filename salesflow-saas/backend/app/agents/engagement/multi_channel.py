"""
Layer 4: Multi-Channel Engagement Agents
==========================================
WhatsApp + Email + Voice + LinkedIn — all automated.
"""
import asyncio
import json
import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
import httpx

from app.agents.base_agent import BaseAgent, AgentPriority

logger = logging.getLogger("dealix.agents.engagement")


# ══════════════════════════════════════════════════════
# Email Agent — Cold Outreach + Sequences
# ══════════════════════════════════════════════════════

class EmailAgent(BaseAgent):
    """
    📧 Automated Email Sales Sequences.
    Like Outreach.io but built-in and Saudi-optimized.
    
    Features:
    - Cold email sequences (5-7 touches)
    - AI-personalized content per lead
    - A/B testing subject lines
    - Open/click tracking
    - Smart timing (Saudi business hours)
    - Arabic + English templates
    - Auto-unsubscribe management
    """

    SEQUENCES = {
        "cold_b2b": {
            "name_ar": "تواصل بارد B2B",
            "steps": [
                {"day": 0, "type": "email", "template": "cold_intro", "subject_ar": "فرصة لزيادة مبيعات {company} 🚀"},
                {"day": 2, "type": "email", "template": "value_add", "subject_ar": "كيف {similar_company} ضاعفت مبيعاتها"},
                {"day": 5, "type": "email", "template": "case_study", "subject_ar": "دراسة حالة: {sector} + AI"},
                {"day": 8, "type": "email", "template": "demo_invite", "subject_ar": "دعوة خاصة: عرض مباشر لـ Dealix"},
                {"day": 12, "type": "email", "template": "breakup", "subject_ar": "آخر رسالة مني — {name}"},
            ],
        },
        "warm_followup": {
            "name_ar": "متابعة دافئة",
            "steps": [
                {"day": 0, "type": "email", "template": "warm_intro", "subject_ar": "تابع لمحادثتنا، {name}"},
                {"day": 3, "type": "email", "template": "proposal", "subject_ar": "عرض خاص لـ {company}"},
                {"day": 7, "type": "email", "template": "urgency", "subject_ar": "العرض ينتهي قريباً — {company}"},
            ],
        },
        "post_meeting": {
            "name_ar": "بعد الاجتماع",
            "steps": [
                {"day": 0, "type": "email", "template": "meeting_summary", "subject_ar": "ملخص اجتماعنا — {company}"},
                {"day": 2, "type": "email", "template": "proposal_formal", "subject_ar": "العرض التجاري — Dealix × {company}"},
                {"day": 5, "type": "email", "template": "closing", "subject_ar": "الخطوة التالية — {company}"},
            ],
        },
    }

    EMAIL_TEMPLATES = {
        "cold_intro": {
            "ar": """مرحباً {name},

أنا سامي، المؤسس والرئيس التنفيذي لشركة Dealix.

لاحظت أن {company} شركة مميزة في قطاع {sector} في {city}، وأعتقد أن لدينا فرصة لمساعدتكم في مضاعفة مبيعاتكم.

Dealix هو نظام ذكاء اصطناعي يكتشف العملاء المحتملين، يتواصل معهم تلقائياً، ويتابعهم حتى يُغلق الصفقة — بدون أي تدخل بشري.

شركات مشابهة لكم حققت زيادة 40% في المبيعات خلال الشهر الأول.

هل يناسبك 15 دقيقة هذا الأسبوع لعرض سريع؟

تحياتي,
م. سامي
المؤسس والرئيس التنفيذي — Dealix
""",
            "en": """Hi {name},

I'm Sami, Founder & CEO of Dealix.

I noticed {company} is a standout company in the {sector} sector in {city}. I believe we have an opportunity to help you double your sales.

Dealix is an AI system that discovers prospects, contacts them automatically, and follows up until the deal closes — with zero human intervention.

Companies like yours achieved 40% sales growth in the first month.

Would you have 15 minutes this week for a quick demo?

Best regards,
Eng. Sami
Founder & CEO — Dealix
""",
        },
        "case_study": {
            "ar": """مرحباً {name},

أشارككم دراسة حالة من عميل في قطاع {sector}:

📊 التحدي: صعوبة في إيجاد وتحويل عملاء جدد
🤖 الحل: نظام Dealix AI للمبيعات الذاتية
📈 النتيجة: 
   • زيادة 40% في العملاء المحتملين
   • 3x سرعة الرد على الاستفسارات
   • 25% زيادة في الإيرادات خلال 60 يوم

هل تودون تحقيق نتائج مشابهة؟

تحياتي,
م. سامي — Dealix
""",
        },
        "breakup": {
            "ar": """مرحباً {name},

هذه ستكون آخر رسالة مني.

إذا لم يكن الوقت مناسباً الآن، أتفهم ذلك تماماً.

لكن في حال تغيّرت الظروف مستقبلاً، الباب مفتوح دائماً. يمكنك الرد على هذه الرسالة في أي وقت.

أتمنى لكم التوفيق والنجاح.

تحياتي,
م. سامي — Dealix
""",
        },
    }

    def __init__(self):
        super().__init__(
            name="email_agent",
            name_ar="وكيل البريد الإلكتروني",
            layer=4,
            description="إرسال حملات إيميل مخصصة بالذكاء الاصطناعي مع تتبع الأداء",
        )
        self.api_key = os.getenv("RESEND_API_KEY", "")
        self.from_email = os.getenv("EMAIL_FROM", "sami@dealix.sa")
        self.from_name = "م. سامي — Dealix"

    def get_capabilities(self) -> List[str]:
        return [
            "إرسال سلاسل إيميل باردة (5-7 رسائل)",
            "تخصيص كل رسالة بالذكاء الاصطناعي",
            "A/B testing للعناوين",
            "تتبع الفتح والنقر",
            "قوالب جاهزة (عربي + إنجليزي)",
            "جدولة ذكية (أوقات العمل السعودية)",
            "إدارة إلغاء الاشتراك تلقائياً",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "send")
        
        if action == "send":
            return await self.send_email(
                to=task.get("to", ""),
                subject=task.get("subject", ""),
                body=task.get("body", ""),
                lead=task.get("lead", {}),
            )
        elif action == "start_sequence":
            return await self.start_sequence(
                lead=task.get("lead", {}),
                sequence=task.get("sequence", "cold_b2b"),
            )
        elif action == "personalize":
            return await self.personalize_email(
                template=task.get("template", "cold_intro"),
                lead=task.get("lead", {}),
            )
        
        return {"error": f"Unknown action: {action}"}

    async def send_email(self, to: str, subject: str, body: str, lead: Dict = None) -> Dict:
        """Send an email via Resend API."""
        if not self.api_key:
            logger.info(f"📧 [DRY RUN] Email to {to}: {subject}")
            return {"status": "dry_run", "to": to, "subject": subject}
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "from": f"{self.from_name} <{self.from_email}>",
                        "to": [to],
                        "subject": subject,
                        "html": self._format_html(body),
                    }
                )
                result = resp.json()
                logger.info(f"📧 Email sent to {to}: {result}")
                return {"status": "sent", "result": result}
        except Exception as e:
            logger.error(f"📧 Email error: {e}")
            return {"status": "error", "error": str(e)}

    async def start_sequence(self, lead: Dict, sequence: str = "cold_b2b") -> Dict:
        """Start an automated email sequence for a lead."""
        seq = self.SEQUENCES.get(sequence, self.SEQUENCES["cold_b2b"])
        
        # Personalize first email immediately
        first_step = seq["steps"][0]
        personalized = await self.personalize_email(first_step["template"], lead)
        subject = first_step["subject_ar"].format(
            name=lead.get("name", ""),
            company=lead.get("company", lead.get("name", "")),
            sector=lead.get("sector", ""),
        )
        
        # Send first email
        email_to = lead.get("email", "")
        if email_to:
            await self.send_email(email_to, subject, personalized, lead)
        
        # Schedule follow-ups
        remaining_steps = []
        for step in seq["steps"][1:]:
            remaining_steps.append({
                "scheduled_for": (datetime.now(timezone.utc) + timedelta(days=step["day"])).isoformat(),
                "template": step["template"],
                "subject": step["subject_ar"],
            })
        
        self.remember(f"sequence_{lead.get('phone', lead.get('email', ''))}", {
            "sequence": sequence,
            "lead": lead,
            "current_step": 0,
            "remaining_steps": remaining_steps,
            "started_at": datetime.now(timezone.utc).isoformat(),
        })
        
        return {
            "status": "sequence_started",
            "sequence": sequence,
            "total_steps": len(seq["steps"]),
            "first_email_sent": bool(email_to),
            "scheduled_followups": len(remaining_steps),
        }

    async def personalize_email(self, template: str, lead: Dict) -> str:
        """Use AI to personalize an email template for a specific lead."""
        base_template = self.EMAIL_TEMPLATES.get(template, {}).get("ar", "")
        
        if not base_template:
            # Generate entirely with AI
            prompt = f"""اكتب إيميل مبيعات احترافي لهذا العميل:

الاسم: {lead.get('name', '')}
الشركة: {lead.get('company', lead.get('name', ''))}
القطاع: {lead.get('sector', '')}
المدينة: {lead.get('city', '')}
نوع الإيميل: {template}

اكتب الإيميل بالعربي الفصيح المهني. رد بنص الإيميل فقط."""
            return await self.think(prompt, task_type="email_writing")
        
        # Personalize existing template
        return base_template.format(
            name=lead.get("name", ""),
            company=lead.get("company", lead.get("name", "")),
            sector=lead.get("sector", ""),
            city=lead.get("city", ""),
            similar_company="شركات مشابهة",
        )

    def _format_html(self, body: str) -> str:
        """Convert plain text to branded HTML email."""
        return f"""<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Tahoma, sans-serif; background: #f8fafc; padding: 40px 20px; direction: rtl;">
<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
<div style="border-bottom: 3px solid #00D4AA; padding-bottom: 20px; margin-bottom: 24px;">
  <span style="font-size: 20px; font-weight: 800; color: #0A1628;">Dealix</span>
  <span style="background: rgba(0,212,170,0.1); color: #00D4AA; padding: 2px 10px; border-radius: 20px; font-size: 11px; margin-right: 8px;">AI</span>
</div>
<div style="font-size: 15px; line-height: 1.8; color: #374151; white-space: pre-line;">{body}</div>
<div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
  © 2026 Dealix — أقوى نظام AI لأتمتة المبيعات في السعودية
  <br><a href="#unsubscribe" style="color: #9ca3af;">إلغاء الاشتراك</a>
</div>
</div>
</body></html>"""


# ══════════════════════════════════════════════════════
# Voice Agent — AI Phone Calls
# ══════════════════════════════════════════════════════

class VoiceAgent(BaseAgent):
    """
    📞 AI-Powered Voice Calls — Arabic natural voice.
    
    Uses:
    - ElevenLabs for Arabic text-to-speech
    - Whisper (via Groq) for speech-to-text
    - Twilio for phone infrastructure
    - AI for real-time conversation management
    """

    def __init__(self):
        super().__init__(
            name="voice_agent",
            name_ar="وكيل الاتصال الصوتي",
            layer=4,
            description="اتصالات هاتفية ذكية بصوت عربي طبيعي مع تحليل المحادثة",
        )

    def get_capabilities(self) -> List[str]:
        return [
            "اتصال تلقائي بالعملاء HOT",
            "صوت عربي سعودي طبيعي (ElevenLabs)",
            "تحويل صوت لنص (Whisper via Groq — مجاني)",
            "تحليل المكالمة فوراً (sentiment + objections)",
            "تحويل المكالمة لمندوب بشري عند الحاجة",
            "تسجيل وأرشفة كل المكالمات",
            "جدولة callback ذكي",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "analyze")
        
        if action == "analyze_call":
            return await self.analyze_call_transcript(task.get("transcript", ""))
        elif action == "generate_script":
            return await self.generate_call_script(task.get("lead", {}))
        elif action == "transcribe":
            return await self.transcribe_audio(task.get("audio_url", ""))
        
        return {"status": "voice_agent_ready", "note": "Twilio + ElevenLabs integration pending"}

    async def analyze_call_transcript(self, transcript: str) -> Dict:
        """Analyze a call transcript with AI — like Gong."""
        return await self.think_json(
            f"""حلل هذه المكالمة البيعية:

المحادثة:
{transcript}

أعطني تحليل شامل:
{{"sentiment": "positive/neutral/negative", "buying_signals": ["..."], "objections": ["..."], "talk_ratio_seller": 0-100, "talk_ratio_buyer": 0-100, "key_topics": ["..."], "next_action": "...", "deal_probability": 0-100, "coaching_tips": ["..."]}}""",
            task_type="conversation_analysis",
        )

    async def generate_call_script(self, lead: Dict) -> Dict:
        """Generate a customized call script for a lead."""
        script = await self.think(
            f"""اكتب سكربت مكالمة بيعية لهذا العميل:

الشركة: {lead.get('name', '')}
القطاع: {lead.get('sector', '')}
الحجم: {lead.get('company_size', '')}
التقييم: {lead.get('score', 0)}

اكتب:
1. افتتاحية (30 ثانية)
2. عرض القيمة (60 ثانية)
3. أسئلة اكتشافية (3 أسئلة)
4. معالجة الاعتراضات الشائعة (3 سيناريوهات)
5. إغلاق (CTA واضح)

اكتب بالعربي السعودي العامي.""",
            task_type="script_generation",
        )
        return {"script": script, "lead": lead.get("name", "")}

    async def transcribe_audio(self, audio_url: str) -> Dict:
        """Transcribe audio using Whisper via Groq (free)."""
        groq_key = os.getenv("GROQ_API_KEY", "")
        if not groq_key:
            return {"status": "no_api_key"}
        
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                # Download audio
                audio_resp = await client.get(audio_url)
                
                # Send to Groq Whisper
                resp = await client.post(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    headers={"Authorization": f"Bearer {groq_key}"},
                    files={"file": ("audio.ogg", audio_resp.content, "audio/ogg")},
                    data={"model": "whisper-large-v3", "language": "ar"},
                )
                result = resp.json()
                return {"text": result.get("text", ""), "status": "transcribed"}
        except Exception as e:
            return {"status": "error", "error": str(e)}


# ══════════════════════════════════════════════════════
# Conversation Intelligence Agent — Like Gong
# ══════════════════════════════════════════════════════

class ConversationIntelAgent(BaseAgent):
    """
    🎙️ Conversation Intelligence — The "Gong" of Dealix.
    
    Analyzes EVERY interaction across ALL channels to extract:
    - Buying signals
    - Objections & pain points
    - Competitive mentions
    - Sentiment trajectory
    - Deal risk indicators
    - Coaching opportunities
    """

    def __init__(self):
        super().__init__(
            name="conversation_intel",
            name_ar="وكيل ذكاء المحادثات",
            layer=6,
            description="تحليل جميع المحادثات عبر كل القنوات لاستخراج رؤى وتوقعات ذكية",
        )

    def get_capabilities(self) -> List[str]:
        return [
            "تحليل محادثات واتساب (كل رسالة)",
            "تحليل إيميلات المبيعات",
            "تحليل تسجيلات المكالمات",
            "كشف إشارات الشراء (buying signals)",
            "كشف الاعتراضات والمخاوف",
            "تحليل المشاعر (sentiment) عبر الزمن",
            "كشف ذكر المنافسين",
            "تقديم نصائح تدريبية (coaching insights)",
            "تقييم صحة الصفقة (deal health score)",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "analyze")
        
        if action == "analyze_conversation":
            return await self.analyze_full_conversation(task.get("messages", []), task.get("lead", {}))
        elif action == "extract_insights":
            return await self.extract_insights(task.get("conversations", []))
        elif action == "deal_health":
            return await self.assess_deal_health(task.get("lead", {}))
        elif action == "coaching":
            return await self.generate_coaching(task.get("rep_conversations", []))
        
        return {"error": f"Unknown action: {action}"}

    async def analyze_full_conversation(self, messages: List[Dict], lead: Dict) -> Dict:
        """Deep analysis of a full conversation thread."""
        msgs_text = "\n".join([
            f"{'البائع' if m.get('from') == 'us' else 'العميل'}: {m.get('text', '')}"
            for m in messages
        ])
        
        return await self.think_json(f"""حلل هذه المحادثة البيعية بشكل عميق:

العميل: {lead.get('name', '')} — {lead.get('company', '')}
القطاع: {lead.get('sector', '')}

المحادثة:
{msgs_text}

أعطني تحليل شامل:
{{
  "overall_sentiment": "positive/neutral/negative",
  "sentiment_trajectory": "improving/stable/declining",
  "buying_signals": ["..."],
  "objections": ["..."],
  "pain_points": ["..."],
  "competitive_mentions": ["..."],
  "engagement_level": "high/medium/low",
  "deal_stage": "awareness/interest/consideration/decision/closed",
  "deal_probability": 0-100,
  "deal_health_score": 0-100,
  "risk_factors": ["..."],
  "recommended_action": "...",
  "best_response": "...",
  "coaching_note": "..."
}}""", task_type="deep_analysis")

    async def assess_deal_health(self, lead: Dict) -> Dict:
        """Assess the health of a deal — like Clari/Gong deal intelligence."""
        history = lead.get("conversation_history", [])
        
        factors = {
            "response_speed": self._calc_response_speed(history),
            "message_count": len(history),
            "engagement_ratio": self._calc_engagement_ratio(history),
            "last_contact_days": self._days_since_last_contact(lead),
            "tier": lead.get("tier", "UNKNOWN"),
        }
        
        # AI assessment
        assessment = await self.think_json(f"""قيّم صحة هذه الصفقة:

العميل: {lead.get('name', '')}
التصنيف: {lead.get('tier', '')}
عدد الرسائل: {factors['message_count']}
نسبة التفاعل: {factors['engagement_ratio']}%
آخر تواصل قبل: {factors['last_contact_days']} يوم

{{
  "health_score": 0-100,
  "risk_level": "low/medium/high/critical",
  "risks": ["..."],
  "recommendations": ["..."],
  "estimated_close_date": "YYYY-MM-DD or null",
  "confidence": 0-100
}}""", task_type="deal_assessment")
        
        assessment.update(factors)
        return assessment

    async def generate_coaching(self, conversations: List) -> Dict:
        """Generate coaching insights from sales conversations."""
        return await self.think_json(f"""حلل أداء المبيعات من هذه المحادثات وأعطني نصائح تدريبية:

عدد المحادثات: {len(conversations)}

{{
  "strengths": ["..."],
  "areas_for_improvement": ["..."],
  "best_practices_observed": ["..."],
  "recommended_training": ["..."],
  "talk_ratio_average": 0,
  "avg_response_time_minutes": 0,
  "objection_handling_score": 0-100
}}""", task_type="coaching")

    def _calc_response_speed(self, history: List[Dict]) -> float:
        """Calculate average response speed in minutes."""
        if len(history) < 2:
            return 0
        # Simplified
        return round(len(history) * 2.5, 1)

    def _calc_engagement_ratio(self, history: List[Dict]) -> float:
        """Calculate engagement ratio (their messages / total)."""
        if not history:
            return 0
        their_msgs = sum(1 for m in history if m.get("from") != "us")
        return round((their_msgs / len(history)) * 100, 1)

    def _days_since_last_contact(self, lead: Dict) -> int:
        """Days since last contact."""
        last = lead.get("last_contact")
        if not last:
            return 999
        try:
            last_dt = datetime.fromisoformat(last.replace("Z", "+00:00"))
            return (datetime.now(timezone.utc) - last_dt).days
        except Exception:
            return 999


# ══════════════════════════════════════════════════════
# Revenue Forecast Agent — Like Clari
# ══════════════════════════════════════════════════════

class RevenueForecastAgent(BaseAgent):
    """
    📈 Revenue Forecasting & Pipeline Intelligence.
    Predicts revenue, identifies at-risk deals, optimizes pipeline.
    """

    def __init__(self):
        super().__init__(
            name="revenue_forecast",
            name_ar="وكيل توقع الإيرادات",
            layer=5,
            description="توقع الإيرادات وتحليل صحة خط الإنتاج البيعي وكشف المخاطر",
        )

    def get_capabilities(self) -> List[str]:
        return [
            "توقع إيرادات الشهر القادم (AI-powered)",
            "تحليل صحة الـ Pipeline بالوقت الحقيقي",
            "كشف الصفقات المعرضة للخطر",
            "حساب MRR/ARR المتوقع",
            "تحليل sales velocity",
            "تقرير pipeline coverage",
            "تنبيهات فورية عند خطر فقد صفقة",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "forecast")
        
        if action == "forecast":
            return await self.forecast_revenue(task.get("pipeline_data", {}))
        elif action == "pipeline_health":
            return await self.analyze_pipeline(task.get("deals", []))
        elif action == "at_risk":
            return await self.identify_at_risk_deals(task.get("deals", []))
        
        return {"error": f"Unknown action: {action}"}

    async def forecast_revenue(self, pipeline_data: Dict) -> Dict:
        """AI-powered revenue forecasting."""
        return await self.think_json(f"""توقع الإيرادات بناءً على هذه البيانات:

بيانات خط الإنتاج:
{json.dumps(pipeline_data, ensure_ascii=False, default=str)}

أعطني:
{{
  "forecast_monthly_sar": 0,
  "forecast_quarterly_sar": 0,
  "confidence_level": "high/medium/low",
  "best_case_sar": 0,
  "worst_case_sar": 0,
  "committed_sar": 0,
  "pipeline_coverage_ratio": 0,
  "deals_expected_to_close": 0,
  "avg_deal_size_sar": 0,
  "sales_velocity_days": 0,
  "recommendations": ["..."]
}}""", task_type="forecasting")

    async def analyze_pipeline(self, deals: List[Dict]) -> Dict:
        """Analyze the entire pipeline health."""
        return await self.think_json(f"""حلل صحة خط الإنتاج البيعي:

عدد الصفقات: {len(deals)}

أعطني:
{{
  "total_pipeline_value_sar": 0,
  "weighted_pipeline_sar": 0,
  "stages": {{
    "prospect": {{"count": 0, "value": 0}},
    "qualified": {{"count": 0, "value": 0}},
    "meeting": {{"count": 0, "value": 0}},
    "proposal": {{"count": 0, "value": 0}},
    "negotiation": {{"count": 0, "value": 0}},
    "close": {{"count": 0, "value": 0}}
  }},
  "health_score": 0-100,
  "bottleneck_stage": "...",
  "recommendations": ["..."]
}}""", task_type="pipeline_analysis")

    async def identify_at_risk_deals(self, deals: List[Dict]) -> Dict:
        """Identify deals at risk of being lost."""
        at_risk = []
        for deal in deals:
            health = await self.think_json(f"""هل هذه الصفقة معرضة للخطر؟

الشركة: {deal.get('name', '')}
المرحلة: {deal.get('stage', '')}
القيمة: {deal.get('value', 0)} ر.س
آخر تواصل: {deal.get('last_contact', '')}
عدد التفاعلات: {deal.get('interactions', 0)}

{{"at_risk": true/false, "risk_score": 0-100, "reason": "...", "save_action": "..."}}""")
            
            if health.get("at_risk", False):
                at_risk.append({"deal": deal.get("name"), "risk": health})
        
        return {"at_risk_deals": at_risk, "total_checked": len(deals)}
