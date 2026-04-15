"""In-process async enrichment jobs (HTTP poll). Optional path before full Celery."""

from __future__ import annotations

import logging
import threading
import time
import uuid
from typing import Any

_LOCK = threading.Lock()
_JOBS: dict[str, dict[str, Any]] = {}
_TTL_SEC = 3600

logger = logging.getLogger("dealix.intel_jobs")


def _prune() -> None:
    t = time.time()
    dead = [k for k, v in _JOBS.items() if t - v.get("created_at", t) > _TTL_SEC]
    for k in dead:
        del _JOBS[k]


def create_job() -> str:
    job_id = uuid.uuid4().hex
    with _LOCK:
        _prune()
        _JOBS[job_id] = {
            "status": "pending",
            "created_at": time.time(),
            "result": None,
            "error": None,
        }
    return job_id


def mark_running(job_id: str) -> None:
    with _LOCK:
        if job_id in _JOBS:
            _JOBS[job_id]["status"] = "running"


def mark_done(job_id: str, result: dict[str, Any]) -> None:
    with _LOCK:
        if job_id in _JOBS:
            _JOBS[job_id].update(status="done", result=result, error=None)


def mark_error(job_id: str, message: str) -> None:
    with _LOCK:
        if job_id in _JOBS:
            _JOBS[job_id].update(status="error", error=message, result=None)


def get_job(job_id: str) -> dict[str, Any] | None:
    with _LOCK:
        _prune()
        row = _JOBS.get(job_id)
        return dict(row) if row else None
