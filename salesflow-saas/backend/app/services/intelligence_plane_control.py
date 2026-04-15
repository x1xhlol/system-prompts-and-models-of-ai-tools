"""Lightweight cache, rate limits, and audit hooks for intelligence endpoints (no Celery required for MVP)."""

from __future__ import annotations

import json
import logging
import os
import threading
import time
from collections import defaultdict
from typing import Any

logger = logging.getLogger("dealix.intelligence_plane")

_LOCK = threading.Lock()
# client_key -> list of unix timestamps (sliding window)
_RATE_BUCKETS: dict[str, list[float]] = defaultdict(list)
# cache key -> (expires_at, payload)
_CACHE: dict[str, tuple[float, Any]] = {}

DEFAULT_WINDOW_SEC = 3600
DEFAULT_MAX_PER_WINDOW = 60
CACHE_TTL_SEC = 120


def _now() -> float:
    return time.time()


def _client_key(forwarded: str | None, fallback: str) -> str:
    if forwarded:
        return forwarded.split(",")[0].strip() or fallback
    return fallback


def check_rate_limit(
    *,
    client_ip: str,
    x_forwarded_for: str | None,
    tenant_id: str | None = None,
    max_per_window: int | None = None,
    window_sec: int | None = None,
) -> tuple[bool, str]:
    """
    Returns (allowed, reason). Uses tenant_id when provided, else client IP.
    """
    max_n = max_per_window or int(os.getenv("DEALIX_INTEL_RATE_LIMIT", str(DEFAULT_MAX_PER_WINDOW)))
    win = float(window_sec or os.getenv("DEALIX_INTEL_RATE_WINDOW_SEC", str(DEFAULT_WINDOW_SEC)))

    key = f"t:{tenant_id}" if tenant_id else f"ip:{_client_key(x_forwarded_for, client_ip)}"
    t = _now()
    with _LOCK:
        bucket = _RATE_BUCKETS[key]
        bucket[:] = [x for x in bucket if t - x < win]
        if len(bucket) >= max_n:
            return False, f"rate_limited:{key}"
        bucket.append(t)
    return True, "ok"


def cache_get(key: str) -> Any | None:
    with _LOCK:
        row = _CACHE.get(key)
        if not row:
            return None
        exp, payload = row
        if exp < _now():
            del _CACHE[key]
            return None
        return payload


def cache_set(key: str, payload: Any, ttl_sec: int | None = None) -> None:
    ttl = float(ttl_sec or os.getenv("DEALIX_INTEL_CACHE_TTL_SEC", str(CACHE_TTL_SEC)))
    with _LOCK:
        _CACHE[key] = (_now() + ttl, payload)


def audit_ai_decision(
    *,
    operation: str,
    tenant_id: str | None,
    model_id: str | None,
    user_id: str | None = None,
    extra: dict[str, Any] | None = None,
) -> None:
    """Structured log line for later SIEM / golden-set review (no PII in values)."""
    payload = {
        "op": operation,
        "tenant_id": str(tenant_id) if tenant_id else None,
        "user_id": str(user_id) if user_id else None,
        "model_id": model_id,
        **(extra or {}),
    }
    logger.info("ai_audit %s", json.dumps(payload, ensure_ascii=False))


def deep_enrich_enabled_for_tenant(tenant_id: str | None) -> bool:
    """Optional heavy enrichment; default off unless DEALIX_DEEP_ENRICH_DEFAULT or allow-list."""
    if os.getenv("DEALIX_DEEP_ENRICH_DEFAULT", "").lower() in ("1", "true", "yes"):
        return True
    raw = os.getenv("DEALIX_DEEP_ENRICH_TENANTS", "")
    if not tenant_id or not raw.strip():
        return False
    allow = {x.strip() for x in raw.split(",") if x.strip()}
    return str(tenant_id) in allow


def intelligence_feature_snapshot(*, tenant_id: str | None) -> dict[str, Any]:
    """Effective flags for workspace / ops (no secrets). Prefer JWT tenant over spoofed headers."""
    tavily = bool((os.getenv("TAVILY_API_KEY") or "").strip())
    allow_search_env = os.getenv("DEALIX_ALLOW_LICENSED_SEARCH", "true").lower() not in ("0", "false", "no")
    deep_default = os.getenv("DEALIX_DEEP_ENRICH_DEFAULT", "").lower() in ("1", "true", "yes")
    deep_tenants = os.getenv("DEALIX_DEEP_ENRICH_TENANTS", "").strip()
    deep_list = {x.strip() for x in deep_tenants.split(",") if x.strip()}
    deep_for_tenant = deep_default or (bool(tenant_id) and str(tenant_id) in deep_list)
    tavily_allow = tenant_may_use_licensed_search(tenant_id)
    return {
        "licensed_web_search_configured": tavily,
        "licensed_web_search_allowed": tavily and allow_search_env and tavily_allow,
        "deep_enrichment_enabled": deep_for_tenant,
        "intel_rate_limit_per_window": int(os.getenv("DEALIX_INTEL_RATE_LIMIT", str(DEFAULT_MAX_PER_WINDOW))),
        "intel_cache_ttl_sec": int(float(os.getenv("DEALIX_INTEL_CACHE_TTL_SEC", str(CACHE_TTL_SEC)))),
        "enrich_idempotent_daily": os.getenv("DEALIX_ENRICH_IDEMPOTENT_DAILY", "true").lower()
        not in ("0", "false", "no"),
        "async_enrich_jobs_enabled": os.getenv("DEALIX_ASYNC_ENRICH_JOBS", "true").lower()
        not in ("0", "false", "no"),
    }


def tenant_may_use_licensed_search(tenant_id: str | None) -> bool:
    """
    Optional allow-list for Tavily-class search. Empty env → any tenant (or anonymous) may use search if keys exist.
    """
    raw = os.getenv("DEALIX_TAVILY_TENANT_ALLOWLIST", "").strip()
    if not raw:
        return True
    if not tenant_id:
        return True
    allow = {x.strip() for x in raw.split(",") if x.strip()}
    return str(tenant_id) in allow
