"""
Layer 1: Infrastructure Agents
================================
CRM, Analytics, Reports, Security, Scheduler — Foundation layer.
"""
import asyncio
import json
import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
from app.agents.base_agent import BaseAgent, AgentPriority

logger = logging.getLogger("dealix.agents.infrastructure")


# ══════════════════════════════════════════════════════
# CRM Agent — Full Pipeline Management
# ══════════════════════════════════════════════════════

class CRMAgent(BaseAgent):
    """
    إدارة علاقات العملاء الكاملة — مثل HubSpot CRM.
    يدير Pipeline stages + contacts + companies + activities.
    """
    
    PIPELINE_STAGES = [
        {"id": "new", "name_ar": "جديد", "name_en": "New", "order": 1, "probability": 10},
        {"id": "contacted", "name_ar": "تم التواصل", "name_en": "Contacted", "order": 2, "probability": 20},
        {"id": "qualified", "name_ar": "مؤهل", "name_en": "Qualified", "order": 3, "probability": 40},
        {"id": "meeting", "name_ar": "اجتماع", "name_en": "Meeting", "order": 4, "probability": 60},
        {"id": "proposal", "name_ar": "عرض سعر", "name_en": "Proposal", "order": 5, "probability": 75},
        {"id": "negotiation", "name_ar": "تفاوض", "name_en": "Negotiation", "order": 6, "probability": 85},
        {"id": "closed_won", "name_ar": "مغلقة — ربح", "name_en": "Closed Won", "order": 7, "probability": 100},
        {"id": "closed_lost", "name_ar": "مغلقة — خسارة", "name_en": "Closed Lost", "order": 8, "probability": 0},
    ]

    def __init__(self):
        super().__init__(name="crm_agent", name_ar="وكيل إدارة العلاقات", layer=1,
                         description="إدارة خط الإنتاج البيعي وبيانات العملاء والشركات")
        self.deals: Dict[str, Dict] = {}
        self.contacts: Dict[str, Dict] = {}
        self.activities: List[Dict] = []

    def get_capabilities(self) -> List[str]:
        return [
            "إدارة Pipeline كامل (8 مراحل)", "إنشاء وتحديث الصفقات",
            "تتبع كل تفاعل", "إدارة جهات الاتصال والشركات",
            "بحث ذكي", "تصدير/استيراد CSV", "ربط مع HubSpot/Salesforce",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "status")
        if action == "create_deal":
            return self._create_deal(task)
        elif action == "update_stage":
            return self._update_deal_stage(task.get("deal_id", ""), task.get("stage", ""))
        elif action == "add_contact":
            return self._add_contact(task)
        elif action == "log_activity":
            return self._log_activity(task)
        elif action == "pipeline_view":
            return self._get_pipeline_view()
        elif action == "search":
            return self._search(task.get("query", ""))
        return self._get_pipeline_view()

    def _create_deal(self, data: Dict) -> Dict:
        deal_id = f"deal_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
        deal = {
            "id": deal_id, "company": data.get("company", ""),
            "contact": data.get("contact", ""), "value": data.get("value", 0),
            "stage": "new", "sector": data.get("sector", ""),
            "city": data.get("city", ""), "source": data.get("source", "ai"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "history": [{"stage": "new", "at": datetime.now(timezone.utc).isoformat()}],
        }
        self.deals[deal_id] = deal
        return {"status": "created", "deal": deal}

    def _update_deal_stage(self, deal_id: str, stage: str) -> Dict:
        deal = self.deals.get(deal_id)
        if not deal:
            return {"error": "Deal not found"}
        deal["stage"] = stage
        deal["updated_at"] = datetime.now(timezone.utc).isoformat()
        deal["history"].append({"stage": stage, "at": datetime.now(timezone.utc).isoformat()})
        return {"status": "updated", "deal": deal}

    def _add_contact(self, data: Dict) -> Dict:
        phone = data.get("phone", "")
        self.contacts[phone] = {
            "name": data.get("name", ""), "phone": phone,
            "email": data.get("email", ""), "company": data.get("company", ""),
            "title": data.get("title", ""), "city": data.get("city", ""),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        return {"status": "added", "contact": self.contacts[phone]}

    def _log_activity(self, data: Dict) -> Dict:
        activity = {
            "type": data.get("type", "note"), "deal_id": data.get("deal_id", ""),
            "contact": data.get("contact", ""), "description": data.get("description", ""),
            "channel": data.get("channel", "system"),
            "at": datetime.now(timezone.utc).isoformat(),
        }
        self.activities.append(activity)
        return {"status": "logged", "activity": activity}

    def _get_pipeline_view(self) -> Dict:
        stages = {}
        for s in self.PIPELINE_STAGES:
            stage_deals = [d for d in self.deals.values() if d["stage"] == s["id"]]
            stages[s["id"]] = {
                "name_ar": s["name_ar"], "count": len(stage_deals),
                "value": sum(d.get("value", 0) for d in stage_deals),
                "deals": stage_deals,
            }
        return {"pipeline": stages, "total_deals": len(self.deals),
                "total_value": sum(d.get("value", 0) for d in self.deals.values())}

    def _search(self, query: str) -> Dict:
        results = [d for d in self.deals.values() if query.lower() in json.dumps(d, ensure_ascii=False).lower()]
        contacts = [c for c in self.contacts.values() if query.lower() in json.dumps(c, ensure_ascii=False).lower()]
        return {"deals": results, "contacts": contacts}


# ══════════════════════════════════════════════════════
# Analytics Agent — Performance Intelligence
# ══════════════════════════════════════════════════════

class AnalyticsAgent(BaseAgent):
    """وكيل تحليلات الأداء — يحلل كل شيء ويقدّم الرؤى."""

    def __init__(self):
        super().__init__(name="analytics_agent", name_ar="وكيل التحليلات", layer=1,
                         description="تحليل أداء المبيعات والحملات وتقديم رؤى ذكية")

    def get_capabilities(self) -> List[str]:
        return [
            "تحليل معدل التحويل (funnel analysis)", "أداء كل قناة",
            "ROI لكل حملة", "سرعة البيع (velocity)", "مقارنة الفترات",
            "تنبيهات انخفاض الأداء", "KPI dashboard بيانات حية",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "analyze")
        if action == "funnel":
            return await self._funnel_analysis(task.get("data", {}))
        elif action == "channel_performance":
            return await self._channel_performance(task.get("data", {}))
        elif action == "kpis":
            return await self._calculate_kpis(task.get("data", {}))
        return await self._calculate_kpis(task.get("data", {}))

    async def _funnel_analysis(self, data: Dict) -> Dict:
        return await self.think_json(f"""حلل قمع المبيعات:\n{json.dumps(data, ensure_ascii=False, default=str)}\n
أعطني: {{"stages": [{{"name": "...", "count": 0, "conversion_rate": 0}}], "bottleneck": "...", "recommendations": ["..."]}}""", task_type="analytics")

    async def _channel_performance(self, data: Dict) -> Dict:
        return await self.think_json(f"""حلل أداء القنوات:\n{json.dumps(data, ensure_ascii=False, default=str)}\n
{{"channels": [{{"name": "whatsapp", "sent": 0, "replies": 0, "conversion": 0}}], "best_channel": "...", "recommendations": ["..."]}}""", task_type="analytics")

    async def _calculate_kpis(self, data: Dict) -> Dict:
        return {
            "kpis": {
                "total_leads": data.get("total_leads", 0),
                "qualified_rate": f"{data.get('qualified', 0) / max(data.get('total_leads', 1), 1) * 100:.1f}%",
                "meeting_rate": f"{data.get('meetings', 0) / max(data.get('qualified', 1), 1) * 100:.1f}%",
                "close_rate": f"{data.get('closed', 0) / max(data.get('meetings', 1), 1) * 100:.1f}%",
                "avg_deal_value": data.get("avg_deal", 0),
                "sales_velocity_days": data.get("avg_cycle", 0),
                "pipeline_value": data.get("pipeline_value", 0),
            },
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }


# ══════════════════════════════════════════════════════
# Report Agent — Automated Reports
# ══════════════════════════════════════════════════════

class ReportAgent(BaseAgent):
    """وكيل التقارير — ينشئ تقارير يومية/أسبوعية/شهرية ذاتياً."""

    def __init__(self):
        super().__init__(name="report_agent", name_ar="وكيل التقارير", layer=1,
                         description="إنشاء تقارير فورية ودورية وإرسالها تلقائياً")

    def get_capabilities(self) -> List[str]:
        return [
            "تقرير يومي على واتساب", "تقرير أسبوعي PDF", "تقرير شهري CEO",
            "تنبيهات فورية (HOT lead, صفقة)", "لوحة بيانات حية",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "daily")
        report = await self.think(
            f"""أنشئ تقرير {action} للمبيعات يشمل:\n1. ملخص تنفيذي\n2. الأرقام الرئيسية\n3. أهم الأحداث\n4. التوصيات\n
البيانات: {json.dumps(task.get('data', {}), ensure_ascii=False, default=str)}\n
اكتب بالعربي, مختصر ومفيد.""", task_type="reporting")
        return {"report": report, "type": action, "generated_at": datetime.now(timezone.utc).isoformat()}


# ══════════════════════════════════════════════════════
# Security Agent — Data Protection & Compliance  
# ══════════════════════════════════════════════════════

class SecurityAgent(BaseAgent):
    """وكيل الأمان — حماية البيانات والامتثال لـ PDPL."""

    def __init__(self):
        super().__init__(name="security_agent", name_ar="وكيل الأمان", layer=1,
                         description="حماية بيانات العملاء والامتثال لنظام حماية البيانات الشخصية")
        self.audit_log: List[Dict] = []

    def get_capabilities(self) -> List[str]:
        return [
            "تسجيل كل عملية (audit log)", "الامتثال لـ PDPL السعودي",
            "مراقبة محاولات الوصول", "تشفير البيانات الحساسة",
            "نسخ احتياطي تلقائي", "تقرير أمان دوري",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "audit")
        if action == "log":
            return self._log_event(task)
        elif action == "check_compliance":
            return await self._check_pdpl_compliance(task.get("data", {}))
        elif action == "audit_report":
            return {"audit_entries": len(self.audit_log), "last_10": self.audit_log[-10:]}
        return {"status": "security_active", "audit_entries": len(self.audit_log)}

    def _log_event(self, data: Dict) -> Dict:
        entry = {"event": data.get("event", ""), "user": data.get("user", "system"),
                 "ip": data.get("ip", ""), "details": data.get("details", ""),
                 "at": datetime.now(timezone.utc).isoformat()}
        self.audit_log.append(entry)
        return {"logged": True}

    async def _check_pdpl_compliance(self, data: Dict) -> Dict:
        return await self.think_json(f"""تحقق من الامتثال لنظام حماية البيانات الشخصية PDPL:
{json.dumps(data, ensure_ascii=False, default=str)}
{{"compliant": true/false, "issues": ["..."], "recommendations": ["..."], "risk_level": "low/medium/high"}}""",
            task_type="compliance")


# ══════════════════════════════════════════════════════
# Scheduler Agent — Smart Task & Meeting Scheduling
# ══════════════════════════════════════════════════════

class SchedulerAgent(BaseAgent):
    """وكيل الجدولة — يجدول المهام والاجتماعات والمتابعات ذاتياً."""

    SAUDI_BUSINESS_HOURS = {"start": 8, "end": 17, "days": [0, 1, 2, 3, 6]}  # Sun-Thu

    def __init__(self):
        super().__init__(name="scheduler_agent", name_ar="وكيل الجدولة", layer=1,
                         description="جدولة المتابعات والاجتماعات والمهام الدورية ذاتياً")
        self.scheduled_tasks: List[Dict] = []
        self.meetings: List[Dict] = []

    def get_capabilities(self) -> List[str]:
        return [
            "جدولة متابعات ذكية (حسب tier)", "حجز اجتماعات تلقائي (Calendly-style)",
            "تذكيرات قبل الاجتماع", "إعادة جدولة ذكية",
            "Cron jobs للحملات", "مراعاة أوقات العمل السعودية",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "schedule")
        if action == "schedule_followup":
            return self._schedule_followup(task)
        elif action == "book_meeting":
            return self._book_meeting(task)
        elif action == "get_agenda":
            return self._get_today_agenda()
        elif action == "available_slots":
            return self._get_available_slots(task.get("date", ""))
        return self._get_today_agenda()

    def _schedule_followup(self, data: Dict) -> Dict:
        tier = data.get("tier", "WARM")
        delays = {"HOT": 1, "WARM": 3, "NURTURE": 7}
        delay_days = delays.get(tier, 3)
        scheduled_for = datetime.now(timezone.utc) + timedelta(days=delay_days)
        task_entry = {
            "type": "followup", "lead": data.get("lead", ""), "tier": tier,
            "scheduled_for": scheduled_for.isoformat(), "channel": data.get("channel", "whatsapp"),
            "status": "pending", "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.scheduled_tasks.append(task_entry)
        return {"scheduled": True, "task": task_entry}

    def _book_meeting(self, data: Dict) -> Dict:
        meeting = {
            "id": f"mtg_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            "lead": data.get("lead", ""), "company": data.get("company", ""),
            "datetime": data.get("datetime", ""), "duration": data.get("duration", 30),
            "type": data.get("type", "demo"), "notes": data.get("notes", ""),
            "status": "confirmed", "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.meetings.append(meeting)
        return {"booked": True, "meeting": meeting}

    def _get_today_agenda(self) -> Dict:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        today_tasks = [t for t in self.scheduled_tasks if t.get("scheduled_for", "").startswith(today)]
        today_meetings = [m for m in self.meetings if m.get("datetime", "").startswith(today)]
        return {"date": today, "tasks": today_tasks, "meetings": today_meetings}

    def _get_available_slots(self, date: str) -> Dict:
        slots = []
        for hour in range(self.SAUDI_BUSINESS_HOURS["start"], self.SAUDI_BUSINESS_HOURS["end"]):
            slots.append(f"{date}T{hour:02d}:00:00+03:00")
            slots.append(f"{date}T{hour:02d}:30:00+03:00")
        booked = [m["datetime"] for m in self.meetings]
        available = [s for s in slots if s not in booked]
        return {"date": date, "available_slots": available, "total": len(available)}
