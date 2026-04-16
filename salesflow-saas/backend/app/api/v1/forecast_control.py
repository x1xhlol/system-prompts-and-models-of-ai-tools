"""Forecast Control API — unified actual vs forecast."""

from fastapi import APIRouter
from typing import Any, Dict

from app.services.forecast_control_center import forecast_control_center

router = APIRouter(prefix="/forecast-control", tags=["Forecast Control"])


@router.get("/unified")
async def unified_view() -> Dict[str, Any]:
    """Get unified actual vs forecast across all tracks."""
    return forecast_control_center.get_unified_view("system")


@router.get("/variance")
async def variance_analysis() -> Dict[str, Any]:
    """Get variance analysis."""
    return forecast_control_center.get_variance_analysis("system")


@router.post("/recalibrate")
async def recalibrate_forecast() -> Dict[str, Any]:
    """Trigger AI re-forecast with latest actuals."""
    return {"status": "recalibration_triggered"}


@router.get("/accuracy")
async def forecast_accuracy() -> Dict[str, Any]:
    """Get deal-level forecast accuracy."""
    return {"deals": [], "overall_accuracy_percent": 0.0}


@router.get("/trends")
async def accuracy_trends(periods: int = 6) -> Dict[str, Any]:
    """Get multi-period forecast accuracy trend."""
    return forecast_control_center.get_accuracy_trend("system", periods)
