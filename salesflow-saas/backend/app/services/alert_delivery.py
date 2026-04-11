"""
Alert Delivery Service — Multi-channel alert routing with urgency-based
channel selection, acknowledgement tracking, and Arabic digest generation.

Channel routing matrix:
  CRITICAL : dashboard + whatsapp + email + sms
  HIGH     : dashboard + whatsapp
  MEDIUM   : dashboard + email
  LOW      : dashboard (collected for daily digest)
"""

from __future__ import annotations

import logging
import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger("dealix.services.alert_delivery")

# ---------------------------------------------------------------------------
# Enums & Models
# ---------------------------------------------------------------------------


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
    title: str
    title_ar: str
    body: str
    body_ar: str
    urgency: AlertUrgency = AlertUrgency.MEDIUM
    category: str = "system"  # lead, deal, system, compliance, security
    channels: List[AlertChannel] = [AlertChannel.DASHBOARD]
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    requires_acknowledgement: bool = False
    acknowledged_at: Optional[datetime] = None
    delivered_channels: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = {}


# ---------------------------------------------------------------------------
# Arabic alert templates
# ---------------------------------------------------------------------------

ALERT_TEMPLATES: Dict[str, Dict[str, str]] = {
    "new_lead": {
        "title_ar": "عميل محتمل جديد",
        "body_ar": "عميل محتمل جديد: {name} من {source}",
    },
    "deal_won": {
        "title_ar": "صفقة ناجحة",
        "body_ar": "تم إغلاق صفقة: {title} بقيمة {value} ر.س",
    },
    "deal_at_risk": {
        "title_ar": "صفقة معرضة للخطر",
        "body_ar": "صفقة معرضة للخطر: {title} - لا نشاط منذ {days} أيام",
    },
    "consent_expiring": {
        "title_ar": "موافقة PDPL تنتهي قريبا",
        "body_ar": "موافقة PDPL تنتهي خلال {days} أيام للعميل {name}",
    },
    "escalation": {
        "title_ar": "تصعيد يتطلب انتباهك",
        "body_ar": "يحتاج تدخلك: {title} - {reason}",
    },
    "sequence_complete": {
        "title_ar": "تسلسل مكتمل",
        "body_ar": "اكتمل تسلسل {name} للعميل {lead_name}",
    },
    "meeting_booked": {
        "title_ar": "موعد جديد",
        "body_ar": "تم حجز موعد مع {name} في {time}",
    },
    "competitor_alert": {
        "title_ar": "تنبيه منافس",
        "body_ar": "تغيير من المنافس {competitor}: {detail}",
    },
}

# Channel routing per urgency
_CHANNEL_MATRIX: Dict[AlertUrgency, List[AlertChannel]] = {
    AlertUrgency.CRITICAL: [
        AlertChannel.DASHBOARD, AlertChannel.WHATSAPP,
        AlertChannel.EMAIL, AlertChannel.SMS,
    ],
    AlertUrgency.HIGH: [AlertChannel.DASHBOARD, AlertChannel.WHATSAPP],
    AlertUrgency.MEDIUM: [AlertChannel.DASHBOARD, AlertChannel.EMAIL],
    AlertUrgency.LOW: [AlertChannel.DASHBOARD],
}


# ---------------------------------------------------------------------------
# Channel dispatchers (thin wrappers — production would call real adapters)
# ---------------------------------------------------------------------------

async def _dispatch_dashboard(alert: Alert) -> bool:
    logger.info(
        "[DASHBOARD] tenant=%s user=%s title=%s",
        alert.tenant_id[:8], (alert.user_id or "broadcast")[:8], alert.title_ar,
    )
    return True


async def _dispatch_email(alert: Alert) -> bool:
    logger.info(
        "[EMAIL] tenant=%s user=%s subject=%s",
        alert.tenant_id[:8], (alert.user_id or "broadcast")[:8], alert.title_ar,
    )
    return True


async def _dispatch_whatsapp(alert: Alert) -> bool:
    logger.info(
        "[WHATSAPP] tenant=%s user=%s body=%s",
        alert.tenant_id[:8], (alert.user_id or "broadcast")[:8], alert.body_ar[:60],
    )
    return True


async def _dispatch_sms(alert: Alert) -> bool:
    logger.info(
        "[SMS] tenant=%s user=%s body=%s",
        alert.tenant_id[:8], (alert.user_id or "broadcast")[:8], alert.body_ar[:60],
    )
    return True


