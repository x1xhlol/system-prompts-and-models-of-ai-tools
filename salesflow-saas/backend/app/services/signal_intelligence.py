"""
Signal Intelligence Engine — Real-time signal distillation, deduplication,
importance scoring, and watchlist matching for Dealix CRM.
"""
from __future__ import annotations

import hashlib, logging, uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("dealix.services.signal_intelligence")


class SignalSource(str, Enum):
    CRM_EVENT = "crm_event"
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    WEBSITE = "website"
    COMPETITOR = "competitor"
    SYSTEM = "system"


class SignalEvent(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    source: SignalSource
    entity_type: str
    entity_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_payload: Dict[str, Any] = {}
    normalized: Dict[str, Any] = {}
    importance_score: float = 0.0
    urgency_score: float = 0.0
    sentiment: str = "neutral"
    tags: List[str] = []
    tenant_id: str = ""
    is_duplicate: bool = False


class Watchlist(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    tenant_id: str
    name: str
    name_ar: str
    entity_type: str
    entity_ids: List[str] = []
    keywords: List[str] = []
    alert_threshold: float = 0.5
    channels: List[str] = ["dashboard"]
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SignalFilter(BaseModel):
    source: Optional[SignalSource] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    min_importance: float = 0.0
    sentiment: Optional[str] = None
    tags: List[str] = []
    since: Optional[datetime] = None
    limit: int = 50


# ── Importance / urgency scoring tables ──────────────────────────────────
_IMPORTANCE: Dict[str, float] = {
    "deal_stage_won": 0.95, "deal_stage_lost": 0.95,
    "pdpl_consent_expiring": 0.90, "high_value_lead_responded": 0.85,
    "competitor_price_change": 0.80, "meeting_booked": 0.75,
    "new_lead_whatsapp": 0.70, "sequence_step_completed": 0.40,
    "email_opened": 0.30, "page_visit": 0.20, "routine_update": 0.15,
}
_URGENCY: Dict[str, float] = {
    "deal_stage_won": 0.90, "deal_stage_lost": 0.85,
    "pdpl_consent_expiring": 0.95, "high_value_lead_responded": 0.80,
    "competitor_price_change": 0.70, "meeting_booked": 0.65,
    "new_lead_whatsapp": 0.60, "sequence_step_completed": 0.30,
    "email_opened": 0.15, "page_visit": 0.10, "routine_update": 0.05,
}

_POSITIVE_KW = {"شكرا", "ممتاز", "موافق", "نعم", "interested", "great", "won", "closed_won", "booked"}
_NEGATIVE_KW = {"غاضب", "مشكلة", "إلغاء", "lost", "closed_lost", "cancel", "complaint", "angry"}


def _classify(source: SignalSource, p: Dict[str, Any]) -> str:
    et = str(p.get("event_type", "")).lower()
    st = str(p.get("stage", "")).lower()
    if source == SignalSource.CRM_EVENT:
        if st in ("closed_won", "won"): return "deal_stage_won"
        if st in ("closed_lost", "lost"): return "deal_stage_lost"
        return {"meeting_booked": "meeting_booked", "high_value_response": "high_value_lead_responded",
                "sequence_step_completed": "sequence_step_completed"}.get(et, "routine_update")
    if source == SignalSource.WHATSAPP:
        return "new_lead_whatsapp" if et == "new_lead" else "high_value_lead_responded"
    if source == SignalSource.EMAIL:
        return "email_opened" if et == "opened" else "routine_update"
    if source == SignalSource.WEBSITE:
        return "page_visit"
    if source == SignalSource.COMPETITOR:
        return "competitor_price_change" if "price" in et else "routine_update"
    if source == SignalSource.SYSTEM:
        return "pdpl_consent_expiring" if ("consent" in et or "pdpl" in et) else "routine_update"
    return "routine_update"


def _sentiment(payload: Dict[str, Any]) -> str:
    text = " ".join(str(v) for v in payload.values() if isinstance(v, str)).lower()
    pos = sum(1 for w in _POSITIVE_KW if w in text)
    neg = sum(1 for w in _NEGATIVE_KW if w in text)
    return "positive" if pos > neg else ("negative" if neg > pos else "neutral")


def _tags(source: SignalSource, p: Dict[str, Any]) -> List[str]:
    t = [source.value]
    for k in ("entity_type", "event_type"):
        if p.get(k): t.append(str(p[k]))
    if p.get("high_value"): t.append("high_value")
    if p.get("stage") in ("closed_won", "won"): t.append("won")
    if p.get("stage") in ("closed_lost", "lost"): t.append("lost")
    return t


def _sentiment_ar(s: str) -> str:
    return {"positive": "إيجابي", "neutral": "محايد", "negative": "سلبي"}.get(s, "محايد")


class SignalIntelligence:
    """Real-time signal ingestion, scoring, dedup, watchlist matching."""

    def __init__(self) -> None:
        self._events: Dict[str, List[SignalEvent]] = defaultdict(list)
        self._watchlists: Dict[str, List[Watchlist]] = defaultdict(list)
        self._dedup: Dict[str, datetime] = {}

    async def ingest(self, source: SignalSource, payload: Dict[str, Any], tenant_id: str) -> SignalEvent:
        etype = str(payload.get("entity_type", "unknown"))
        eid = str(payload.get("entity_id", ""))
        norm = {k: v for k, v in {
            "source": source.value, "entity_type": etype, "entity_id": eid,
            "event_type": payload.get("event_type", "unknown"),
            "stage": payload.get("stage"), "value": payload.get("value"),
            "name": payload.get("name"), "channel": payload.get("channel"),
        }.items() if v is not None}

        event = SignalEvent(source=source, entity_type=etype, entity_id=eid,
                            raw_payload=payload, normalized=norm, tenant_id=tenant_id,
                            sentiment=_sentiment(payload), tags=_tags(source, payload))

        event.is_duplicate = await self.deduplicate(event)
        if not event.is_duplicate:
            event.importance_score = await self.score_importance(event)
            event.urgency_score = await self._score_urgency(event)
            buf = self._events[tenant_id]
            buf.insert(0, event)
            if len(buf) > 5000:
                self._events[tenant_id] = buf[:5000]

        matched = await self.check_watchlists(event, tenant_id)
        if matched:
            logger.info("Signal %s matched %d watchlist(s)", event.id[:8], len(matched))
        return event

    async def deduplicate(self, event: SignalEvent) -> bool:
        now = datetime.now(timezone.utc)
        self._dedup = {k: v for k, v in self._dedup.items() if v > now}
        fp = hashlib.sha256(
            f"{event.tenant_id}:{event.source.value}:{event.entity_type}:{event.entity_id}:{event.normalized.get('event_type','')}".encode()
        ).hexdigest()[:32]
        if fp in self._dedup:
            return True
        self._dedup[fp] = now + timedelta(hours=1)
        return False

    async def score_importance(self, event: SignalEvent) -> float:
        base = _IMPORTANCE.get(_classify(event.source, event.raw_payload), 0.15)
        if event.raw_payload.get("high_value"): base = min(1.0, base + 0.10)
        if event.sentiment == "negative": base = min(1.0, base + 0.05)
        return round(base, 2)

    async def _score_urgency(self, event: SignalEvent) -> float:
        base = _URGENCY.get(_classify(event.source, event.raw_payload), 0.05)
        if event.sentiment == "negative": base = min(1.0, base + 0.10)
        return round(base, 2)

    async def check_watchlists(self, event: SignalEvent, tenant_id: str) -> List[Watchlist]:
        matched: List[Watchlist] = []
        for wl in self._watchlists.get(tenant_id, []):
            if not wl.is_active or event.importance_score < wl.alert_threshold:
                continue
            if wl.entity_type and wl.entity_type != event.entity_type:
                continue
            id_ok = (not wl.entity_ids) or (event.entity_id in wl.entity_ids)
            kw_ok = True
            if wl.keywords:
                text = " ".join(str(v) for v in event.raw_payload.values() if isinstance(v, str)).lower()
                kw_ok = any(kw.lower() in text for kw in wl.keywords)
            if not id_ok and not kw_ok:
                continue
            matched.append(wl)
        return matched

    async def create_watchlist(self, watchlist: Watchlist) -> Watchlist:
        self._watchlists[watchlist.tenant_id].append(watchlist)
        logger.info("Watchlist '%s' created for tenant %s", watchlist.name, watchlist.tenant_id[:8])
        return watchlist

    async def get_watchlists(self, tenant_id: str) -> List[Watchlist]:
        return [w for w in self._watchlists.get(tenant_id, []) if w.is_active]

    async def get_signals(self, tenant_id: str, filters: SignalFilter) -> List[SignalEvent]:
        result: List[SignalEvent] = []
        for ev in self._events.get(tenant_id, []):
            if filters.source and ev.source != filters.source: continue
            if filters.entity_type and ev.entity_type != filters.entity_type: continue
            if filters.entity_id and ev.entity_id != filters.entity_id: continue
            if ev.importance_score < filters.min_importance: continue
            if filters.sentiment and ev.sentiment != filters.sentiment: continue
            if filters.tags and not set(filters.tags).issubset(set(ev.tags)): continue
            if filters.since and ev.timestamp < filters.since: continue
            result.append(ev)
            if len(result) >= filters.limit: break
        return result

    async def get_entity_summary(self, entity_type: str, entity_id: str,
                                  tenant_id: str, hours: int = 24) -> Dict[str, Any]:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        events = [e for e in self._events.get(tenant_id, [])
                  if e.entity_type == entity_type and e.entity_id == entity_id and e.timestamp >= cutoff]
        if not events:
            return {"entity_type": entity_type, "entity_id": entity_id, "hours": hours,
                    "signal_count": 0, "summary_ar": "لا توجد إشارات في الفترة المحددة"}

        sents = {"positive": 0, "neutral": 0, "negative": 0}
        sources: Dict[str, int] = defaultdict(int)
        max_imp = 0.0
        all_tags: List[str] = []
        for ev in events:
            sents[ev.sentiment] = sents.get(ev.sentiment, 0) + 1
            sources[ev.source.value] += 1
            max_imp = max(max_imp, ev.importance_score)
            all_tags.extend(ev.tags)

        dom = max(sents, key=sents.get)  # type: ignore[arg-type]
        utags = list(set(all_tags))[:15]
        parts = [f"عدد الإشارات: {len(events)}", f"أعلى أهمية: {max_imp:.0%}",
                 f"المشاعر السائدة: {_sentiment_ar(dom)}"]
        if "won" in utags: parts.append("تم إغلاق صفقة بنجاح")
        if "lost" in utags: parts.append("تم خسارة صفقة")
        if "high_value" in utags: parts.append("عميل عالي القيمة")

        return {"entity_type": entity_type, "entity_id": entity_id, "hours": hours,
                "signal_count": len(events), "max_importance": max_imp,
                "dominant_sentiment": dom, "sentiment_breakdown": sents,
                "sources": dict(sources), "tags": utags,
                "summary_ar": " | ".join(parts),
                "latest_signal": events[0].model_dump() if events else None}


_instance: Optional[SignalIntelligence] = None

def get_signal_intelligence() -> SignalIntelligence:
    global _instance
    if _instance is None:
        _instance = SignalIntelligence()
    return _instance
