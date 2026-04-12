"""
Deal Negotiator — Autonomous AI negotiator for B2B deals.
المفاوض الذكي: مفاوض آلي بالذكاء الاصطناعي للصفقات بين الشركات
"""

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategic_deal import (
    StrategicDeal, CompanyProfile, DealStatus, DealType,
)
from app.services.llm.provider import get_llm

logger = logging.getLogger("dealix.strategic_deals.negotiator")


# ── Models ───────────────────────────────────────────────────────────────────


class NegotiationStrategy(BaseModel):
    """Strategy configuration for autonomous negotiation."""
    target_terms: dict = {}         # Ideal outcome
    acceptable_range: dict = {}     # Min/max for each variable
    walk_away_point: dict = {}      # Absolute limits / deal breakers
    priorities: list[str] = []      # Ordered from most to least important
    style: str = "collaborative"    # collaborative, competitive, accommodating


@dataclass
class NegotiationRound:
    """Result of a single negotiation round."""
    round_number: int = 0
    action: str = ""            # opening_offer, counter_offer, acceptance, rejection, escalation
    our_terms: dict = field(default_factory=dict)
    their_terms: dict = field(default_factory=dict)
    message_ar: str = ""
    message_en: str = ""
    concessions_made: list[str] = field(default_factory=list)
    concessions_gained: list[str] = field(default_factory=list)
    within_range: bool = True
    confidence: float = 0.0
    timestamp: str = ""


# ── Escalation thresholds ────────────────────────────────────────────────────

ESCALATION_VALUE_SAR = 500_000      # Deals above this need human oversight
MAX_AUTO_ROUNDS = 5                  # After this many rounds, escalate
STALL_THRESHOLD = 3                  # Same terms repeated this many times = stall


