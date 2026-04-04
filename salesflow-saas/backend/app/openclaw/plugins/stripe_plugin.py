from __future__ import annotations

from typing import Dict, Any

from app.services.stripe_service import stripe_service


class StripeBillingPlugin:
    name = "stripe-billing"

    async def create_charge(self, customer_id: str, amount_sar: int) -> Dict[str, Any]:
        response = await stripe_service.create_payment_intent(amount_sar, customer_id)
        return {"provider": "stripe", "customer_id": customer_id, "amount_sar": amount_sar, "response": response}
