"""
Arabic Conversation Intelligence — Analyzes WhatsApp/email threads
to extract insights, buying/risk signals, and next-best-action recommendations.
"""

import json
import logging
import re
from dataclasses import dataclass, field
from typing import Optional

from app.services.llm.provider import get_llm

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class BuyingSignal:
    phrase: str
    confidence: float
    signal_type: str  # "explicit", "implicit"


@dataclass
class RiskSignal:
    phrase: str
    risk_type: str  # "price_objection", "competitor", "hesitation", "delay"
    severity: str  # "low", "medium", "high"


@dataclass
class ActionItem:
    description_ar: str
    description_en: str
    priority: str  # "high", "medium", "low"
    due_hint: Optional[str] = None  # "today", "this_week", "next_week"


@dataclass
class ConversationInsight:
    summary_ar: str
    summary_en: str
    key_topics: list[str] = field(default_factory=list)
    buying_signals: list[BuyingSignal] = field(default_factory=list)
    risk_signals: list[RiskSignal] = field(default_factory=list)
    objections: list[str] = field(default_factory=list)
    action_items: list[ActionItem] = field(default_factory=list)
    next_best_action_ar: str = ""
    next_best_action_en: str = ""
    quality_score: float = 0.0  # 0.0 - 10.0
    message_count: int = 0
    dominant_language: str = "ar"


# ---------------------------------------------------------------------------
# Pattern constants
# ---------------------------------------------------------------------------

BUYING_SIGNAL_PATTERNS = [
    (r"أبي\s*عرض\s*سعر", "explicit", 0.9),
    (r"كم\s*السعر", "explicit", 0.85),
    (r"متى\s*تقدرون\s*تبد[وأ]ون", "explicit", 0.9),
    (r"أبي\s*أشتري", "explicit", 0.95),
    (r"نبي\s*ن[شس]تري", "explicit", 0.95),
    (r"عطوني\s*عرض", "explicit", 0.85),
    (r"ودي\s*آخذ", "explicit", 0.8),
    (r"أبغى\s*أطلب", "explicit", 0.9),
    (r"جاهز[ية]?\s*نبدأ", "explicit", 0.95),
    (r"كيف\s*طريقة\s*الدفع", "implicit", 0.8),
    (r"فيه\s*ضمان", "implicit", 0.7),
    (r"عندكم\s*تجربة\s*مجانية", "implicit", 0.6),
    (r"متى\s*يوصل", "implicit", 0.7),
    (r"أبي\s*أعرف\s*أكثر", "implicit", 0.5),
    (r"send\s*(?:me\s*)?(?:a\s*)?quot(?:e|ation)", "explicit", 0.85),
    (r"how\s*(?:much|soon)", "implicit", 0.7),
    (r"ready\s*to\s*(?:start|buy|proceed)", "explicit", 0.95),
]