async def _dispatch_telegram(alert: Alert) -> bool:
    logger.info(
        "[TELEGRAM] tenant=%s user=%s body=%s",
        alert.tenant_id[:8], (alert.user_id or "broadcast")[:8], alert.body_ar[:60],
    )
    return True


_DISPATCHERS = {
    AlertChannel.DASHBOARD: _dispatch_dashboard,
    AlertChannel.EMAIL: _dispatch_email,
    AlertChannel.WHATSAPP: _dispatch_whatsapp,
    AlertChannel.SMS: _dispatch_sms,
    AlertChannel.TELEGRAM: _dispatch_telegram,
}


# ---------------------------------------------------------------------------
# Core Service
# ---------------------------------------------------------------------------


class AlertDelivery:
    """
    Multi-channel alert delivery with urgency-based routing, acknowledgement
    tracking, digest generation and delivery statistics.
    """

    def __init__(self) -> None:
        # tenant_id -> list[Alert]  (most recent first)
        self._alerts: Dict[str, List[Alert]] = defaultdict(list)
        # delivery stats counters
        self._stats: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))

    # ── Send ──────────────────────────────────────────────────

    async def send(self, alert: Alert) -> Dict[str, Any]:
        """Route alert to channels based on urgency, deliver, and persist."""
        # Determine channels from urgency matrix, merged with explicit overrides
        urgency_channels = _CHANNEL_MATRIX.get(alert.urgency, [AlertChannel.DASHBOARD])
        target_channels = list(set(urgency_channels) | set(alert.channels))

        delivered: List[str] = []
        failed: List[str] = []

        for ch in target_channels:
            ok = await self.send_to_channel(alert, ch)
            if ok:
                delivered.append(ch.value)
                self._stats[alert.tenant_id][ch.value] += 1
            else:
                failed.append(ch.value)

        alert.delivered_channels = delivered
        self._alerts[alert.tenant_id].insert(0, alert)

        # Cap buffer
        if len(self._alerts[alert.tenant_id]) > 10_000:
            self._alerts[alert.tenant_id] = self._alerts[alert.tenant_id][:10_000]

        self._stats[alert.tenant_id]["total"] += 1

        logger.info(
            "Alert %s [%s] delivered via %s for tenant %s",
            alert.id[:8], alert.urgency.value,
            ", ".join(delivered) or "none", alert.tenant_id[:8],
        )

        return {
            "alert_id": alert.id,
            "urgency": alert.urgency.value,
            "delivered": delivered,
            "failed": failed,
        }

    async def send_to_channel(self, alert: Alert, channel: AlertChannel) -> bool:
        """Dispatch to a single channel. Returns success bool."""
        dispatcher = _DISPATCHERS.get(channel)
        if not dispatcher:
            logger.warning("No dispatcher for channel %s", channel.value)
            return False
        try:
            return await dispatcher(alert)
        except Exception:
            logger.exception("Channel %s dispatch failed for alert %s", channel.value, alert.id[:8])
            return False

    # ── Templates ─────────────────────────────────────────────

    async def send_from_template(
        self,
        template_key: str,
        tenant_id: str,
        urgency: AlertUrgency,
        category: str = "system",
        user_id: Optional[str] = None,
        action_url: Optional[str] = None,
        requires_ack: bool = False,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """Build and send an alert from a named Arabic template."""
        tpl = ALERT_TEMPLATES.get(template_key)
        if not tpl:
            logger.error("Unknown alert template: %s", template_key)
            return {"error": f"Unknown template: {template_key}"}

        title_ar = tpl["title_ar"]
        body_ar = tpl["body_ar"].format_map(defaultdict(lambda: "—", **kwargs))

        alert = Alert(
            tenant_id=tenant_id,
            user_id=user_id,
            title=template_key.replace("_", " ").title(),
            title_ar=title_ar,
            body=body_ar,
            body_ar=body_ar,
            urgency=urgency,
            category=category,
            action_url=action_url,
            requires_acknowledgement=requires_ack,
            metadata=dict(kwargs),
        )
        return await self.send(alert)

    # ── Acknowledgement ───────────────────────────────────────

    async def acknowledge(self, alert_id: str, user_id: str) -> bool:
        """Mark an alert as acknowledged by a user."""
        for alerts in self._alerts.values():
            for alert in alerts:
                if alert.id == alert_id:
                    if alert.acknowledged_at:
                        return True  # already acked
                    alert.acknowledged_at = datetime.now(timezone.utc)
                    logger.info(
                        "Alert %s acknowledged by user %s",
                        alert_id[:8], user_id[:8],
                    )
                    return True
        return False

    # ── Digest ────────────────────────────────────────────────

    async def generate_digest(
        self,
        tenant_id: str,
        user_id: Optional[str] = None,
        period: str = "daily",
    ) -> Dict[str, Any]:
        """Compile unacknowledged alerts into an Arabic summary digest."""
        hours = 24 if period == "daily" else 168  # weekly
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)

        pending = [
            a for a in self._alerts.get(tenant_id, [])
            if a.acknowledged_at is None
            and a.created_at >= cutoff
            and (user_id is None or a.user_id is None or a.user_id == user_id)
        ]

        if not pending:
            return {
                "tenant_id": tenant_id,
                "period": period,
                "count": 0,
                "digest_ar": "لا توجد تنبيهات جديدة",
                "alerts": [],
            }

        # Group by category
        by_category: Dict[str, List[Alert]] = defaultdict(list)
        for a in pending:
            by_category[a.category].append(a)

        category_labels = {
            "lead": "العملاء المحتملون",
            "deal": "الصفقات",
            "system": "النظام",
            "compliance": "الامتثال",
            "security": "الأمان",
        }

        lines: List[str] = []
        lines.append(f"ملخص التنبيهات — {'يومي' if period == 'daily' else 'أسبوعي'}")
        lines.append(f"إجمالي التنبيهات: {len(pending)}")
        lines.append("")

        critical_count = sum(1 for a in pending if a.urgency == AlertUrgency.CRITICAL)
        high_count = sum(1 for a in pending if a.urgency == AlertUrgency.HIGH)
        if critical_count:
            lines.append(f"تنبيهات حرجة: {critical_count}")
        if high_count:
            lines.append(f"تنبيهات عالية الأهمية: {high_count}")
        lines.append("")

        for cat, cat_alerts in by_category.items():
            label = category_labels.get(cat, cat)
            lines.append(f"— {label} ({len(cat_alerts)}):")
            for a in cat_alerts[:10]:
                urgency_marker = ""
                if a.urgency == AlertUrgency.CRITICAL:
                    urgency_marker = " [حرج]"
                elif a.urgency == AlertUrgency.HIGH:
                    urgency_marker = " [مهم]"
                lines.append(f"  - {a.title_ar}{urgency_marker}")
            if len(cat_alerts) > 10:
                lines.append(f"  ... و {len(cat_alerts) - 10} تنبيهات أخرى")

        digest_text = "\n".join(lines)

        return {
            "tenant_id": tenant_id,
            "user_id": user_id,
            "period": period,
            "count": len(pending),
            "critical": critical_count,
            "high": high_count,
            "digest_ar": digest_text,
            "alerts": [a.model_dump() for a in pending[:50]],
        }

    # ── Queries ───────────────────────────────────────────────

    async def get_pending(
        self, tenant_id: str, user_id: Optional[str] = None
    ) -> List[Alert]:
        """Return unacknowledged alerts for a user (or all if user_id is None)."""
        return [
            a for a in self._alerts.get(tenant_id, [])
            if a.acknowledged_at is None
            and (user_id is None or a.user_id is None or a.user_id == user_id)
        ]

    async def get_delivery_stats(self, tenant_id: str) -> Dict[str, Any]:
        """Return delivery statistics for a tenant."""
        stats = dict(self._stats.get(tenant_id, {}))
        total = stats.get("total", 0)

        alerts = self._alerts.get(tenant_id, [])
        acked = sum(1 for a in alerts if a.acknowledged_at is not None)
        pending = sum(1 for a in alerts if a.acknowledged_at is None)

        urgency_counts: Dict[str, int] = defaultdict(int)
        category_counts: Dict[str, int] = defaultdict(int)
        for a in alerts:
            urgency_counts[a.urgency.value] += 1
            category_counts[a.category] += 1

        return {
            "tenant_id": tenant_id,
            "total_sent": total,
            "acknowledged": acked,
            "pending": pending,
            "ack_rate": round(acked / max(total, 1) * 100, 1),
            "by_channel": {k: v for k, v in stats.items() if k != "total"},
            "by_urgency": dict(urgency_counts),
            "by_category": dict(category_counts),
        }


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

_instance: Optional[AlertDelivery] = None


def get_alert_delivery() -> AlertDelivery:
    global _instance
    if _instance is None:
        _instance = AlertDelivery()
    return _instance
