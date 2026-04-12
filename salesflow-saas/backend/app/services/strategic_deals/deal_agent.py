"""
Deal Agent — Autonomous outreach agent for B2B deal discovery and engagement.
وكيل الصفقات: وكيل ذكي مستقل للتواصل واكتشاف الشراكات
"""

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import (
    CompanyProfile, StrategicDeal, DealMatch,
    DealStatus, DealChannel, MatchStatus, DealType,
)
from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.strategic_deals.agent")


# ── WhatsApp outreach templates (Arabic) ─────────────────────────────────────

TEMPLATES = {
    "introduction_collaborative": (
        "السلام عليكم {contact_name}\n\n"
        "أتمنى تكون بخير وعافية. أنا {sender_name} من {company_name}.\n"
        "اطلعت على أعمالكم في مجال {target_industry} وعجبني اللي تقدمونه.\n\n"
        "عندنا خبرة في {our_capability} ونشوف فرصة تعاون مثمرة بيننا "
        "خصوصاً في مجال {collaboration_area}.\n\n"
        "هل ممكن نحدد وقت مناسب نتكلم فيه عن إمكانية التعاون؟\n\n"
        "تحياتي"
    ),
    "introduction_as_ai": (
        "السلام عليكم {contact_name}\n\n"
        "أنا مساعد ذكي من شركة {company_name}. فريقنا مهتم بالتعاون معكم "
        "بناءً على تحليل التكامل بين خدماتنا.\n\n"
        "شركة {company_name} تقدم {our_capability} وشفنا إن عندكم احتياج في "
        "هذا المجال.\n\n"
        "هل تحبون نرسل لكم تفاصيل أكثر عن فرصة التعاون؟\n\n"
        "شكراً لوقتكم"
    ),
    "follow_up_1": (
        "مرحباً {contact_name}\n\n"
        "تابعت معكم بخصوص موضوع التعاون اللي ذكرناه.\n"
        "أبشركم جهزنا مقترح مبدئي يوضح كيف ممكن نستفيد من بعض.\n\n"
        "هل تفضلون نرسله عبر الإيميل أو نحدد اجتماع قصير؟\n\n"
        "تحياتي"
    ),
    "proposal_summary": (
        "حبيت أشاركك ملخص المقترح:\n\n"
        "- نوع التعاون: {deal_type_ar}\n"
        "- القيمة المتوقعة: {estimated_value}\n"
        "- المدة: {duration}\n"
        "- المنافع المشتركة: {mutual_benefits}\n\n"
        "المقترح الكامل بالمرفق. ننتظر ملاحظاتكم.\n\n"
        "شاكرين لكم"
    ),
    "negotiation_counter": (
        "شاكرين لكم على الرد والاهتمام {contact_name}.\n\n"
        "نقدر وجهة نظركم. بعد دراسة مقترحكم، حبينا نقدم لكم عرض معدل:\n\n"
        "{counter_details}\n\n"
        "نتمنى يكون العرض مناسب ونتطلع لشراكة ناجحة.\n\n"
        "تحياتي"
    ),
}

DEAL_TYPE_AR = {
    "partnership": "شراكة استراتيجية",
    "distribution": "توزيع",
    "franchise": "امتياز تجاري",
    "jv": "مشروع مشترك",
    "referral": "إحالة",
    "acquisition": "استحواذ",
    "barter": "مقايضة",
}


@dataclass
class OutreachResult:
    """Result of an outreach attempt."""
    success: bool = False
    channel: str = ""
    message_sent: str = ""
    response_received: Optional[str] = None
    interest_level: Optional[str] = None  # high, medium, low, none
    next_action: str = ""
    next_action_ar: str = ""
    error: Optional[str] = None


