"""
Dealix Meeting Intelligence Service
=====================================
Cal.com integration + Meeting preparation + Executive reporting
"""
import asyncio
import json
import os
import httpx
from datetime import datetime, timedelta
from typing import Optional
from groq import AsyncGroq
import logging

logger = logging.getLogger(__name__)

CAL_API_BASE = "https://api.cal.com/v1"
CAL_API_KEY = os.getenv("CAL_COM_API_KEY", "")


class CalComService:
    """Cal.com meeting booking integration."""

    def __init__(self):
        self.api_key = CAL_API_KEY
        self.event_type_id = os.getenv("CAL_COM_EVENT_TYPE_ID", "")
        self.booking_link = os.getenv("CAL_COM_BOOKING_LINK", "https://cal.com/dealix/demo")

    async def get_available_slots(self, days_ahead: int = 7) -> list:
        """Get available meeting slots."""
        if not self.api_key:
            # Return mock slots
            slots = []
            base = datetime.now()
            for i in range(1, days_ahead + 1):
                for hour in [10, 14, 16]:
                    slot_time = base + timedelta(days=i)
                    slot_time = slot_time.replace(hour=hour, minute=0)
                    slots.append({
                        "datetime": slot_time.isoformat(),
                        "available": True,
                        "duration": 30
                    })
            return slots

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{CAL_API_BASE}/slots",
                params={"eventTypeId": self.event_type_id},
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            return resp.json().get("slots", [])

    def generate_booking_link(self, lead_name: str, company: str) -> str:
        """Generate personalized Cal.com booking link."""
        base = self.booking_link
        return f"{base}?name={lead_name.replace(' ', '+')}&company={company.replace(' ', '+')}"

    async def create_booking(self, lead_data: dict, slot: str) -> dict:
        """Create a Cal.com booking."""
        if not self.api_key:
            return {
                "status": "mock_booked",
                "booking_id": f"MOCK_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "slot": slot,
                "lead": lead_data.get("name"),
                "link": self.booking_link
            }

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{CAL_API_BASE}/bookings",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "eventTypeId": self.event_type_id,
                    "start": slot,
                    "responses": {
                        "name": lead_data.get("name", ""),
                        "email": lead_data.get("email", ""),
                        "notes": lead_data.get("notes", "")
                    }
                }
            )
            return resp.json()


class MeetingPreparationService:
    """AI-powered meeting preparation package."""

    def __init__(self):
        self.groq = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))

    async def prepare_meeting_package(self, meeting_data: dict) -> dict:
        """Generate complete meeting preparation package."""

        company = meeting_data.get("company_name", "")
        contact = meeting_data.get("contact_name", "")
        meeting_time = meeting_data.get("meeting_time", "")
        research = meeting_data.get("company_research", {})
        qualification = meeting_data.get("qualification", {})

        # Generate talking points
        talking_points = await self._generate_talking_points(company, contact, research, qualification)

        # Generate company cheat sheet
        cheat_sheet = await self._generate_cheat_sheet(company, research)

        # Generate slide deck outline
        slides = await self._generate_slide_outline(company, research)

        return {
            "meeting_code": f"DLX-{datetime.now().strftime('%Y%m%d-%H%M')}",
            "company": company,
            "contact": contact,
            "meeting_time": meeting_time,
            "preparation_package": {
                "talking_points": talking_points,
                "company_cheat_sheet": cheat_sheet,
                "slide_deck": slides,
                "success_criteria": "حجز تجربة مجانية أو اتفاق مبدئي",
                "time_allocation": {
                    "minutes_0_5": "بناء علاقة + سؤال افتتاحي",
                    "minutes_5_15": "تشخيص التحدي + العرض المخصص",
                    "minutes_15_20": "التوصية + الخطوة التالية"
                }
            },
            "generated_at": datetime.utcnow().isoformat()
        }

    async def _generate_talking_points(self, company: str, contact: str, research: dict, qualification: dict) -> list:
        prompt = f"""اصنع 5 نقاط حوار ذكية لاجتماع مع {contact} من {company}.

تحديات الشركة: {json.dumps(research.get('business_challenges', []), ensure_ascii=False)}
نقاط القوة للاستخدام: {json.dumps(qualification.get('talking_points', []), ensure_ascii=False)}

قدّم JSON:
{{"talking_points": [{{"point": "...", "purpose": "...", "follow_up_question": "..."}}]}}"""

        response = await self.groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content).get("talking_points", [])

    async def _generate_cheat_sheet(self, company: str, research: dict) -> dict:
        return {
            "company": company,
            "industry": research.get("company_profile", {}).get("industry", ""),
            "size": research.get("company_profile", {}).get("size", ""),
            "key_pain": research.get("business_challenges", [""])[0] if research.get("business_challenges") else "",
            "best_pitch": research.get("recommended_pitch", ""),
            "avoid": "تجنب الحديث عن المنافسين مباشرة",
            "wow_stat": "شركات مشابهة حققت 40% زيادة في المبيعات مع ديليكس"
        }

    async def _generate_slide_outline(self, company: str, research: dict) -> list:
        return [
            {"slide": 1, "title": "افتتاحية", "content": f"شكراً {company} — أهلاً وسهلاً"},
            {"slide": 2, "title": "ما سمعناه عن تحدياتكم", "content": research.get("business_challenges", [""])[0]},
            {"slide": 3, "title": "كيف يحل ديليكس هذا", "content": "أتمتة كاملة + ذكاء اصطناعي متخصص"},
            {"slide": 4, "title": "نتائج حقيقية", "content": "40% زيادة في الإيجابات + 60% توفير في الوقت"},
            {"slide": 5, "title": "الخطوة التالية", "content": "تجربة مجانية 14 يوم — البداية اليوم"}
        ]


class SalesTeamNotificationService:
    """Instant sales team notifications for every meeting booked."""

    def __init__(self):
        self.whatsapp_group = os.getenv("SALES_TEAM_WHATSAPP", "")
        self.slack_webhook = os.getenv("SALES_SLACK_WEBHOOK", "")

    async def notify_meeting_booked(self, lead_data: dict, meeting_package: dict) -> dict:
        """Send instant notification to sales team."""
        company = lead_data.get("company_name", "")
        contact = lead_data.get("contact_name", "")
        score = lead_data.get("score", 0)
        meeting_time = lead_data.get("meeting_time", "TBD")

        notification = f"""🚨 *اجتماع جديد محجوز!* 🔥

👤 *العميل:* {contact}
🏢 *الشركة:* {company}
⭐ *درجة التأهيل:* {score}/100
📅 *الموعد:* {meeting_time}

💡 *أهم نقطة:* {lead_data.get('key_insight', 'تحقق من ملف التحضير')}

📊 ملف التحضير: تم إنشاؤه تلقائياً ✅
📧 عرض ديليكس: جاهز ✅

*استعد — هذا عميل ساخن!* 🎯"""

        results = {"notification_sent": False, "channels": []}

        # Slack notification
        if self.slack_webhook:
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(self.slack_webhook, json={"text": notification})
                results["channels"].append("slack")
            except Exception as e:
                logger.error(f"Slack notification failed: {e}")

        # Log to system (always works)
        logger.info(f"📬 Meeting notification: {company} - {meeting_time}")
        results["notification_sent"] = True
        results["message"] = notification
        results["timestamp"] = datetime.utcnow().isoformat()

        return results
