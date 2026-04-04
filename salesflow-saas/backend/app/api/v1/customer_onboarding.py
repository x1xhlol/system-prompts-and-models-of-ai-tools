"""Customer onboarding journey & acceptance checklist — JSON for UI and sales engineering."""

from __future__ import annotations

from fastapi import APIRouter

from app.services.customer_onboarding_journey import (
    build_acceptance_test_checklist,
    build_journey,
)

router = APIRouter(prefix="/customer-onboarding", tags=["Customer Onboarding"])


@router.get("/journey")
async def get_customer_journey():
    return build_journey()


@router.get("/acceptance-test")
async def get_acceptance_test_checklist():
    return build_acceptance_test_checklist()
