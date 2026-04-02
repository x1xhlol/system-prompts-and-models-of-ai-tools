"""
Wallet Service — Strategic financial engine for affiliate payouts.
Tracks available balance, settles commissions, and manages the payout queue.
"""

import uuid
from typing import Dict, Any, List
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.affiliate import AffiliateMarketer, AffiliatePerformance
from app.models.commission import Commission, CommissionStatus

class WalletService:
    """The financial 'Wallet' of Dealix: Settling commissions and managing cashflow."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def settle_commission(
        self, 
        tenant_id: str, 
        deal_id: str, 
        amount_paid: float
    ) -> Dict[str, Any]:
        """Automatically calculate and settle commission for the affiliate linked to the deal."""
        
        # 1. Lookup the commission entry for this deal
        result = await self.db.execute(
            select(Commission).where(Commission.deal_id == uuid.UUID(deal_id))
        )
        commission = result.scalar_one_or_none()
        
        if not commission:
            return {"status": "ignored", "message": "No commission linked to this deal."}

        # 2. Update Commission Status
        commission.status = CommissionStatus.APPROVED
        from datetime import datetime, timezone
        commission.approved_at = datetime.now(timezone.utc)
        commission.payment_reference = f"SETTLE-{uuid.uuid4().hex[:6].upper()}"

        # 3. Update Affiliate's Available Balance
        affiliate_result = await self.db.execute(
            select(AffiliateMarketer).where(AffiliateMarketer.id == commission.affiliate_id)
        )
        affiliate = affiliate_result.scalar_one_or_none()
        
        if affiliate:
            # We add to available balance immediately upon payment confirmation
            affiliate.available_balance += float(commission.amount)
            affiliate.total_commission_earned += float(commission.amount)
            affiliate.total_deals_closed += 1
            
            # 4. Record in Monthly Performance
            month_str = datetime.now().strftime("%Y-%m")
            perf_result = await self.db.execute(
                select(AffiliatePerformance).where(
                    AffiliatePerformance.affiliate_id == affiliate.id,
                    AffiliatePerformance.month == month_str
                )
            )
            perf = perf_result.scalar_one_or_none()
            if perf:
                perf.commission_earned += float(commission.amount)
                perf.revenue_generated += float(amount_paid)
                perf.deals_closed += 1

        await self.db.flush()
        
        return {
            "status": "success",
            "settled_amount": float(commission.amount),
            "affiliate_id": str(commission.affiliate_id),
            "new_balance": float(affiliate.available_balance) if affiliate else 0
        }

    async def get_wallet_summary(self, affiliate_id: str) -> Dict[str, Any]:
        """Get the financial summary for an affiliate's wallet."""
        result = await self.db.execute(
            select(AffiliateMarketer).where(AffiliateMarketer.id == uuid.UUID(affiliate_id))
        )
        affiliate = result.scalar_one_or_none()
        if not affiliate:
            return {"error": "Affiliate not found"}

        return {
            "available_balance": float(affiliate.available_balance),
            "total_earned": float(affiliate.total_commission_earned),
            "deals_closed": affiliate.total_deals_closed,
            "currency": "SAR"
        }
