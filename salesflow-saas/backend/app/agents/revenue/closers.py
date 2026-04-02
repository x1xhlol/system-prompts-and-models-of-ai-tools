"""
Layer 5: Revenue Agents — Closer + Pricing + Market Intel
==========================================================
"""
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List
from app.agents.base_agent import BaseAgent, AgentPriority

logger = logging.getLogger("dealix.agents.revenue")


class CloserAgent(BaseAgent):
    """وكيل الإغلاق — العقل التجاري الذي يغلق الصفقات."""

    OBJECTION_PLAYBOOK = {
        "expensive": "أفهمك تماماً. بس خلني أوريك: لو Dealix جابلك بس 3 عملاء زيادة الشهر، كم راح يكون العائد؟ يعني استثمارك يرجع لك أضعاف.",
        "not_now": "أقدر أفهم جدولك. وش رأيك نحجز 15 دقيقة الأسبوع الجاي؟ مجرد عرض سريع ونشوف إذا يناسبكم.",
        "have_solution": "ممتاز إنكم تستخدمون حل! السؤال: هل يكتشف لكم عملاء جدد ويتواصل معهم تلقائياً؟ Dealix يكمل أي نظام عندكم.",
        "need_approval": "طبعاً، القرار يحتاج موافقة. وش رأيك أجهّز لك عرض PDF يساعدك تقنع الإدارة؟",
        "too_complex": "بالعكس! النظام يشتغل لحاله 100%. أنت بس حدد القطاع والمدينة، وخلّي Dealix يسوي الباقي.",
    }

    def __init__(self):
        super().__init__(name="closer_agent", name_ar="وكيل الإغلاق", layer=5,
                         description="إغلاق الصفقات بذكاء: تفاوض، معالجة اعتراضات، عروض أسعار")

    def get_capabilities(self) -> List[str]:
        return [
            "التفاوض الذكي (خصومات محسوبة)", "معالجة 5+ اعتراضات شائعة",
            "إنشاء عروض أسعار PDF", "Urgency creation", "إغلاق multi-channel",
            "متابعة ما بعد العرض", "تحليل أسباب الخسارة",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "close")
        if action == "handle_objection":
            return await self._handle_objection(task.get("objection", ""), task.get("lead", {}))
        elif action == "generate_proposal":
            return await self._generate_proposal(task.get("lead", {}))
        elif action == "closing_sequence":
            return await self._closing_sequence(task.get("lead", {}))
        elif action == "analyze_loss":
            return await self._analyze_loss(task.get("deal", {}))
        return {"error": "Unknown action"}

    async def _handle_objection(self, objection: str, lead: Dict) -> Dict:
        response = await self.think(f"""عميل سعودي اعترض بهذا:
"{objection}"

العميل: {lead.get('name', '')} — {lead.get('sector', '')}

رد عليه بطريقة احترافية سعودية تحلّ الاعتراض وتقرّبه من الشراء.
استخدم أسلوب CEO مباشر ومقنع. رد بـ 2-3 جمل فقط.""", task_type="objection_handling")
        return {"objection": objection, "response": response, "playbook_match": self._match_playbook(objection)}

    def _match_playbook(self, objection: str) -> str:
        for key, response in self.OBJECTION_PLAYBOOK.items():
            if key in objection.lower() or any(w in objection for w in ["غالي", "سعر", "ميزانية"]):
                return response
        return ""

    async def _generate_proposal(self, lead: Dict) -> Dict:
        proposal = await self.think(f"""أنشئ عرض سعر احترافي لهذا العميل:
الشركة: {lead.get('name', '')}
القطاع: {lead.get('sector', '')}
الحجم: {lead.get('company_size', '')}

أنشئ عرض يشمل:
1. ملخص تنفيذي
2. الحل المقترح
3. القيمة المضافة (ROI)
4. التسعير (3 خطط)
5. الخطوات التالية
6. ضمان الأداء

اكتب بالعربي المهني.""", task_type="proposal_generation")
        return {"proposal": proposal, "lead": lead.get("name", ""), "generated_at": datetime.now(timezone.utc).isoformat()}

    async def _closing_sequence(self, lead: Dict) -> Dict:
        return await self.think_json(f"""خطط تسلسل إغلاق لهذا العميل:
{json.dumps(lead, ensure_ascii=False, default=str)}
{{"steps": [{{"day": 0, "channel": "whatsapp", "action": "...", "message": "..."}}],
"urgency_trigger": "...", "discount_strategy": "...", "expected_close_days": 0}}""",
            task_type="closing_strategy")

    async def _analyze_loss(self, deal: Dict) -> Dict:
        return await self.think_json(f"""حلل لماذا خسرنا هذه الصفقة:
{json.dumps(deal, ensure_ascii=False, default=str)}
{{"primary_reason": "...", "secondary_reasons": ["..."], "was_preventable": true/false,
"lessons_learned": ["..."], "win_back_strategy": "...", "win_back_probability": 0-100}}""",
            task_type="loss_analysis")


