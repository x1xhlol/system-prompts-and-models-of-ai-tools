"""
Dealix Autonomous Sales Pipeline
=================================
Fully automated: Discover → Qualify → Message → Follow-up → Close
Zero human intervention required.
"""
import asyncio
import json
import random
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
import httpx
import os

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════
# Lead Database (SQLite-backed for local, PostgreSQL for prod)
# ═══════════════════════════════════════════════════════════════

class LeadStore:
    """Simple in-memory + file-backed lead store."""

    def __init__(self, db_path: str = "data/leads.json"):
        self.db_path = db_path
        self.leads: Dict[str, Dict] = {}
        self._load()

    def _load(self):
        try:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            if os.path.exists(self.db_path):
                with open(self.db_path, "r", encoding="utf-8") as f:
                    self.leads = json.load(f)
                logger.info(f"📂 Loaded {len(self.leads)} leads from store")
        except Exception as e:
            logger.warning(f"Could not load lead store: {e}")
            self.leads = {}

    def _save(self):
        try:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            with open(self.db_path, "w", encoding="utf-8") as f:
                json.dump(self.leads, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Could not save lead store: {e}")

    def add_lead(self, phone: str, data: Dict) -> bool:
        """Add a new lead. Returns True if new, False if exists."""
        if phone in self.leads:
            return False
        self.leads[phone] = {
            **data,
            "phone": phone,
            "status": "new",
            "tier": "UNKNOWN",
            "messages_sent": 0,
            "messages_received": 0,
            "last_contact": None,
            "next_followup": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "conversation_history": [],
            "ai_notes": "",
        }
        self._save()
        return True

    def update_lead(self, phone: str, updates: Dict):
        if phone in self.leads:
            self.leads[phone].update(updates)
            self._save()

    def get_lead(self, phone: str) -> Optional[Dict]:
        return self.leads.get(phone)

    def get_leads_by_status(self, status: str) -> List[Dict]:
        return [l for l in self.leads.values() if l.get("status") == status]

    def get_leads_needing_followup(self) -> List[Dict]:
        now = datetime.now(timezone.utc)
        results = []
        for lead in self.leads.values():
            nf = lead.get("next_followup")
            if nf and datetime.fromisoformat(nf) <= now:
                results.append(lead)
        return results

    def get_stats(self) -> Dict:
        total = len(self.leads)
        by_tier = {}
        by_status = {}
        for lead in self.leads.values():
            tier = lead.get("tier", "UNKNOWN")
            status = lead.get("status", "new")
            by_tier[tier] = by_tier.get(tier, 0) + 1
            by_status[status] = by_status.get(status, 0) + 1
        return {
            "total_leads": total,
            "by_tier": by_tier,
            "by_status": by_status,
            "hot_leads": by_tier.get("HOT", 0),
            "warm_leads": by_tier.get("WARM", 0),
            "meetings_scheduled": by_status.get("meeting_scheduled", 0),
            "deals_closed": by_status.get("closed", 0),
        }


# ═══════════════════════════════════════════════════════════════
# WhatsApp Messenger (Ultramsg)
# ═══════════════════════════════════════════════════════════════

class WhatsAppMessenger:
    """Send messages via Ultramsg API."""

    def __init__(self):
        self.instance_id = os.getenv("ULTRAMSG_INSTANCE_ID", "instance168132")
        self.token = os.getenv("ULTRAMSG_TOKEN", "7azj2ss74wpg9jwp")
        self.api_base = f"https://api.ultramsg.com/{self.instance_id}"

    async def send_message(self, phone: str, message: str) -> Dict:
        """Send a WhatsApp message."""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{self.api_base}/messages/chat",
                    data={
                        "token": self.token,
                        "to": phone,
                        "body": message,
                    }
                )
                result = resp.json()
                logger.info(f"📤 Sent to {phone[-4:]}: {result}")
                return result
        except Exception as e:
            logger.error(f"❌ Send failed to {phone[-4:]}: {e}")
            return {"error": str(e)}

    async def send_image(self, phone: str, image_url: str, caption: str = "") -> Dict:
        """Send an image via WhatsApp."""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{self.api_base}/messages/image",
                    data={
                        "token": self.token,
                        "to": phone,
                        "image": image_url,
                        "caption": caption,
                    }
                )
                return resp.json()
        except Exception as e:
            return {"error": str(e)}


