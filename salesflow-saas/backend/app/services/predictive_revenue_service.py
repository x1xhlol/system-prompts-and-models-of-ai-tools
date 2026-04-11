from __future__ import annotations

from typing import Any, Dict, List


class PredictiveRevenueService:
    """Forecasting + churn + anomaly skeleton for phase-1 foundation."""

    def score_signal_based_lead(self, lead: Dict[str, Any], signals: List[Dict[str, Any]]) -> float:
        base = float(lead.get("discovery_score", 50))
        signal_boost = sum(float(s.get("score", 0)) for s in signals[:5]) / 10.0
        return min(100.0, round(base + signal_boost, 2))

    def forecast(self, pipeline: List[Dict[str, Any]]) -> Dict[str, Any]:
        weighted = 0.0
        for deal in pipeline:
            value = float(deal.get("value", 0))
            prob = float(deal.get("win_probability", 0.3))
            weighted += value * prob
        return {"weighted_forecast_sar": round(weighted, 2), "confidence": 0.74}

    def predict_churn(self, accounts: List[Dict[str, Any]]) -> Dict[str, Any]:
        risky = [a for a in accounts if float(a.get("health_score", 100)) < 50]
        return {"risk_count": len(risky), "at_risk_accounts": risky[:20]}

    def detect_anomalies(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        velocity = float(metrics.get("pipeline_velocity", 0))
        drop = velocity < float(metrics.get("velocity_floor", 1))
        return {"pipeline_velocity_drop": drop, "details": metrics}


predictive_revenue_service = PredictiveRevenueService()
