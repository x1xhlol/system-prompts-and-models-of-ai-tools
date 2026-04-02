"""
Layer 3: Qualification Agents
==============================
Lead Qualifier + Lead Scorer + Intent Detector
"""
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List
from app.agents.base_agent import BaseAgent, AgentPriority

logger = logging.getLogger("dealix.agents.qualification")


class LeadQualifierAgent(BaseAgent):
    """وكيل تأهيل العملاء — BANT + AI + سعودي."""

    def __init__(self):
        super().__init__(name="lead_qualifier", name_ar="وكيل التأهيل", layer=3,
                         description="تأهيل العملاء المحتملين بمعايير BANT والذكاء الاصطناعي")

    def get_capabilities(self) -> List[str]:
        return [
            "تأهيل BANT (Budget, Authority, Need, Timeline)",
            "تصنيف: HOT / WARM / NURTURE / DISQUALIFIED",
            "تحليل حجم الفرصة", "اقتراح الخطوة التالية",
            "إعادة تأهيل دورية", "تأهيل جماعي (batch)",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "qualify")
        if action == "qualify":
            return await self._qualify_lead(task.get("lead", {}))
        elif action == "batch_qualify":
            results = []
            for lead in task.get("leads", []):
                results.append(await self._qualify_lead(lead))
            return {"qualified": len(results), "results": results}
        elif action == "requalify_batch":
            return {"requalified": 0, "message": "No leads to requalify"}
        return {"error": "Unknown action"}

    async def _qualify_lead(self, lead: Dict) -> Dict:
        result = await self.think_json(f"""أهّل هذا العميل المحتمل:
الاسم: {lead.get('name', '')}
الشركة: {lead.get('company', lead.get('name', ''))}
القطاع: {lead.get('sector', '')}
الحجم: {lead.get('company_size', '')}
الردود: {lead.get('reply_count', 0)}
آخر رسالة: {lead.get('last_message', '')}

حلل بمعايير BANT:
{{"tier": "HOT/WARM/NURTURE/DISQUALIFIED", "budget_score": 0-25, "authority_score": 0-25,
"need_score": 0-25, "timeline_score": 0-25, "total_score": 0-100,
"deal_size_estimate_sar": 0, "next_action": "...", "reasoning": "...",
"confidence": 0-100}}""", task_type="lead_qualify")
        
        lead.update({"qualification": result, "qualified_at": datetime.now(timezone.utc).isoformat()})
        
        if result.get("tier") == "HOT":
            self.send_message("closer_agent", "hot_lead", {"lead": lead}, AgentPriority.CRITICAL)
        
        return lead


class LeadScorerAgent(BaseAgent):
    """وكيل تقييم العملاء — نقاط 0-100 لكل عميل."""

    SCORING_WEIGHTS = {
        "company_size": 20, "sector_fit": 15, "response_speed": 15,
        "interaction_count": 15, "question_quality": 15, "buying_signals": 20,
    }

    def __init__(self):
        super().__init__(name="lead_scorer", name_ar="وكيل التقييم", layer=3,
                         description="تقييم كل عميل محتمل بنقاط 0-100 بناء على عوامل متعددة")

    def get_capabilities(self) -> List[str]:
        return [
            "تقييم 0-100 لكل عميل", "6 عوامل تقييم بأوزان",
            "تحديث تلقائي عند كل تفاعل", "فرز حسب الأولوية",
            "كشف العملاء الأعلى قيمة", "تنبيه عند وصول عميل لـ 80+",
        ]

    async def execute(self, task: Dict) -> Dict:
        lead = task.get("lead", {})
        score = await self.think_json(f"""قيّم هذا العميل من 0-100:
{json.dumps(lead, ensure_ascii=False, default=str)}

العوامل والأوزان:
{json.dumps(self.SCORING_WEIGHTS, ensure_ascii=False)}

{{"total_score": 0-100, "company_size_score": 0-20, "sector_fit_score": 0-15,
"response_speed_score": 0-15, "interaction_score": 0-15, "question_quality_score": 0-15,
"buying_signals_score": 0-20, "priority": "urgent/high/medium/low"}}""", task_type="lead_scoring")
        
        lead["score"] = score.get("total_score", 50)
        lead["priority"] = score.get("priority", "medium")
        lead["scoring_details"] = score
        
        if lead["score"] >= 80:
            self.send_message("closer_agent", "high_score_lead", {"lead": lead, "score": lead["score"]}, AgentPriority.HIGH)
        
        return lead


class IntentDetectorAgent(BaseAgent):
    """وكيل كشف النوايا — يحلل رسائل العميل ويكشف نيته."""

    INTENTS = [
        "ready_to_buy", "comparing", "researching", "price_checking",
        "objecting", "requesting_demo", "scheduling", "not_interested",
        "spam", "support_needed", "referral",
    ]

    def __init__(self):
        super().__init__(name="intent_detector", name_ar="وكيل كشف النوايا", layer=3,
                         description="تحليل رسائل العميل وكشف نيته الحقيقية بالذكاء الاصطناعي")

    def get_capabilities(self) -> List[str]:
        return [
            "كشف 11 نوع نية", "تحليل لهجة سعودية", "كشف إشارات شراء",
            "كشف اعتراضات مخفية", "اقتراح أفضل رد", "تتبع تغيّر النية عبر الزمن",
        ]

    async def execute(self, task: Dict) -> Dict:
        message = task.get("message", "")
        context = task.get("context", {})
        
        result = await self.think_json(f"""حلل هذه الرسالة من عميل سعودي:

الرسالة: "{message}"
السياق: {json.dumps(context, ensure_ascii=False, default=str)}

النوايا المحتملة: {self.INTENTS}

{{"primary_intent": "...", "confidence": 0-100, "secondary_intent": "...",
"buying_signals": ["..."], "objections": ["..."], "sentiment": "positive/neutral/negative",
"urgency": "high/medium/low", "recommended_response_type": "...",
"recommended_response": "..."}}""", task_type="intent_detection")
        
        if result.get("primary_intent") == "ready_to_buy":
            self.send_message("closer_agent", "buyer_detected",
                {"message": message, "analysis": result}, AgentPriority.CRITICAL)
        
        return result
