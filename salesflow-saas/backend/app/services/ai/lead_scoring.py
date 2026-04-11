"""
AI Lead Scoring Engine — Calculates a 0-100 score for each lead
based on engagement, profile, behavior, and Arabic NLP intent analysis.
"""

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai.arabic_nlp import ArabicNLPService

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class ScoreBreakdown:
    category: str
    score: float
    max_score: float
    explanation_ar: str
    explanation_en: str
    factors: list[dict] = field(default_factory=list)


@dataclass
class LeadScoreResult:
    lead_id: str
    total_score: int  # 0-100
    grade: str  # A, B, C, D, F
    breakdowns: list[ScoreBreakdown] = field(default_factory=list)
    summary_ar: str = ""
    summary_en: str = ""
    recommended_action_ar: str = ""
    last_scored_at: str = ""


# ---------------------------------------------------------------------------
# Scoring thresholds and weights
# ---------------------------------------------------------------------------

GRADE_THRESHOLDS = {"A": 80, "B": 60, "C": 40, "D": 20, "F": 0}

RESPONSE_SPEED_THRESHOLDS = {
    "excellent": timedelta(minutes=15),
    "good": timedelta(hours=1),
    "average": timedelta(hours=4),
    "slow": timedelta(hours=24),
}

IMPORTANT_INDUSTRIES = [
    "real_estate", "healthcare", "retail", "ecommerce", "construction",
    "education", "hospitality", "automotive", "fintech", "logistics",
]


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class LeadScoringEngine:
    """Calculates AI-powered lead scores with Arabic NLP intent analysis."""

    def __init__(self):
        self._nlp = ArabicNLPService()

    async def score_lead(
        self, lead_id: str, tenant_id: str, db: AsyncSession
    ) -> LeadScoreResult:
        """Calculate a comprehensive lead score (0-100)."""
        now = datetime.now(timezone.utc)

        try:
            lead_data = await self._fetch_lead_data(lead_id, tenant_id, db)
        except Exception as e:
            logger.error(f"Failed to fetch lead data for {lead_id}: {e}")
            return LeadScoreResult(
                lead_id=lead_id,
                total_score=0,
                grade="F",
                summary_ar="تعذر حساب النتيجة - لم يتم العثور على بيانات العميل المحتمل",
                summary_en="Score calculation failed - lead data not found",
                last_scored_at=now.isoformat(),
            )

        engagement = await self._score_engagement(lead_data)
        profile = self._score_profile(lead_data)
        behavioral = self._score_behavioral(lead_data)
        intent = await self._score_intent(lead_data)

        total = int(
            engagement.score + profile.score + behavioral.score + intent.score
        )
        total = max(0, min(100, total))
        grade = self._calculate_grade(total)

        summary_ar = self._build_arabic_summary(total, grade, engagement, profile, behavioral, intent)
        summary_en = self._build_english_summary(total, grade)
        action_ar = self._recommend_action_ar(total, grade, intent, engagement)

        result = LeadScoreResult(
            lead_id=lead_id,
            total_score=total,
            grade=grade,
            breakdowns=[engagement, profile, behavioral, intent],
            summary_ar=summary_ar,
            summary_en=summary_en,
            recommended_action_ar=action_ar,
            last_scored_at=now.isoformat(),
        )

        await self._persist_score(lead_id, tenant_id, result, db)
        return result

    # ── Data Fetching ────────────────────────────

    async def _fetch_lead_data(self, lead_id: str, tenant_id: str, db: AsyncSession) -> dict:
        """Fetch all lead-related data for scoring."""
        from app.models.lead import Lead

        stmt = select(Lead).where(Lead.id == lead_id, Lead.tenant_id == tenant_id)
        row = await db.execute(stmt)
        lead = row.scalar_one_or_none()
        if not lead:
            raise ValueError(f"Lead {lead_id} not found")

        messages = await self._fetch_messages(lead_id, db)
        activities = await self._fetch_activities(lead_id, db)

        return {
            "lead": lead,
            "full_name": getattr(lead, "full_name", "") or "",
            "email": getattr(lead, "email", "") or "",
            "phone": getattr(lead, "phone", "") or "",
            "company_name": getattr(lead, "company_name", "") or "",
            "sector": getattr(lead, "sector", "") or "",
            "city": getattr(lead, "city", "") or "",
            "source": getattr(lead, "source", "") or "",
            "status": getattr(lead, "status", "new"),
            "created_at": getattr(lead, "created_at", None),
            "messages": messages,
            "activities": activities,
        }

    async def _fetch_messages(self, lead_id: str, db: AsyncSession) -> list[dict]:
        """Fetch WhatsApp/email messages for a lead."""
        try:
            from app.models.message import Message
            stmt = (
                select(Message)
                .where(Message.lead_id == lead_id)
                .order_by(Message.created_at.desc())
                .limit(50)
            )
            rows = await db.execute(stmt)
            return [
                {
                    "content": getattr(m, "content", ""),
                    "channel": getattr(m, "channel", ""),
                    "direction": getattr(m, "direction", ""),
                    "created_at": getattr(m, "created_at", None),
                }
                for m in rows.scalars().all()
            ]
        except Exception:
            logger.debug("Message model not available, skipping message fetch")
            return []

    async def _fetch_activities(self, lead_id: str, db: AsyncSession) -> list[dict]:
        """Fetch activity log for a lead."""
        try:
            from app.models.activity import Activity
            stmt = (
                select(Activity)
                .where(Activity.lead_id == lead_id)
                .order_by(Activity.created_at.desc())
                .limit(100)
            )
            rows = await db.execute(stmt)
            return [
                {
                    "type": getattr(a, "type", ""),
                    "metadata": getattr(a, "metadata", {}),
                    "created_at": getattr(a, "created_at", None),
                }
                for a in rows.scalars().all()
            ]
        except Exception:
            logger.debug("Activity model not available, skipping activity fetch")
            return []

    # ── Sub-Scores ───────────────────────────────

    async def _score_engagement(self, data: dict) -> ScoreBreakdown:
        """Engagement Score: WhatsApp messages, email opens, response speed. Max 30 pts."""
        factors = []
        score = 0.0

        # WhatsApp message count (max 12 pts)
        messages = data.get("messages", [])
        wa_messages = [m for m in messages if m.get("channel") == "whatsapp"]
        inbound_wa = [m for m in wa_messages if m.get("direction") == "inbound"]
        wa_count = len(inbound_wa)
        if wa_count >= 10:
            wa_score = 12.0
        elif wa_count >= 5:
            wa_score = 9.0
        elif wa_count >= 2:
            wa_score = 6.0
        elif wa_count >= 1:
            wa_score = 3.0
        else:
            wa_score = 0.0
        score += wa_score
        factors.append({
            "name": "رسائل واتساب",
            "value": wa_count,
            "points": wa_score,
            "max": 12,
        })

        # Email engagement (max 9 pts)
        email_msgs = [m for m in messages if m.get("channel") == "email"]
        email_opens = len([
            a for a in data.get("activities", [])
            if a.get("type") == "email_open"
        ])
        email_score = min(email_opens * 1.5, 9.0)
        if not email_opens and email_msgs:
            email_score = 2.0
        score += email_score
        factors.append({
            "name": "تفاعل البريد الإلكتروني",
            "value": email_opens,
            "points": email_score,
            "max": 9,
        })

        # Response speed (max 9 pts)
        response_score = self._calc_response_speed(messages)
        score += response_score
        factors.append({
            "name": "سرعة الرد",
            "value": f"{response_score:.1f}/9",
            "points": response_score,
            "max": 9,
        })

        explanation_ar = f"مجموع التفاعل: {score:.0f} من 30 نقطة"
        if wa_count == 0 and email_opens == 0:
            explanation_ar += " — لم يتم رصد أي تفاعل بعد"
        elif score >= 20:
            explanation_ar += " — تفاعل ممتاز"

        return ScoreBreakdown(
            category="engagement",
            score=round(min(score, 30), 1),
            max_score=30,
            explanation_ar=explanation_ar,
            explanation_en=f"Engagement: {score:.0f}/30",
            factors=factors,
        )

    def _calc_response_speed(self, messages: list[dict]) -> float:
        """Calculate response speed score from message timestamps."""
        inbound = [m for m in messages if m.get("direction") == "inbound"]
        outbound = [m for m in messages if m.get("direction") == "outbound"]
        if not inbound or not outbound:
            return 3.0  # neutral default

        # Check last inbound -> next outbound gap
        try:
            last_inbound_time = inbound[0].get("created_at")
            response_times = []
            for ob in outbound:
                ob_time = ob.get("created_at")
                if ob_time and last_inbound_time and ob_time > last_inbound_time:
                    continue
                if ob_time and last_inbound_time:
                    gap = abs((last_inbound_time - ob_time).total_seconds())
                    response_times.append(gap)

            if not response_times:
                return 4.5

            avg_gap_seconds = sum(response_times) / len(response_times)
            if avg_gap_seconds < 900:  # < 15 min
                return 9.0
            elif avg_gap_seconds < 3600:  # < 1 hr
                return 7.0
            elif avg_gap_seconds < 14400:  # < 4 hrs
                return 5.0
            elif avg_gap_seconds < 86400:  # < 24 hrs
                return 3.0
            else:
                return 1.0
        except Exception:
            return 3.0

    def _score_profile(self, data: dict) -> ScoreBreakdown:
        """Profile Score: Contact completeness, company info, industry match. Max 25 pts."""
        factors = []
        score = 0.0

        # Contact completeness (max 10 pts)
        completeness = 0
        if data.get("full_name"):
            completeness += 2.5
        if data.get("email"):
            completeness += 2.5
        if data.get("phone"):
            completeness += 2.5
        if data.get("city"):
            completeness += 2.5
        score += completeness
        factors.append({
            "name": "اكتمال بيانات التواصل",
            "value": f"{int(completeness / 2.5)}/4 حقول",
            "points": completeness,
            "max": 10,
        })

        # Company info (max 8 pts)
        company_score = 0.0
        if data.get("company_name"):
            company_score += 4.0
        if data.get("sector"):
            company_score += 4.0
        score += company_score
        factors.append({
            "name": "معلومات الشركة",
            "value": data.get("company_name", "غير محدد"),
            "points": company_score,
            "max": 8,
        })

        # Industry match (max 7 pts)
        sector = (data.get("sector") or "").lower().replace(" ", "_")
        if sector in IMPORTANT_INDUSTRIES:
            industry_score = 7.0
        elif sector:
            industry_score = 4.0
        else:
            industry_score = 0.0
        score += industry_score
        factors.append({
            "name": "تطابق القطاع",
            "value": data.get("sector", "غير محدد"),
            "points": industry_score,
            "max": 7,
        })

        return ScoreBreakdown(
            category="profile",
            score=round(min(score, 25), 1),
            max_score=25,
            explanation_ar=f"اكتمال الملف: {score:.0f} من 25 نقطة",
            explanation_en=f"Profile: {score:.0f}/25",
            factors=factors,
        )

    def _score_behavioral(self, data: dict) -> ScoreBreakdown:
        """Behavioral Score: Pages, proposals, meetings. Max 25 pts."""
        factors = []
        score = 0.0
        activities = data.get("activities", [])

        # Pages visited (max 8 pts)
        page_visits = len([a for a in activities if a.get("type") == "page_view"])
        pages_score = min(page_visits * 1.0, 8.0)
        score += pages_score
        factors.append({
            "name": "صفحات تمت زيارتها",
            "value": page_visits,
            "points": pages_score,
            "max": 8,
        })

        # Proposals viewed (max 10 pts)
        proposals_viewed = len([a for a in activities if a.get("type") in ("proposal_view", "proposal_download")])
        proposals_score = min(proposals_viewed * 5.0, 10.0)
        score += proposals_score
        factors.append({
            "name": "عروض الأسعار المعروضة",
            "value": proposals_viewed,
            "points": proposals_score,
            "max": 10,
        })

        # Meetings attended (max 7 pts)
        meetings = len([a for a in activities if a.get("type") in ("meeting_attended", "meeting_completed")])
        meeting_score = min(meetings * 3.5, 7.0)
        score += meeting_score
        factors.append({
            "name": "اجتماعات حضرها",
            "value": meetings,
            "points": meeting_score,
            "max": 7,
        })

        return ScoreBreakdown(
            category="behavioral",
            score=round(min(score, 25), 1),
            max_score=25,
            explanation_ar=f"السلوك: {score:.0f} من 25 نقطة",
            explanation_en=f"Behavioral: {score:.0f}/25",
            factors=factors,
        )

    async def _score_intent(self, data: dict) -> ScoreBreakdown:
        """Intent Score: Arabic NLP intent analysis from conversations. Max 20 pts."""
        factors = []
        score = 0.0
        messages = data.get("messages", [])

        # Gather inbound message text for NLP
        inbound_texts = [
            m.get("content", "")
            for m in messages
            if m.get("direction") == "inbound" and m.get("content")
        ]

        if not inbound_texts:
            return ScoreBreakdown(
                category="intent",
                score=0,
                max_score=20,
                explanation_ar="النية: 0 من 20 — لا توجد رسائل واردة للتحليل",
                explanation_en="Intent: 0/20 - no inbound messages to analyze",
                factors=[],
            )

        # Analyze up to 10 most recent messages
        combined_text = "\n".join(inbound_texts[:10])

        try:
            intent_result = await self._nlp.extract_intent(combined_text)
            sentiment_result = await self._nlp.analyze_sentiment(combined_text)
        except Exception as e:
            logger.warning(f"NLP analysis failed for intent scoring: {e}")
            return ScoreBreakdown(
                category="intent",
                score=5,
                max_score=20,
                explanation_ar="النية: 5 من 20 — تعذر تحليل الرسائل بالكامل",
                explanation_en="Intent: 5/20 - partial analysis",
                factors=[],
            )

        # Intent score (max 12 pts)
        intent_scores = {
            "buying_intent": 12.0,
            "pricing_inquiry": 9.0,
            "appointment_request": 10.0,
            "complaint": 3.0,
            "general_inquiry": 5.0,
        }
        intent_pts = intent_scores.get(intent_result.intent, 5.0)
        intent_pts *= intent_result.confidence
        score += intent_pts
        factors.append({
            "name": "نية العميل",
            "value": intent_result.intent,
            "points": round(intent_pts, 1),
            "max": 12,
        })

        # Sentiment boost (max 8 pts)
        sentiment_map = {"positive": 8.0, "neutral": 4.0, "negative": 1.0}
        sent_pts = sentiment_map.get(sentiment_result.sentiment, 4.0)
        sent_pts *= sentiment_result.confidence
        score += sent_pts
        factors.append({
            "name": "مزاج العميل",
            "value": sentiment_result.sentiment,
            "points": round(sent_pts, 1),
            "max": 8,
        })

        return ScoreBreakdown(
            category="intent",
            score=round(min(score, 20), 1),
            max_score=20,
            explanation_ar=f"النية: {score:.0f} من 20 — نية {intent_result.intent}، مزاج {sentiment_result.sentiment}",
            explanation_en=f"Intent: {score:.0f}/20 - {intent_result.intent}, {sentiment_result.sentiment}",
            factors=factors,
        )

    # ── Helpers ───────────────────────────────────

    @staticmethod
    def _calculate_grade(total: int) -> str:
        for grade, threshold in GRADE_THRESHOLDS.items():
            if total >= threshold:
                return grade
        return "F"

    @staticmethod
    def _build_arabic_summary(
        total: int, grade: str,
        engagement: ScoreBreakdown, profile: ScoreBreakdown,
        behavioral: ScoreBreakdown, intent: ScoreBreakdown,
    ) -> str:
        parts = [f"التقييم الإجمالي: {total}/100 (درجة {grade})"]
        parts.append(f"  - التفاعل: {engagement.score:.0f}/{engagement.max_score:.0f}")
        parts.append(f"  - الملف الشخصي: {profile.score:.0f}/{profile.max_score:.0f}")
        parts.append(f"  - السلوك: {behavioral.score:.0f}/{behavioral.max_score:.0f}")
        parts.append(f"  - النية: {intent.score:.0f}/{intent.max_score:.0f}")
        if total >= 80:
            parts.append("هذا عميل محتمل ممتاز — يجب التواصل فوراً!")
        elif total >= 60:
            parts.append("عميل واعد — يحتاج متابعة نشطة")
        elif total >= 40:
            parts.append("عميل متوسط — يحتاج تنمية وتأهيل")
        else:
            parts.append("عميل بارد — يحتاج حملة إعادة تفعيل")
        return "\n".join(parts)

    @staticmethod
    def _build_english_summary(total: int, grade: str) -> str:
        status = {
            "A": "Hot lead - immediate action required",
            "B": "Warm lead - active nurturing needed",
            "C": "Medium lead - needs qualification",
            "D": "Cold lead - needs re-engagement",
            "F": "Inactive - consider removing or re-targeting",
        }
        return f"Score: {total}/100 (Grade {grade}) - {status.get(grade, '')}"

    @staticmethod
    def _recommend_action_ar(
        total: int, grade: str, intent: ScoreBreakdown, engagement: ScoreBreakdown
    ) -> str:
        if grade == "A":
            return "اتصل بالعميل الآن! أرسل عرض سعر مخصص واحجز اجتماع عرض المنتج."
        elif grade == "B":
            return "أرسل رسالة واتساب شخصية واستفسر عن احتياجاته. تابع خلال 24 ساعة."
        elif grade == "C":
            if engagement.score < 10:
                return "العميل لم يتفاعل كفاية. أرسل محتوى تعليمي عن المنتج ودراسة حالة."
            return "أرسل بريد إلكتروني بعرض خاص ومحدود الوقت لتحفيز اتخاذ القرار."
        elif grade == "D":
            return "أضف العميل لحملة تنقيط تلقائية (drip campaign) وتابع بعد أسبوعين."
        else:
            return "راجع بيانات العميل وتأكد من صحتها. إذا لم يتفاعل خلال 30 يوم، أرشف الملف."

    async def _persist_score(
        self, lead_id: str, tenant_id: str, result: LeadScoreResult, db: AsyncSession
    ) -> None:
        """Save the score to the database."""
        try:
            from app.models.lead import Lead
            from sqlalchemy import update

            stmt = (
                update(Lead)
                .where(Lead.id == lead_id, Lead.tenant_id == tenant_id)
                .values(score=result.total_score)
            )
            await db.execute(stmt)
            await db.commit()
            logger.info(f"Lead {lead_id} scored {result.total_score} (grade {result.grade})")
        except Exception as e:
            logger.warning(f"Failed to persist score for lead {lead_id}: {e}")
            await db.rollback()
