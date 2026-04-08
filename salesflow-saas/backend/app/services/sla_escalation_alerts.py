"""
Approval SLA: auto-escalation metadata on pending rows + breach alerts (webhook / Slack).

Persists escalation state under ApprovalRequest.payload["_dealix_sla"].
Aggregated breach notifications use a per-tenant cooldown to avoid spam.
"""

from __future__ import annotations

import logging
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.config import get_settings
from app.models.operations import ApprovalRequest
from app.services.operations_hub import emit_domain_event

logger = logging.getLogger(__name__)

SLA_KEY = "_dealix_sla"

# tenant_id -> last aggregate breach alert (UTC)
_last_aggregate_breach_alert: Dict[str, datetime] = {}


def _hours_between(now: datetime, then: Optional[datetime]) -> float:
    if not then:
        return 0.0
    return max(0.0, (now - then).total_seconds() / 3600.0)


def _escalation_level(age_h: float, warn_h: int, breach_h: int, l3_mult: float) -> int:
    if age_h < warn_h:
        return 0
    if age_h < breach_h:
        return 1
    breach_m = max(float(breach_h), float(warn_h))
    if age_h < breach_m * max(l3_mult, 1.01):
        return 2
    return 3


def _level_label_ar(level: int) -> str:
    return {
        0: "ضمن المهلة",
        1: "تحذير — يقترب من تجاوز SLA",
        2: "تجاوز SLA — يتطلب اهتماماً فورياً",
        3: "تصعيد حرج — تدخل المالك/الإدارة",
    }.get(level, "غير معروف")


async def refresh_pending_escalations(db: AsyncSession, tenant_id: UUID) -> Dict[str, Any]:
    """
    Update _dealix_sla on each pending approval; emit domain events when level increases.
    """
    s = get_settings()
    now = datetime.now(timezone.utc)
    warn_h = max(1, int(s.OPENCLAW_APPROVAL_SLA_HOURS_WARN))
    breach_h = max(warn_h, int(s.OPENCLAW_APPROVAL_SLA_HOURS_BREACH))
    l3_mult = max(1.01, float(s.OPENCLAW_APPROVAL_ESCALATION_L3_MULTIPLIER))

    q = await db.execute(
        select(ApprovalRequest).where(
            ApprovalRequest.tenant_id == tenant_id,
            ApprovalRequest.status == "pending",
        )
    )
    rows: List[ApprovalRequest] = list(q.scalars().all())
    counts: Counter[int] = Counter()
    bumped = 0

    for row in rows:
        age_h = _hours_between(now, row.created_at)
        level = _escalation_level(age_h, warn_h, breach_h, l3_mult)
        counts[level] += 1

        base = dict(row.payload) if isinstance(row.payload, dict) else {}
        prev = base.get(SLA_KEY) if isinstance(base.get(SLA_KEY), dict) else {}
        prev_level = int(prev.get("escalation_level", 0) or 0)

        sla_block = {
            **prev,
            "escalation_level": level,
            "escalation_label_ar": _level_label_ar(level),
            "age_hours": round(age_h, 2),
            "warn_threshold_hours": warn_h,
            "breach_threshold_hours": breach_h,
            "updated_at": now.isoformat(),
        }

        if level != prev_level:
            sla_block["escalation_changed_at"] = now.isoformat()

        base[SLA_KEY] = sla_block
        row.payload = base
        flag_modified(row, "payload")

        if level > prev_level:
            bumped += 1
            await emit_domain_event(
                db,
                tenant_id=tenant_id,
                event_type="approval.sla_escalated",
                payload={
                    "approval_id": str(row.id),
                    "from_level": prev_level,
                    "to_level": level,
                    "age_hours": round(age_h, 2),
                },
                source="sla_escalation",
            )

    by_level = {str(k): int(counts.get(k, 0)) for k in range(4)}
    return {
        "pending_escalation_total": len(rows),
        "by_level": by_level,
        "events_emitted": bumped,
    }


