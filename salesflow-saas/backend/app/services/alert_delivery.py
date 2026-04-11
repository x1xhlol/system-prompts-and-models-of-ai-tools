"""
Alert Delivery — Multi-channel routing with urgency-based channel selection,
acknowledgement tracking, and Arabic digest generation for Dealix CRM.

Channel matrix:
  CRITICAL : dashboard + whatsapp + email + sms
  HIGH     : dashboard + whatsapp
  MEDIUM   : dashboard + email
  LOW      : dashboard (daily digest)
"""
from __future__ import annotations

import logging, uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("dealix.services.alert_delivery")


class AlertUrgency(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AlertChannel(str, Enum):
    DASHBOARD = "dashboard"
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    SMS = "sms"
    TELEGRAM = "telegram"


class Alert(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    tenant_id: str
    user_id: Optional[str] = None
    title: str = ""
    title_ar: str = ""
    body: str = ""
    body_ar: str = ""
    urgency: AlertUrgency = AlertUrgency.MEDIUM
    category: str = "system"
    channels: List[AlertChannel] = [AlertChannel.DASHBOARD]
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    requires_acknowledgement: bool = False
    acknowledged_at: Optional[datetime] = None
    delivered_channels: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = {}


TEMPLATES: Dict[str, Dict[str, str]] = {
    "new_lead": {"title_ar": "عميل محتمل جديد",
                 "body_ar": "عميل محتمل جديد: {name} من {source}"},
    "deal_won": {"title_ar": "صفقة ناجحة",
                 "body_ar": "تم إغلاق صفقة: {title} بقيمة {value} ر.س"},
    "deal_at_risk": {"title_ar": "صفقة معرضة للخطر",
                     "body_ar": "صفقة معرضة للخطر: {title} - لا نشاط منذ {days} أيام"},
    "consent_expiring": {"title_ar": "موافقة PDPL تنتهي قريبا",
                         "body_ar": "موافقة PDPL تنتهي خلال {days} أيام للعميل {name}"},
    "escalation": {"title_ar": "تصعيد يتطلب انتباهك",
                   "body_ar": "يحتاج تدخلك: {title} - {reason}"},
    "sequence_complete": {"title_ar": "تسلسل مكتمل",
                          "body_ar": "اكتمل تسلسل {name} للعميل {lead_name}"},
    "meeting_booked": {"title_ar": "موعد جديد",
                       "body_ar": "تم حجز موعد مع {name} في {time}"},
    "competitor_alert": {"title_ar": "تنبيه منافس",
                         "body_ar": "تغيير من المنافس {competitor}: {detail}"},
}

_CHANNEL_MATRIX: Dict[AlertUrgency, List[AlertChannel]] = {
    AlertUrgency.CRITICAL: [AlertChannel.DASHBOARD, AlertChannel.WHATSAPP, AlertChannel.EMAIL, AlertChannel.SMS],
    AlertUrgency.HIGH: [AlertChannel.DASHBOARD, AlertChannel.WHATSAPP],
    AlertUrgency.MEDIUM: [AlertChannel.DASHBOARD, AlertChannel.EMAIL],
    AlertUrgency.LOW: [AlertChannel.DASHBOARD],
}

_CAT_AR = {"lead": "العملاء المحتملون", "deal": "الصفقات", "system": "النظام",
           "compliance": "الامتثال", "security": "الأمان"}


async def _dispatch(alert: Alert, channel: AlertChannel) -> bool:
    logger.info("[%s] tenant=%s user=%s title=%s", channel.value.upper(),
                alert.tenant_id[:8], (alert.user_id or "broadcast")[:8], alert.title_ar[:40])
    return True


class AlertDelivery:
    """Multi-channel alert delivery with urgency routing and digest generation."""

    def __init__(self) -> None:
        self._alerts: Dict[str, List[Alert]] = defaultdict(list)
        self._stats: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))

    async def send(self, alert: Alert) -> Dict[str, Any]:
        targets = list(set(_CHANNEL_MATRIX.get(alert.urgency, [AlertChannel.DASHBOARD]) + alert.channels))
        delivered, failed = [], []
        for ch in targets:
            ok = await self.send_to_channel(alert, ch)
            (delivered if ok else failed).append(ch.value)
            if ok:
                self._stats[alert.tenant_id][ch.value] += 1
        alert.delivered_channels = delivered
        buf = self._alerts[alert.tenant_id]
        buf.insert(0, alert)
        if len(buf) > 10_000:
            self._alerts[alert.tenant_id] = buf[:10_000]
        self._stats[alert.tenant_id]["total"] += 1
        logger.info("Alert %s [%s] delivered via %s", alert.id[:8], alert.urgency.value, ", ".join(delivered) or "none")
        return {"alert_id": alert.id, "urgency": alert.urgency.value, "delivered": delivered, "failed": failed}

    async def send_to_channel(self, alert: Alert, channel: AlertChannel) -> bool:
        try:
            return await _dispatch(alert, channel)
        except Exception:
            logger.exception("Channel %s dispatch failed for alert %s", channel.value, alert.id[:8])
            return False

    async def send_from_template(self, template_key: str, tenant_id: str, urgency: AlertUrgency,
                                  category: str = "system", user_id: Optional[str] = None,
                                  action_url: Optional[str] = None, requires_ack: bool = False,
                                  **kwargs: Any) -> Dict[str, Any]:
        tpl = TEMPLATES.get(template_key)
        if not tpl:
            return {"error": f"Unknown template: {template_key}"}
        body_ar = tpl["body_ar"].format_map(defaultdict(lambda: "—", **kwargs))
        alert = Alert(tenant_id=tenant_id, user_id=user_id,
                      title=template_key.replace("_", " ").title(), title_ar=tpl["title_ar"],
                      body=body_ar, body_ar=body_ar, urgency=urgency, category=category,
                      action_url=action_url, requires_acknowledgement=requires_ack, metadata=dict(kwargs))
        return await self.send(alert)

    async def acknowledge(self, alert_id: str, user_id: str) -> bool:
        for alerts in self._alerts.values():
            for a in alerts:
                if a.id == alert_id:
                    if a.acknowledged_at:
                        return True
                    a.acknowledged_at = datetime.now(timezone.utc)
                    logger.info("Alert %s acknowledged by %s", alert_id[:8], user_id[:8])
                    return True
        return False

    async def generate_digest(self, tenant_id: str, user_id: Optional[str] = None,
                               period: str = "daily") -> Dict[str, Any]:
        hours = 24 if period == "daily" else 168
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        pending = [a for a in self._alerts.get(tenant_id, [])
                   if a.acknowledged_at is None and a.created_at >= cutoff
                   and (user_id is None or a.user_id is None or a.user_id == user_id)]
        if not pending:
            return {"tenant_id": tenant_id, "period": period, "count": 0,
                    "digest_ar": "لا توجد تنبيهات جديدة", "alerts": []}

        by_cat: Dict[str, List[Alert]] = defaultdict(list)
        for a in pending:
            by_cat[a.category].append(a)

        crit = sum(1 for a in pending if a.urgency == AlertUrgency.CRITICAL)
        high = sum(1 for a in pending if a.urgency == AlertUrgency.HIGH)
        lines = [f"ملخص التنبيهات — {'يومي' if period == 'daily' else 'أسبوعي'}",
                 f"إجمالي التنبيهات: {len(pending)}"]
        if crit: lines.append(f"تنبيهات حرجة: {crit}")
        if high: lines.append(f"تنبيهات عالية الأهمية: {high}")
        lines.append("")
        for cat, items in by_cat.items():
            lines.append(f"— {_CAT_AR.get(cat, cat)} ({len(items)}):")
            for a in items[:10]:
                tag = " [حرج]" if a.urgency == AlertUrgency.CRITICAL else (
                    " [مهم]" if a.urgency == AlertUrgency.HIGH else "")
                lines.append(f"  - {a.title_ar}{tag}")
            if len(items) > 10:
                lines.append(f"  ... و {len(items) - 10} تنبيهات أخرى")

        return {"tenant_id": tenant_id, "user_id": user_id, "period": period,
                "count": len(pending), "critical": crit, "high": high,
                "digest_ar": "\n".join(lines), "alerts": [a.model_dump() for a in pending[:50]]}

    async def get_pending(self, tenant_id: str, user_id: Optional[str] = None) -> List[Alert]:
        return [a for a in self._alerts.get(tenant_id, [])
                if a.acknowledged_at is None
                and (user_id is None or a.user_id is None or a.user_id == user_id)]

    async def get_delivery_stats(self, tenant_id: str) -> Dict[str, Any]:
        stats = dict(self._stats.get(tenant_id, {}))
        total = stats.get("total", 0)
        alerts = self._alerts.get(tenant_id, [])
        acked = sum(1 for a in alerts if a.acknowledged_at is not None)
        urg: Dict[str, int] = defaultdict(int)
        cat: Dict[str, int] = defaultdict(int)
        for a in alerts:
            urg[a.urgency.value] += 1
            cat[a.category] += 1
        return {"tenant_id": tenant_id, "total_sent": total, "acknowledged": acked,
                "pending": sum(1 for a in alerts if a.acknowledged_at is None),
                "ack_rate": round(acked / max(total, 1) * 100, 1),
                "by_channel": {k: v for k, v in stats.items() if k != "total"},
                "by_urgency": dict(urg), "by_category": dict(cat)}


_instance: Optional[AlertDelivery] = None

def get_alert_delivery() -> AlertDelivery:
    global _instance
    if _instance is None:
        _instance = AlertDelivery()
    return _instance
