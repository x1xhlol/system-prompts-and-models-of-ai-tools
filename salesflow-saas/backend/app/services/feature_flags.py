"""
Feature Flags — Dealix AI Revenue OS
Simple Redis-backed feature flag system with per-tenant control.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Default flags and their initial state
DEFAULT_FLAGS = {
    "ai_sales_agent": False,       # Autonomous WhatsApp sales agent
    "sequences": True,             # Multi-channel sequences
    "cpq": True,                   # Configure, Price, Quote
    "signal_intelligence": False,  # Real-time signal engine
    "autopilot": False,            # Autopilot automation
    "behavior_intelligence": False,# Pattern detection
    "arabic_nlp": True,            # Arabic NLP processing
    "lead_scoring_ai": True,       # AI-powered lead scoring
    "conversation_intel": False,   # Conversation analysis
    "territory_management": True,  # Saudi territory routing
    "whatsapp_chatbot": False,     # Auto-reply chatbot
    "pdpl_strict_mode": True,      # Strict PDPL enforcement
    "forecasting": False,          # Sales forecasting
    "alert_delivery": True,        # Multi-channel alerts
    "skill_registry": False,       # Domain skill system
}


class FeatureFlagService:
    """
    Feature flag service using Redis for fast lookups.
    Supports global flags and per-tenant overrides.
    """

    def __init__(self, redis_client=None):
        self._redis = redis_client
        self._local_cache: dict[str, bool] = dict(DEFAULT_FLAGS)
        self._tenant_cache: dict[str, dict[str, bool]] = {}

    def _global_key(self, flag: str) -> str:
        return f"ff:global:{flag}"

    def _tenant_key(self, flag: str, tenant_id: str) -> str:
        return f"ff:tenant:{tenant_id}:{flag}"

    async def is_enabled(
        self, flag: str, tenant_id: Optional[str] = None
    ) -> bool:
        """Check if a feature flag is enabled."""
        # Check tenant-specific override first
        if tenant_id and self._redis:
            try:
                val = await self._redis.get(self._tenant_key(flag, tenant_id))
                if val is not None:
                    return val == "1"
            except Exception as e:
                logger.warning(f"Redis error checking flag {flag}: {e}")

        # Check global flag in Redis
        if self._redis:
            try:
                val = await self._redis.get(self._global_key(flag))
                if val is not None:
                    return val == "1"
            except Exception as e:
                logger.warning(f"Redis error checking flag {flag}: {e}")

        # Fallback to local cache / defaults
        return self._local_cache.get(flag, False)

    async def enable(
        self, flag: str, tenant_id: Optional[str] = None
    ) -> bool:
        """Enable a feature flag globally or for a specific tenant."""
        key = (
            self._tenant_key(flag, tenant_id)
            if tenant_id
            else self._global_key(flag)
        )
        if self._redis:
            try:
                await self._redis.set(key, "1")
            except Exception as e:
                logger.error(f"Redis error enabling flag {flag}: {e}")
                return False

        if not tenant_id:
            self._local_cache[flag] = True
        logger.info(
            f"Feature flag '{flag}' enabled"
            + (f" for tenant {tenant_id}" if tenant_id else " globally")
        )
        return True

    async def disable(
        self, flag: str, tenant_id: Optional[str] = None
    ) -> bool:
        """Disable a feature flag globally or for a specific tenant."""
        key = (
            self._tenant_key(flag, tenant_id)
            if tenant_id
            else self._global_key(flag)
        )
        if self._redis:
            try:
                await self._redis.set(key, "0")
            except Exception as e:
                logger.error(f"Redis error disabling flag {flag}: {e}")
                return False

        if not tenant_id:
            self._local_cache[flag] = False
        logger.info(
            f"Feature flag '{flag}' disabled"
            + (f" for tenant {tenant_id}" if tenant_id else " globally")
        )
        return True

    async def list_flags(
        self, tenant_id: Optional[str] = None
    ) -> dict[str, bool]:
        """List all flags with their current state."""
        result = {}
        for flag in DEFAULT_FLAGS:
            result[flag] = await self.is_enabled(flag, tenant_id)
        return result

    async def enable_beta(self, tenant_id: str) -> dict[str, bool]:
        """Enable all beta features for a tenant (beta tester program)."""
        beta_flags = [
            "ai_sales_agent", "signal_intelligence", "autopilot",
            "behavior_intelligence", "conversation_intel",
            "forecasting", "skill_registry", "whatsapp_chatbot",
        ]
        enabled = {}
        for flag in beta_flags:
            await self.enable(flag, tenant_id)
            enabled[flag] = True
        logger.info(f"Beta features enabled for tenant {tenant_id}")
        return enabled

    async def init_defaults(self) -> None:
        """Initialize default flag values in Redis."""
        if not self._redis:
            return
        for flag, default_val in DEFAULT_FLAGS.items():
            key = self._global_key(flag)
            try:
                exists = await self._redis.exists(key)
                if not exists:
                    await self._redis.set(key, "1" if default_val else "0")
            except Exception as e:
                logger.warning(f"Could not init flag {flag}: {e}")
        logger.info(f"Initialized {len(DEFAULT_FLAGS)} feature flags")


# Global singleton (initialize with Redis client at app startup)
feature_flags = FeatureFlagService()
