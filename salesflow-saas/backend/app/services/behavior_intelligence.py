"""
Behavior Intelligence — Pattern detection engine for Dealix CRM.

Watch-mode analytics that detects winning sequences, top-rep behaviours,
optimal contact times, at-risk deals, and generates Arabic recommendations.
Operates on in-memory signal history; no autonomous actions taken.
"""

from __future__ import annotations

import logging
import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger("dealix.services.behavior_intelligence")

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class TrackedPattern(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    tenant_id: str
    pattern_type: str  # winning_sequence, fast_close, high_conversion_rep, at_risk, best_time
    description: str
    description_ar: str
    confidence: float = 0.0  # 0-1
    frequency: int = 1
    entities_involved: List[str] = []
    first_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    suggested_action: str = ""
    suggested_action_ar: str = ""


class Recommendation(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    tenant_id: str
    category: str  # performance, sequence, timing, risk
    title_ar: str
    detail_ar: str
    impact: str  # high, medium, low
    confidence: float = 0.0
    source_patterns: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Simulated data layer
# ---------------------------------------------------------------------------
# In production these would query PostgreSQL aggregates. Here we keep
# lightweight dicts that can be seeded or fed from the signal engine.


class _TenantData:
    """Holds simulated analytics data for a single tenant."""

    def __init__(self) -> None:
        # rep_id -> stats
        self.rep_stats: Dict[str, Dict[str, Any]] = {}
        # sequence_id -> stats
        self.sequence_stats: Dict[str, Dict[str, Any]] = {}
        # deal_id -> stats
        self.deal_stats: Dict[str, Dict[str, Any]] = {}
        # hour -> response count
        self.hourly_responses: Dict[int, int] = defaultdict(int)
        # day-of-week (0=Mon) -> response count
        self.daily_responses: Dict[int, int] = defaultdict(int)


_tenant_data: Dict[str, _TenantData] = defaultdict(_TenantData)


def seed_tenant_data(tenant_id: str, data: _TenantData) -> None:
    """Allow external seeding (tests, signal ingest pipeline)."""
    _tenant_data[tenant_id] = data


def _get_data(tenant_id: str) -> _TenantData:
    return _tenant_data[tenant_id]


# ---------------------------------------------------------------------------
# Core Service
# ---------------------------------------------------------------------------


class BehaviorIntelligence:
    """
    Detects behavioural patterns across reps, sequences, contact timing,
    and deal health. All analysis is read-only (watch mode).
    """

    # ── Rep Performance ───────────────────────────────────────

    async def analyze_rep_performance(self, tenant_id: str) -> List[TrackedPattern]:
        """Find top-performing reps and what differentiates them."""
        data = _get_data(tenant_id)
        patterns: List[TrackedPattern] = []

        if not data.rep_stats:
            # Generate representative sample when no data yet
            data.rep_stats = _sample_rep_stats()

        reps = data.rep_stats
        if not reps:
            return patterns

        # Find top closer
        by_close = sorted(reps.items(), key=lambda r: r[1].get("close_rate", 0), reverse=True)
        if by_close:
            top_id, top = by_close[0]
            cr = top.get("close_rate", 0)
            avg_resp = top.get("avg_response_min", 0)
            name = top.get("name", top_id[:8])
            patterns.append(TrackedPattern(
                tenant_id=tenant_id,
                pattern_type="high_conversion_rep",
                description=f"Rep {name} closes at {cr:.0%} with avg response {avg_resp}min",
                description_ar=f"{name} يغلق بنسبة {cr:.0%} مع متوسط استجابة {avg_resp} دقيقة",
                confidence=min(1.0, cr + 0.1),
                frequency=top.get("deals_closed", 1),
                entities_involved=[top_id],
                suggested_action=f"Replicate {name}'s follow-up cadence across the team",
                suggested_action_ar=f"انسخ نمط متابعة {name} لبقية الفريق",
            ))

        # Find fastest closer
        by_speed = sorted(reps.items(), key=lambda r: r[1].get("avg_days_to_close", 999))
        if by_speed:
            fast_id, fast = by_speed[0]
            days = fast.get("avg_days_to_close", 0)
            name = fast.get("name", fast_id[:8])
            patterns.append(TrackedPattern(
                tenant_id=tenant_id,
                pattern_type="fast_close",
                description=f"{name} avg close in {days} days",
                description_ar=f"{name} يغلق الصفقات في متوسط {days} أيام",
                confidence=0.75,
                frequency=fast.get("deals_closed", 1),
                entities_involved=[fast_id],
                suggested_action=f"Study {name}'s discovery call technique",
                suggested_action_ar=f"ادرس أسلوب {name} في مكالمة الاستكشاف",
            ))

        # Find slow responder (coaching opportunity)
        by_resp = sorted(reps.items(), key=lambda r: r[1].get("avg_response_min", 0), reverse=True)
        if by_resp:
            slow_id, slow = by_resp[0]
            avg_r = slow.get("avg_response_min", 0)
            if avg_r > 60:
                name = slow.get("name", slow_id[:8])
                patterns.append(TrackedPattern(
                    tenant_id=tenant_id,
                    pattern_type="slow_responder",
                    description=f"{name} avg response {avg_r}min — above 60min threshold",
                    description_ar=f"{name} متوسط استجابة {avg_r} دقيقة — أعلى من الحد المقبول",
                    confidence=0.80,
                    frequency=1,
                    entities_involved=[slow_id],
                    suggested_action=f"Coach {name} on response time; set mobile alerts",
                    suggested_action_ar=f"درّب {name} على سرعة الاستجابة وفعّل التنبيهات",
                ))

        return patterns

    # ── Winning Sequences ─────────────────────────────────────

    async def analyze_winning_sequences(self, tenant_id: str) -> List[TrackedPattern]:
        """Identify sequence templates with highest conversion rates."""
        data = _get_data(tenant_id)
        patterns: List[TrackedPattern] = []

        if not data.sequence_stats:
            data.sequence_stats = _sample_sequence_stats()

        seqs = data.sequence_stats
        by_conv = sorted(seqs.items(), key=lambda s: s[1].get("conversion_rate", 0), reverse=True)

        for seq_id, stats in by_conv[:3]:
            name = stats.get("name", seq_id[:8])
            name_ar = stats.get("name_ar", name)
            cr = stats.get("conversion_rate", 0)
            enrolled = stats.get("enrolled", 0)

            patterns.append(TrackedPattern(
                tenant_id=tenant_id,
                pattern_type="winning_sequence",
                description=f"Sequence '{name}' converts at {cr:.0%} ({enrolled} enrolled)",
                description_ar=f"تسلسل '{name_ar}' يحقق تحويل {cr:.0%} ({enrolled} مسجل)",
                confidence=min(1.0, 0.5 + cr),
                frequency=enrolled,
                entities_involved=[seq_id],
                suggested_action=f"Use '{name}' as default for similar leads",
                suggested_action_ar=f"استخدم '{name_ar}' كتسلسل افتراضي للعملاء المشابهين",
            ))

        # Compare top vs average
        if len(by_conv) >= 2:
            top_cr = by_conv[0][1].get("conversion_rate", 0)
            avg_cr = sum(s.get("conversion_rate", 0) for _, s in by_conv) / len(by_conv)
            if avg_cr > 0:
                multiplier = round(top_cr / avg_cr, 1)
                top_name_ar = by_conv[0][1].get("name_ar", by_conv[0][0][:8])
                patterns.append(TrackedPattern(
                    tenant_id=tenant_id,
                    pattern_type="winning_sequence",
                    description=f"Top sequence outperforms average by {multiplier}x",
                    description_ar=f"تسلسل '{top_name_ar}' يحقق {multiplier}x تحويل مقارنة بالمتوسط",
                    confidence=0.85,
                    frequency=1,
                    entities_involved=[by_conv[0][0]],
                    suggested_action="Migrate underperforming sequences to the top template",
                    suggested_action_ar="انقل التسلسلات الضعيفة إلى القالب الأفضل",
                ))

        return patterns

    # ── Best Contact Times ────────────────────────────────────

    async def analyze_best_contact_times(self, tenant_id: str) -> Dict[str, Any]:
        """When do leads respond most? Returns hour/day heat map."""
        data = _get_data(tenant_id)

        if not data.hourly_responses:
            # Seed typical Saudi business patterns
            for h in range(24):
                if 9 <= h <= 12:
                    data.hourly_responses[h] = 35 + (h - 9) * 5
                elif 16 <= h <= 20:
                    data.hourly_responses[h] = 40 + (20 - h) * 3
                elif 13 <= h <= 15:
                    data.hourly_responses[h] = 15
                else:
                    data.hourly_responses[h] = 5

        if not data.daily_responses:
            # Sunday-Thursday work week in KSA
            data.daily_responses = {
                0: 30, 1: 25, 2: 35, 3: 20, 4: 15,  # Mon-Fri
                5: 5, 6: 40,  # Sat, Sun — Sun is work day in KSA
            }

        hourly = dict(data.hourly_responses)
        daily = dict(data.daily_responses)

        best_hour = max(hourly, key=hourly.get)  # type: ignore[arg-type]
        best_day = max(daily, key=daily.get)  # type: ignore[arg-type]

        day_names_ar = {
            0: "الإثنين", 1: "الثلاثاء", 2: "الأربعاء",
            3: "الخميس", 4: "الجمعة", 5: "السبت", 6: "الأحد",
        }

        period = "صباحا" if best_hour < 12 else "مساء"
        display_hour = best_hour if best_hour <= 12 else best_hour - 12

        return {
            "tenant_id": tenant_id,
            "best_hour": best_hour,
            "best_hour_ar": f"{display_hour} {period}",
            "best_day": best_day,
            "best_day_ar": day_names_ar.get(best_day, ""),
            "hourly_distribution": hourly,
            "daily_distribution": {day_names_ar.get(d, str(d)): c for d, c in daily.items()},
            "recommendation_ar": (
                f"أفضل وقت للتواصل: {day_names_ar.get(best_day, '')} الساعة {display_hour} {period}"
            ),
        }

    # ── At-Risk Detection ─────────────────────────────────────

    async def detect_at_risk_patterns(self, tenant_id: str) -> List[TrackedPattern]:
        """Find deals going cold or leads losing interest."""
        data = _get_data(tenant_id)
        patterns: List[TrackedPattern] = []

        if not data.deal_stats:
            data.deal_stats = _sample_deal_stats()

        now = datetime.now(timezone.utc)

        for deal_id, stats in data.deal_stats.items():
            title = stats.get("title", deal_id[:8])
            last_activity_str = stats.get("last_activity")
            stage = stats.get("stage", "")

            if stage in ("closed_won", "closed_lost"):
                continue

            if last_activity_str:
                try:
                    last_dt = datetime.fromisoformat(last_activity_str)
                except (ValueError, TypeError):
                    last_dt = now - timedelta(days=3)
            else:
                last_dt = now - timedelta(days=5)

            days_idle = (now - last_dt).days

            if days_idle >= 7:
                confidence = min(1.0, 0.5 + days_idle * 0.05)
                patterns.append(TrackedPattern(
                    tenant_id=tenant_id,
                    pattern_type="at_risk_deal",
                    description=f"Deal '{title}' idle for {days_idle} days",
                    description_ar=f"صفقة '{title}' بدون نشاط منذ {days_idle} أيام",
                    confidence=confidence,
                    frequency=1,
                    entities_involved=[deal_id],
                    suggested_action=f"Re-engage on deal '{title}' immediately",
                    suggested_action_ar=f"أعد التواصل بخصوص صفقة '{title}' فورا",
                ))
            elif days_idle >= 3:
                patterns.append(TrackedPattern(
                    tenant_id=tenant_id,
                    pattern_type="cooling_deal",
                    description=f"Deal '{title}' cooling — {days_idle} days since last touch",
                    description_ar=f"صفقة '{title}' تبرد — {days_idle} أيام منذ آخر تواصل",
                    confidence=0.55,
                    frequency=1,
                    entities_involved=[deal_id],
                    suggested_action=f"Schedule follow-up for deal '{title}'",
                    suggested_action_ar=f"جدول متابعة لصفقة '{title}'",
                ))

        return patterns

    # ── Recommendations ───────────────────────────────────────

    async def get_recommendations(self, tenant_id: str) -> List[Dict[str, Any]]:
        """Generate Arabic recommendations from all detected patterns."""
        rep_patterns = await self.analyze_rep_performance(tenant_id)
        seq_patterns = await self.analyze_winning_sequences(tenant_id)
        time_analysis = await self.analyze_best_contact_times(tenant_id)
        risk_patterns = await self.detect_at_risk_patterns(tenant_id)

        recommendations: List[Recommendation] = []

        # From rep patterns
        for p in rep_patterns:
            if p.pattern_type == "high_conversion_rep":
                recommendations.append(Recommendation(
                    tenant_id=tenant_id,
                    category="performance",
                    title_ar="نمط إغلاق ناجح",
                    detail_ar=p.description_ar + " — " + p.suggested_action_ar,
                    impact="high",
                    confidence=p.confidence,
                    source_patterns=[p.id],
                ))
            elif p.pattern_type == "slow_responder":
                recommendations.append(Recommendation(
                    tenant_id=tenant_id,
                    category="performance",
                    title_ar="فرصة تحسين سرعة الاستجابة",
                    detail_ar=p.description_ar + " — " + p.suggested_action_ar,
                    impact="medium",
                    confidence=p.confidence,
                    source_patterns=[p.id],
                ))

        # From sequence patterns
        for p in seq_patterns:
            recommendations.append(Recommendation(
                tenant_id=tenant_id,
                category="sequence",
                title_ar="تسلسل عالي الأداء",
                detail_ar=p.description_ar,
                impact="high" if p.confidence > 0.7 else "medium",
                confidence=p.confidence,
                source_patterns=[p.id],
            ))

        # From timing
        if time_analysis.get("recommendation_ar"):
            recommendations.append(Recommendation(
                tenant_id=tenant_id,
                category="timing",
                title_ar="أفضل وقت للتواصل",
                detail_ar=time_analysis["recommendation_ar"],
                impact="medium",
                confidence=0.80,
            ))

        # From risk patterns
        critical_risks = [p for p in risk_patterns if p.pattern_type == "at_risk_deal"]
        if critical_risks:
            names = ", ".join(p.entities_involved[0][:8] for p in critical_risks[:5])
            recommendations.append(Recommendation(
                tenant_id=tenant_id,
                category="risk",
                title_ar="صفقات معرضة للخطر",
                detail_ar=f"{len(critical_risks)} صفقات بدون نشاط لأكثر من أسبوع: {names}",
                impact="high",
                confidence=0.85,
                source_patterns=[p.id for p in critical_risks[:5]],
            ))

        return [r.model_dump() for r in recommendations]


# ---------------------------------------------------------------------------
# Sample data generators (used when no real data exists yet)
# ---------------------------------------------------------------------------


def _sample_rep_stats() -> Dict[str, Dict[str, Any]]:
    return {
        "rep_001": {
            "name": "أحمد", "close_rate": 0.42, "avg_response_min": 18,
            "avg_days_to_close": 12, "deals_closed": 28, "follow_ups_per_deal": 4.2,
        },
        "rep_002": {
            "name": "سارة", "close_rate": 0.35, "avg_response_min": 25,
            "avg_days_to_close": 15, "deals_closed": 22, "follow_ups_per_deal": 3.1,
        },
        "rep_003": {
            "name": "خالد", "close_rate": 0.28, "avg_response_min": 75,
            "avg_days_to_close": 22, "deals_closed": 15, "follow_ups_per_deal": 2.0,
        },
    }


def _sample_sequence_stats() -> Dict[str, Dict[str, Any]]:
    return {
        "seq_001": {
            "name": "VIP Real Estate", "name_ar": "عقارات VIP",
            "conversion_rate": 0.38, "enrolled": 120, "avg_steps": 4,
        },
        "seq_002": {
            "name": "Tech Startup Outreach", "name_ar": "تواصل الشركات الناشئة",
            "conversion_rate": 0.25, "enrolled": 85, "avg_steps": 5,
        },
        "seq_003": {
            "name": "Standard Follow-up", "name_ar": "المتابعة العادية",
            "conversion_rate": 0.12, "enrolled": 200, "avg_steps": 6,
        },
    }


def _sample_deal_stats() -> Dict[str, Dict[str, Any]]:
    now = datetime.now(timezone.utc)
    return {
        "deal_001": {
            "title": "عقد صيانة المبنى",
            "stage": "negotiation",
            "value": 250000,
            "last_activity": (now - timedelta(days=10)).isoformat(),
        },
        "deal_002": {
            "title": "ترخيص برمجيات",
            "stage": "proposal",
            "value": 180000,
            "last_activity": (now - timedelta(days=4)).isoformat(),
        },
        "deal_003": {
            "title": "خدمات استشارية",
            "stage": "discovery",
            "value": 95000,
            "last_activity": (now - timedelta(days=1)).isoformat(),
        },
        "deal_004": {
            "title": "نظام ERP",
            "stage": "negotiation",
            "value": 500000,
            "last_activity": (now - timedelta(days=8)).isoformat(),
        },
    }


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

_instance: Optional[BehaviorIntelligence] = None


def get_behavior_intelligence() -> BehaviorIntelligence:
    global _instance
    if _instance is None:
        _instance = BehaviorIntelligence()
    return _instance
