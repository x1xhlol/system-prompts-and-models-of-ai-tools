"""
Webhooks Entry Point — Financial Neural Link for Dealix.
Exports the sub-routers for payment confirmation and bank events.
"""

from fastapi import APIRouter
from app.api.v1.webhooks import payments

router = APIRouter()

# Include the payments webhook router
router.include_router(payments.router, prefix="/payments", tags=["Payment Webhooks"])
