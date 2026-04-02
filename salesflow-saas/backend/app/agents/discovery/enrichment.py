"""
Layer 2: Data Enricher + Company Researcher
=============================================
Deep intelligence for every company.
"""
import json
import logging
import os
from datetime import datetime, timezone
from typing import Dict, List
import httpx
from app.agents.base_agent import BaseAgent, AgentPriority

logger = logging.getLogger("dealix.agents.discovery")


class DataEnricherAgent(BaseAgent):
    """وكيل إثراء البيانات — يجمع معلومات عميقة عن كل شركة."""

    def __init__(self):
        super().__init__(name="data_enricher", name_ar="وكيل إثراء البيانات", layer=2,
                         description="إثراء بيانات الشركات بمعلومات تفصيلية من مصادر متعددة")

    def get_capabilities(self) -> List[str]:
        return [
            "حجم الشركة (صغيرة/متوسطة/كبيرة)", "عدد الموظفين التقريبي",
            "الموقع والسوشيال ميديا", "صنّاع القرار", "التقنيات المستخدمة",
            "أخبار الشركة الأخيرة", "تقييم Google + مراجعات",
            "هل عندهم واتساب بزنس", "الإيرادات التقديرية",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "enrich")
        if action == "enrich":
            return await self._enrich_company(task.get("company", {}))
        elif action == "batch_enrich":
            results = []
            for company in task.get("companies", []):
                results.append(await self._enrich_company(company))
            return {"enriched": len(results), "results": results}
        return {"error": "Unknown action"}

    async def _enrich_company(self, company: Dict) -> Dict:
        enrichment = await self.think_json(f"""أثري بيانات هذه الشركة السعودية:
الاسم: {company.get('name', '')}
القطاع: {company.get('sector', '')}
المدينة: {company.get('city', '')}

أعطني كل المعلومات المتاحة:
{{"company_size": "صغيرة/متوسطة/كبيرة", "employees_estimate": 0, "revenue_estimate_sar": "",
"website": "", "linkedin": "", "twitter": "", "instagram": "",
"decision_makers": [{{"name": "...", "title": "...", "email_pattern": ""}}],
"tech_stack": ["..."], "pain_points": ["..."], "competitors": ["..."],
"has_whatsapp_business": true/false, "google_rating": 0, "recent_news": ["..."],
"growth_signals": ["..."], "buying_readiness": 0}}""", task_type="enrichment")
        
        company.update(enrichment)
        company["enriched"] = True
        company["enriched_at"] = datetime.now(timezone.utc).isoformat()
        return company


class CompanyResearcherAgent(BaseAgent):
    """وكيل بحث الشركات — بحث عميق عن أي شركة قبل التواصل."""

    DEPTH_LEVELS = {"quick": 30, "deep": 120, "full": 300}  # seconds

    def __init__(self):
        super().__init__(name="company_researcher", name_ar="وكيل البحث العميق", layer=2,
                         description="بحث عميق ومتعدد المصادر عن أي شركة مستهدفة")

    def get_capabilities(self) -> List[str]:
        return [
            "بحث سريع (30 ثانية): اسم + هاتف + قطاع",
            "بحث عميق (2 دقيقة): + حجم + منافسين + فرص",
            "بحث كامل (5 دقائق): + أخبار + مالية + صنّاع قرار",
            "تحليل SWOT مختصر", "تحليل فرص البيع", "اقتراح طريقة التواصل المثلى",
        ]

    async def execute(self, task: Dict) -> Dict:
        depth = task.get("depth", "deep")
        company = task.get("company", task.get("name", ""))
        
        result = await self.think_json(f"""ابحث بعمق عن هذه الشركة:
الاسم: {company if isinstance(company, str) else company.get('name', '')}
مستوى البحث: {depth}

أعطني تقرير بحثي:
{{"overview": "...", "industry": "...", "size": "...", "strengths": ["..."],
"weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."],
"sales_approach": "...", "key_contacts": [{{"name": "...", "role": "..."}}],
"deal_size_estimate_sar": 0, "closing_probability": 0, "recommended_channel": "whatsapp/email/call",
"personalized_pitch": "...", "research_confidence": 0}}""", task_type="research")
        
        return {"company": company, "depth": depth, "research": result,
                "researched_at": datetime.now(timezone.utc).isoformat()}