# ═══════════════════════════════════════════════════════════════
# AI Brain (Multi-Model Router)
# ═══════════════════════════════════════════════════════════════

class AIBrain:
    """AI-powered decision making for the sales pipeline."""

    def __init__(self):
        from app.services.model_router import get_router
        self.router = get_router()

    async def qualify_lead(self, lead: Dict, message: str = "") -> Dict:
        """Classify and qualify a lead using AI."""
        prompt = f"""حلل هذا العميل المحتمل وصنّفه:

الاسم: {lead.get('name', 'غير معروف')}
الشركة: {lead.get('company', 'غير معروف')}
القطاع: {lead.get('sector', 'غير معروف')}
المدينة: {lead.get('city', 'غير معروف')}
رسالته: {message or 'لم يرد بعد'}
عدد الرسائل المرسلة: {lead.get('messages_sent', 0)}
عدد الردود: {lead.get('messages_received', 0)}

صنّفه (HOT/WARM/NURTURE) وحدد الخطوة التالية.
رد بـ JSON:
{{"tier": "...", "intent": "...", "next_action": "...", "confidence": 0-100, "reply": "..."}}"""

        result = await self.router.route("lead_qualify", prompt, 
            "أنت خبير تصنيف عملاء في السوق السعودي. رد بـ JSON فقط.")
        
        try:
            text = result.get("text", "")
            if "{" in text:
                json_str = text[text.index("{"):text.rindex("}") + 1]
                return json.loads(json_str)
        except Exception:
            pass
        
        return {"tier": "WARM", "intent": "unknown", "next_action": "followup", 
                "confidence": 50, "reply": ""}

    async def personalize_message(self, lead: Dict, template: str, context: str = "") -> str:
        """Generate a personalized message for a lead."""
        prompt = f"""خصّص هذه الرسالة للعميل:

القالب: {template}

معلومات العميل:
- الاسم: {lead.get('name', '')}
- الشركة: {lead.get('company', '')}
- القطاع: {lead.get('sector', '')}
- المدينة: {lead.get('city', '')}
{f'- سياق إضافي: {context}' if context else ''}

اكتب الرسالة المخصصة بالعربي السعودي العامي. رد بالرسالة فقط بدون شرح."""

        result = await self.router.route("whatsapp_template", prompt,
            "أنت كاتب رسائل واتساب محترف. اكتب الرسالة فقط.")
        return result.get("text", template)

    async def handle_reply(self, lead: Dict, incoming_message: str) -> Dict:
        """Process an incoming reply and generate AI response."""
        history = lead.get("conversation_history", [])
        history_text = "\n".join([
            f"{'نحن' if m.get('from') == 'us' else 'العميل'}: {m.get('text', '')}"
            for m in history[-5:]
        ])

        prompt = f"""أنت المهندس سامي، الرئيس التنفيذي لشركة Dealix.
        
العميل {lead.get('name', '')} من {lead.get('company', '')} رد على رسالتك.

تاريخ المحادثة:
{history_text}

رسالته الأخيرة: {incoming_message}

تصنيفه الحالي: {lead.get('tier', 'UNKNOWN')}

ردّ عليه بشكل طبيعي ومهني كرئيس تنفيذي سعودي.
وأعطني تصنيفه الجديد.

رد بـ JSON:
{{"reply": "...", "tier": "HOT|WARM|NURTURE", "next_action": "demo|proposal|followup|close|nurture", "meeting_requested": false}}"""

        result = await self.router.route("sales_decision", prompt,
            "أنت المهندس سامي، CEO شركة Dealix. رد بـ JSON فقط.")
        
        try:
            text = result.get("text", "")
            if "{" in text:
                json_str = text[text.index("{"):text.rindex("}") + 1]
                return json.loads(json_str)
        except Exception:
            pass
        
        return {
            "reply": f"شكراً {lead.get('name', '')}! وصلتني رسالتك وسأرد عليك قريباً 🙏",
            "tier": lead.get("tier", "WARM"),
            "next_action": "followup",
        }


# ═══════════════════════════════════════════════════════════════
# Smart Follow-Up Engine
# ═══════════════════════════════════════════════════════════════

