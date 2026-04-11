"""
Arabic NLP Service — Language detection, intent extraction, entity recognition,
and sentiment analysis optimized for Saudi Arabic dialect.
Uses regex for fast pattern matching and LLM for complex analysis.
"""

import re
import json
import logging
from dataclasses import dataclass, field
from typing import Optional

from app.services.llm.provider import get_llm

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class LanguageDetection:
    language: str  # "ar", "en", "mixed"
    confidence: float  # 0.0 - 1.0
    is_saudi_dialect: bool
    dialect_markers_found: list[str] = field(default_factory=list)
    region_hint: Optional[str] = None  # "najdi", "hijazi", "sharqawi"


@dataclass
class IntentResult:
    intent: str  # buying_intent, pricing_inquiry, appointment_request, complaint, general_inquiry
    confidence: float
    sub_intent: Optional[str] = None
    raw_signals: list[str] = field(default_factory=list)


@dataclass
class EntityResult:
    names: list[str] = field(default_factory=list)
    phone_numbers: list[str] = field(default_factory=list)
    dates: list[str] = field(default_factory=list)
    amounts: list[dict] = field(default_factory=list)  # {"value": 5000, "currency": "SAR", "raw": "..."}
    locations: list[str] = field(default_factory=list)


@dataclass
class SentimentResult:
    sentiment: str  # "positive", "neutral", "negative"
    confidence: float
    emotional_tone: Optional[str] = None  # "satisfied", "frustrated", "eager", "hesitant"
    key_phrases: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ARABIC_RANGE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]")

SAUDI_DIALECT_MARKERS = [
    "وش", "ايش", "كيف حالك", "يعطيك العافية", "هلا والله", "كذا",
    "خلاص", "يا رجال", "وش لونك", "مب", "ماعندي", "الحين", "دحين",
    "تمام", "يا زين", "شلونك", "أبي", "أبغى", "يا بوي", "كيفك",
    "عطني", "خلني", "ماشي", "يالله", "بس", "حلو", "ياخي", "زين",
]

REGIONAL_MARKERS = {
    "najdi": ["ايش", "كذا", "يا رجال", "وش لونك", "الحين", "أبي", "أبغى"],
    "hijazi": ["كده", "ليش", "يا زين", "دحين", "عايز", "ابغى"],
    "sharqawi": ["شلونك", "هاي", "بعد", "يا بوي", "اشلون"],
}

INTENT_PATTERNS = {
    "buying_intent": [
        r"أبي\s*أشتري", r"أبغى\s*أطلب", r"أبي\s*عرض\s*سعر", r"نبي\s*ن[شس]تري",
        r"ودي\s*آخذ", r"interested", r"want to buy", r"أبي\s*أعرف\s*السعر",
        r"جاهز\s*أشتري", r"أبي\s*أكمل\s*الطلب", r"نبي\s*نبدأ",
    ],
    "pricing_inquiry": [
        r"كم\s*السعر", r"كم\s*سعر", r"بكم", r"وش\s*[اأ]سعار", r"أسعاركم",
        r"how much", r"price", r"عرض\s*سعر", r"كم\s*تكلفة", r"كم\s*ريال",
        r"عندكم\s*عرض", r"فيه\s*خصم", r"أرخص\s*سعر",
    ],
    "appointment_request": [
        r"أبي\s*موعد", r"نبي\s*اجتماع", r"متى\s*فاضي", r"متى\s*تقدر",
        r"نتقابل", r"ممكن\s*نتواصل", r"schedule", r"meeting",
        r"أبي\s*زيارة", r"ودي\s*أجي", r"متى\s*نتقابل",
    ],
    "complaint": [
        r"عندي\s*مشكلة", r"ما\s*يشتغل", r"خربان", r"مو\s*راضي",
        r"أبي\s*أشتكي", r"complaint", r"problem", r"زعلان",
        r"ما\s*عجبني", r"سيئ", r"خدمة\s*سيئة", r"ما\s*رديتوا",
    ],
}

