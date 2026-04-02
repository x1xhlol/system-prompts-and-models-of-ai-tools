"""
Payment Service — Financial engine for Dealix.
Handles payment link generation (Mada, Apple Pay, STC Pay) and settlement loops.
"""

import uuid
from decimal import Decimal
from typing import Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.deal import Deal
from app.models.commission import Commission, CommissionStatus
from app.services.affiliate_service import AffiliateService

class PaymentService:
    """The financial 'Heart' of Dealix: Closing the loop from Deal to Cash."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.affiliate_service = AffiliateService(db)

    async def generate_payment_link(
        self, 
        tenant_id: str, 
        deal_id: str, 
        amount: float,
        gateway: str = "toy_gateway" # Future: 'moyasar', 'paytabs'
    ) -> Dict[str, Any]:
        """Generate a secure payment link for a deal."""
        
        result = await self.db.execute(
            select(Deal).where(
                Deal.id == uuid.UUID(deal_id),
                Deal.tenant_id == uuid.UUID(tenant_id)
            )
        )
        deal = result.scalar_one_or_none()
        if not deal:
            return {"status": "error", "message": "Deal not found"}

        # Generate a unique payment reference
        payment_ref = f"PAY-{uuid.uuid4().hex[:8].upper()}"
        
        # In a real scenario, we'd call Moyasar/Stripe here.
        # For now, we generate a professional Mock Link (localized).
        payment_link = f"https://pay.dealix.sa/checkout/{payment_ref}?amount={amount}&currency=SAR"
        
        # Update deal with link
        deal.payment_link = payment_link
        deal.payment_status = "pending"
        deal.value = Decimal(str(amount))
        
        await self.db.flush()
        
        return {
            "status": "success",
            "payment_link": payment_link,
            "payment_reference": payment_ref,
            "amount": amount,
            "currency": "SAR",
            "supported_methods": ["mada", "apple_pay", "stc_pay"]
        }

    async def confirm_payment(
        self, 
        tenant_id: str, 
        deal_id: str, 
        payment_reference: str
    ) -> Dict[str, Any]:
        """Confirm payment and trigger the automated financial cascade."""
        
        result = await self.db.execute(
            select(Deal).where(
                Deal.id == uuid.UUID(deal_id),
                Deal.tenant_id == uuid.UUID(tenant_id)
            )
        )
        deal = result.scalar_one_or_none()
        if not deal:
            return {"status": "error", "message": "Deal not found"}

        # 1. Update Deal Status
        deal.payment_status = "paid"
        deal.stage = "closed_won"
        from datetime import datetime, timezone
        deal.closed_at = datetime.now(timezone.utc)
        
        # 2. Trigger Automated Commission Settlement (The Revenue Cascade)
        from app.services.wallet_service import WalletService
        wallet_svc = WalletService(self.db)
        settle_result = await wallet_svc.settle_commission(
            tenant_id, str(deal_id), float(deal.value)
        )
        
        # 3. Generate Official ZATCA Invoice Data
        from app.services.invoice_generator import InvoiceGenerator
        inv_svc = InvoiceGenerator(self.db)
        invoice_result = await inv_svc.generate_invoice_data(tenant_id, str(deal_id))

        await self.db.flush()
        
        return {
            "status": "success",
            "message": "Payment confirmed. Revenue cascade completed: Deal won, Commission settled, ZATCA Invoice generated.",
            "deal_id": str(deal_id),
            "revenue": float(deal.value),
            "commission_settled": settle_result,
            "invoice": invoice_result
        }
