from __future__ import annotations

from typing import Any, Dict, List


class SignalSellingService:
    def aggregate_signals(
        self,
        web_signals: List[Dict[str, Any]],
        email_signals: List[Dict[str, Any]],
        call_signals: List[Dict[str, Any]],
        linkedin_signals: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        all_signals = web_signals + email_signals + call_signals + linkedin_signals
        score = sum(float(s.get("score", 0)) for s in all_signals[:20])
        return {
            "signal_count": len(all_signals),
            "buying_intent_score": min(100.0, round(score / 5.0, 2)),
            "top_signals": sorted(all_signals, key=lambda x: float(x.get("score", 0)), reverse=True)[:5],
        }


signal_selling_service = SignalSellingService()
