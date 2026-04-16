"""Model Routing Dashboard — metrics and health for LLM providers."""

from __future__ import annotations

from typing import Any, Dict, List


# Provider registry matching model_router.py configuration
PROVIDERS = {
    "groq": {"name": "Groq", "model": "llama-3.3-70b-versatile", "tier": "core"},
    "openai": {"name": "OpenAI", "model": "gpt-4o", "tier": "strong"},
    "claude": {"name": "Claude Opus", "model": "claude-opus-4-6", "tier": "strong"},
    "gemini": {"name": "Gemini", "model": "gemini-2.0-flash", "tier": "pilot"},
    "deepseek": {"name": "DeepSeek", "model": "deepseek-coder", "tier": "pilot"},
}


class ModelRoutingDashboard:
    """Provides model routing metrics, health status, and cost attribution."""

    def get_provider_health(self) -> List[Dict[str, Any]]:
        return [
            {
                "provider": key,
                "name": info["name"],
                "model": info["model"],
                "tier": info["tier"],
                "status": "available",
            }
            for key, info in PROVIDERS.items()
        ]

    def get_routing_stats(self, tenant_id: str) -> Dict[str, Any]:
        return {
            "tenant_id": tenant_id,
            "primary_provider": "groq",
            "fallback_provider": "openai",
            "providers": self.get_provider_health(),
            "routing_policy": {
                "fast_classification": "groq",
                "sales_copy": "claude",
                "research": "gemini",
                "coding": "deepseek",
                "default": "groq",
            },
        }

    def get_cost_summary(self, tenant_id: str) -> Dict[str, Any]:
        return {
            "tenant_id": tenant_id,
            "period": "current_month",
            "by_provider": {
                "groq": {"calls": 0, "tokens": 0, "cost_sar": 0.0},
                "openai": {"calls": 0, "tokens": 0, "cost_sar": 0.0},
                "claude": {"calls": 0, "tokens": 0, "cost_sar": 0.0},
            },
            "total_cost_sar": 0.0,
        }


model_routing_dashboard = ModelRoutingDashboard()
