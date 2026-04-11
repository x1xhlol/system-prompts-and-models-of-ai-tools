"""
Feature Flags — Dealix AI Revenue OS

Redis-backed feature flag system with PostgreSQL persistence.

Architecture:
- Redis: primary store for fast reads (~0.1ms per lookup)
- PostgreSQL: durable backup, survives Redis restarts
- Local cache: fallback when both Redis and PG are unavailable

Usage:
    from app.services.feature_flags import feature_flags

    # Check a flag
    if await feature_flags.is_enabled("ai_sales_agent", tenant_id=str(tenant.id)):
        ...

    # Enable for a specific tenant (beta testing)
    await feature_flags.enable("autopilot", tenant_id=str(tenant.id))

    # Enable globally
    await feature_flags.enable("sequences")

    # List all flags for a tenant (merges global + tenant overrides)
    flags = await feature_flags.list_flags(tenant_id=str(tenant.id))
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import Column, DateTime, String, Boolean, Text, select, delete
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# ── Default Flags ───────────────────────────────────────────────
# All flags default to False for new tenants.
# Flags marked True are generally available to everyone.

DEFAULT_FLAGS: Dict[str, bool] = {
    "ai_sales_agent": False,        # Autonomous WhatsApp sales agent
    "sequences": False,             # Multi-channel outbound sequences
    "cpq": False,                   # Configure, Price, Quote engine
    "signal_intelligence": False,   # Real-time buying signal detection
    "autopilot": False,             # Full autopilot deal automation
    "behavior_intelligence": False, # Customer behavior pattern detection
    "arabic_nlp": True,             # Arabic NLP processing (core feature)
    "lead_scoring_ai": True,        # AI-powered lead scoring (core feature)
    "conversation_intel": False,    # Conversation analysis and coaching
    "territory_management": True,   # Saudi territory routing (core feature)
    "whatsapp_chatbot": False,      # Auto-reply WhatsApp chatbot
    "pdpl_strict_mode": True,       # Strict PDPL enforcement (always on)
    "forecasting": False,           # Sales revenue forecasting
    "alert_delivery": True,         # Multi-channel alert notifications
    "skill_registry": False,        # Domain skill system
}

# Flags enabled by default for beta testers
BETA_FLAGS: List[str] = [
    "ai_sales_agent",
    "sequences",
    "cpq",
    "signal_intelligence",
    "autopilot",
    "behavior_intelligence",
    "conversation_intel",
    "forecasting",
    "skill_registry",
    "whatsapp_chatbot",
]


class FeatureFlagService:
    """
    Feature flag service with Redis (fast) and PostgreSQL (durable) backends.

    Read path:  Redis -> PostgreSQL -> local defaults
    Write path: Redis + PostgreSQL (dual write)

    Supports:
    - Global flags: apply to all tenants
    - Per-tenant flags: override global for a specific tenant
    - Beta program: enable all advanced flags for a tenant
    """

    def __init__(
        self,
        redis_client: Any = None,
        db_session_factory: Any = None,
    ):
        self._redis = redis_client
        self._db_session_factory = db_session_factory
        self._local_cache: Dict[str, bool] = dict(DEFAULT_FLAGS)
        self._tenant_cache: Dict[str, Dict[str, bool]] = {}

    # ── Redis Key Schema ────────────────────────────────────────

    def _global_key(self, flag: str) -> str:
        """Redis key for a global flag."""
        return f"ff:global:{flag}"

    def _tenant_key(self, flag: str, tenant_id: str) -> str:
        """Redis key for a tenant-specific flag override."""
        return f"ff:tenant:{tenant_id}:{flag}"

    # ── Core Operations ─────────────────────────────────────────

    async def is_enabled(
        self, flag: str, tenant_id: Optional[str] = None
    ) -> bool:
        """
        Check if a feature flag is enabled.

        Resolution order:
        1. Tenant-specific override in Redis (if tenant_id provided)
        2. Global flag in Redis
        3. Tenant-specific override in PostgreSQL (if tenant_id provided)
        4. Global flag in PostgreSQL
        5. Local default from DEFAULT_FLAGS
        6. False (unknown flags are disabled)
        """
        # 1. Tenant override in Redis
        if tenant_id and self._redis:
            try:
                val = await self._redis.get(self._tenant_key(flag, tenant_id))
                if val is not None:
                    return val == "1"
            except Exception as e:
                logger.warning(f"Redis error checking tenant flag {flag}: {e}")

        # 2. Global flag in Redis
        if self._redis:
            try:
                val = await self._redis.get(self._global_key(flag))
                if val is not None:
                    return val == "1"
            except Exception as e:
                logger.warning(f"Redis error checking global flag {flag}: {e}")

        # 3 & 4. PostgreSQL fallback
        if self._db_session_factory:
            try:
                pg_val = await self._read_from_pg(flag, tenant_id)
                if pg_val is not None:
                    # Warm the Redis cache for next lookup
                    await self._warm_redis(flag, tenant_id, pg_val)
                    return pg_val
            except Exception as e:
                logger.warning(f"PostgreSQL error checking flag {flag}: {e}")

        # 5. Local default
        return self._local_cache.get(flag, False)

    async def enable(
        self, flag: str, tenant_id: Optional[str] = None
    ) -> bool:
        """Enable a feature flag globally or for a specific tenant."""
        return await self._set_flag(flag, True, tenant_id)

    async def disable(
        self, flag: str, tenant_id: Optional[str] = None
    ) -> bool:
        """Disable a feature flag globally or for a specific tenant."""
        return await self._set_flag(flag, False, tenant_id)

    async def _set_flag(
        self, flag: str, enabled: bool, tenant_id: Optional[str] = None
    ) -> bool:
        """Write a flag value to both Redis and PostgreSQL."""
        redis_key = (
            self._tenant_key(flag, tenant_id)
            if tenant_id
            else self._global_key(flag)
        )
        redis_val = "1" if enabled else "0"

        # Write to Redis
        if self._redis:
            try:
                await self._redis.set(redis_key, redis_val)
            except Exception as e:
                logger.error(f"Redis error setting flag {flag}: {e}")

        # Write to PostgreSQL for durability
        if self._db_session_factory:
            try:
                await self._write_to_pg(flag, enabled, tenant_id)
            except Exception as e:
                logger.error(f"PostgreSQL error setting flag {flag}: {e}")

        # Update local cache for global flags
        if not tenant_id:
            self._local_cache[flag] = enabled
        else:
            # Update tenant cache
            if tenant_id not in self._tenant_cache:
                self._tenant_cache[tenant_id] = {}
            self._tenant_cache[tenant_id][flag] = enabled

        action = "enabled" if enabled else "disabled"
        scope = f"for tenant {tenant_id}" if tenant_id else "globally"
        logger.info(f"Feature flag '{flag}' {action} {scope}")
        return True

    async def list_flags(
        self, tenant_id: Optional[str] = None
    ) -> Dict[str, bool]:
        """
        List all flags with their current state.

        For a tenant, returns the merged view (global + tenant overrides).
        """
        result = {}
        for flag in DEFAULT_FLAGS:
            result[flag] = await self.is_enabled(flag, tenant_id)
        return result

    async def enable_beta(self, tenant_id: str) -> Dict[str, bool]:
        """
        Enable all beta features for a tenant.

        Used for the beta tester program — gives the tenant access
        to all advanced features while they remain disabled globally.
        """
        enabled = {}
        for flag in BETA_FLAGS:
            await self.enable(flag, tenant_id)
            enabled[flag] = True
        logger.info(
            f"Beta features enabled for tenant {tenant_id}: "
            f"{len(BETA_FLAGS)} flags activated"
        )
        return enabled

    async def disable_beta(self, tenant_id: str) -> Dict[str, bool]:
        """
        Remove all beta feature overrides for a tenant.

        The tenant will fall back to global flag states.
        """
        disabled = {}
        for flag in BETA_FLAGS:
            await self._remove_tenant_override(flag, tenant_id)
            disabled[flag] = False
        logger.info(f"Beta features removed for tenant {tenant_id}")
        return disabled

    async def _remove_tenant_override(
        self, flag: str, tenant_id: str
    ) -> None:
        """Remove a tenant-specific override, falling back to global."""
        # Remove from Redis
        if self._redis:
            try:
                await self._redis.delete(self._tenant_key(flag, tenant_id))
            except Exception as e:
                logger.warning(f"Redis error removing override {flag}: {e}")

        # Remove from PostgreSQL
        if self._db_session_factory:
            try:
                await self._delete_from_pg(flag, tenant_id)
            except Exception as e:
                logger.warning(f"PG error removing override {flag}: {e}")

        # Remove from local tenant cache
        if tenant_id in self._tenant_cache:
            self._tenant_cache[tenant_id].pop(flag, None)

    # ── PostgreSQL Persistence ──────────────────────────────────

    async def _read_from_pg(
        self, flag: str, tenant_id: Optional[str] = None
    ) -> Optional[bool]:
        """Read a flag value from PostgreSQL."""
        if not self._db_session_factory:
            return None

        async with self._db_session_factory() as db:
            # Check tenant override first
            if tenant_id:
                stmt = select(FeatureFlagRow).where(
                    FeatureFlagRow.flag_name == flag,
                    FeatureFlagRow.tenant_id == tenant_id,
                )
                result = await db.execute(stmt)
                row = result.scalar_one_or_none()
                if row is not None:
                    return row.is_enabled

            # Check global
            stmt = select(FeatureFlagRow).where(
                FeatureFlagRow.flag_name == flag,
                FeatureFlagRow.tenant_id.is_(None),
            )
            result = await db.execute(stmt)
            row = result.scalar_one_or_none()
            if row is not None:
                return row.is_enabled

        return None

    async def _write_to_pg(
        self, flag: str, enabled: bool, tenant_id: Optional[str] = None
    ) -> None:
        """Write a flag value to PostgreSQL (upsert)."""
        if not self._db_session_factory:
            return

        async with self._db_session_factory() as db:
            # Check if row exists
            stmt = select(FeatureFlagRow).where(
                FeatureFlagRow.flag_name == flag,
                FeatureFlagRow.tenant_id == tenant_id
                if tenant_id
                else FeatureFlagRow.tenant_id.is_(None),
            )
            result = await db.execute(stmt)
            row = result.scalar_one_or_none()

            if row:
                row.is_enabled = enabled
                row.updated_at = datetime.now(timezone.utc)
            else:
                row = FeatureFlagRow(
                    flag_name=flag,
                    tenant_id=tenant_id,
                    is_enabled=enabled,
                    description=f"Feature flag: {flag}",
                )
                db.add(row)

            await db.commit()

    async def _delete_from_pg(
        self, flag: str, tenant_id: str
    ) -> None:
        """Delete a tenant-specific override from PostgreSQL."""
        if not self._db_session_factory:
            return

        async with self._db_session_factory() as db:
            stmt = delete(FeatureFlagRow).where(
                FeatureFlagRow.flag_name == flag,
                FeatureFlagRow.tenant_id == tenant_id,
            )
            await db.execute(stmt)
            await db.commit()

    async def _warm_redis(
        self, flag: str, tenant_id: Optional[str], value: bool
    ) -> None:
        """Populate Redis from a PostgreSQL read (cache warming)."""
        if not self._redis:
            return
        key = (
            self._tenant_key(flag, tenant_id)
            if tenant_id
            else self._global_key(flag)
        )
        try:
            # Set with 1-hour TTL so stale values eventually expire
            await self._redis.set(key, "1" if value else "0", ex=3600)
        except Exception:
            pass  # Non-critical, will read from PG again next time

    # ── Initialization ──────────────────────────────────────────

    async def init_defaults(self) -> None:
        """
        Initialize default flag values in Redis and PostgreSQL.

        Only sets values for flags that don't already exist —
        existing flag states are never overwritten.
        """
        initialized = 0

        for flag, default_val in DEFAULT_FLAGS.items():
            # Redis
            if self._redis:
                key = self._global_key(flag)
                try:
                    exists = await self._redis.exists(key)
                    if not exists:
                        await self._redis.set(
                            key, "1" if default_val else "0"
                        )
                        initialized += 1
                except Exception as e:
                    logger.warning(f"Could not init Redis flag {flag}: {e}")

            # PostgreSQL
            if self._db_session_factory:
                try:
                    pg_val = await self._read_from_pg(flag)
                    if pg_val is None:
                        await self._write_to_pg(flag, default_val)
                except Exception as e:
                    logger.warning(f"Could not init PG flag {flag}: {e}")

        logger.info(
            f"Feature flags initialized: {len(DEFAULT_FLAGS)} total, "
            f"{initialized} newly set in Redis"
        )

    async def sync_redis_from_pg(self) -> int:
        """
        Rebuild Redis flag cache from PostgreSQL.

        Use after Redis restart or cache flush to restore state.
        Returns the number of flags synced.
        """
        if not self._redis or not self._db_session_factory:
            logger.warning("Cannot sync: Redis or PG not configured")
            return 0

        synced = 0
        async with self._db_session_factory() as db:
            stmt = select(FeatureFlagRow)
            result = await db.execute(stmt)
            rows = result.scalars().all()

            for row in rows:
                key = (
                    self._tenant_key(row.flag_name, row.tenant_id)
                    if row.tenant_id
                    else self._global_key(row.flag_name)
                )
                try:
                    await self._redis.set(
                        key, "1" if row.is_enabled else "0"
                    )
                    synced += 1
                except Exception as e:
                    logger.warning(
                        f"Failed to sync flag {row.flag_name}: {e}"
                    )

        logger.info(f"Synced {synced} feature flags from PostgreSQL to Redis")
        return synced


# ── SQLAlchemy Model ────────────────────────────────────────────
# Lightweight model for PostgreSQL persistence.
# Add to alembic migration when deploying feature flags.

try:
    from app.models.base import Base
except ImportError:
    # Fallback for when Base isn't available (testing, standalone use)
    from sqlalchemy.orm import DeclarativeBase

    class Base(DeclarativeBase):
        pass


class FeatureFlagRow(Base):
    """PostgreSQL table for durable feature flag storage."""

    __tablename__ = "feature_flags"

    flag_name = Column(String(100), primary_key=True, index=True)
    tenant_id = Column(
        String(36),
        primary_key=True,
        default="__global__",
        doc="Tenant UUID or '__global__' for global flags",
    )
    is_enabled = Column(Boolean, nullable=False, default=False)
    description = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        scope = self.tenant_id if self.tenant_id != "__global__" else "global"
        state = "ON" if self.is_enabled else "OFF"
        return f"<FeatureFlag {self.flag_name} [{scope}] {state}>"


# ── Global Singleton ────────────────────────────────────────────
# Initialize with Redis client and DB session factory at app startup:
#
#   from app.services.feature_flags import feature_flags
#   feature_flags._redis = redis_client
#   feature_flags._db_session_factory = async_session_maker
#   await feature_flags.init_defaults()

feature_flags = FeatureFlagService()
