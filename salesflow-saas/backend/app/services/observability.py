"""
Observability Service -- Dealix AI Revenue OS -- خدمة المراقبة
Track cost, performance, and health across all agent workflows.
Anomaly detection, executive summaries in Arabic.
"""
from __future__ import annotations

import logging
import statistics
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class WorkflowMetric(BaseModel):
    """Single workflow execution metric."""
    workflow_name: str
    profile_id: str
    backend: str
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    duration_ms: int = 0
    token_count: int = 0
    estimated_cost_usd: float = 0.0
    success: bool = True
    error: Optional[str] = None


class AnomalyAlert(BaseModel):
    """Detected anomaly."""
    id: str = ""
    anomaly_type: str  # cost_spike, failure_spike, latency_spike, regression
    description: str
    description_ar: str
    severity: str = "medium"  # critical, high, medium, low
    metric_name: str = ""
    current_value: float = 0.0
    baseline_value: float = 0.0
    deviation_pct: float = 0.0
    detected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class ObservabilityService:
    """Track cost, performance, and health across all agent workflows."""

    def __init__(self) -> None:
        self._metrics: list[WorkflowMetric] = []
        self._max_metrics = 50_000
        self._anomalies: list[AnomalyAlert] = []
        self._max_anomalies = 1_000
        logger.info("خدمة المراقبة: تم التهيئة")

    # -- Recording ---------------------------------------------------------

    async def record_workflow(self, metric: WorkflowMetric) -> None:
        """Store a workflow execution metric."""
        self._metrics.append(metric)
        if len(self._metrics) > self._max_metrics:
            self._metrics = self._metrics[-self._max_metrics:]
        logger.debug(
            "[Obs] سجل: %s profile=%s backend=%s %dms $%.4f %s",
            metric.workflow_name, metric.profile_id, metric.backend,
            metric.duration_ms, metric.estimated_cost_usd,
            "OK" if metric.success else "FAIL",
        )

    # -- Cost report -------------------------------------------------------

    async def get_cost_report(
        self, period: str = "daily", profile: Optional[str] = None,
    ) -> dict[str, Any]:
        """Total cost, cost by profile, cost by backend, cost by workflow."""
        cutoff = self._period_cutoff(period)
        filtered = [
            m for m in self._metrics
            if m.started_at >= cutoff and (profile is None or m.profile_id == profile)
        ]

        total = sum(m.estimated_cost_usd for m in filtered)
        by_profile: dict[str, float] = defaultdict(float)
        by_backend: dict[str, float] = defaultdict(float)
        by_workflow: dict[str, float] = defaultdict(float)

        for m in filtered:
            by_profile[m.profile_id] += m.estimated_cost_usd
            by_backend[m.backend] += m.estimated_cost_usd
            by_workflow[m.workflow_name] += m.estimated_cost_usd

        # Sort by cost descending
        top_workflows = sorted(by_workflow.items(), key=lambda x: -x[1])[:10]

        return {
            "period": period,
            "total_usd": round(total, 4),
            "by_profile": {k: round(v, 4) for k, v in by_profile.items()},
            "by_backend": {k: round(v, 4) for k, v in by_backend.items()},
            "top_workflows": [{"name": n, "cost_usd": round(c, 4)} for n, c in top_workflows],
            "total_executions": len(filtered),
            "message_ar": f"التكلفة الإجمالية ({period}): ${total:.2f} عبر {len(filtered)} عملية",
        }

    # -- Performance report ------------------------------------------------

    async def get_performance_report(self, period: str = "daily") -> dict[str, Any]:
        """Average duration, P95 duration, success rate, error rate."""
        cutoff = self._period_cutoff(period)
        filtered = [m for m in self._metrics if m.started_at >= cutoff]

        if not filtered:
            return {
                "period": period, "total_executions": 0,
                "message_ar": "لا توجد بيانات لهذه الفترة",
            }

        durations = [m.duration_ms for m in filtered]
        successes = sum(1 for m in filtered if m.success)
        failures = len(filtered) - successes

        avg_ms = statistics.mean(durations)
        p95_ms = sorted(durations)[int(len(durations) * 0.95)] if len(durations) >= 20 else max(durations)
        success_rate = successes / len(filtered)

        # Slowest workflows
        by_wf: dict[str, list[int]] = defaultdict(list)
        for m in filtered:
            by_wf[m.workflow_name].append(m.duration_ms)
        slowest = sorted(
            [(wf, statistics.mean(ds)) for wf, ds in by_wf.items()],
            key=lambda x: -x[1],
        )[:5]

        # Most expensive
        cost_wf: dict[str, float] = defaultdict(float)
        for m in filtered:
            cost_wf[m.workflow_name] += m.estimated_cost_usd
        most_expensive = sorted(cost_wf.items(), key=lambda x: -x[1])[:5]

        return {
            "period": period,
            "total_executions": len(filtered),
            "avg_duration_ms": round(avg_ms, 2),
            "p95_duration_ms": p95_ms,
            "success_rate": round(success_rate, 4),
            "error_rate": round(1 - success_rate, 4),
            "total_successes": successes,
            "total_failures": failures,
            "slowest_workflows": [{"name": n, "avg_ms": round(d, 2)} for n, d in slowest],
            "most_expensive": [{"name": n, "cost_usd": round(c, 4)} for n, c in most_expensive],
            "message_ar": (
                f"أداء ({period}): {len(filtered)} عملية، "
                f"متوسط {avg_ms:.0f}ms، نجاح {success_rate:.0%}، فشل {failures}"
            ),
        }

    # -- Health report -----------------------------------------------------

    async def get_health_report(self) -> dict[str, Any]:
        """Backend health, skill health, memory health, knowledge health, trust health."""
        recent = [m for m in self._metrics if m.started_at >= self._period_cutoff("daily")]

        # Backend health
        backend_calls: dict[str, dict[str, int]] = defaultdict(lambda: {"ok": 0, "fail": 0})
        for m in recent:
            backend_calls[m.backend]["ok" if m.success else "fail"] += 1
        backend_health = {}
        for b, counts in backend_calls.items():
            total = counts["ok"] + counts["fail"]
            rate = counts["ok"] / total if total else 1.0
            backend_health[b] = {
                "total": total, "success_rate": round(rate, 4),
                "healthy": rate >= 0.7 or total < 5,
            }

        # Skill health (by workflow)
        skill_calls: dict[str, dict[str, int]] = defaultdict(lambda: {"ok": 0, "fail": 0})
        for m in recent:
            skill_calls[m.workflow_name]["ok" if m.success else "fail"] += 1
        skill_health = {}
        for s, counts in skill_calls.items():
            total = counts["ok"] + counts["fail"]
            rate = counts["ok"] / total if total else 1.0
            skill_health[s] = {"total": total, "success_rate": round(rate, 4)}

        # Overall
        total = len(recent)
        overall_ok = sum(1 for m in recent if m.success)
        overall_rate = overall_ok / total if total else 1.0
        healthy = overall_rate >= 0.8

        return {
            "overall_healthy": healthy,
            "overall_success_rate": round(overall_rate, 4),
            "total_today": total,
            "backend_health": backend_health,
            "skill_health": skill_health,
            "anomalies_today": len([
                a for a in self._anomalies
                if a.detected_at >= self._period_cutoff("daily")
            ]),
            "message_ar": (
                f"صحة النظام: {'سليم' if healthy else 'يحتاج انتباه'} -- "
                f"نجاح {overall_rate:.0%}، {total} عملية اليوم"
            ),
        }

    # -- Executive summary -------------------------------------------------

    async def get_executive_summary(self, period: str = "weekly") -> str:
        """Arabic executive summary for leadership."""
        cutoff = self._period_cutoff(period)
        filtered = [m for m in self._metrics if m.started_at >= cutoff]

        total = len(filtered)
        successes = sum(1 for m in filtered if m.success)
        rate = successes / total if total else 0
        cost = sum(m.estimated_cost_usd for m in filtered)
        anomalies = [a for a in self._anomalies if a.detected_at >= cutoff]
        critical = sum(1 for a in anomalies if a.severity == "critical")

        period_ar = {
            "daily": "اليوم", "weekly": "هذا الأسبوع",
            "monthly": "هذا الشهر",
        }.get(period, period)

        summary = (
            f"{period_ar}: {total} مهمة منفذة، "
            f"{rate:.0%} نجاح، "
            f"تكلفة ${cost:.2f}، "
            f"{len(anomalies)} تنبيه"
        )
        if critical:
            summary += f"، {critical} مشاكل حرجة تحتاج تدخل فوري"
        else:
            summary += "، 0 مشاكل حرجة"

        return summary

    # -- Anomaly detection -------------------------------------------------

    async def detect_anomalies(self) -> list[AnomalyAlert]:
        """Sudden cost spikes, unusual failure patterns, backend degradation."""
        alerts: list[AnomalyAlert] = []
        now = datetime.now(timezone.utc)
        today = [m for m in self._metrics if m.started_at >= now - timedelta(hours=24)]
        prev_week = [
            m for m in self._metrics
            if now - timedelta(days=8) <= m.started_at < now - timedelta(days=1)
        ]

        if not today or not prev_week:
            return alerts

        # Cost spike detection
        today_cost = sum(m.estimated_cost_usd for m in today)
        avg_daily_cost = sum(m.estimated_cost_usd for m in prev_week) / 7
        if avg_daily_cost > 0 and today_cost > avg_daily_cost * 2:
            deviation = ((today_cost - avg_daily_cost) / avg_daily_cost) * 100
            alerts.append(AnomalyAlert(
                id=f"cost-{now.strftime('%Y%m%d')}",
                anomaly_type="cost_spike",
                description=f"Today's cost ${today_cost:.2f} is {deviation:.0f}% above daily avg ${avg_daily_cost:.2f}",
                description_ar=f"تكلفة اليوم ${today_cost:.2f} أعلى بنسبة {deviation:.0f}% من المتوسط ${avg_daily_cost:.2f}",
                severity="high" if deviation > 200 else "medium",
                metric_name="daily_cost_usd",
                current_value=today_cost,
                baseline_value=avg_daily_cost,
                deviation_pct=round(deviation, 2),
            ))

        # Failure rate spike
        today_fail_rate = sum(1 for m in today if not m.success) / max(len(today), 1)
        prev_fail_rate = sum(1 for m in prev_week if not m.success) / max(len(prev_week), 1)
        if today_fail_rate > 0.15 and today_fail_rate > prev_fail_rate * 2:
            alerts.append(AnomalyAlert(
                id=f"fail-{now.strftime('%Y%m%d')}",
                anomaly_type="failure_spike",
                description=f"Failure rate {today_fail_rate:.1%} vs baseline {prev_fail_rate:.1%}",
                description_ar=f"معدل الفشل {today_fail_rate:.1%} مقابل الخط الأساسي {prev_fail_rate:.1%}",
                severity="critical" if today_fail_rate > 0.3 else "high",
                metric_name="failure_rate",
                current_value=today_fail_rate,
                baseline_value=prev_fail_rate,
                deviation_pct=round(((today_fail_rate - prev_fail_rate) / max(prev_fail_rate, 0.01)) * 100, 2),
            ))

        # Latency spike (per backend)
        for backend in {"claude", "openclaude", "goose", "internal"}:
            today_b = [m.duration_ms for m in today if m.backend == backend]
            prev_b = [m.duration_ms for m in prev_week if m.backend == backend]
            if len(today_b) >= 5 and len(prev_b) >= 5:
                today_avg = statistics.mean(today_b)
                prev_avg = statistics.mean(prev_b)
                if prev_avg > 0 and today_avg > prev_avg * 3:
                    deviation = ((today_avg - prev_avg) / prev_avg) * 100
                    alerts.append(AnomalyAlert(
                        id=f"latency-{backend}-{now.strftime('%Y%m%d')}",
                        anomaly_type="latency_spike",
                        description=f"{backend} latency {today_avg:.0f}ms vs baseline {prev_avg:.0f}ms",
                        description_ar=f"زمن استجابة {backend}: {today_avg:.0f}ms مقابل {prev_avg:.0f}ms",
                        severity="high",
                        metric_name=f"latency_{backend}",
                        current_value=today_avg,
                        baseline_value=prev_avg,
                        deviation_pct=round(deviation, 2),
                    ))

        self._anomalies.extend(alerts)
        if len(self._anomalies) > self._max_anomalies:
            self._anomalies = self._anomalies[-self._max_anomalies:]

        if alerts:
            logger.warning("[Obs] %d anomalies detected", len(alerts))

        return alerts

    # -- Helpers -----------------------------------------------------------

    @staticmethod
    def _period_cutoff(period: str) -> datetime:
        now = datetime.now(timezone.utc)
        if period == "daily":
            return now - timedelta(hours=24)
        if period == "weekly":
            return now - timedelta(days=7)
        if period == "monthly":
            return now - timedelta(days=30)
        return now - timedelta(hours=24)


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

observability_service = ObservabilityService()