async def maybe_dispatch_sla_breach_alerts(
    db: AsyncSession,
    tenant_id: UUID,
    *,
    tenant_id_str: str,
    metrics: Dict[str, Any],
) -> Dict[str, Any]:
    """
    If breach count > 0 and alerts enabled, POST to webhook and/or Slack (respecting cooldown).
    """
    s = get_settings()
    out: Dict[str, Any] = {
        "attempted": False,
        "skipped_reason": None,
        "webhook_ok": None,
        "slack_ok": None,
        "cooldown_minutes": int(s.OPENCLAW_SLA_ALERT_COOLDOWN_MINUTES),
    }

    if not s.OPENCLAW_SLA_ALERTS_ENABLED:
        out["skipped_reason"] = "alerts_disabled"
        return out

    breach_n = int(metrics.get("pending_breach_count") or 0)
    if breach_n <= 0:
        out["skipped_reason"] = "no_breach"
        return out

    webhook_url = (s.OPENCLAW_SLA_WEBHOOK_URL or "").strip()
    slack_url = (s.OPENCLAW_SLA_SLACK_WEBHOOK_URL or "").strip()
    if not webhook_url and not slack_url:
        out["skipped_reason"] = "no_webhook_configured"
        return out

    now = datetime.now(timezone.utc)
    cool = timedelta(minutes=max(5, int(s.OPENCLAW_SLA_ALERT_COOLDOWN_MINUTES)))
    last = _last_aggregate_breach_alert.get(tenant_id_str)
    if last and (now - last) < cool:
        out["skipped_reason"] = "cooldown"
        out["next_eligible_at"] = (last + cool).isoformat()
        return out

    payload = {
        "event": "approval_sla.breach",
        "tenant_id": tenant_id_str,
        "pending_breach_count": breach_n,
        "pending_warn_count": int(metrics.get("pending_warn_count") or 0),
        "breach_threshold_hours": metrics.get("breach_threshold_hours"),
        "warn_threshold_hours": metrics.get("warn_threshold_hours"),
        "health": metrics.get("health"),
        "timestamp": now.isoformat(),
        "source": "dealix",
    }

    out["attempted"] = True
    timeout = httpx.Timeout(12.0)

    async with httpx.AsyncClient(timeout=timeout) as client:
        if webhook_url:
            try:
                r = await client.post(webhook_url, json=payload)
                out["webhook_ok"] = 200 <= r.status_code < 300
                if not out["webhook_ok"]:
                    out["webhook_status"] = r.status_code
            except Exception as e:
                logger.warning("SLA webhook failed: %s", e)
                out["webhook_ok"] = False
                out["webhook_error"] = str(e)[:200]

        if slack_url:
            text = (
                f":rotating_light: *Approval SLA breach* — tenant `{tenant_id_str[:8]}…`\n"
                f"*Pending breach:* {breach_n} (warn: {metrics.get('pending_warn_count', 0)})\n"
                f"*Thresholds:* warn {metrics.get('warn_threshold_hours')}h / breach {metrics.get('breach_threshold_hours')}h\n"
                f"*Time:* {now.isoformat()}"
            )
            slack_body = {"text": text}
            try:
                r2 = await client.post(slack_url, json=slack_body)
                out["slack_ok"] = 200 <= r2.status_code < 300
                if not out["slack_ok"]:
                    out["slack_status"] = r2.status_code
            except Exception as e:
                logger.warning("SLA Slack webhook failed: %s", e)
                out["slack_ok"] = False
                out["slack_error"] = str(e)[:200]

    delivered = bool(out.get("webhook_ok")) or bool(out.get("slack_ok"))
    if not delivered:
        out["skipped_reason"] = "delivery_failed"
        out["attempted"] = True
        return out

    _last_aggregate_breach_alert[tenant_id_str] = now
    out["dispatched_at"] = now.isoformat()

    # Mark pending breach rows with last aggregate notify (audit in payload)
    q = await db.execute(
        select(ApprovalRequest).where(
            ApprovalRequest.tenant_id == tenant_id,
            ApprovalRequest.status == "pending",
        )
    )
    breach_h = max(1, int(s.OPENCLAW_APPROVAL_SLA_HOURS_BREACH))
    for row in q.scalars().all():
        age_h = _hours_between(now, row.created_at)
        if age_h < breach_h:
            continue
        base = dict(row.payload) if isinstance(row.payload, dict) else {}
        sla = dict(base.get(SLA_KEY) or {})
        sla["last_aggregate_breach_alert_at"] = now.isoformat()
        base[SLA_KEY] = sla
        row.payload = base
        flag_modified(row, "payload")

    await emit_domain_event(
        db,
        tenant_id=tenant_id,
        event_type="approval.sla_breach_notified",
        payload={
            "pending_breach_count": breach_n,
            "webhook_ok": out.get("webhook_ok"),
            "slack_ok": out.get("slack_ok"),
        },
        source="sla_alerts",
    )

    return out
