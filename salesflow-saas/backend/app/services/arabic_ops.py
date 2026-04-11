"""
Arabic Operations Layer — Dealix AI Revenue OS (Mukhtasar + Mkhlab Pattern)
Arabic summarization, executive briefs, dialect handling, and Arabic content ops.
"""
import logging
import re
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class ArabicSummary(BaseModel):
    short_summary: str  # 1-2 sentences
    executive_summary: str  # 3-5 sentences
    action_bullets: list[str] = []
    decision_bullets: list[str] = []
    risks: list[str] = []
    unanswered_questions: list[str] = []
    source_reference: str = ""
    confidence: float = 0.8  # 0-1
    language: str = "ar"
    dialect: str = "msa"  # msa, saudi, gulf, egyptian, levantine
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ArabicContentCheck(BaseModel):
    has_arabic: bool
    has_rtl_markers: bool
    has_arabizi: bool
    has_code_switching: bool  # Arabic + English mixed
    detected_dialect: str
    issues: list[str] = []
    suggestions: list[str] = []


# Saudi dialect markers
SAUDI_MARKERS = [
    "وش", "ليش", "كذا", "يعني", "خلاص", "إن شاء الله", "يعطيك العافية",
    "ما يخالف", "يالله", "زين", "حيل", "واجد", "مو", "أبي", "أبغى",
    "كيف الحال", "الله يعافيك", "تكفى", "يا حبيبي", "مشكور",
]

# Arabizi patterns (Arabic written in Latin characters)
ARABIZI_PATTERNS = [
    r"\b(7abibi|ya ?3ni|inshalla|wallah|mesh|mafi|3adi|2ol|sa7)\b",
    r"\b(shu|wen|kif|hal|7aga|bas|yalla|7amdulilah)\b",
]

# Common Arabic stop words to skip in summarization
ARABIC_STOP_WORDS = {
    "في", "من", "على", "إلى", "عن", "هذا", "هذه", "التي", "الذي",
    "أن", "لا", "ما", "هو", "هي", "كان", "كانت", "مع", "أو", "ثم",
}


