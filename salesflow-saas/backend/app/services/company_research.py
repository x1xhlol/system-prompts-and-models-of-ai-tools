"""
Dealix Company Research Engine
================================
يحلل أي شركة بعمق باستخدام الذكاء الاصطناعي
- تحليل الموقع الإلكتروني
- تحليل لينكدإن
- تقرير SWOT مخصص
- فرص البيع المثلى
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


class WebsiteAnalyzer:
    """Extract and analyze company information from their website."""

    async def fetch_content(self, url: str) -> str:
        """Fetch website content safely."""
        if not url:
            return ""
        if not url.startswith("http"):
            url = f"https://{url}"
        try:
            async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
                headers = {"User-Agent": "Mozilla/5.0 (compatible; DealixBot/1.0)"}
                resp = await client.get(url, headers=headers)
                text = resp.text
                # Clean HTML tags
                text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
                text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
                text = re.sub(r'<[^>]+>', ' ', text)
                text = re.sub(r'\s+', ' ', text).strip()
                return text[:3000]  # First 3000 chars
        except Exception as e:
            logger.warning(f"Could not fetch {url}: {e}")
            return ""


class DeepCompanyAnalyzer:
    """
    AI-powered deep company analysis.
    Knows everything about a company before the first call.
    """

    def __init__(self, groq_api_key: str):
        self.groq = AsyncGroq(api_key=groq_api_key)
        self.web = WebsiteAnalyzer()

    async def analyze(self, company_name: str, website: str = None, extra_info: str = "") -> dict:
        """Run complete company analysis."""

        # Try to get website content
        web_content = ""
        if website:
            web_content = await self.web.fetch_content(website)

        context = f"""
شركة: {company_name}
الموقع: {website or 'غير معروف'}
محتوى الموقع: {web_content[:1000] if web_content else 'لم يتمكن من الوصول'}
معلومات إضافية: {extra_info}
        """

        prompt = f"""أنت محلل أعمال متخصص في السوق السعودي.

حلّل هذه الشركة بعمق:
{context}

قدّم تقريراً شاملاً:
{{
  "company_profile": {{
    "industry": "القطاع",
    "sub_industry": "القطاع الفرعي",
    "size_estimate": "SMB (1-50) / Mid-Market (51-500) / Enterprise (500+)",
    "market_position": "leader/challenger/follower/niche",
    "digital_maturity": "low/medium/high",
    "saudi_vision_alignment": "كيف ترتبط بالرؤية 2030"
  }},
  "business_intelligence": {{
    "revenue_estimate": "تقدير الإيراد السنوي بالريال",
    "growth_stage": "startup/growth/mature/declining",
    "key_products_services": ["منتج/خدمة رئيسية"],
    "target_market": "السوق المستهدف",
    "competitive_landscape": "المنافسون المحتملون"
  }},
  "pain_points_analysis": {{
    "confirmed_challenges": ["تحدٍّ مؤكد بناءً على المعلومات"],
    "assumed_challenges": ["تحدٍّ متوقع للشركات المشابهة"],
    "technology_gaps": ["فجوة تقنية محتملة"],
    "sales_productivity_issues": ["مشكلة في إنتاجية المبيعات"]
  }},
  "dealix_fit_analysis": {{
    "fit_score": 85,
    "primary_value_proposition": "أقوى سبب لاستخدام ديليكس",
    "roi_estimate": "العائد المتوقع خلال 6 أشهر",
    "implementation_complexity": "low/medium/high",
    "decision_timeline": "قصير (1 شهر) / متوسط (3 أشهر) / طويل (6+ شهر)"
  }},
  "swot_analysis": {{
    "strengths": ["نقطة قوة"],
    "weaknesses": ["نقطة ضعف (فرصة لديليكس)"],
    "opportunities": ["فرصة في السوق"],
    "threats": ["تهديد / خطر"]
  }},
  "personalization_insights": {{
    "conversation_starter": "أفضل سؤال افتتاحي لهذه الشركة",
    "avoid_topics": ["موضوع يجب تجنبه"],
    "cultural_notes": "ملاحظات ثقافية خاصة",
    "decision_maker_psychology": "كيف يفكر المقرر في هذه الشركة"
  }},
  "action_plan": {{
    "week_1": "الإجراء الأول",
    "month_1": "الهدف الأول",
    "success_metrics": ["مقياس نجاح"]
  }},
  "confidence_score": 78,
  "data_quality": "high/medium/low",
  "analysis_timestamp": null
}}"""

        response = await self.groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        result["analysis_timestamp"] = datetime.utcnow().isoformat()
        result["company_name"] = company_name
        result["website"] = website
        return result

    async def batch_analyze(self, companies: list) -> list:
        """Analyze multiple companies in parallel."""
        tasks = [
            self.analyze(c.get("name", ""), c.get("website"), c.get("extra", ""))
            for c in companies
        ]
        return await asyncio.gather(*tasks, return_exceptions=True)

    async def compare_companies(self, company_a: str, company_b: str) -> dict:
        """Compare two companies for competitive intelligence."""
        [a, b] = await asyncio.gather(
            self.analyze(company_a),
            self.analyze(company_b)
        )

        prompt = f"""قارن بين هاتين الشركتين من منظور مبيعات ديليكس:

الشركة الأولى: {json.dumps(a, ensure_ascii=False)[:500]}
الشركة الثانية: {json.dumps(b, ensure_ascii=False)[:500]}

{{
  "winner": "أيها أولى بالتركيز",
  "rationale": "السبب",
  "approach_difference": "كيف يختلف النهج مع كل شركة",
  "combined_strategy": "هل يمكن استهدافهما معاً"
}}"""

        response = await self.groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        comparison = json.loads(response.choices[0].message.content)
        return {"company_a": a, "company_b": b, "comparison": comparison}
