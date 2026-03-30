"""Simple token-bucket rate limiter with per-API defaults."""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from threading import Lock

# Default daily limits per API.
DEFAULT_LIMITS: dict[str, int] = {
    "linkedin": 50,   # 50 actions per day
    "twitter": 100,   # 100 actions per day
    "email": 50,      # 50 sends per day
}

# Number of seconds in a day -- used for refill rate calculation.
_SECONDS_PER_DAY: float = 86_400.0


@dataclass
class _Bucket:
    """Internal token-bucket state for a single API."""

    capacity: int
    tokens: float = field(init=False)
    refill_rate: float = field(init=False)  # tokens per second
    last_refill: float = field(init=False)
    lock: Lock = field(default_factory=Lock, repr=False)

    def __post_init__(self) -> None:
        self.tokens = float(self.capacity)
        self.refill_rate = self.capacity / _SECONDS_PER_DAY
        self.last_refill = time.monotonic()


class RateLimiter:
    """Per-API token-bucket rate limiter.

    Usage::

        limiter = RateLimiter()
        if limiter.allow("linkedin"):
            do_linkedin_action()
        else:
            wait_or_skip()

    Custom limits can be supplied at construction time::

        limiter = RateLimiter(limits={"linkedin": 30, "twitter": 200})
    """

    def __init__(self, limits: dict[str, int] | None = None) -> None:
        merged = {**DEFAULT_LIMITS, **(limits or {})}
        self._buckets: dict[str, _Bucket] = {
            api: _Bucket(capacity=cap) for api, cap in merged.items()
        }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def allow(self, api: str, tokens: int = 1) -> bool:
        """Consume *tokens* from the bucket for *api*.

        Returns ``True`` if the action is allowed, ``False`` if the rate
        limit has been exhausted.  If *api* has no configured limit the
        call is always allowed.
        """
        bucket = self._buckets.get(api)
        if bucket is None:
            return True

        with bucket.lock:
            self._refill(bucket)
            if bucket.tokens >= tokens:
                bucket.tokens -= tokens
                return True
            return False

    def remaining(self, api: str) -> float:
        """Return the approximate number of tokens remaining for *api*."""
        bucket = self._buckets.get(api)
        if bucket is None:
            return float("inf")
        with bucket.lock:
            self._refill(bucket)
            return bucket.tokens

    def wait_time(self, api: str, tokens: int = 1) -> float:
        """Return seconds to wait before *tokens* become available.

        Returns ``0.0`` if the action can proceed immediately.
        """
        bucket = self._buckets.get(api)
        if bucket is None:
            return 0.0
        with bucket.lock:
            self._refill(bucket)
            if bucket.tokens >= tokens:
                return 0.0
            deficit = tokens - bucket.tokens
            return deficit / bucket.refill_rate

    def reset(self, api: str | None = None) -> None:
        """Reset one or all buckets to full capacity."""
        targets = [api] if api else list(self._buckets)
        for name in targets:
            bucket = self._buckets.get(name)
            if bucket is not None:
                with bucket.lock:
                    bucket.tokens = float(bucket.capacity)
                    bucket.last_refill = time.monotonic()

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    @staticmethod
    def _refill(bucket: _Bucket) -> None:
        """Add tokens based on elapsed time since last refill."""
        now = time.monotonic()
        elapsed = now - bucket.last_refill
        if elapsed > 0:
            bucket.tokens = min(
                bucket.capacity,
                bucket.tokens + elapsed * bucket.refill_rate,
            )
            bucket.last_refill = now
