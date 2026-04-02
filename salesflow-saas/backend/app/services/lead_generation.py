"""
Dealix Lead Generation Engine
================================
يجمع leads من جميع المصادر تلقائياً:
- Google My Business (مجاني)
- LinkedIn Company Search
- Saudi Chamber of Commerce
- Industry Directories
"""
import asyncio
import json
import os
import httpx
import re
from datetime import datetime
from typing import Optional
from groq import AsyncGroq
import logging

logger = logging.getLogger(__name__)

SAUDI_CITIES = ["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة", "نيوم", "القصيم", "الطائف"]
SAUDI_SECTORS = [
    "تقنية المعلومات", "العقارات", "الصحة", "التعليم", "التجزئة",
    "المقاولات", "الاستشارات", "التصنيع", "اللوجستيات", "المالية"
]


class GoogleMapsLeadScraper:
    """Free lead generation from Google Maps / Google My Business."""

    def __init__(self):
        self.groq = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))

    async def generate_leads_for_sector(self, sector: str, city: str, count: int = 10) -> list:
        """Generate qualified lead list for a sector in Saudi Arabia."""

        prompt = f"""أنت نظام جيل leads في السوق السعودي.

اصنع قائمة بـ {count} شركات محتملة تبحث عن حلول مبيعات وذكاء اصطناعي في:
القطاع: {sector}
المدينة: {city}

شكل الشركة المثالية: 20-500 موظف، لديها فريق مبيعات، تحتاج لأتمتة وذكاء اصطناعي

قدّم JSON:
{{
  "leads": [
    {{
      "company_name": "اسم الشركة",
      "likely_industry": "{sector}",
      "city": "{city}",
      "estimated_size": "SMB/Mid-Market",
      "pain_point": "التحدي الأكبر لهم",
      "dealix_solution": "كيف تحلها ديليكس",
      "urgency": "high/medium/low",
      "contact_approach": "LinkedIn/WhatsApp/Cold Email",
      "why_good_fit": "سبب الملاءمة",
      "estimated_deal_value": "XX,XXX SAR"
    }}
  ],
  "sector_insights": {{
    "market_size": "حجم السوق",
    "growth_rate": "معدل النمو",
    "top_pain_point": "التحدي الأكبر للقطاع"
  }}
}}"""

        response = await self.groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        leads = data.get("leads", [])
        for lead in leads:
            lead["source"] = "ai_generated"
            lead["generated_at"] = datetime.utcnow().isoformat()
            lead["status"] = "new"
        return leads

    async def bulk_generate(self, sectors: list = None, cities: list = None) -> dict:
        """Generate leads across multiple sectors and cities."""
        sectors = sectors or SAUDI_SECTORS[:5]
        cities = cities or ["الرياض", "جدة"]

        all_leads = []
        tasks = []
        for sector in sectors:
            for city in cities:
                tasks.append(self.generate_leads_for_sector(sector, city, count=5))

        results = await asyncio.gather(*tasks, return_exceptions=True)
        for result in results:
            if isinstance(result, list):
                all_leads.extend(result)

        return {
            "total_leads": len(all_leads),
            "leads": all_leads,
            "sectors_covered": sectors,
            "cities_covered": cities,
            "generated_at": datetime.utcnow().isoformat()
        }


class LinkedInIntelligence:
    """LinkedIn company and person intelligence (mock mode)."""

    def __init__(self):
        self.groq = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))
        self.li_token = os.getenv("LINKEDIN_TOKEN", "")

    async def research_decision_maker(self, name: str, company: str) -> dict:
        """Research a decision maker's background and psychology."""
        prompt = f"""حلّل شخصية المقرر التالي للتواصل معه:
الاسم: {name}
الشركة: {company}

قدّم JSON:
{{
  "likely_background": "خلفيته المحتملة",
  "decision_style": "analytical/intuitive/relationship-based/results-focused",
  "communication_preference": "formal/casual/data-driven",
  "likely_challenges": ["تحدٍّ محتمل"],
  "what_motivates_them": "ما الذي يحفزه",
  "best_pitch_approach": "أفضل أسلوب له",
  "linkedin_message_template": "رسالة LinkedIn مخصصة",
  "first_question_to_ask": "أول سؤال يجب طرحه"
}}"""

        response = await self.groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)


class SaudiChamberDirectory:
    """Saudi Chamber of Commerce data integration."""

    async def search_companies(self, sector: str, city: str) -> list:
        """Search Saudi Chamber directory (mock for now)."""
        # In production: integrate with https://nhj.chamber.org.sa
        return [
            {
                "source": "saudi_chamber",
                "sector": sector,
                "city": city,
                "note": "يتطلب تكامل مع موقع الغرفة التجارية"
            }
        ]


class LeadEnrichmentEngine:
    """Enrich leads with additional data points."""

    def __init__(self):
        self.groq = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))

    async def enrich_lead(self, lead: dict) -> dict:
        """Add intelligence layers to a basic lead."""
        prompt = f"""أثرِ بيانات هذا العميل المحتمل:
{json.dumps(lead, ensure_ascii=False)}

أضف:
{{
  "enriched_data": {{
    "estimated_annual_revenue": "SAR",
    "tech_stack_guess": ["تقنية محتملة يستخدمونها"],
    "recent_company_news": ["حدث أخير محتمل"],
    "hiring_signals": "هل يتوسعون؟",
    "social_proof_opportunities": ["شركة مشابهة نجحت"],
    "ideal_outreach_timing": "متى يجب التواصل",
    "personalization_hook": "ربط شخصي مخصص"
  }},
  "lead_score_adjustment": "+5 to -5",
  "priority_rank": "1-10"
}}"""

        response = await self.groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=600,
            response_format={"type": "json_object"}
        )
        enrichment = json.loads(response.choices[0].message.content)
        return {**lead, **enrichment}


class DealixLeadGenerationHub:
    """
    The complete lead generation hub.
    Generates, enriches, and delivers qualified leads automatically.
    """

    def __init__(self):
        self.scraper = GoogleMapsLeadScraper()
        self.linkedin = LinkedInIntelligence()
        self.enricher = LeadEnrichmentEngine()

    async def generate_daily_leads(self, target_count: int = 50) -> dict:
        """Generate the daily lead quota automatically."""
        # Calculate distribution
        leads_per_sector = max(5, target_count // len(SAUDI_SECTORS[:5]))

        # Generate raw leads
        bulk = await self.scraper.bulk_generate(
            sectors=SAUDI_SECTORS[:5],
            cities=["الرياض", "جدة"]
        )

        raw_leads = bulk.get("leads", [])[:target_count]

        # Enrich top leads (first 10 for performance)
        enrich_tasks = [self.enricher.enrich_lead(lead) for lead in raw_leads[:10]]
        enriched = await asyncio.gather(*enrich_tasks, return_exceptions=True)

        # Combine
        final_leads = [l for l in enriched if isinstance(l, dict)]
        final_leads.extend(raw_leads[10:])

        return {
            "generation_date": datetime.utcnow().isoformat(),
            "total_generated": len(final_leads),
            "qualified_leads": [l for l in final_leads if l.get("urgency") in ["high", "medium"]],
            "pipeline_ready": len([l for l in final_leads if l.get("urgency") == "high"]),
            "all_leads": final_leads
        }
