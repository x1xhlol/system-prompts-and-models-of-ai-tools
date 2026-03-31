from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel as Schema

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.knowledge import SectorAsset, AssetType

router = APIRouter()


class PresentationResponse(Schema):
    id: UUID
    sector: str
    asset_type: str
    title: str
    title_ar: Optional[str] = None
    content: Optional[str] = None
    content_ar: Optional[str] = None
    file_url: Optional[str] = None
    metadata: Optional[dict] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PresentationListResponse(Schema):
    items: list[PresentationResponse]
    total: int
    page: int
    per_page: int


PRESENTATION_TYPES = [
    AssetType.PRESENTATION,
    AssetType.ONE_PAGER,
    AssetType.CASE_STUDY,
]


@router.get("", response_model=PresentationListResponse)
async def list_presentations(
    sector: str = Query(None),
    asset_type: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(SectorAsset).where(
        SectorAsset.is_active == True,
        SectorAsset.asset_type.in_(PRESENTATION_TYPES),
    )
    if sector:
        query = query.where(SectorAsset.sector == sector)
    if asset_type:
        query = query.where(SectorAsset.asset_type == asset_type)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.order_by(SectorAsset.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = [PresentationResponse.model_validate(a) for a in result.scalars().all()]
    return PresentationListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/by-sector", response_model=dict)
async def list_by_sector(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SectorAsset.sector, func.count(SectorAsset.id))
        .where(SectorAsset.is_active == True, SectorAsset.asset_type.in_(PRESENTATION_TYPES))
        .group_by(SectorAsset.sector)
        .order_by(SectorAsset.sector)
    )
    return {"sectors": {row[0]: row[1] for row in result.all()}}
