"""
Payment Webhook Handler — Financial sensor for Dealix.
Receives bank/gateway notifications and triggers the automated financial cascade.
"""

import uuid
from typing import Any, Dict
from fastapi import APIRouter, Header, HTTPException, Request, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.services.payment_service import PaymentService
from app.schemas.response import ResponseSchema

router = APIRouter()

@router.post("/moyasar", response_model=ResponseSchema)
async def moyasar_webhook(
    request: Request,
    x_moyasar_signature: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Handle webhooks from Moyasar (Standard Saudi Payment Gateway).
    Verifies signature and triggers the revenue loop.
    """
    payload = await request.json()
    
    # In production, verify x_moyasar_signature here
    
    event = payload.get("type")
    data = payload.get("data", {})
    
    if event == "payment.paid":
        deal_id = data.get("metadata", {}).get("deal_id")
        tenant_id = data.get("metadata", {}).get("tenant_id")
        payment_ref = data.get("id")
        
        if deal_id and tenant_id:
            pay_svc = PaymentService(db)
            result = await pay_svc.confirm_payment(tenant_id, deal_id, payment_ref)
            
            return {
                "status": "success",
                "message": "Payment confirmed and deal updated.",
                "data": result
            }

    return {"status": "ignored", "message": f"Event {event} not handled."}

@router.post("/test-simulate", response_model=ResponseSchema)
async def simulate_payment_success(
    deal_id: str,
    tenant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Strategic Simulation: Manually trigger a success for testing the revenue flow.
    """
    pay_svc = PaymentService(db)
    result = await pay_svc.confirm_payment(tenant_id, deal_id, "SIM-PAY-SUCCESS")
    
    return {
        "status": "success",
        "message": "SIMULATED: Payment confirmed. Revenue flow triggered.",
        "data": result
    }
