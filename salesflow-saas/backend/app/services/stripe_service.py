from __future__ import annotations

import httpx
from typing import Any, Dict

from app.config import get_settings

settings = get_settings()


class StripeService:
    async def create_payment_intent(self, amount_sar: int, customer_id: str) -> Dict[str, Any]:
        if not settings.STRIPE_SECRET_KEY:
            return {"status": "mock", "amount_sar": amount_sar, "customer_id": customer_id}
        amount_halalas = int(amount_sar * 100)
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                "https://api.stripe.com/v1/payment_intents",
                headers={"Authorization": f"Bearer {settings.STRIPE_SECRET_KEY}"},
                data={
                    "amount": str(amount_halalas),
                    "currency": "sar",
                    "customer": customer_id,
                    "automatic_payment_methods[enabled]": "true",
                },
            )
            resp.raise_for_status()
            return resp.json()


stripe_service = StripeService()