class DealNegotiator:
    """
    Autonomous AI negotiator that handles B2B deal negotiations.
    Respects Saudi business culture: relationship-first, patience, mutual respect.
    مفاوض ذكي يحترم ثقافة الأعمال السعودية
    """

    def __init__(self):
        self.llm = get_llm()

    # ── Start Negotiation ────────────────────────────────────────────────────

    async def start_negotiation(
        self,
        deal_id,
        strategy: NegotiationStrategy,
        db: AsyncSession,
    ) -> NegotiationRound:
        """
        Generate opening offer based on strategy and Saudi negotiation culture.
        إنشاء العرض الأولي بناءً على الاستراتيجية وثقافة التفاوض السعودية
        """
        deal = await self._load_deal(deal_id, db)

        initiator = await self._load_profile(deal.initiator_profile_id, db)
        target_name = deal.target_company_name or "الطرف الآخر"
        if deal.target_profile_id:
            target = await self._load_profile(deal.target_profile_id, db)
            target_name = target.company_name if target else target_name

        context = f"""Deal: {deal.deal_title}
Deal type: {deal.deal_type}
Our company: {initiator.company_name}
Target company: {target_name}
Our offer: {deal.our_offer or 'not specified'}
Our need: {deal.our_need or 'not specified'}
Strategy style: {strategy.style}
Target terms: {json.dumps(strategy.target_terms, ensure_ascii=False)}
Priorities: {', '.join(strategy.priorities)}"""

        style_guidance = {
            "collaborative": "ابدأ بعرض عادل ومتوازن يظهر الرغبة في شراكة طويلة المدى",
            "competitive": "ابدأ بعرض طموح لكن معقول مع ترك مساحة للتفاوض",
            "accommodating": "ابدأ بعرض سخي يظهر حسن النية والرغبة في بناء علاقة",
        }

        system_prompt = f"""أنت مفاوض أعمال سعودي محترف. أنشئ عرضاً أولياً للصفقة.

التوجيه: {style_guidance.get(strategy.style, style_guidance['collaborative'])}

Important Saudi negotiation culture:
- Start with relationship building (سلامات واستفسار عن الأحوال)
- Show respect for the other party
- Be patient, don't rush to numbers
- Present win-win framing

Return JSON:
{{
    "opening_terms": {{"key": "value for each negotiable item"}},
    "message_ar": "رسالة العرض الأولي بالعربي (تبدأ بالسلام والتحية)",
    "message_en": "Opening message in English",
    "rationale_ar": "مبررات العرض",
    "confidence": 0.0 to 1.0
}}"""

        llm_response = await self.llm.complete(
            system_prompt=system_prompt,
            user_message=context,
            json_mode=True,
            temperature=0.4,
        )
        result = llm_response.parse_json() or {}

        now_str = datetime.now(timezone.utc).isoformat()
        round_data = NegotiationRound(
            round_number=1,
            action="opening_offer",
            our_terms=result.get("opening_terms", strategy.target_terms),
            their_terms={},
            message_ar=result.get("message_ar", ""),
            message_en=result.get("message_en", ""),
            concessions_made=[],
            concessions_gained=[],
            within_range=True,
            confidence=result.get("confidence", 0.5),
            timestamp=now_str,
        )

        # Update deal
        deal.proposed_terms = round_data.our_terms
        deal.status = DealStatus.NEGOTIATING.value
        deal.ai_confidence = round_data.confidence
        history = list(deal.negotiation_history or [])
        history.append({
            "round": round_data.round_number,
            "action": round_data.action,
            "our_terms": round_data.our_terms,
            "their_terms": round_data.their_terms,
            "message_ar": round_data.message_ar,
            "timestamp": now_str,
        })
        deal.negotiation_history = history
        await db.flush()

        logger.info("Started negotiation for deal %s (round 1)", deal_id)
        return round_data

    # ── Handle Counter-Offer ─────────────────────────────────────────────────

    async def handle_counter_offer(
        self,
        deal_id,
        their_terms: dict,
        db: AsyncSession,
    ) -> NegotiationRound:
        """
        Analyze a counter-offer and generate a response.
        تحليل عرض مضاد وتوليد رد مناسب
        """
        deal = await self._load_deal(deal_id, db)
        history = list(deal.negotiation_history or [])
        round_num = len(history) + 1

        # Get the latest strategy from proposed terms
        our_latest = deal.proposed_terms or {}

        context = f"""Deal: {deal.deal_title}
Deal type: {deal.deal_type}
Our latest terms: {json.dumps(our_latest, ensure_ascii=False)}
Their counter-offer: {json.dumps(their_terms, ensure_ascii=False)}
Negotiation history (rounds): {len(history)}
Estimated value SAR: {deal.estimated_value_sar or 'unknown'}"""

        system_prompt = """أنت مفاوض أعمال سعودي محترف. الطرف الآخر قدم عرضاً مضاداً.

حلل العرض وقرر:
1. هل العرض مقبول؟
2. هل نحتاج عرض مضاد؟
3. هل يجب رفع الموضوع لإنسان؟

Saudi culture: never be aggressive. Show appreciation for their offer before countering.
Handle common responses: "غالي" (too expensive), "نبي نفكر" (need to think), "عندنا عرض ثاني" (we have another offer)

Return JSON:
{
    "action": "accept/counter/reject/escalate",
    "counter_terms": {"key": "value"},
    "message_ar": "الرد بالعربي",
    "message_en": "Response in English",
    "concessions_made": ["what we gave up"],
    "concessions_gained": ["what we got"],
    "within_acceptable_range": true/false,
    "confidence": 0.0 to 1.0,
    "analysis_ar": "تحليل العرض المضاد"
}"""

        llm_response = await self.llm.complete(
            system_prompt=system_prompt,
            user_message=context,
            json_mode=True,
            temperature=0.3,
        )
        result = llm_response.parse_json() or {}

        action = result.get("action", "counter")
        now_str = datetime.now(timezone.utc).isoformat()

        round_data = NegotiationRound(
            round_number=round_num,
            action=action,
            our_terms=result.get("counter_terms", our_latest),
            their_terms=their_terms,
            message_ar=result.get("message_ar", ""),
            message_en=result.get("message_en", ""),
            concessions_made=result.get("concessions_made", []),
            concessions_gained=result.get("concessions_gained", []),
            within_range=result.get("within_acceptable_range", True),
            confidence=result.get("confidence", 0.5),
            timestamp=now_str,
        )

        # Update deal state
        if action == "accept":
            deal.agreed_terms = their_terms
            deal.status = DealStatus.TERM_SHEET.value
        elif action == "reject":
            deal.status = DealStatus.CLOSED_LOST.value
            deal.closed_at = datetime.now(timezone.utc)
        else:
            deal.proposed_terms = round_data.our_terms

        deal.ai_confidence = round_data.confidence
        history.append({
            "round": round_data.round_number,
            "action": action,
            "our_terms": round_data.our_terms,
            "their_terms": their_terms,
            "message_ar": round_data.message_ar,
            "timestamp": now_str,
        })
        deal.negotiation_history = history
        await db.flush()

        logger.info("Handled counter-offer for deal %s (round %d, action=%s)", deal_id, round_num, action)
        return round_data

    # ── Generate Negotiation Response ────────────────────────────────────────

    async def generate_response(
        self,
        deal_id,
        message: str,
        db: AsyncSession,
    ) -> str:
        """
        Generate a culturally appropriate Arabic/English negotiation response.
        توليد رد تفاوضي مناسب ثقافياً بالعربي أو الإنجليزي
        """
        deal = await self._load_deal(deal_id, db)
        history = deal.negotiation_history or []

        # Summarize negotiation context
        history_summary = ""
        for h in history[-3:]:  # Last 3 rounds
            history_summary += f"Round {h.get('round', '?')}: {h.get('action', '?')} - {h.get('message_ar', '')[:100]}\n"

        context = f"""Deal: {deal.deal_title}
Deal type: {deal.deal_type}
Current status: {deal.status}
Our proposed terms: {json.dumps(deal.proposed_terms or {}, ensure_ascii=False)}
Recent history:
{history_summary}

Incoming message from counter-party: {message}"""

        system_prompt = """أنت مفاوض أعمال سعودي محترف. رد على رسالة الطرف الآخر بشكل مناسب.

Rules:
- إذا الرسالة بالعربي، رد بالعربي
- إذا الرسالة بالإنجليزي، رد بالإنجليزي
- كن محترماً وودوداً دائماً
- لا تكن عدوانياً أبداً
- حافظ على العلاقة حتى لو الصفقة لم تنجح

Handle:
- "غالي" → أظهر المرونة واعرض بدائل
- "نبي نفكر" → أعطهم وقت مع اقتراح موعد متابعة
- "عندنا عرض ثاني" → أبرز المميزات الفريدة بدون تقليل المنافسين
- "ما يناسبنا" → اسأل عن التفاصيل واعرض تعديلات

Return the response message directly as text (not JSON)."""

        llm_response = await self.llm.complete(
            system_prompt=system_prompt,
            user_message=context,
            temperature=0.5,
        )
        response_text = llm_response.content.strip()

        # Log the exchange in negotiation history
        history = list(deal.negotiation_history or [])
        history.append({
            "round": len(history) + 1,
            "action": "response",
            "their_message": message[:500],
            "our_response": response_text[:500],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        deal.negotiation_history = history
        await db.flush()

        logger.info("Generated negotiation response for deal %s", deal_id)
        return response_text

    # ── Should Escalate? ─────────────────────────────────────────────────────

    async def should_escalate(
        self,
        deal_id,
        db: AsyncSession,
    ) -> bool:
        """
        Determine if a human should take over the negotiation.
        تحديد ما إذا كان يجب تصعيد التفاوض لإنسان
        """
        deal = await self._load_deal(deal_id, db)
        history = deal.negotiation_history or []
        round_count = len(history)

        # Rule 1: High-value deals
        value = float(deal.estimated_value_sar or 0)
        if value > ESCALATION_VALUE_SAR:
            logger.info("Escalation: deal %s value (%.0f SAR) exceeds threshold", deal_id, value)
            return True

        # Rule 2: Too many rounds without resolution
        if round_count >= MAX_AUTO_ROUNDS:
            logger.info("Escalation: deal %s reached %d rounds", deal_id, round_count)
            return True

        # Rule 3: Stalled negotiation (same terms repeating)
        if round_count >= STALL_THRESHOLD:
            recent_terms = [
                json.dumps(h.get("our_terms", {}), sort_keys=True)
                for h in history[-STALL_THRESHOLD:]
            ]
            if len(set(recent_terms)) == 1:
                logger.info("Escalation: deal %s stalled for %d rounds", deal_id, STALL_THRESHOLD)
                return True

        # Rule 4: Low confidence
        if deal.ai_confidence is not None and deal.ai_confidence < 0.3:
            logger.info("Escalation: deal %s AI confidence too low (%.2f)", deal_id, deal.ai_confidence)
            return True

        # Rule 5: Counter-party explicitly requested human contact
        if history:
            last_msg = (history[-1].get("their_message", "") or "").lower()
            human_keywords = [
                "أبي أكلم شخص", "أبي أكلم المدير", "ابي اتكلم مع انسان",
                "speak to someone", "talk to a person", "human", "manager",
                "مدير", "مسؤول",
            ]
            for kw in human_keywords:
                if kw in last_msg:
                    logger.info("Escalation: deal %s counter-party requested human", deal_id)
                    return True

        return False

    # ── Generate Term Sheet ──────────────────────────────────────────────────

    async def generate_term_sheet(
        self,
        deal_id,
        db: AsyncSession,
    ) -> dict:
        """
        Generate a formal Arabic term sheet from agreed terms.
        إنشاء ورقة شروط رسمية بالعربي من الشروط المتفق عليها
        """
        deal = await self._load_deal(deal_id, db)
        initiator = await self._load_profile(deal.initiator_profile_id, db)

        target_name = deal.target_company_name or "الطرف الثاني"
        target_cr = ""
        if deal.target_profile_id:
            target = await self._load_profile(deal.target_profile_id, db)
            if target:
                target_name = target.company_name
                target_cr = target.cr_number or ""

        terms = deal.agreed_terms or deal.proposed_terms or {}

        context = f"""Parties:
- Party A: {initiator.company_name} (CR: {initiator.cr_number or 'N/A'})
- Party B: {target_name} (CR: {target_cr or 'N/A'})

Deal: {deal.deal_title}
Deal type: {deal.deal_type}
Agreed terms: {json.dumps(terms, ensure_ascii=False)}
Estimated value: {deal.estimated_value_sar or 'TBD'} SAR
Our offer: {deal.our_offer or 'N/A'}
Our need: {deal.our_need or 'N/A'}"""

        system_prompt = """أنت مستشار قانوني سعودي متخصص في صياغة أوراق الشروط.
أنشئ ورقة شروط رسمية باللغة العربية.

Return JSON:
{
    "title_ar": "عنوان ورقة الشروط",
    "date": "التاريخ",
    "parties": [
        {"name": "اسم الطرف", "role": "الطرف الأول/الطرف الثاني", "cr": "رقم السجل التجاري"}
    ],
    "preamble_ar": "مقدمة ورقة الشروط",
    "scope_ar": "نطاق الاتفاقية",
    "terms": [
        {"title_ar": "عنوان البند", "description_ar": "تفاصيل البند"}
    ],
    "obligations_party_a_ar": ["التزامات الطرف الأول"],
    "obligations_party_b_ar": ["التزامات الطرف الثاني"],
    "financial_terms_ar": "الشروط المالية",
    "duration_ar": "مدة الاتفاقية",
    "termination_ar": "شروط الإنهاء",
    "confidentiality_ar": "شرط السرية",
    "dispute_resolution_ar": "حل النزاعات",
    "governing_law_ar": "القانون الحاكم: أنظمة المملكة العربية السعودية",
    "next_steps_ar": ["الخطوات التالية"]
}"""

        llm_response = await self.llm.complete(
            system_prompt=system_prompt,
            user_message=context,
            json_mode=True,
            temperature=0.2,
        )
        term_sheet = llm_response.parse_json() or {}

        # Update deal status
        if deal.status == DealStatus.NEGOTIATING.value:
            deal.status = DealStatus.TERM_SHEET.value
        await db.flush()

        logger.info("Generated term sheet for deal %s", deal_id)
        return term_sheet

    # ── Helpers ──────────────────────────────────────────────────────────────

    async def _load_deal(self, deal_id, db: AsyncSession) -> StrategicDeal:
        result = await db.execute(select(StrategicDeal).where(StrategicDeal.id == deal_id))
        deal = result.scalar_one_or_none()
        if not deal:
            raise ValueError(f"Deal {deal_id} not found")
        return deal

    async def _load_profile(self, profile_id, db: AsyncSession) -> Optional[CompanyProfile]:
        if not profile_id:
            return None
        result = await db.execute(select(CompanyProfile).where(CompanyProfile.id == profile_id))
        return result.scalar_one_or_none()
