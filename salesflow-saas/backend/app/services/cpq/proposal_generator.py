"""
Dealix AI Proposal Generator
توليد عروض تجارية ذكية بالعربية والإنجليزية باستخدام الذكاء الاصطناعي
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field

from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.cpq.proposal")

SECTION_DEFINITIONS = {
    "executive_summary": {
        "title_ar": "الملخص التنفيذي",
        "title_en": "Executive Summary",
        "prompt_hint": "Write a concise executive summary for the proposal.",
    },
    "solution_overview": {
        "title_ar": "نظرة عامة على الحل",
        "title_en": "Solution Overview",
        "prompt_hint": "Describe the proposed solution and its key components.",
    },
    "pricing": {
        "title_ar": "التسعير",
        "title_en": "Pricing",
        "prompt_hint": "Present the pricing breakdown and value proposition.",
    },
    "timeline": {
        "title_ar": "الجدول الزمني",
        "title_en": "Timeline",
        "prompt_hint": "Outline the implementation or delivery timeline.",
    },
    "terms": {
        "title_ar": "الشروط والأحكام",
        "title_en": "Terms & Conditions",
        "prompt_hint": "State the terms, conditions, and warranty details.",
    },
}

INDUSTRY_CONTEXT = {
    "real_estate": "عقارات — بيع أو تأجير وحدات سكنية أو تجارية في المملكة العربية السعودية",
    "healthcare": "رعاية صحية — خدمات طبية وعلاجية في عيادات ومراكز صحية سعودية",
    "services": "خدمات — استشارات أو خدمات مهنية متنوعة للشركات السعودية",
    "contracting": "مقاولات — أعمال بناء أو صيانة أو تشطيبات في المملكة",
    "retail": "تجارة وريتيل — بيع بالتجزئة أو تجارة إلكترونية في السوق السعودي",
    "education": "تعليم وتدريب — برامج تعليمية أو دورات تدريبية في المملكة",
}


class ProposalInput(BaseModel):
    deal_title: str
    client_name: str
    client_company: str = ""
    industry: str = "services"
    deal_value: float = 0.0
    currency: str = "SAR"
    requirements: str = ""
    language: str = Field(default="ar", pattern=r"^(ar|en|both)$")
    extra_context: str = ""


class ProposalSection(BaseModel):
    key: str
    title_ar: str
    title_en: str
    content_ar: str = ""
    content_en: str = ""


class ProposalOutput(BaseModel):
    sections: list[ProposalSection]
    language: str
    industry: str
    generated_at: str
    metadata: dict = {}


class ProposalGenerator:
    """AI-powered proposal generation using LLM with Arabic/English support."""

    def __init__(self):
        self.llm = get_llm()

    async def generate_proposal(self, data: ProposalInput) -> ProposalOutput:
        """Generate a full proposal with all sections using AI."""
        industry_ctx = INDUSTRY_CONTEXT.get(data.industry, INDUSTRY_CONTEXT["services"])
        sections: list[ProposalSection] = []

        for key, defn in SECTION_DEFINITIONS.items():
            section = await self._generate_section(
                section_key=key,
                section_def=defn,
                data=data,
                industry_ctx=industry_ctx,
            )
            sections.append(section)

        logger.info(
            "Proposal generated for '%s' — %d sections, lang=%s",
            data.deal_title, len(sections), data.language,
        )
        return ProposalOutput(
            sections=sections,
            language=data.language,
            industry=data.industry,
            generated_at=datetime.now(timezone.utc).isoformat(),
            metadata={
                "client": data.client_name,
                "company": data.client_company,
                "deal_value": data.deal_value,
                "currency": data.currency,
            },
        )

    async def customize_section(
        self,
        section_key: str,
        custom_instructions: str,
        data: ProposalInput,
    ) -> ProposalSection:
        """Re-generate a single section with custom instructions."""
        defn = SECTION_DEFINITIONS.get(section_key)
        if not defn:
            raise ValueError(f"Unknown section: {section_key}")

        industry_ctx = INDUSTRY_CONTEXT.get(data.industry, INDUSTRY_CONTEXT["services"])
        return await self._generate_section(
            section_key=section_key,
            section_def=defn,
            data=data,
            industry_ctx=industry_ctx,
            custom_instructions=custom_instructions,
        )

    async def export_pdf_data(self, proposal: ProposalOutput, company_branding: Optional[dict] = None) -> dict:
        """Prepare structured data ready for PDF rendering."""
        branding = company_branding or {
            "company_name_ar": "شركتكم",
            "company_name_en": "Your Company",
            "logo_url": "",
            "primary_color": "#1a5276",
            "secondary_color": "#2ecc71",
        }
        return {
            "branding": branding,
            "title_ar": "عرض تجاري",
            "title_en": "Commercial Proposal",
            "generated_at": proposal.generated_at,
            "metadata": proposal.metadata,
            "sections": [s.model_dump() for s in proposal.sections],
            "footer_ar": "تم إنشاء هذا العرض بواسطة ديليكس — نظام ذكاء المبيعات",
            "footer_en": "Generated by Dealix — AI Sales Intelligence",
            "direction": "rtl" if proposal.language in ("ar", "both") else "ltr",
        }

    # ── Internal ────────────────────────────────────

    async def _generate_section(
        self,
        section_key: str,
        section_def: dict,
        data: ProposalInput,
        industry_ctx: str,
        custom_instructions: str = "",
    ) -> ProposalSection:
        system_prompt = (
            "أنت كاتب عروض تجارية محترف متخصص في السوق السعودي.\n"
            "اكتب بأسلوب مهني ومقنع. لا تستخدم رموز تعبيرية.\n"
            "إذا طُلب منك الكتابة بالعربية، استخدم العربية الفصحى الرسمية.\n"
            f"القطاع: {industry_ctx}\n"
        )
        if custom_instructions:
            system_prompt += f"تعليمات إضافية: {custom_instructions}\n"

        user_msg = (
            f"اكتب قسم '{section_def['title_ar']}' لعرض تجاري.\n"
            f"العنوان: {data.deal_title}\n"
            f"العميل: {data.client_name} — {data.client_company}\n"
            f"القيمة: {data.deal_value} {data.currency}\n"
            f"المتطلبات: {data.requirements or 'غير محددة'}\n"
            f"{section_def['prompt_hint']}\n"
            f"سياق إضافي: {data.extra_context or 'لا يوجد'}\n"
        )

        content_ar = ""
        content_en = ""

        if data.language in ("ar", "both"):
            resp = await self.llm.complete(
                system_prompt=system_prompt + "اكتب بالعربية فقط. 3-5 فقرات مختصرة.",
                user_message=user_msg,
                temperature=0.5,
                max_tokens=500,
            )
            content_ar = resp.content.strip()

        if data.language in ("en", "both"):
            resp = await self.llm.complete(
                system_prompt=(
                    "You are a professional proposal writer for the Saudi market.\n"
                    "Write in formal business English. No emojis.\n"
                    f"Industry: {industry_ctx}\n"
                ),
                user_message=(
                    f"Write the '{section_def['title_en']}' section for a business proposal.\n"
                    f"Title: {data.deal_title}\n"
                    f"Client: {data.client_name} — {data.client_company}\n"
                    f"Value: {data.deal_value} {data.currency}\n"
                    f"Requirements: {data.requirements or 'Not specified'}\n"
                    f"{section_def['prompt_hint']}\n"
                ),
                temperature=0.5,
                max_tokens=500,
            )
            content_en = resp.content.strip()

        return ProposalSection(
            key=section_key,
            title_ar=section_def["title_ar"],
            title_en=section_def["title_en"],
            content_ar=content_ar,
            content_en=content_en,
        )