SAUDI_CITIES = [
    "الرياض", "جدة", "مكة", "المدينة", "الدمام", "الخبر", "الظهران",
    "الطائف", "تبوك", "بريدة", "عنيزة", "حائل", "جازان", "نجران",
    "أبها", "خميس مشيط", "الجبيل", "ينبع", "المجمعة", "الأحساء",
    "القطيف", "حفر الباطن", "سكاكا", "الباحة", "عرعر",
    "Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar",
    "Dhahran", "Tabuk", "Abha", "Jubail", "Yanbu", "NEOM",
]

PHONE_PATTERNS = [
    re.compile(r"(?:\+?966|00966|0)[\s-]?5\d[\s-]?\d{3}[\s-]?\d{4}"),
    re.compile(r"05\d{8}"),
    re.compile(r"\+9665\d{8}"),
]

AMOUNT_PATTERN = re.compile(
    r"(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|ر\.س|SAR|sar|ر\.س\.)"
)

ARABIC_DATE_PATTERNS = [
    re.compile(r"\d{1,2}\s*/\s*\d{1,2}\s*/\s*\d{2,4}"),
    re.compile(r"\d{4}-\d{2}-\d{2}"),
    re.compile(
        r"(?:يوم|بتاريخ|في)\s+"
        r"(?:السبت|الأحد|الاثنين|الثلاثاء|الأربعاء|الخميس|الجمعة)"
        r"(?:\s+\d{1,2})?"
    ),
    re.compile(r"(?:بعد\s+)?(?:أسبوع|شهر|يومين|ثلاث\s+أيام|باكر|بكرة|غداً)"),
]

POSITIVE_MARKERS = [
    "ممتاز", "حلو", "رائع", "تمام", "أحسنت", "ماشاء الله", "يعطيك العافية",
    "مشكور", "شكراً", "الله يعطيك", "زين", "عجبني", "مبسوط", "ممنون",
    "great", "amazing", "thank", "good", "excellent", "love",
]

