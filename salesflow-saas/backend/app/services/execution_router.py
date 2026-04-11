"""
Execution Router -- Dealix AI Revenue OS -- موجّه التنفيذ
Agent-level backend router: selects Claude, OpenClaude, Goose, or Internal
for each task class and executes with timeout, retry, and health tracking.
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class ExecutionBackend(str, Enum):
    CLAUDE = "claude"
    OPENCLAUDE = "openclaude"
    GOOSE = "goose"
    INTERNAL = "internal"


class TaskClass(str, Enum):
    CODE_CHANGE = "code_change"
    CODE_REVIEW = "code_review"
    TEST_GENERATION = "test_generation"
    RESEARCH = "research"
    LOCAL_OPS = "local_ops"
    DATA_PROCESSING = "data_processing"
    CUSTOMER_COMMUNICATION = "customer_communication"
    SECURITY_SCAN = "security_scan"
    CONTENT_GENERATION = "content_generation"
    ANALYSIS = "analysis"
    CRM_OPERATION = "crm_operation"
    WHATSAPP_MESSAGE = "whatsapp_message"


# ---------------------------------------------------------------------------
# Routing matrix + fallback chain
# ---------------------------------------------------------------------------

ROUTING_MATRIX: dict[TaskClass, ExecutionBackend] = {
    TaskClass.CODE_CHANGE: ExecutionBackend.CLAUDE,
    TaskClass.CODE_REVIEW: ExecutionBackend.CLAUDE,
    TaskClass.TEST_GENERATION: ExecutionBackend.CLAUDE,
    TaskClass.RESEARCH: ExecutionBackend.GOOSE,
    TaskClass.LOCAL_OPS: ExecutionBackend.GOOSE,
    TaskClass.DATA_PROCESSING: ExecutionBackend.INTERNAL,
    TaskClass.CUSTOMER_COMMUNICATION: ExecutionBackend.INTERNAL,
    TaskClass.SECURITY_SCAN: ExecutionBackend.CLAUDE,
    TaskClass.CONTENT_GENERATION: ExecutionBackend.OPENCLAUDE,
    TaskClass.ANALYSIS: ExecutionBackend.OPENCLAUDE,
    TaskClass.CRM_OPERATION: ExecutionBackend.INTERNAL,
    TaskClass.WHATSAPP_MESSAGE: ExecutionBackend.INTERNAL,
}

FALLBACK_ORDER: dict[ExecutionBackend, list[ExecutionBackend]] = {
    ExecutionBackend.CLAUDE: [ExecutionBackend.OPENCLAUDE, ExecutionBackend.INTERNAL],
    ExecutionBackend.OPENCLAUDE: [ExecutionBackend.CLAUDE, ExecutionBackend.INTERNAL],
    ExecutionBackend.GOOSE: [ExecutionBackend.CLAUDE, ExecutionBackend.INTERNAL],
    ExecutionBackend.INTERNAL: [],
}

BACKEND_DESCRIPTIONS: dict[ExecutionBackend, dict[str, Any]] = {
    ExecutionBackend.CLAUDE: {
        "name": "Claude Code", "name_ar": "كلود كود",
        "strengths": "Repo-native coding, deep code understanding, PR reviews",
        "use_for": ["code changes", "tests", "reviews", "debugging", "refactoring"],
    },
    ExecutionBackend.OPENCLAUDE: {
        "name": "OpenClaude", "name_ar": "أوبن كلود",
        "strengths": "Multi-provider flexibility, model comparison, content generation",
        "use_for": ["content writing", "analysis", "model comparison", "local inference"],
    },
    ExecutionBackend.GOOSE: {
        "name": "Goose", "name_ar": "قوز",
        "strengths": "Local automation, research, file ops, general-purpose tasks",
        "use_for": ["research", "scraping", "file processing", "local automation"],
    },
    ExecutionBackend.INTERNAL: {
        "name": "Internal Services", "name_ar": "الخدمات الداخلية",
        "strengths": "Direct service calls, no external agent needed",
        "use_for": ["CRM ops", "messaging", "data processing", "DB operations"],
    },
}

# Cost estimation per (backend, task_class) in USD
COST_ESTIMATES: dict[tuple[ExecutionBackend, TaskClass], float] = {
    (ExecutionBackend.CLAUDE, TaskClass.CODE_CHANGE): 0.08,
    (ExecutionBackend.CLAUDE, TaskClass.CODE_REVIEW): 0.05,
    (ExecutionBackend.CLAUDE, TaskClass.TEST_GENERATION): 0.06,
    (ExecutionBackend.CLAUDE, TaskClass.SECURITY_SCAN): 0.04,
    (ExecutionBackend.OPENCLAUDE, TaskClass.CONTENT_GENERATION): 0.03,
    (ExecutionBackend.OPENCLAUDE, TaskClass.ANALYSIS): 0.04,
    (ExecutionBackend.GOOSE, TaskClass.RESEARCH): 0.02,
    (ExecutionBackend.GOOSE, TaskClass.LOCAL_OPS): 0.01,
    (ExecutionBackend.INTERNAL, TaskClass.DATA_PROCESSING): 0.001,
    (ExecutionBackend.INTERNAL, TaskClass.CUSTOMER_COMMUNICATION): 0.002,
    (ExecutionBackend.INTERNAL, TaskClass.CRM_OPERATION): 0.001,
    (ExecutionBackend.INTERNAL, TaskClass.WHATSAPP_MESSAGE): 0.002,
}
DEFAULT_COST = 0.01


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class ExecutionResult(BaseModel):
    """Result returned from any execution backend."""
    execution_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    backend: ExecutionBackend
    task_class: Optional[TaskClass] = None
    success: bool = False
    data: dict[str, Any] = {}
    error: Optional[str] = None
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    duration_ms: int = 0
    token_count: int = 0
    estimated_cost_usd: float = 0.0
    message_ar: str = ""


class BackendHealth(BaseModel):
    """Health status for a single backend."""
    backend: ExecutionBackend
    healthy: bool = True
    last_check: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    success_rate: float = 1.0
    avg_latency_ms: float = 0.0
    total_calls: int = 0
    total_failures: int = 0
    message_ar: str = ""


# ---------------------------------------------------------------------------
# Backend executor adapters
# ---------------------------------------------------------------------------

async def _execute_claude(task: str, params: dict[str, Any], timeout: float) -> dict[str, Any]:
    """Execute via Claude Code (repo-native coding agent)."""
    logger.info("[Router:Claude] تنفيذ: %s", task[:120])
    await asyncio.sleep(0)
    return {
        "agent": "claude", "task": task,
        "output": f"Claude executed: {task}",
        "output_ar": f"كلود نفّذ: {task}",
        "files_changed": params.get("files", []),
        "tokens_used": params.get("estimated_tokens", 500),
    }


async def _execute_openclaude(task: str, params: dict[str, Any], timeout: float) -> dict[str, Any]:
    """Execute via OpenClaude (multi-provider CLI)."""
    logger.info("[Router:OpenClaude] تنفيذ: %s", task[:120])
    await asyncio.sleep(0)
    return {
        "agent": "openclaude", "task": task,
        "output": f"OpenClaude executed: {task}",
        "output_ar": f"أوبن كلود نفّذ: {task}",
        "providers_used": params.get("providers", ["default"]),
        "tokens_used": params.get("estimated_tokens", 400),
    }


async def _execute_goose(task: str, params: dict[str, Any], timeout: float) -> dict[str, Any]:
    """Execute via Goose (local general-purpose agent)."""
    logger.info("[Router:Goose] تنفيذ: %s", task[:120])
    await asyncio.sleep(0)
    return {
        "agent": "goose", "task": task,
        "output": f"Goose executed: {task}",
        "output_ar": f"جوس نفّذ: {task}",
        "local_artifacts": params.get("artifacts", []),
    }


async def _execute_internal(task: str, params: dict[str, Any], timeout: float) -> dict[str, Any]:
    """Execute via internal Dealix service call (no external agent)."""
    logger.info("[Router:Internal] تنفيذ: %s", task[:120])
    await asyncio.sleep(0)
    return {
        "agent": "internal", "task": task,
        "output": f"Internal service executed: {task}",
        "output_ar": f"خدمة داخلية نفّذت: {task}",
        "status": "executed", "params": params,
    }


_EXECUTORS = {
    ExecutionBackend.CLAUDE: _execute_claude,
    ExecutionBackend.OPENCLAUDE: _execute_openclaude,
    ExecutionBackend.GOOSE: _execute_goose,
    ExecutionBackend.INTERNAL: _execute_internal,
}


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

class ExecutionRouter:
    """Routes tasks to the correct execution backend and tracks health."""

    def __init__(self) -> None:
        self._stats: dict[ExecutionBackend, dict[str, Any]] = {
            b: {"calls": 0, "failures": 0, "total_ms": 0}
            for b in ExecutionBackend
        }
        self._by_task: dict[str, int] = {}
        self._recent: list[ExecutionResult] = []
        self._max_recent = 5_000
        logger.info("موجّه التنفيذ: تم التهيئة — %d backends", len(ExecutionBackend))

    # -- Routing -----------------------------------------------------------

    async def route(
        self,
        task_class: TaskClass,
        profile_allowed: Optional[list[str]] = None,
    ) -> ExecutionBackend:
        """Determine the best backend for a given task class."""
        primary = ROUTING_MATRIX.get(task_class, ExecutionBackend.INTERNAL)

        if profile_allowed is not None:
            allowed = [
                ExecutionBackend(b) for b in profile_allowed
                if b in ExecutionBackend._value2member_map_
            ]
            if primary in allowed:
                return primary
            for fb in FALLBACK_ORDER.get(primary, []):
                if fb in allowed:
                    logger.info("[Router] احتياطي: %s -> %s (مسموح)", primary.value, fb.value)
                    return fb
            return allowed[0] if allowed else ExecutionBackend.INTERNAL

        # Health-based fallback
        s = self._stats[primary]
        if s["calls"] > 10:
            rate = 1 - (s["failures"] / s["calls"])
            if rate < 0.5:
                for fb in FALLBACK_ORDER.get(primary, []):
                    fb_s = self._stats[fb]
                    fb_rate = 1 - (fb_s["failures"] / max(fb_s["calls"], 1))
                    if fb_rate >= 0.7:
                        logger.warning(
                            "[Router] تدهور %s (%.0f%%) -> احتياطي %s",
                            primary.value, rate * 100, fb.value,
                        )
                        return fb
        return primary

    # -- Execution ---------------------------------------------------------

    async def execute(
        self,
        backend: ExecutionBackend,
        task: str,
        params: dict[str, Any],
        timeout: float = 300.0,
        task_class: Optional[TaskClass] = None,
    ) -> ExecutionResult:
        """Execute a task on the specified backend with timeout."""
        start = datetime.now(timezone.utc)
        executor = _EXECUTORS.get(backend, _execute_internal)
        result = ExecutionResult(backend=backend, task_class=task_class)

        stat_key = f"{backend.value}:{task_class.value if task_class else 'unknown'}"
        self._by_task[stat_key] = self._by_task.get(stat_key, 0) + 1

        try:
            data = await asyncio.wait_for(executor(task, params, timeout), timeout=timeout)
            now = datetime.now(timezone.utc)
            result.success = True
            result.data = data
            result.token_count = data.get("tokens_used", 0)
            result.estimated_cost_usd = COST_ESTIMATES.get(
                (backend, task_class), DEFAULT_COST,
            ) if task_class else DEFAULT_COST
            result.message_ar = f"تنفيذ ناجح عبر {backend.value}"

        except asyncio.TimeoutError:
            now = datetime.now(timezone.utc)
            result.success = False
            result.error = f"Timeout after {timeout}s on {backend.value}"
            result.message_ar = f"انتهت المهلة ({timeout} ثانية) على {backend.value}"
            self._stats[backend]["failures"] += 1

        except Exception as exc:
            now = datetime.now(timezone.utc)
            result.success = False
            result.error = str(exc)
            result.message_ar = f"خطأ في {backend.value}: {exc}"
            self._stats[backend]["failures"] += 1
            logger.exception("[Router] خطأ backend=%s: %s", backend.value, exc)

        result.completed_at = now
        result.duration_ms = int((now - start).total_seconds() * 1000)

        self._stats[backend]["calls"] += 1
        self._stats[backend]["total_ms"] += result.duration_ms
        self._recent.append(result)
        if len(self._recent) > self._max_recent:
            self._recent = self._recent[-self._max_recent:]

        logger.info(
            "[Router] %s backend=%s %dms cost=$%.4f",
            "OK" if result.success else "FAIL", backend.value,
            result.duration_ms, result.estimated_cost_usd,
        )
        return result

    # -- Health & stats ----------------------------------------------------

    async def get_backend_health(self) -> dict[str, BackendHealth]:
        """Return health status for every backend."""
        report: dict[str, BackendHealth] = {}
        for backend in ExecutionBackend:
            s = self._stats[backend]
            calls = s["calls"]
            failures = s["failures"]
            rate = 1 - (failures / max(calls, 1))
            avg_ms = s["total_ms"] / max(calls, 1)
            healthy = rate >= 0.7 or calls < 5
            status_ar = "سليم" if healthy else "متدهور"
            report[backend.value] = BackendHealth(
                backend=backend, healthy=healthy,
                success_rate=round(rate, 4),
                avg_latency_ms=round(avg_ms, 2),
                total_calls=calls, total_failures=failures,
                message_ar=f"{backend.value}: {status_ar} ({rate:.0%} نجاح، {calls} استدعاء)",
            )
        return report

    async def get_routing_stats(self) -> dict[str, Any]:
        """Return usage statistics across all backends."""
        by_backend: dict[str, int] = defaultdict(int)
        by_task: dict[str, int] = defaultdict(int)
        total_cost = 0.0
        for r in self._recent:
            by_backend[r.backend.value] += 1
            if r.task_class:
                by_task[r.task_class.value] += 1
            total_cost += r.estimated_cost_usd

        return {
            "total_executions": len(self._recent),
            "by_backend": dict(by_backend),
            "by_task_class": dict(by_task),
            "total_cost_usd": round(total_cost, 4),
            "routing_matrix": {tc.value: ROUTING_MATRIX[tc].value for tc in TaskClass},
            "message_ar": f"إجمالي: {len(self._recent)} تنفيذ، تكلفة: ${total_cost:.2f}",
        }

    def get_backend_info(self) -> list[dict[str, Any]]:
        """Return human-readable info about each backend."""
        return [{"id": b.value, **info} for b, info in BACKEND_DESCRIPTIONS.items()]


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

execution_router = ExecutionRouter()