class DealAgent:
    """
    Autonomous outreach agent that discovers, contacts, and qualifies B2B partners.
    وكيل ذكي مستقل يكتشف ويتواصل ويؤهل الشركاء
    """

    def __init__(self):
        self.llm = get_llm()

    # ── Outreach Campaign ────────────────────────────────────────────────────

    async def run_outreach_campaign(
        self,
        deal_match_id,
        channel: str,
        db: AsyncSession,
    ) -> OutreachResult:
        """
        Execute multi-step outreach: research, craft intro, send, handle response.
        تنفيذ حملة تواصل متعددة الخطوات
        """
        # Load match and related profiles
        match_result = await db.execute(select(DealMatch).where(DealMatch.id == deal_match_id))
        match = match_result.scalar_one_or_none()
        if not match:
            return OutreachResult(success=False, error="Match not found")

        a_result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == match.company_a_id))
        company_a = a_result.scalar_one_or_none()
        if not company_a:
            return OutreachResult(success=False, error="Initiator profile not found")

        target_name = match.company_b_name or "الشركة المستهدفة"
        target_industry = ""
        target_contact = ""
        company_b = None

        if match.company_b_id:
            b_result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == match.company_b_id))
            company_b = b_result.scalar_one_or_none()
            if company_b:
                target_name = company_b.company_name
                target_industry = company_b.industry or ""
                target_contact = company_b.whatsapp_number or ""

        # Step 1: Research the target
        research = await self._research_target(company_a, company_b, match)

        # Step 2: Craft personalized introduction
        style = "as_company"  # Default to speaking as the company
        intro_message = await self.craft_introduction(
            match=match,
            channel=channel,
            style=style,
            db=db,
        )

        # Step 3: Prepare outreach result (actual sending delegated to channel adapters)
        # In production, this would call WhatsApp/LinkedIn/Email service
        outreach = OutreachResult(
            success=True,
            channel=channel,
            message_sent=intro_message,
            next_action="await_response",
            next_action_ar="انتظار الرد من الطرف الآخر",
        )

        # Step 4: Update match status
        match.status = MatchStatus.OUTREACH_SENT.value
        await db.flush()

        # Step 5: Create a strategic deal from this outreach
        deal = StrategicDeal(
            tenant_id=company_a.tenant_id,
            initiator_profile_id=company_a.id,
            target_profile_id=match.company_b_id,
            target_company_name=target_name,
            deal_type=match.deal_type_suggested or DealType.PARTNERSHIP.value,
            deal_title=f"شراكة مع {target_name}",
            deal_title_ar=f"شراكة مع {target_name}",
            our_offer=research.get("our_value_proposition", ""),
            our_need=research.get("what_we_need_from_them", ""),
            proposed_terms=match.terms_suggested or {},
            status=DealStatus.OUTREACH.value,
            channel=channel,
            ai_confidence=match.match_score,
            negotiation_history=[{
                "round": 0,
                "action": "outreach",
                "channel": channel,
                "message": intro_message[:500],
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }],
        )
        db.add(deal)
        await db.flush()

        logger.info(
            "Outreach campaign executed for match %s via %s (deal %s created)",
            deal_match_id, channel, deal.id,
        )
        return outreach

    # ── Craft Introduction ───────────────────────────────────────────────────

    async def craft_introduction(
        self,
        match: DealMatch,
        channel: str,
        style: str,
        db: AsyncSession,
    ) -> str:
        """
        Generate a personalized Arabic introduction message.
        إنشاء رسالة تعريفية عربية مخصصة
        """
        a_result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == match.company_a_id))
        company_a = a_result.scalar_one_or_none()

        target_name = match.company_b_name or "الشركة المستهدفة"
        target_industry = ""
        target_caps = []
        target_needs = []

        if match.company_b_id:
            b_result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == match.company_b_id))
            company_b = b_result.scalar_one_or_none()
            if company_b:
                target_name = company_b.company_name
                target_industry = company_b.industry or ""
                target_caps = company_b.capabilities or []
                target_needs = company_b.needs or []
        elif match.company_b_data:
            target_industry = match.company_b_data.get("industry", "")
            target_caps = match.company_b_data.get("capabilities", [])
            target_needs = match.company_b_data.get("needs", [])

        # Channel-specific length guidance
        length_guidance = {
            "whatsapp": "اكتب رسالة قصيرة ومباشرة (3-5 أسطر). لا تكتب أكثر من 300 حرف.",
            "email": "اكتب رسالة مفصلة ومهنية (8-12 سطر) مع سطر موضوع.",
            "linkedin": "اكتب رسالة قصيرة ومهنية (4-6 أسطر).",
            "in_person": "جهز نقاط حديث مختصرة (5-7 نقاط).",
        }

        style_guidance = {
            "as_company": "تكلم باسم الشركة مباشرة (نحن في شركة X...)",
            "as_ai": "كن شفافاً أنك مساعد ذكي (أنا مساعد ذكي من شركة X...)",
        }

        context = f"""Our company: {company_a.company_name if company_a else 'unknown'}
Our capabilities: {', '.join((company_a.capabilities or [])[:5]) if company_a else 'unknown'}
Target company: {target_name}
Target industry: {target_industry}
Target capabilities: {', '.join(target_caps[:5])}
Target needs: {', '.join(target_needs[:5])}
Match reasons: {', '.join(match.match_reasons or [])}
Match score: {match.match_score}
Suggested deal type: {match.deal_type_suggested}"""

        system_prompt = f"""أنت كاتب رسائل أعمال سعودي محترف.
اكتب رسالة تعريفية للتواصل مع شركة محتملة للتعاون.

Channel: {channel}
{length_guidance.get(channel, length_guidance['whatsapp'])}

Style: {style}
{style_guidance.get(style, style_guidance['as_company'])}

قواعد مهمة:
- ابدأ بالسلام
- اذكر سبب التواصل بوضوح
- أبرز نقطة التكامل بين الشركتين
- اختم بطلب واضح (اجتماع، مكالمة، تفاصيل أكثر)
- لا تبالغ في المدح
- كن مهنياً وودوداً

Return the message directly as text (not JSON)."""

        llm_response = await self.llm.complete(
            system_prompt=system_prompt,
            user_message=context,
            temperature=0.6,
        )
        message = llm_response.content.strip()

        logger.info("Crafted introduction for match %s via %s", match.id, channel)
        return message

    # ── Handle Response ──────────────────────────────────────────────────────

    async def handle_response(
        self,
        deal_id,
        message: str,
        channel: str,
        db: AsyncSession,
    ) -> str:
        """
        Analyze incoming response and generate appropriate follow-up.
        تحليل الرد الوارد وتوليد متابعة مناسبة
        """
        deal_result = await db.execute(select(StrategicDeal).where(StrategicDeal.id == deal_id))
        deal = deal_result.scalar_one_or_none()
        if not deal:
            raise ValueError(f"Deal {deal_id} not found")

        # Load initiator profile
        initiator = None
        if deal.initiator_profile_id:
            init_result = await db.execute(
                select(CompanyProfile).where(CompanyProfile.id == deal.initiator_profile_id)
            )
            initiator = init_result.scalar_one_or_none()

        history_summary = ""
        for h in (deal.negotiation_history or [])[-3:]:
            history_summary += f"- {h.get('action', '?')}: {h.get('message', '')[:100]}\n"

        context = f"""Deal: {deal.deal_title}
Our company: {initiator.company_name if initiator else 'unknown'}
Target: {deal.target_company_name or 'unknown'}
Channel: {channel}
Current status: {deal.status}
Recent conversation:
{history_summary}

Incoming message: {message}"""

        system_prompt = """أنت مساعد أعمال سعودي. حلل الرسالة الواردة وحدد نوعها وقدم رداً مناسباً.

أولاً حلل الرسالة:
- اهتمام (interest): الطرف الآخر مهتم
- اعتراض (objection): عنده تحفظات
- سؤال (question): يحتاج معلومات إضافية
- رفض (rejection): غير مهتم
- طلب معلومات (request_for_info): يريد تفاصيل أكثر

ثم اكتب رداً مناسباً:
- إذا مهتم: حدد الخطوة التالية (اجتماع، مقترح)
- إذا متحفظ: عالج التحفظ بلطف
- إذا عنده سؤال: أجب بوضوح
- إذا رافض: اشكره واترك الباب مفتوحاً
- إذا يبي تفاصيل: وعده بإرسالها

Return JSON:
{
    "response_type": "interest/objection/question/rejection/request_for_info",
    "interest_level": "high/medium/low/none",
    "response_message": "الرد بالعربي",
    "next_action": "schedule_meeting/send_proposal/send_info/follow_up_later/close",
    "next_action_ar": "الخطوة التالية بالعربي"
}"""

        llm_response = await self.llm.complete(
            system_prompt=system_prompt,
            user_message=context,
            json_mode=True,
            temperature=0.4,
        )
        result = llm_response.parse_json() or {}

        response_msg = result.get("response_message", "شكراً لردكم، سنتواصل معكم قريباً.")
        interest = result.get("interest_level", "medium")
        next_action = result.get("next_action", "follow_up_later")

        # Update deal based on response
        if interest == "high" or next_action == "schedule_meeting":
            deal.status = DealStatus.NEGOTIATING.value
        elif interest == "none" or next_action == "close":
            deal.status = DealStatus.CLOSED_LOST.value
            deal.closed_at = datetime.now(timezone.utc)

        # Log in negotiation history
        history = list(deal.negotiation_history or [])
        history.append({
            "round": len(history) + 1,
            "action": "response_handling",
            "their_message": message[:500],
            "our_response": response_msg[:500],
            "response_type": result.get("response_type", "unknown"),
            "interest_level": interest,
            "next_action": next_action,
            "channel": channel,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        deal.negotiation_history = history
        await db.flush()

        logger.info(
            "Handled response for deal %s: type=%s, interest=%s",
            deal_id, result.get("response_type"), interest,
        )
        return response_msg

    # ── Generate Proposal ────────────────────────────────────────────────────

    async def generate_proposal(
        self,
        deal_id,
        db: AsyncSession,
    ) -> dict:
        """
        Generate a full Arabic business proposal document.
        إنشاء مقترح أعمال عربي كامل
        """
        deal_result = await db.execute(select(StrategicDeal).where(StrategicDeal.id == deal_id))
        deal = deal_result.scalar_one_or_none()
        if not deal:
            raise ValueError(f"Deal {deal_id} not found")

        initiator = None
        if deal.initiator_profile_id:
            init_result = await db.execute(
                select(CompanyProfile).where(CompanyProfile.id == deal.initiator_profile_id)
            )
            initiator = init_result.scalar_one_or_none()

        target_name = deal.target_company_name or "الطرف الآخر"
        target = None
        if deal.target_profile_id:
            t_result = await db.execute(
                select(CompanyProfile).where(CompanyProfile.id == deal.target_profile_id)
            )
            target = t_result.scalar_one_or_none()
            if target:
                target_name = target.company_name

        context = f"""Our company: {initiator.company_name if initiator else 'unknown'}
Our industry: {initiator.industry if initiator else 'unknown'}
Our capabilities: {', '.join((initiator.capabilities or [])[:8]) if initiator else 'unknown'}

Target company: {target_name}
Target industry: {target.industry if target else 'unknown'}
Target capabilities: {', '.join((target.capabilities or [])[:8]) if target else 'unknown'}
Target needs: {', '.join((target.needs or [])[:8]) if target else 'unknown'}

Deal: {deal.deal_title}
Deal type: {deal.deal_type}
Our offer: {deal.our_offer or 'TBD'}
Our need: {deal.our_need or 'TBD'}
Proposed terms: {json.dumps(deal.proposed_terms or {}, ensure_ascii=False)}
Estimated value: {deal.estimated_value_sar or 'TBD'} SAR"""

        system_prompt = """أنت كاتب مقترحات أعمال سعودي محترف.
أنشئ مقترح أعمال شامل ومهني باللغة العربية.

Return JSON:
{
    "title_ar": "عنوان المقترح",
    "executive_summary_ar": "الملخص التنفيذي (3-5 جمل)",
    "about_us_ar": "نبذة عن شركتنا",
    "understanding_your_needs_ar": "فهمنا لاحتياجاتكم",
    "proposed_solution_ar": "الحل المقترح",
    "our_capabilities_ar": ["قدرة 1", "قدرة 2"],
    "mutual_benefits_ar": ["منفعة مشتركة 1", "منفعة مشتركة 2"],
    "deal_structure_ar": "هيكل الصفقة",
    "financial_overview_ar": "النظرة المالية",
    "timeline_ar": [
        {"phase_ar": "المرحلة", "duration_ar": "المدة", "deliverables_ar": "المخرجات"}
    ],
    "success_metrics_ar": ["مؤشر نجاح 1", "مؤشر نجاح 2"],
    "risks_and_mitigations_ar": [
        {"risk_ar": "المخاطرة", "mitigation_ar": "التخفيف"}
    ],
    "next_steps_ar": ["خطوة 1", "خطوة 2"],
    "closing_statement_ar": "الخاتمة"
}"""

        llm_response = await self.llm.complete(
            system_prompt=system_prompt,
            user_message=context,
            json_mode=True,
            temperature=0.4,
        )
        proposal = llm_response.parse_json() or {}

        logger.info("Generated proposal for deal %s", deal_id)
        return proposal

    # ── Discovery Scan ───────────────────────────────────────────────────────

    async def run_discovery_scan(
        self,
        profile_id,
        deal_type: Optional[str],
        db: AsyncSession,
    ) -> list[DealMatch]:
        """
        Full autonomous scan: analyze profile, find matches, generate outreach plan.
        فحص مستقل كامل: تحليل الملف، إيجاد مطابقات، تجهيز خطة تواصل
        """
        from app.services.strategic_deals.company_profiler import CompanyProfiler
        from app.services.strategic_deals.deal_matcher import DealMatcher

        profiler = CompanyProfiler()
        matcher = DealMatcher()

        # Step 1: Enrich profile if needed
        prof_result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == profile_id))
        profile = prof_result.scalar_one_or_none()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        if not profile.capabilities or len(profile.capabilities) < 2:
            logger.info("Discovery scan: enriching profile %s first", profile_id)
            await profiler.enrich_profile(profile_id, db)

        # Step 2: Analyze capabilities if thin
        if not profile.capabilities or len(profile.capabilities) < 3:
            await profiler.analyze_capabilities(profile_id, db)

        # Step 3: Find matches
        matches = await matcher.find_matches(
            profile_id=profile_id,
            deal_type=deal_type,
            db=db,
            limit=10,
        )

        # Step 4: Generate deal structure suggestions for top matches
        for match in matches[:3]:
            try:
                await matcher.suggest_deal_structure(match.id, db)
            except Exception as e:
                logger.warning("Could not suggest structure for match %s: %s", match.id, e)

        # Step 5: Generate Arabic summary
        if matches:
            summary_parts = [f"تم العثور على {len(matches)} فرصة شراكة محتملة:"]
            for i, m in enumerate(matches[:5], 1):
                target_name = m.company_b_name or "شركة"
                if m.company_b_id:
                    b_res = await db.execute(
                        select(CompanyProfile).where(CompanyProfile.id == m.company_b_id)
                    )
                    b_prof = b_res.scalar_one_or_none()
                    if b_prof:
                        target_name = b_prof.company_name
                reasons = ", ".join((m.match_reasons or [])[:2])
                summary_parts.append(
                    f"{i}. {target_name} (نسبة التوافق: {m.match_score:.0%}) — {reasons}"
                )
            summary = "\n".join(summary_parts)
            logger.info("Discovery scan summary:\n%s", summary)

        logger.info("Discovery scan complete for profile %s: %d matches", profile_id, len(matches))
        return matches

    # ── Private Helpers ──────────────────────────────────────────────────────

    async def _research_target(
        self,
        company_a: CompanyProfile,
        company_b: Optional[CompanyProfile],
        match: DealMatch,
    ) -> dict:
        """Research the target company to personalize outreach."""
        target_name = company_b.company_name if company_b else (match.company_b_name or "unknown")
        target_industry = company_b.industry if company_b else ""
        target_caps = ", ".join((company_b.capabilities or [])[:5]) if company_b else ""
        target_needs = ", ".join((company_b.needs or [])[:5]) if company_b else ""

        context = f"""Our company: {company_a.company_name}
Our capabilities: {', '.join((company_a.capabilities or [])[:5])}
Our needs: {', '.join((company_a.needs or [])[:5])}

Target: {target_name}
Industry: {target_industry}
Capabilities: {target_caps}
Needs: {target_needs}
Match score: {match.match_score}
Match reasons: {', '.join(match.match_reasons or [])}"""

        system_prompt = """أنت باحث أعمال. حلل الشركة المستهدفة وجهز نقاط للتواصل.

Return JSON:
{
    "our_value_proposition": "ما نقدمه لهم بجملة واحدة",
    "what_we_need_from_them": "ما نحتاجه منهم بجملة واحدة",
    "key_talking_points_ar": ["نقطة حوار 1", "نقطة حوار 2"],
    "potential_objections_ar": ["اعتراض محتمل 1"],
    "recommended_approach_ar": "النهج الموصى به"
}"""

        try:
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=context,
                json_mode=True,
                temperature=0.3,
                fast=True,
            )
            return llm_response.parse_json() or {}
        except Exception as e:
            logger.warning("Target research failed: %s", e)
            return {
                "our_value_proposition": "",
                "what_we_need_from_them": "",
                "key_talking_points_ar": [],
                "potential_objections_ar": [],
                "recommended_approach_ar": "",
            }
