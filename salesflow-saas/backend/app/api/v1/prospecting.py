"""
Prospecting API — Strategic endpoints for automated lead discovery.
Harnessing the power of Google Maps.
"""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, get_current_user
from app.services.prospecting_service import ProspectingService
from app.schemas.response import ResponseSchema

router = APIRouter()

@router.post("/hunt", response_model=ResponseSchema)
async def hunt_leads(
    query: str = Query(..., description="The sector to hunt for (e.g., 'Dentists')"),
    location: str = Query("Riyadh, Saudi Arabia", description="The city/area to hunt in"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Trigger an automated hunt for businesses and import them as leads.
    The ultimate growth hack for Dealix.
    """
    tenant_id = str(current_user["tenant_id"])
    pro_svc = ProspectingService(db)
    
    result = await pro_svc.search_businesses(tenant_id, query, location, limit)
    
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
        
    return {
        "status": "success",
        "message": f"Successfully hunted and imported {result['imported_count']} leads for '{query}' in {location}.",
        "data": result
    }

@router.get("/suggest-sectors", response_model=ResponseSchema)
async def suggest_hunting_sectors():
    """Returns top ROI sectors for the Saudi market to guide the user."""
    sectors = [
        {"id": "medical", "name_ar": "العيادات الطبية", "name_en": "Medical Clinics", "priority": "high"},
        {"id": "realestate", "name_ar": "مكاتب العقارات", "name_en": "Real Estate Agencies", "priority": "high"},
        {"id": "auto", "name_ar": "ورش صيانة السيارات", "name_en": "Auto Repair Shops", "priority": "medium"},
        {"id": "f&b", "name_ar": "المطاعم والكافيهات", "name_en": "Restaurants & Cafes", "priority": "medium"},
        {"id": "construction", "name_ar": "شركات المقاولات", "name_en": "Construction Companies", "priority": "high"},
        {"id": "ecommerce", "name_ar": "متاجر التجزئة", "name_en": "Retail Stores", "priority": "medium"}
    ]
    return {
        "status": "success",
        "data": sectors
    }
