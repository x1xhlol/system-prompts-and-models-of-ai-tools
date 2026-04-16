"""Model Routing API — LLM provider metrics and health."""

from fastapi import APIRouter
from typing import Any, Dict

from app.services.model_routing_dashboard import model_routing_dashboard

router = APIRouter(prefix="/model-routing", tags=["Model Routing"])


@router.get("/dashboard")
async def routing_dashboard() -> Dict[str, Any]:
    """Get model routing dashboard."""
    return model_routing_dashboard.get_routing_stats("system")


@router.get("/health")
async def provider_health() -> Dict[str, Any]:
    """Get LLM provider health status."""
    return {"providers": model_routing_dashboard.get_provider_health()}


@router.get("/costs")
async def routing_costs() -> Dict[str, Any]:
    """Get model routing cost attribution."""
    return model_routing_dashboard.get_cost_summary("system")


@router.get("/recommendations")
async def routing_recommendations() -> Dict[str, Any]:
    """Get routing optimization recommendations."""
    return {"recommendations": []}