class ArabicOps:
    """Arabic operations: summarization, dialect detection, content QA."""

    async def summarize(
        self,
        text: str,
        context: str = "general",
        max_sentences: int = 5,
    ) -> ArabicSummary:
        """Summarize Arabic text for executive consumption."""
        if not text or len(text.strip()) < 20:
            return ArabicSummary(
                short_summary="نص قصير جداً للتلخيص",
                executive_summary="النص المقدم قصير جداً لإنتاج ملخص مفيد.",
                confidence=0.3,
            )

        dialect = self.detect_dialect(text)
        sentences = self._split_sentences(text)
        scored = self._score_sentences(sentences)
        top = sorted(scored, key=lambda x: x[1], reverse=True)

        short = top[0][0] if top else text[:200]
        exec_sentences = [s for s, _ in top[:max_sentences]]
        executive = " ".join(exec_sentences)

        actions = self._extract_bullets(text, "action")
        decisions = self._extract_bullets(text, "decision")
        risks = self._extract_bullets(text, "risk")
        questions = self._extract_bullets(text, "question")

        return ArabicSummary(
            short_summary=short,
            executive_summary=executive,
            action_bullets=actions,
            decision_bullets=decisions,
            risks=risks,
            unanswered_questions=questions,
            source_reference=context,
            confidence=0.75 if len(sentences) > 3 else 0.5,
            dialect=dialect,
        )

    def detect_dialect(self, text: str) -> str:
        """Detect Arabic dialect from text."""
        text_lower = text.lower()
        saudi_count = sum(1 for m in SAUDI_MARKERS if m in text)
        if saudi_count >= 2:
            return "saudi"

        gulf_markers = ["شلونك", "هالحين", "أشوف"]
        if any(m in text for m in gulf_markers):
            return "gulf"

        egyptian_markers = ["ازيك", "كده", "خالص", "بتاع"]
        if any(m in text for m in egyptian_markers):
            return "egyptian"

        levantine_markers = ["هلق", "شو", "كتير", "هيك"]
        if any(m in text for m in levantine_markers):
            return "levantine"

        return "msa"  # Modern Standard Arabic

    def check_arabizi(self, text: str) -> bool:
        """Check if text contains Arabizi (Arabic in Latin characters)."""
        for pattern in ARABIZI_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False

    def check_code_switching(self, text: str) -> bool:
        """Check for Arabic-English code-switching."""
        has_arabic = bool(re.search(r'[\u0600-\u06FF]', text))
        has_latin = bool(re.search(r'[a-zA-Z]{3,}', text))
        return has_arabic and has_latin

    def check_content(self, text: str) -> ArabicContentCheck:
        """Full Arabic content quality check."""
        has_arabic = bool(re.search(r'[\u0600-\u06FF]', text))
        has_rtl = bool(re.search(r'[\u200F\u202B\u202E]', text)) or has_arabic
        has_arabizi = self.check_arabizi(text)
        has_code_switch = self.check_code_switching(text)
        dialect = self.detect_dialect(text) if has_arabic else "none"

        issues = []
        suggestions = []

        if has_arabizi:
            issues.append("نص يحتوي على عربيزي — يفضل تحويله لعربي صحيح")
            suggestions.append("استخدم أداة تحويل العربيزي للعربي")

        if has_code_switch:
            suggestions.append("النص فيه خلط عربي-إنجليزي — تأكد من وضوح القراءة")

        if has_arabic and not has_rtl:
            issues.append("نص عربي بدون علامات RTL")
            suggestions.append("أضف dir='rtl' للعنصر المحتوي")

        return ArabicContentCheck(
            has_arabic=has_arabic,
            has_rtl_markers=has_rtl,
            has_arabizi=has_arabizi,
            has_code_switching=has_code_switch,
            detected_dialect=dialect,
            issues=issues,
            suggestions=suggestions,
        )

    async def generate_executive_brief(
        self, topic: str, content: str, audience: str = "executive"
    ) -> ArabicSummary:
        """Generate Arabic executive brief from content."""
        summary = await self.summarize(content, context=topic)

        if audience == "executive":
            summary.executive_summary = (
                f"ملخص تنفيذي — {topic}\n\n{summary.executive_summary}"
            )
        elif audience == "sales":
            summary.executive_summary = (
                f"ملخص للمبيعات — {topic}\n\n{summary.executive_summary}"
            )

        return summary

    async def compress_call_notes(self, notes: str) -> ArabicSummary:
        """Compress sales call notes into structured summary."""
        return await self.summarize(notes, context="مكالمة مبيعات", max_sentences=3)

    async def compress_market_research(self, research: str) -> ArabicSummary:
        """Compress market research into executive digest."""
        return await self.summarize(research, context="بحث سوق", max_sentences=5)

    def _split_sentences(self, text: str) -> list[str]:
        splits = re.split(r'[.!?؟。\n]+', text)
        return [s.strip() for s in splits if len(s.strip()) > 10]

    def _score_sentences(self, sentences: list[str]) -> list[tuple[str, float]]:
        scored = []
        for i, sentence in enumerate(sentences):
            words = sentence.split()
            content_words = [w for w in words if w not in ARABIC_STOP_WORDS]
            length_score = min(len(content_words) / 15, 1.0)
            position_score = 1.0 - (i / max(len(sentences), 1)) * 0.3
            keyword_score = 0.0
            important_words = ["مهم", "ضروري", "يجب", "أساسي", "رئيسي", "هدف", "نتيجة", "قرار"]
            keyword_score = sum(0.1 for w in important_words if w in sentence)
            total = length_score * 0.3 + position_score * 0.4 + min(keyword_score, 0.3) * 1.0
            scored.append((sentence, total))
        return scored

    def _extract_bullets(self, text: str, bullet_type: str) -> list[str]:
        bullets = []
        patterns = {
            "action": ["يجب", "لازم", "المطلوب", "الخطوة التالية", "نحتاج"],
            "decision": ["تم الاتفاق", "القرار", "تم تحديد", "اخترنا"],
            "risk": ["خطر", "مشكلة", "تحدي", "عائق", "صعوبة"],
            "question": ["هل", "متى", "كيف", "لماذا", "ليش", "وش"],
        }
        keywords = patterns.get(bullet_type, [])
        for sentence in self._split_sentences(text):
            if any(kw in sentence for kw in keywords):
                bullets.append(sentence)
                if len(bullets) >= 5:
                    break
        return bullets


arabic_ops = ArabicOps()