class PricingAgent(BaseAgent):
    """وكيل التسعير الديناميكي — يحسب أفضل سعر لكل عميل."""

    PLANS = {
        "free": {"name_ar": "المجانية", "price_sar": 0, "messages": 50, "leads": 10},
        "professional": {"name_ar": "الاحترافية", "price_sar": 3000, "messages": 1000, "leads": 100},
        "enterprise": {"name_ar": "المؤسسات", "price_sar": 12000, "messages": -1, "leads": -1},
    }

    def __init__(self):
        super().__init__(name="pricing_agent", name_ar="وكيل التسعير", layer=5,
                         description="تسعير ذكي ديناميكي يحسب أفضل سعر لكل عميل")

    def get_capabilities(self) -> List[str]:
        return [
            "تسعير حسب حجم الشركة", "خصومات تلقائية", "حساب ROI المتوقع",
            "مقارنة مع المنافسين", "إنشاء packages مخصصة", "إدارة التجربة المجانية",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "recommend")
        if action == "recommend":
            return await self._recommend_plan(task.get("lead", {}))
        elif action == "calculate_roi":
            return await self._calculate_roi(task.get("lead", {}))
        elif action == "custom_package":
            return await self._create_custom_package(task.get("lead", {}))
        return {"plans": self.PLANS}

    async def _recommend_plan(self, lead: Dict) -> Dict:
        return await self.think_json(f"""وش أفضل خطة لهذا العميل:
{json.dumps(lead, ensure_ascii=False, default=str)}
الخطط: {json.dumps(self.PLANS, ensure_ascii=False)}
{{"recommended_plan": "...", "reason": "...", "custom_price_sar": 0,
"discount_percent": 0, "discount_reason": "...", "upsell_opportunity": "..."}}""",
            task_type="pricing")

    async def _calculate_roi(self, lead: Dict) -> Dict:
        return await self.think_json(f"""احسب ROI المتوقع لهذا العميل:
القطاع: {lead.get('sector', '')}، الحجم: {lead.get('company_size', '')}
{{"investment_sar": 0, "expected_revenue_increase_sar": 0, "roi_percent": 0,
"payback_period_months": 0, "new_leads_per_month": 0, "deals_per_month": 0}}""",
            task_type="roi_calculation")

    async def _create_custom_package(self, lead: Dict) -> Dict:
        return await self.think_json(f"""أنشئ باقة مخصصة لهذا العميل:
{json.dumps(lead, ensure_ascii=False, default=str)}
{{"package_name": "...", "price_sar": 0, "features": ["..."], "messages_limit": 0,
"leads_limit": 0, "ai_models_included": ["..."], "support_level": "...", "contract_months": 0}}""",
            task_type="custom_package")


class MarketIntelAgent(BaseAgent):
    """وكيل ذكاء السوق — يراقب المنافسين والاتجاهات."""

    def __init__(self):
        super().__init__(name="market_intel", name_ar="وكيل ذكاء السوق", layer=6,
                         description="مراقبة السوق السعودي والمنافسين واكتشاف الفرص")

    def get_capabilities(self) -> List[str]:
        return [
            "مراقبة أسعار المنافسين", "تحليل اتجاهات السوق",
            "اكتشاف قطاعات جديدة", "تتبع أخبار القطاعات",
            "تقارير تنافسية", "توقع حركة السوق",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "analyze")
        if action == "competitors":
            return await self._analyze_competitors(task.get("sector", ""))
        elif action == "trends":
            return await self._market_trends(task.get("sector", ""))
        elif action == "opportunities":
            return await self._find_opportunities()
        return await self._find_opportunities()

    async def _analyze_competitors(self, sector: str) -> Dict:
        return await self.think_json(f"""حلل المنافسين في قطاع: {sector or 'SaaS المبيعات'} بالسعودية
{{"competitors": [{{"name": "...", "strength": "...", "weakness": "...", "price_range": "...", "market_share": 0}}],
"our_advantage": "...", "threats": ["..."], "counter_strategy": "..."}}""", task_type="competitive_intel")

    async def _market_trends(self, sector: str) -> Dict:
        return await self.think_json(f"""حلل اتجاهات السوق السعودي لقطاع: {sector or 'B2B SaaS'}
{{"trends": [{{"trend": "...", "impact": "high/medium/low", "opportunity": "..."}}],
"growth_sectors": ["..."], "declining_sectors": ["..."], "recommendations": ["..."]}}""",
            task_type="market_analysis")

    async def _find_opportunities(self) -> Dict:
        return await self.think_json("""اكتشف فرص جديدة في السوق السعودي لنظام AI مبيعات:
{{"untapped_sectors": [{{"sector": "...", "potential_sar": 0, "competition": "low/medium/high", "entry_strategy": "..."}}],
"geographic_opportunities": ["..."], "partnership_opportunities": ["..."],
"timing_opportunities": ["..."]}}""", task_type="opportunity_discovery")
