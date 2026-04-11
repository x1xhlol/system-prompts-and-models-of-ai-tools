"""
Behavior Intelligence — Pattern detection for Dealix CRM (watch-mode only).

Detects winning sequences, top-rep behaviours, optimal contact times,
at-risk deals, and generates Arabic recommendations.
"""
from __future__ import annotations

import logging, uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("dealix.services.behavior_intelligence")


class TrackedPattern(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    tenant_id: str
    pattern_type: str
    description: str
    description_ar: str
    confidence: float = 0.0
    frequency: int = 1
    entities_involved: List[str] = []
    first_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    suggested_action: str = ""
    suggested_action_ar: str = ""


class Recommendation(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    tenant_id: str
    category: str
    title_ar: str
    detail_ar: str
    impact: str = "medium"
    confidence: float = 0.0
    source_patterns: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Simulated data layer ────────────────────────────────────────────────

class _TenantData:
    def __init__(self) -> None:
        self.rep_stats: Dict[str, Dict[str, Any]] = {}
        self.sequence_stats: Dict[str, Dict[str, Any]] = {}
        self.deal_stats: Dict[str, Dict[str, Any]] = {}
        self.hourly_responses: Dict[int, int] = defaultdict(int)
        self.daily_responses: Dict[int, int] = defaultdict(int)

_tenant_data: Dict[str, _TenantData] = defaultdict(_TenantData)

def seed_tenant_data(tenant_id: str, data: _TenantData) -> None:
    _tenant_data[tenant_id] = data

def _data(tid: str) -> _TenantData:
    return _tenant_data[tid]

def _sample_reps() -> Dict[str, Dict[str, Any]]:
    return {
        "rep_001": {"name": "أحمد", "close_rate": 0.42, "avg_response_min": 18,
                    "avg_days_to_close": 12, "deals_closed": 28},
        "rep_002": {"name": "سارة", "close_rate": 0.35, "avg_response_min": 25,
                    "avg_days_to_close": 15, "deals_closed": 22},
        "rep_003": {"name": "خالد", "close_rate": 0.28, "avg_response_min": 75,
                    "avg_days_to_close": 22, "deals_closed": 15},
    }

def _sample_seqs() -> Dict[str, Dict[str, Any]]:
    return {
        "seq_001": {"name": "VIP Real Estate", "name_ar": "عقارات VIP",
                    "conversion_rate": 0.38, "enrolled": 120},
        "seq_002": {"name": "Tech Startup", "name_ar": "تواصل الشركات الناشئة",
                    "conversion_rate": 0.25, "enrolled": 85},
        "seq_003": {"name": "Standard", "name_ar": "المتابعة العادية",
                    "conversion_rate": 0.12, "enrolled": 200},
    }

def _sample_deals() -> Dict[str, Dict[str, Any]]:
    now = datetime.now(timezone.utc)
    return {
        "deal_001": {"title": "عقد صيانة المبنى", "stage": "negotiation", "value": 250000,
                     "last_activity": (now - timedelta(days=10)).isoformat()},
        "deal_002": {"title": "ترخيص برمجيات", "stage": "proposal", "value": 180000,
                     "last_activity": (now - timedelta(days=4)).isoformat()},
        "deal_003": {"title": "خدمات استشارية", "stage": "discovery", "value": 95000,
                     "last_activity": (now - timedelta(days=1)).isoformat()},
        "deal_004": {"title": "نظام ERP", "stage": "negotiation", "value": 500000,
                     "last_activity": (now - timedelta(days=8)).isoformat()},
    }

_DAY_AR = {0: "الإثنين", 1: "الثلاثاء", 2: "الأربعاء", 3: "الخميس",
           4: "الجمعة", 5: "السبت", 6: "الأحد"}


class BehaviorIntelligence:
    """Detects behavioural patterns across reps, sequences, timing, and deal health."""

    async def analyze_rep_performance(self, tenant_id: str) -> List[TrackedPattern]:
        d = _data(tenant_id)
        if not d.rep_stats:
            d.rep_stats = _sample_reps()
        patterns: List[TrackedPattern] = []
        reps = d.rep_stats
        by_close = sorted(reps.items(), key=lambda r: r[1].get("close_rate", 0), reverse=True)
        if by_close:
            rid, top = by_close[0]
            n = top.get("name", rid[:8])
            cr = top["close_rate"]
            ar = top.get("avg_response_min", 0)
            patterns.append(TrackedPattern(
                tenant_id=tenant_id, pattern_type="high_conversion_rep",
                description=f"Rep {n} closes at {cr:.0%} with avg response {ar}min",
                description_ar=f"{n} يغلق بنسبة {cr:.0%} مع متوسط استجابة {ar} دقيقة",
                confidence=min(1.0, cr + 0.1), frequency=top.get("deals_closed", 1),
                entities_involved=[rid],
                suggested_action=f"Replicate {n}'s cadence across team",
                suggested_action_ar=f"انسخ نمط متابعة {n} لبقية الفريق"))
        by_speed = sorted(reps.items(), key=lambda r: r[1].get("avg_days_to_close", 999))
        if by_speed:
            rid, fast = by_speed[0]
            n = fast.get("name", rid[:8])
            days = fast.get("avg_days_to_close", 0)
            patterns.append(TrackedPattern(
                tenant_id=tenant_id, pattern_type="fast_close",
                description=f"{n} avg close in {days} days",
                description_ar=f"{n} يغلق الصفقات في متوسط {days} أيام",
                confidence=0.75, frequency=fast.get("deals_closed", 1),
                entities_involved=[rid],
                suggested_action=f"Study {n}'s discovery call technique",
                suggested_action_ar=f"ادرس أسلوب {n} في مكالمة الاستكشاف"))
        by_resp = sorted(reps.items(), key=lambda r: r[1].get("avg_response_min", 0), reverse=True)
        if by_resp:
            rid, slow = by_resp[0]
            ar = slow.get("avg_response_min", 0)
            if ar > 60:
                n = slow.get("name", rid[:8])
                patterns.append(TrackedPattern(
                    tenant_id=tenant_id, pattern_type="slow_responder",
                    description=f"{n} avg response {ar}min — above threshold",
                    description_ar=f"{n} متوسط استجابة {ar} دقيقة — أعلى من الحد المقبول",
                    confidence=0.80, entities_involved=[rid],
                    suggested_action=f"Coach {n} on response time",
                    suggested_action_ar=f"درّب {n} على سرعة الاستجابة وفعّل التنبيهات"))
        return patterns

    async def analyze_winning_sequences(self, tenant_id: str) -> List[TrackedPattern]:
        d = _data(tenant_id)
        if not d.sequence_stats:
            d.sequence_stats = _sample_seqs()
        patterns: List[TrackedPattern] = []
        by_conv = sorted(d.sequence_stats.items(), key=lambda s: s[1].get("conversion_rate", 0), reverse=True)
        for sid, st in by_conv[:3]:
            n = st.get("name", sid[:8])
            nar = st.get("name_ar", n)
            cr = st.get("conversion_rate", 0)
            enr = st.get("enrolled", 0)
            patterns.append(TrackedPattern(
                tenant_id=tenant_id, pattern_type="winning_sequence",
                description=f"Sequence '{n}' converts at {cr:.0%} ({enr} enrolled)",
                description_ar=f"تسلسل '{nar}' يحقق تحويل {cr:.0%} ({enr} مسجل)",
                confidence=min(1.0, 0.5 + cr), frequency=enr, entities_involved=[sid],
                suggested_action=f"Use '{n}' as default for similar leads",
                suggested_action_ar=f"استخدم '{nar}' كتسلسل افتراضي للعملاء المشابهين"))
        if len(by_conv) >= 2:
            top_cr = by_conv[0][1].get("conversion_rate", 0)
            avg_cr = sum(s.get("conversion_rate", 0) for _, s in by_conv) / len(by_conv)
            if avg_cr > 0:
                mult = round(top_cr / avg_cr, 1)
                nar = by_conv[0][1].get("name_ar", by_conv[0][0][:8])
                patterns.append(TrackedPattern(
                    tenant_id=tenant_id, pattern_type="winning_sequence",
                    description=f"Top sequence outperforms average by {mult}x",
                    description_ar=f"تسلسل '{nar}' يحقق {mult}x تحويل مقارنة بالمتوسط",
                    confidence=0.85, entities_involved=[by_conv[0][0]],
                    suggested_action="Migrate underperforming sequences to top template",
                    suggested_action_ar="انقل التسلسلات الضعيفة إلى القالب الأفضل"))
        return patterns

    async def analyze_best_contact_times(self, tenant_id: str) -> Dict[str, Any]:
        d = _data(tenant_id)
        if not d.hourly_responses:
            for h in range(24):
                if 9 <= h <= 12: d.hourly_responses[h] = 35 + (h - 9) * 5
                elif 16 <= h <= 20: d.hourly_responses[h] = 40 + (20 - h) * 3
                elif 13 <= h <= 15: d.hourly_responses[h] = 15
                else: d.hourly_responses[h] = 5
        if not d.daily_responses:
            d.daily_responses = {0: 30, 1: 25, 2: 35, 3: 20, 4: 15, 5: 5, 6: 40}
        bh = max(d.hourly_responses, key=d.hourly_responses.get)  # type: ignore[arg-type]
        bd = max(d.daily_responses, key=d.daily_responses.get)  # type: ignore[arg-type]
        period = "صباحا" if bh < 12 else "مساء"
        dh = bh if bh <= 12 else bh - 12
        return {
            "tenant_id": tenant_id, "best_hour": bh, "best_hour_ar": f"{dh} {period}",
            "best_day": bd, "best_day_ar": _DAY_AR.get(bd, ""),
            "hourly_distribution": dict(d.hourly_responses),
            "daily_distribution": {_DAY_AR.get(k, str(k)): v for k, v in d.daily_responses.items()},
            "recommendation_ar": f"أفضل وقت للتواصل: {_DAY_AR.get(bd, '')} الساعة {dh} {period}",
        }

    async def detect_at_risk_patterns(self, tenant_id: str) -> List[TrackedPattern]:
        d = _data(tenant_id)
        if not d.deal_stats:
            d.deal_stats = _sample_deals()
        now = datetime.now(timezone.utc)
        patterns: List[TrackedPattern] = []
        for did, st in d.deal_stats.items():
            if st.get("stage") in ("closed_won", "closed_lost"):
                continue
            title = st.get("title", did[:8])
            try:
                last_dt = datetime.fromisoformat(st.get("last_activity", ""))
            except (ValueError, TypeError):
                last_dt = now - timedelta(days=5)
            idle = (now - last_dt).days
            if idle >= 7:
                patterns.append(TrackedPattern(
                    tenant_id=tenant_id, pattern_type="at_risk_deal",
                    description=f"Deal '{title}' idle for {idle} days",
                    description_ar=f"صفقة '{title}' بدون نشاط منذ {idle} أيام",
                    confidence=min(1.0, 0.5 + idle * 0.05), entities_involved=[did],
                    suggested_action=f"Re-engage on '{title}' immediately",
                    suggested_action_ar=f"أعد التواصل بخصوص صفقة '{title}' فورا"))
            elif idle >= 3:
                patterns.append(TrackedPattern(
                    tenant_id=tenant_id, pattern_type="cooling_deal",
                    description=f"Deal '{title}' cooling — {idle} days since last touch",
                    description_ar=f"صفقة '{title}' تبرد — {idle} أيام منذ آخر تواصل",
                    confidence=0.55, entities_involved=[did],
                    suggested_action=f"Schedule follow-up for '{title}'",
                    suggested_action_ar=f"جدول متابعة لصفقة '{title}'"))
        return patterns

    async def get_recommendations(self, tenant_id: str) -> List[Dict[str, Any]]:
        reps = await self.analyze_rep_performance(tenant_id)
        seqs = await self.analyze_winning_sequences(tenant_id)
        timing = await self.analyze_best_contact_times(tenant_id)
        risks = await self.detect_at_risk_patterns(tenant_id)
        recs: List[Recommendation] = []
        for p in reps:
            if p.pattern_type == "high_conversion_rep":
                recs.append(Recommendation(tenant_id=tenant_id, category="performance",
                    title_ar="نمط إغلاق ناجح",
                    detail_ar=f"{p.description_ar} — {p.suggested_action_ar}",
                    impact="high", confidence=p.confidence, source_patterns=[p.id]))
            elif p.pattern_type == "slow_responder":
                recs.append(Recommendation(tenant_id=tenant_id, category="performance",
                    title_ar="فرصة تحسين سرعة الاستجابة",
                    detail_ar=f"{p.description_ar} — {p.suggested_action_ar}",
                    impact="medium", confidence=p.confidence, source_patterns=[p.id]))
        for p in seqs:
            recs.append(Recommendation(tenant_id=tenant_id, category="sequence",
                title_ar="تسلسل عالي الأداء", detail_ar=p.description_ar,
                impact="high" if p.confidence > 0.7 else "medium",
                confidence=p.confidence, source_patterns=[p.id]))
        if timing.get("recommendation_ar"):
            recs.append(Recommendation(tenant_id=tenant_id, category="timing",
                title_ar="أفضل وقت للتواصل", detail_ar=timing["recommendation_ar"],
                impact="medium", confidence=0.80))
        crit = [p for p in risks if p.pattern_type == "at_risk_deal"]
        if crit:
            ids = ", ".join(p.entities_involved[0][:8] for p in crit[:5])
            recs.append(Recommendation(tenant_id=tenant_id, category="risk",
                title_ar="صفقات معرضة للخطر",
                detail_ar=f"{len(crit)} صفقات بدون نشاط لأكثر من أسبوع: {ids}",
                impact="high", confidence=0.85,
                source_patterns=[p.id for p in crit[:5]]))
        return [r.model_dump() for r in recs]


_instance: Optional[BehaviorIntelligence] = None

def get_behavior_intelligence() -> BehaviorIntelligence:
    global _instance
    if _instance is None:
        _instance = BehaviorIntelligence()
    return _instance