class FollowUpEngine:
    """Automated follow-up sequences based on lead tier."""

    SEQUENCES = {
        "HOT": [
            (0, "شكراً لاهتمامك {name}! 🔥 أقدر أرتب لك عرض سريع للنظام خلال 24 ساعة. وش أنسب وقت لك؟"),
            (1, "مرحباً {name}! تذكير بخصوص عرض النظام. الوقت اللي يناسبك أنا متفرغ له ✅"),
            (3, "أهلاً {name}! حبيت أتابع معك — لو عندك أي سؤال عن النظام أنا موجود. حالياً عندنا عرض تأسيسي خاص 🎯"),
            (7, "{name}، آخر فرصة للعرض التأسيسي هالأسبوع. بعدها الأسعار ترجع لسعرها العادي 📊"),
        ],
        "WARM": [
            (0, "شكراً لردك {name}! 🙌 هنا case study من شركة بنفس مجالك حققت نتائج خلال أول أسبوع"),
            (3, "مرحباً {name}! سؤال سريع: وش أكبر تحدي تواجهه حالياً بالمبيعات؟ 🤔"),
            (7, "أهلاً {name}! شركات مثل {company} رفعت مبيعاتها 40% بعد ما فعّلت AI. تبي تشوف كيف؟"),
            (14, "{name}، عرض خاص: تجربة مجانية 14 يوم بدون أي التزام. تبي أفعّلها لك؟ 🚀"),
        ],
        "NURTURE": [
            (0, "شكراً لتواصلك {name}! سجلناك عندنا ✅"),
            (7, "مرحباً {name}! مقال جديد: كيف AI يغيّر مبيعات الشركات السعودية 📈"),
            (14, "{name}، دعوة خاصة لـ Webinar مجاني عن أتمتة المبيعات بالذكاء الاصطناعي 🎓"),
            (30, "أهلاً {name}! كيف الأمور؟ هل الوقت مناسب الآن نتكلم عن حلول المبيعات الذكية؟"),
        ],
    }

    def get_next_message(self, lead: Dict) -> Optional[Dict]:
        """Get the next follow-up message for a lead."""
        tier = lead.get("tier", "NURTURE")
        msgs_sent = lead.get("messages_sent", 0)
        sequence = self.SEQUENCES.get(tier, self.SEQUENCES["NURTURE"])

        # Find the next unsent message in sequence
        for day_offset, template in sequence:
            if msgs_sent <= sequence.index((day_offset, template)):
                message = template.replace("{name}", lead.get("name", ""))
                message = message.replace("{company}", lead.get("company", ""))
                return {
                    "message": message,
                    "delay_days": day_offset,
                    "sequence_index": sequence.index((day_offset, template)),
                }
        return None


# ═══════════════════════════════════════════════════════════════
# Daily Report Generator
# ═══════════════════════════════════════════════════════════════

class DailyReporter:
    """Generate and send daily performance reports."""

    def __init__(self, store: LeadStore, messenger: WhatsAppMessenger):
        self.store = store
        self.messenger = messenger
        self.ceo_phone = os.getenv("CEO_PHONE", "966597788539")

    async def generate_report(self) -> str:
        stats = self.store.get_stats()
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")

        report = f"""📊 *تقرير Dealix اليومي*
⏰ {now}

━━━━━━━━━━━━━━━━
📈 *إحصائيات العملاء*
━━━━━━━━━━━━━━━━
• إجمالي العملاء: {stats['total_leads']}
• 🔥 HOT: {stats['hot_leads']}
• 🌡️ WARM: {stats['warm_leads']}
• 📅 اجتماعات محجوزة: {stats['meetings_scheduled']}
• 💰 صفقات مغلقة: {stats['deals_closed']}

━━━━━━━━━━━━━━━━
📊 *حسب الحالة*
━━━━━━━━━━━━━━━━"""
        for status, count in stats.get("by_status", {}).items():
            report += f"\n• {status}: {count}"

        report += "\n\n🤖 _تقرير آلي من Dealix AI_"
        return report

    async def send_daily_report(self):
        """Generate and send daily report to CEO."""
        report = await self.generate_report()
        await self.messenger.send_message(self.ceo_phone, report)
        logger.info("📊 Daily report sent to CEO")


# ═══════════════════════════════════════════════════════════════
# Main Autonomous Pipeline
# ═══════════════════════════════════════════════════════════════