NEGATIVE_MARKERS = [
    "غالي", "سيئ", "مو كويس", "ما عجبني", "زعلان", "مشكلة", "خربان",
    "ما يشتغل", "خدمة سيئة", "مو راضي", "ما رديتوا", "بطيء",
    "bad", "terrible", "worst", "hate", "angry", "disappointed",
]


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class ArabicNLPService:
    """Arabic NLP processing with Saudi dialect support."""

    def __init__(self):
        self._llm = get_llm()

    # ── Language Detection ────────────────────────

    async def detect_language(self, text: str) -> LanguageDetection:
        """Detect whether text is Arabic, English, or mixed, plus Saudi dialect markers."""
        if not text or not text.strip():
            return LanguageDetection(language="en", confidence=0.0, is_saudi_dialect=False)

        arabic_chars = len(ARABIC_RANGE.findall(text))
        total_alpha = sum(1 for c in text if c.isalpha())
        if total_alpha == 0:
            return LanguageDetection(language="en", confidence=0.5, is_saudi_dialect=False)

        arabic_ratio = arabic_chars / total_alpha

        # Find Saudi dialect markers
        text_lower = text.lower()
        found_markers = [m for m in SAUDI_DIALECT_MARKERS if m in text_lower or m in text]
        is_saudi = len(found_markers) > 0

        # Detect region
        region_hint = None
        if is_saudi:
            region_scores = {}
            for region, markers in REGIONAL_MARKERS.items():
                region_scores[region] = sum(1 for m in markers if m in text_lower or m in text)
            best_region = max(region_scores, key=region_scores.get)
            if region_scores[best_region] > 0:
                region_hint = best_region

        if arabic_ratio > 0.7:
            lang = "ar"
            confidence = min(arabic_ratio + 0.1, 1.0)
        elif arabic_ratio > 0.3:
            lang = "mixed"
            confidence = 0.7
        else:
            lang = "en"
            confidence = min((1 - arabic_ratio) + 0.1, 1.0)

        return LanguageDetection(
            language=lang,
            confidence=round(confidence, 2),
            is_saudi_dialect=is_saudi,
            dialect_markers_found=found_markers,
            region_hint=region_hint,
        )

    # ── Intent Detection ─────────────────────────

    async def extract_intent(self, text: str) -> IntentResult:
        """Extract user intent from Arabic or English message."""
        if not text or not text.strip():
            return IntentResult(intent="general_inquiry", confidence=0.3)

        # Fast regex pass
        regex_result = self._regex_intent(text)
        if regex_result and regex_result.confidence >= 0.8:
            return regex_result

        # LLM for ambiguous or complex text
        try:
            llm_result = await self._llm_intent(text)
            if regex_result:
                # Combine: prefer LLM intent but boost confidence if regex agrees
                if llm_result.intent == regex_result.intent:
                    llm_result.confidence = min(llm_result.confidence + 0.15, 1.0)
                    llm_result.raw_signals.extend(regex_result.raw_signals)
            return llm_result
        except Exception as e:
            logger.warning(f"LLM intent extraction failed: {e}")
            return regex_result or IntentResult(intent="general_inquiry", confidence=0.3)

    def _regex_intent(self, text: str) -> Optional[IntentResult]:
        """Fast regex-based intent detection."""
        best_intent = None
        best_score = 0
        best_signals = []

        for intent, patterns in INTENT_PATTERNS.items():
            signals = []
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    signals.extend(matches)
            if len(signals) > best_score:
                best_score = len(signals)
                best_intent = intent
                best_signals = signals

        if best_intent and best_score > 0:
            confidence = min(0.6 + (best_score * 0.1), 0.95)
            return IntentResult(
                intent=best_intent,
                confidence=round(confidence, 2),
                raw_signals=best_signals[:5],
            )
        return None

    async def _llm_intent(self, text: str) -> IntentResult:
        """LLM-based intent detection for complex text."""
        system_prompt = (
            "أنت محلل نوايا العملاء في نظام CRM سعودي. "
            "حلل الرسالة التالية واستخرج النية الأساسية.\n"
            "أجب بصيغة JSON فقط بالشكل التالي:\n"
            '{"intent": "buying_intent|pricing_inquiry|appointment_request|complaint|general_inquiry", '
            '"confidence": 0.0-1.0, "sub_intent": "وصف مختصر بالعربي أو null", '
            '"signals": ["إشارة1", "إشارة2"]}'
        )
        response = await self._llm.complete(
            system_prompt=system_prompt,
            user_message=text,
            json_mode=True,
            temperature=0.1,
            max_tokens=256,
            fast=True,
        )
        parsed = response.parse_json()
        if parsed:
            return IntentResult(
                intent=parsed.get("intent", "general_inquiry"),
                confidence=float(parsed.get("confidence", 0.5)),
                sub_intent=parsed.get("sub_intent"),
                raw_signals=parsed.get("signals", []),
            )
        return IntentResult(intent="general_inquiry", confidence=0.4)

    # ── Entity Extraction ────────────────────────

    async def extract_entities(self, text: str) -> EntityResult:
        """Extract names, phones, dates, amounts, locations from Arabic/English text."""
        result = EntityResult()

        # Phone numbers (regex)
        for pattern in PHONE_PATTERNS:
            phones = pattern.findall(text)
            result.phone_numbers.extend(
                [re.sub(r"[\s-]", "", p) for p in phones]
            )
        result.phone_numbers = list(set(result.phone_numbers))

        # Amounts in SAR (regex)
        for match in AMOUNT_PATTERN.finditer(text):
            raw_value = match.group(1).replace(",", "")
            try:
                result.amounts.append({
                    "value": float(raw_value),
                    "currency": "SAR",
                    "raw": match.group(0),
                })
            except ValueError:
                pass

        # Dates (regex)
        for pattern in ARABIC_DATE_PATTERNS:
            dates = pattern.findall(text)
            result.dates.extend(dates)
        result.dates = list(set(result.dates))

        # Saudi cities (string match)
        for city in SAUDI_CITIES:
            if city in text:
                result.locations.append(city)
        result.locations = list(set(result.locations))

        # Names via LLM (hard to do with regex for Arabic)
        try:
            names = await self._extract_names_llm(text)
            result.names = names
        except Exception as e:
            logger.warning(f"LLM name extraction failed: {e}")

        return result

    async def _extract_names_llm(self, text: str) -> list[str]:
        """Use LLM to extract person names from Arabic text."""
        system_prompt = (
            "استخرج أسماء الأشخاص فقط من النص التالي. "
            "أجب بصيغة JSON: {\"names\": [\"اسم1\", \"اسم2\"]}. "
            "إذا لم يوجد أسماء أرجع قائمة فارغة."
        )
        response = await self._llm.complete(
            system_prompt=system_prompt,
            user_message=text,
            json_mode=True,
            temperature=0.0,
            max_tokens=128,
            fast=True,
        )
        parsed = response.parse_json()
        if parsed and "names" in parsed:
            return parsed["names"]
        return []

    # ── Sentiment Analysis ───────────────────────

    async def analyze_sentiment(self, text: str) -> SentimentResult:
        """Analyze sentiment in Arabic/English text with Saudi cultural awareness."""
        if not text or not text.strip():
            return SentimentResult(sentiment="neutral", confidence=0.5)

        # Fast regex pass
        regex_result = self._regex_sentiment(text)
        if regex_result.confidence >= 0.85:
            return regex_result

        # LLM for nuanced analysis
        try:
            return await self._llm_sentiment(text, regex_result)
        except Exception as e:
            logger.warning(f"LLM sentiment analysis failed: {e}")
            return regex_result

    def _regex_sentiment(self, text: str) -> SentimentResult:
        """Fast regex sentiment scoring."""
        pos_count = sum(1 for m in POSITIVE_MARKERS if m in text)
        neg_count = sum(1 for m in NEGATIVE_MARKERS if m in text)
        matched_phrases = (
            [m for m in POSITIVE_MARKERS if m in text]
            + [m for m in NEGATIVE_MARKERS if m in text]
        )

        if pos_count > neg_count:
            sentiment = "positive"
            confidence = min(0.5 + (pos_count - neg_count) * 0.1, 0.95)
        elif neg_count > pos_count:
            sentiment = "negative"
            confidence = min(0.5 + (neg_count - pos_count) * 0.1, 0.95)
        else:
            sentiment = "neutral"
            confidence = 0.5

        return SentimentResult(
            sentiment=sentiment,
            confidence=round(confidence, 2),
            key_phrases=matched_phrases[:5],
        )

    async def _llm_sentiment(self, text: str, regex_hint: SentimentResult) -> SentimentResult:
        """LLM sentiment analysis with Saudi cultural context."""
        system_prompt = (
            "أنت محلل مشاعر متخصص في اللهجة السعودية والثقافة السعودية.\n"
            "حلل المشاعر في النص التالي مع مراعاة:\n"
            '- "يعطيك العافية" = إيجابي/شكر\n'
            '- "ان شاء الله" بدون تفاصيل = قد يكون تردد\n'
            '- "خلني أفكر" = حياد/تردد\n'
            '- "ماشي" = موافقة خفيفة\n'
            "أجب بصيغة JSON:\n"
            '{"sentiment": "positive|neutral|negative", '
            '"confidence": 0.0-1.0, '
            '"emotional_tone": "satisfied|frustrated|eager|hesitant|neutral", '
            '"key_phrases": ["عبارة1", "عبارة2"]}'
        )
        response = await self._llm.complete(
            system_prompt=system_prompt,
            user_message=text,
            json_mode=True,
            temperature=0.1,
            max_tokens=256,
            fast=True,
        )
        parsed = response.parse_json()
        if parsed:
            return SentimentResult(
                sentiment=parsed.get("sentiment", regex_hint.sentiment),
                confidence=float(parsed.get("confidence", regex_hint.confidence)),
                emotional_tone=parsed.get("emotional_tone"),
                key_phrases=parsed.get("key_phrases", regex_hint.key_phrases),
            )
        return regex_hint
