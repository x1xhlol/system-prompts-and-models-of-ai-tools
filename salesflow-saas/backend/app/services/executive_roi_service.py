from __future__ import annotations

from typing import Any, Dict


class ExecutiveROIService:
    def build_snapshot(self, baseline: Dict[str, Any], current: Dict[str, Any]) -> Dict[str, Any]:
        baseline_revenue = float(baseline.get("revenue", 0))
        current_revenue = float(current.get("revenue", 0))
        lift = 0.0 if baseline_revenue == 0 else ((current_revenue - baseline_revenue) / baseline_revenue) * 100.0
        return {
            "revenue_lift_percent": round(lift, 2),
            "win_rate": current.get("win_rate", 0),
            "pipeline_velocity_days": current.get("pipeline_velocity_days", 0),
            "manual_work_reduction_percent": current.get("manual_work_reduction_percent", 0),
            "summary": "Executive snapshot generated for CEO dashboard.",
        }


executive_roi_service = ExecutiveROIService()