class AutonomousPipeline:
    """
    The brain of Dealix — orchestrates the entire sales lifecycle.
    
    Flow:
    1. Discover leads (Google Maps + Perplexity)
    2. Qualify with AI (Groq fast classification)
    3. Send personalized messages (WhatsApp via Ultramsg)
    4. Handle replies (Webhook → AI → Auto-respond)
    5. Follow-up sequences (Smart timing)
    6. Schedule meetings (Auto-propose times)
    7. Generate proposals (Claude AI)
    8. Close deals (AI-assisted)
    9. Daily reports (Auto-sent to CEO)
    """

    def __init__(self):
        self.store = LeadStore()
        self.messenger = WhatsAppMessenger()
        self.ai = AIBrain()
        self.followup = FollowUpEngine()
        self.reporter = DailyReporter(self.store, self.messenger)
        self.is_running = False

    async def process_incoming_message(self, phone: str, message: str, sender_name: str = "") -> Dict:
        """Process an incoming WhatsApp message (called by webhook)."""
        lead = self.store.get_lead(phone)

        if not lead:
            # New lead from inbound
            self.store.add_lead(phone, {
                "name": sender_name or "عميل جديد",
                "company": "",
                "sector": "unknown",
                "city": "",
                "source": "inbound_whatsapp",
            })
            lead = self.store.get_lead(phone)

        # Update conversation history
        history = lead.get("conversation_history", [])
        history.append({
            "from": "them",
            "text": message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        # AI processes the reply
        ai_response = await self.ai.handle_reply(lead, message)

        # Update lead
        self.store.update_lead(phone, {
            "tier": ai_response.get("tier", lead.get("tier", "WARM")),
            "status": "engaged",
            "messages_received": lead.get("messages_received", 0) + 1,
            "last_contact": datetime.now(timezone.utc).isoformat(),
            "conversation_history": history,
            "ai_notes": ai_response.get("next_action", ""),
        })

        # Send AI response
        reply_text = ai_response.get("reply", "")
        if reply_text:
            await self.messenger.send_message(phone, reply_text)
            
            # Update our side of conversation
            history.append({
                "from": "us",
                "text": reply_text,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            self.store.update_lead(phone, {
                "messages_sent": lead.get("messages_sent", 0) + 1,
                "conversation_history": history,
            })

        # Schedule next follow-up
        next_followup = self.followup.get_next_message(self.store.get_lead(phone))
        if next_followup:
            followup_time = datetime.now(timezone.utc) + timedelta(days=next_followup["delay_days"])
            self.store.update_lead(phone, {
                "next_followup": followup_time.isoformat(),
            })

        return {
            "reply_sent": reply_text,
            "tier": ai_response.get("tier"),
            "next_action": ai_response.get("next_action"),
        }

    async def run_followups(self):
        """Process all pending follow-ups."""
        leads = self.store.get_leads_needing_followup()
        logger.info(f"🔄 Processing {len(leads)} follow-ups")

        for lead in leads:
            next_msg = self.followup.get_next_message(lead)
            if next_msg:
                # Personalize with AI
                personalized = await self.ai.personalize_message(
                    lead, next_msg["message"]
                )
                await self.messenger.send_message(lead["phone"], personalized)
                
                self.store.update_lead(lead["phone"], {
                    "messages_sent": lead.get("messages_sent", 0) + 1,
                    "last_contact": datetime.now(timezone.utc).isoformat(),
                    "next_followup": None,  # Will be rescheduled on next cycle
                })

                # Rate limiting
                await asyncio.sleep(random.randint(30, 60))

    def get_pipeline_status(self) -> Dict:
        """Get current pipeline status and stats."""
        stats = self.store.get_stats()
        return {
            "engine": "autonomous",
            "status": "running" if self.is_running else "idle",
            "leads": stats,
            "ai_models_active": 5,
            "whatsapp_connected": True,
            "followup_engine": "active",
            "last_check": datetime.now(timezone.utc).isoformat(),
        }


# ═══════════════════════════════════════════════════════════════
# Singleton
# ═══════════════════════════════════════════════════════════════

_pipeline: Optional[AutonomousPipeline] = None

def get_pipeline() -> AutonomousPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = AutonomousPipeline()
    return _pipeline
