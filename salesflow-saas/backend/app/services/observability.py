"""
Observability Service — Dealix AI Revenue OS
Cost tracking, workflow metrics, health monitoring, and Arabic executive summaries.
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class WorkflowMetric(BaseModel):
    workflow_name: str
    profile_id: str
    backend: str
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    duration_ms: int = 0
    token_count: int = 0
    estimated_cost_usd: float = 0.0
    success: bool = True
    error: Optional[str] = None


class ObservabilityService:
    """Track cost, performance, and health across all agent workflows."""

    def __init__(self):
        self._metrics: list[WorkflowMetric] = []
        self._max_metrics = 50000

    async def record_workflow(self, metric: WorkflowMetric) -> None:
        self._metrics.append(metric)
        if len(self._metrics) > self._max_metrics:
            self._metrics = self._metrics[-self._max_metrics:]
        logger.debug(
            f"Recorded: {metric.workflow_name} "
            f"cost=${metric.estimated_cost_usd:.4f} "
            f"{'OK' if metric.success else 'FAIL'}"
        )

    def _filter_by_period(
        self, period: str, metrics: list[WorkflowMetric] = None
    ) -> list[WorkflowMetric]:
        source = metrics or self._metrics
        now = datetime.now(timezone.utc)
        if period == "hourly":
            cutoff = now - timedelta(hours=1)
        elif period == "daily":
            cutoff = now - timedelta(days=1)
        elif period == "weekly":
            cutoff = now - timedelta(weeks=1)
        elif period == "monthly":
            cutoff = now - timedelta(days=30)
        else:
            cutoff = now - timedelta(days=1)
        return [m for m in source if m.started_at >= cutoff]

    async def get_cost_report(
        self, period: str = "daily", profile: str = None
    ) -> dict:
        filtered = self._filter_by_period(period)
        if profile:
            filtered = [m for m in filtered if m.profile_id == profile]

        total_cost = sum(m.estimated_cost_usd for m in filtered)
        by_profile: dict[str, float] = {}
        by_backend: dict[str, float] = {}
        by_workflow: dict[str, float] = {}

        for m in filtered:
            by_profile[m.profile_id] = by_profile.get(m.profile_id, 0) + m.estimated_cost_usd
            by_backend[m.backend] = by_backend.get(m.backend, 0) + m.estimated_cost_usd
            by_workflow[m.workflow_name] = by_workflow.get(m.workflow_name, 0) + m.estimated_cost_usd

        top_expensive = sorted(by_workflow.items(), key=lambda x: x[1], reverse=True)[:5]

        return {
            "period": period,
            "total_cost_usd": round(total_cost, 4),
            "total_workflows": len(filtered),
            "by_profile": {k: round(v, 4) for k, v in by_profile.items()},
            "by_backend": {k: round(v, 4) for k, v in by_backend.items()},
            "top_expensive": [{"name": k, "cost": round(v, 4)} for k, v in top_expensive],
        }

    async def get_performance_report(self, period: str = "daily") -> dict:
        filtered = self._filter_by_period(period)
        if not filtered:
            return {"period": period, "total": 0}

        durations = [m.duration_ms for m in filtered]
        durations.sort()
        total = len(durations)
        success_count = sum(1 for m in filtered if m.success)

        p95_idx = min(int(total * 0.95), total - 1)
        errors = [m for m in filtered if not m.success]

        return {
            "period": period,
            "total_workflows": total,
            "success_rate": round(success_count / total * 100, 1) if total else 0,
            "avg_duration_ms": round(sum(durations) / total) if total else 0,
            "p95_duration_ms": durations[p95_idx] if durations else 0,
            "error_count": len(errors),
            "error_rate": round(len(errors) / total * 100, 1) if total else 0,
            "recent_errors": [
                {"workflow": e.workflow_name, "error": e.error, "at": e.started_at.isoformat()}
                for e in errors[-5:]
            ],
        }

    async def get_health_report(self) -> dict:
        daily = self._filter_by_period("daily")
        total = len(daily)
        success = sum(1 for m in daily if m.success)

        backends_used = set(m.backend for m in daily)
        backend_health = {}
        for b in backends_used:
            b_metrics = [m for m in daily if m.backend == b]
            b_success = sum(1 for m in b_metrics if m.success)
            backend_health[b] = {
                "total": len(b_metrics),
                "success_rate": round(b_success / len(b_metrics) * 100, 1) if b_metrics else 0,
                "avg_duration_ms": round(
                    sum(m.duration_ms for m in b_metrics) / len(b_metrics)
                ) if b_metrics else 0,
            }

        return {
            "overall_health": "healthy" if (total == 0 or success / total > 0.9) else "degraded",
            "workflows_today": total,
            "success_rate": round(success / total * 100, 1) if total else 100,
            "total_cost_today_usd": round(sum(m.estimated_cost_usd for m in daily), 4),
            "backends": backend_health,
        }

    async def get_executive_summary(self, period: str = "weekly") -> str:
        filtered = self._filter_by_period(period)
        total = len(filtered)
        success = sum(1 for m in filtered if m.success)
        cost = sum(m.estimated_cost_usd for m in filtered)
        success_rate = round(success / total * 100) if total else 100

        period_ar = {"daily": "اليوم", "weekly": "هذا الأسبوع", "monthly": "هذا الشهر"}.get(period, period)

        summary = (
            f"📊 ملخص {period_ar}:\n"
            f"• {total} مهمة منفذة\n"
            f"• {success_rate}% نسبة النجاح\n"
            f"• ${cost:.2f} التكلفة الإجمالية\n"
        )

        errors = [m for m in filtered if not m.success]
        if errors:
            summary += f"• {len(errors)} خطأ يحتاج مراجعة\n"
        else:
            summary += "• لا أخطاء حرجة ✅\n"

        return summary

    async def detect_anomalies(self) -> list[dict]:
        anomalies = []
        hourly = self._filter_by_period("hourly")
        daily = self._filter_by_period("daily")

        if hourly:
            hourly_cost = sum(m.estimated_cost_usd for m in hourly)
            if hourly_cost > 5.0:
                anomalies.append({
                    "type": "cost_spike",
                    "severity": "high",
                    "message": f"تكلفة الساعة الأخيرة ${hourly_cost:.2f} — أعلى من الحد الطبيعي",
                    "value": hourly_cost,
                })

            hourly_errors = sum(1 for m in hourly if not m.success)
            if len(hourly) > 5 and hourly_errors / len(hourly) > 0.3:
                anomalies.append({
                    "type": "error_spike",
                    "severity": "critical",
                    "message": f"معدل أخطاء مرتفع: {hourly_errors}/{len(hourly)} في الساعة الأخيرة",
                    "value": hourly_errors,
                })

        return anomalies


observability = ObservabilityService()