RISK_SIGNAL_PATTERNS = [
    (r"غالي", "price_objection", "medium", 0.8),
    (r"فيه\s*أرخص", "competitor", "high", 0.85),
    (r"بفكر", "hesitation", "medium", 0.7),
    (r"مو\s*متأكد", "hesitation", "high", 0.8),
    (r"خلني\s*أستشير", "delay", "medium", 0.6),
    (r"أرجع\s*لك", "delay", "medium", 0.5),
    (r"مو\s*الحين", "delay", "medium", 0.7),
    (r"ما\s*عندي\s*ميزانية", "price_objection", "high", 0.9),
    (r"المنافس\s*يعطينا\s*أحسن", "competitor", "high", 0.9),
    (r"نستخدم\s*نظام\s*ثاني", "competitor", "medium", 0.7),
    (r"ما\s*شفت\s*فايدة", "hesitation", "high", 0.85),
    (r"too\s*expensive", "price_objection", "medium", 0.8),
    (r"not\s*sure", "hesitation", "medium", 0.7),
    (r"(?:need|let)\s*(?:me\s*)?think", "delay", "medium", 0.6),
]


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class ConversationIntelligence:
    """Analyzes Arabic/English conversation threads for sales intelligence."""

    def __init__(self):
        self._llm = get_llm()

    async def analyze_conversation(
        self, messages: list[dict], context: Optional[dict] = None
    ) -> ConversationInsight:
        """
        Analyze a conversation thread.

        Args:
            messages: List of {"role": "lead"|"agent", "content": str, "timestamp": str, "channel": str}
            context: Optional lead/deal context {"lead_name", "company", "industry", "stage"}

        Returns:
            ConversationInsight with full analysis.
        """
        context = context or {}

        if not messages:
            return ConversationInsight(
                summary_ar="لا توجد رسائل للتحليل",
                summary_en="No messages to analyze",
                message_count=0,
            )

        # Regex-based signal extraction (fast)
        buying_signals = self._extract_buying_signals(messages)
        risk_signals = self._extract_risk_signals(messages)

        # LLM-based deep analysis
        try:
            llm_insight = await self._llm_analyze(messages, context)
        except Exception as e:
            logger.warning(f"LLM conversation analysis failed: {e}")
            llm_insight = {}

        # Merge regex and LLM results
        quality_score = self._calculate_quality_score(messages, buying_signals, risk_signals)

        # Combine LLM action items with defaults
        action_items = self._parse_action_items(llm_insight.get("action_items", []))
        if not action_items:
            action_items = self._generate_default_actions(buying_signals, risk_signals)

        return ConversationInsight(
            summary_ar=llm_insight.get("summary_ar", self._build_fallback_summary_ar(messages)),
            summary_en=llm_insight.get("summary_en", self._build_fallback_summary_en(messages)),
            key_topics=llm_insight.get("key_topics", []),
            buying_signals=buying_signals,
            risk_signals=risk_signals,
            objections=llm_insight.get("objections", []),
            action_items=action_items,
            next_best_action_ar=llm_insight.get(
                "next_best_action_ar",
                self._default_next_action_ar(buying_signals, risk_signals),
            ),
            next_best_action_en=llm_insight.get("next_best_action_en", "Follow up with the lead"),
            quality_score=round(quality_score, 1),
            message_count=len(messages),
            dominant_language=self._detect_dominant_language(messages),
        )

    # ── Regex Signal Extraction ──────────────────

    def _extract_buying_signals(self, messages: list[dict]) -> list[BuyingSignal]:
        """Extract buying signals from conversation using regex patterns."""
        signals = []
        lead_texts = " ".join(
            m.get("content", "") for m in messages if m.get("role") == "lead"
        )
        seen_phrases = set()

        for pattern, signal_type, confidence in BUYING_SIGNAL_PATTERNS:
            for match in re.finditer(pattern, lead_texts, re.IGNORECASE):
                phrase = match.group(0).strip()
                if phrase not in seen_phrases:
                    seen_phrases.add(phrase)
                    signals.append(BuyingSignal(
                        phrase=phrase,
                        confidence=confidence,
                        signal_type=signal_type,
                    ))
        return signals

    def _extract_risk_signals(self, messages: list[dict]) -> list[RiskSignal]:
        """Extract risk signals from conversation using regex patterns."""
        signals = []
        lead_texts = " ".join(
            m.get("content", "") for m in messages if m.get("role") == "lead"
        )
        seen_phrases = set()

        for pattern, risk_type, severity, _confidence in RISK_SIGNAL_PATTERNS:
            for match in re.finditer(pattern, lead_texts, re.IGNORECASE):
                phrase = match.group(0).strip()
                if phrase not in seen_phrases:
                    seen_phrases.add(phrase)
                    signals.append(RiskSignal(
                        phrase=phrase,
                        risk_type=risk_type,
                        severity=severity,
                    ))
        return signals

    # ── LLM Deep Analysis ────────────────────────

    async def _llm_analyze(self, messages: list[dict], context: dict) -> dict:
        """Use LLM for deep conversation analysis."""
        thread_text = self._format_thread(messages)
        context_str = ""
        if context:
            context_str = (
                f"معلومات العميل: {context.get('lead_name', 'غير معروف')}, "
                f"الشركة: {context.get('company', 'غير معروف')}, "
                f"القطاع: {context.get('industry', 'غير محدد')}, "
                f"المرحلة: {context.get('stage', 'غير محدد')}"
            )

        system_prompt = (
            "أنت محلل محادثات مبيعات خبير في السوق السعودي.\n"
            "حلل المحادثة التالية واستخرج:\n"
            "1. ملخص المحادثة بالعربي والإنجليزي\n"
            "2. المواضيع الرئيسية\n"
            "3. الاعتراضات التي طرحها العميل\n"
            "4. المهام والإجراءات المطلوبة\n"
            "5. أفضل إجراء تالي\n\n"
            f"{context_str}\n\n"
            "أجب بصيغة JSON بالضبط:\n"
            "{\n"
            '  "summary_ar": "ملخص بالعربي",\n'
            '  "summary_en": "English summary",\n'
            '  "key_topics": ["موضوع1", "موضوع2"],\n'
            '  "objections": ["اعتراض1", "اعتراض2"],\n'
            '  "action_items": [\n'
            '    {"description_ar": "وصف", "description_en": "desc", "priority": "high|medium|low", "due_hint": "today|this_week|next_week"}\n'
            "  ],\n"
            '  "next_best_action_ar": "الإجراء التالي بالعربي",\n'
            '  "next_best_action_en": "Next action in English"\n'
            "}"
        )

        response = await self._llm.complete(
            system_prompt=system_prompt,
            user_message=thread_text,
            json_mode=True,
            temperature=0.2,
            max_tokens=1024,
        )
        parsed = response.parse_json()
        return parsed or {}

    # ── Quality Scoring ──────────────────────────

    def _calculate_quality_score(
        self,
        messages: list[dict],
        buying_signals: list[BuyingSignal],
        risk_signals: list[RiskSignal],
    ) -> float:
        """Calculate conversation quality score (0-10)."""
        score = 5.0  # baseline

        # Message volume factor
        msg_count = len(messages)
        if msg_count >= 10:
            score += 1.0
        elif msg_count >= 5:
            score += 0.5

        # Two-way engagement
        lead_msgs = sum(1 for m in messages if m.get("role") == "lead")
        agent_msgs = sum(1 for m in messages if m.get("role") == "agent")
        if lead_msgs > 0 and agent_msgs > 0:
            ratio = min(lead_msgs, agent_msgs) / max(lead_msgs, agent_msgs)
            score += ratio * 1.5  # balanced conversation = higher quality

        # Buying signals boost
        score += min(len(buying_signals) * 0.5, 2.0)

        # Risk signals penalty
        high_risks = sum(1 for r in risk_signals if r.severity == "high")
        score -= min(high_risks * 0.5, 2.0)

        # Average message length (longer = more engaged)
        avg_len = sum(len(m.get("content", "")) for m in messages) / max(msg_count, 1)
        if avg_len > 100:
            score += 0.5

        return max(0.0, min(10.0, score))

    # ── Helpers ──────────────────────────────────

    @staticmethod
    def _format_thread(messages: list[dict]) -> str:
        """Format messages into a readable thread for LLM."""
        lines = []
        for m in messages[-30:]:  # limit to last 30 messages
            role = "العميل" if m.get("role") == "lead" else "المندوب"
            timestamp = m.get("timestamp", "")
            channel = m.get("channel", "")
            prefix = f"[{timestamp}] [{channel}] {role}" if timestamp else f"[{channel}] {role}"
            lines.append(f"{prefix}: {m.get('content', '')}")
        return "\n".join(lines)

    @staticmethod
    def _detect_dominant_language(messages: list[dict]) -> str:
        """Quick check on whether the conversation is mostly Arabic or English."""
        arabic_re = re.compile(r"[\u0600-\u06FF]")
        arabic_chars = 0
        total_chars = 0
        for m in messages:
            content = m.get("content", "")
            arabic_chars += len(arabic_re.findall(content))
            total_chars += len(content)
        if total_chars == 0:
            return "ar"
        return "ar" if (arabic_chars / total_chars) > 0.3 else "en"

    @staticmethod
    def _parse_action_items(raw_items: list) -> list[ActionItem]:
        """Parse LLM action items into ActionItem objects."""
        items = []
        for item in raw_items:
            if isinstance(item, dict):
                items.append(ActionItem(
                    description_ar=item.get("description_ar", ""),
                    description_en=item.get("description_en", ""),
                    priority=item.get("priority", "medium"),
                    due_hint=item.get("due_hint"),
                ))
        return items

    @staticmethod
    def _generate_default_actions(
        buying_signals: list[BuyingSignal], risk_signals: list[RiskSignal]
    ) -> list[ActionItem]:
        """Generate default actions when LLM is unavailable."""
        actions = []
        if buying_signals:
            explicit = [s for s in buying_signals if s.signal_type == "explicit"]
            if explicit:
                actions.append(ActionItem(
                    description_ar="العميل أبدى رغبة شرائية واضحة — أرسل عرض سعر فوراً",
                    description_en="Lead showed explicit buying intent - send proposal immediately",
                    priority="high",
                    due_hint="today",
                ))
        high_risks = [r for r in risk_signals if r.severity == "high"]
        if high_risks:
            risk_types = set(r.risk_type for r in high_risks)
            if "price_objection" in risk_types:
                actions.append(ActionItem(
                    description_ar="العميل يشوف السعر غالي — جهّز مقارنة قيمة وعرض خاص",
                    description_en="Price objection detected - prepare value comparison and discount offer",
                    priority="high",
                    due_hint="today",
                ))
            if "competitor" in risk_types:
                actions.append(ActionItem(
                    description_ar="العميل يقارن بالمنافسين — جهّز مقارنة تنافسية",
                    description_en="Competitor comparison detected - prepare competitive analysis",
                    priority="high",
                    due_hint="today",
                ))
        if not actions:
            actions.append(ActionItem(
                description_ar="تابع مع العميل برسالة واتساب ودية",
                description_en="Follow up with a friendly WhatsApp message",
                priority="medium",
                due_hint="this_week",
            ))
        return actions

    @staticmethod
    def _default_next_action_ar(
        buying_signals: list[BuyingSignal], risk_signals: list[RiskSignal]
    ) -> str:
        if any(s.signal_type == "explicit" for s in buying_signals):
            return "العميل جاهز! أرسل عرض سعر مخصص واتصل خلال ساعة."
        high_risks = [r for r in risk_signals if r.severity == "high"]
        if high_risks:
            return "انتبه — فيه إشارات خطر. عالج الاعتراضات قبل المتابعة."
        if buying_signals:
            return "فيه اهتمام. أرسل معلومات إضافية وحدد موعد عرض."
        return "تابع المحادثة واسأل عن احتياجات العميل."

    @staticmethod
    def _build_fallback_summary_ar(messages: list[dict]) -> str:
        count = len(messages)
        lead_count = sum(1 for m in messages if m.get("role") == "lead")
        return f"محادثة مكونة من {count} رسالة ({lead_count} من العميل). لم يتم تحليل المحتوى بالتفصيل."

    @staticmethod
    def _build_fallback_summary_en(messages: list[dict]) -> str:
        count = len(messages)
        lead_count = sum(1 for m in messages if m.get("role") == "lead")
        return f"Conversation with {count} messages ({lead_count} from lead). Detailed analysis unavailable."
