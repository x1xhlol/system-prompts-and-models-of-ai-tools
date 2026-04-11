from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel as Schema

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.knowledge import SectorAsset

router = APIRouter()


class SectorAssetResponse(Schema):
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


class SectorAssetListResponse(Schema):
    items: list[SectorAssetResponse]
    total: int


class SectorSummary(Schema):
    sector: str
    asset_count: int


class SectorListResponse(Schema):
    sectors: list[SectorSummary]


@router.get("", response_model=SectorListResponse)
async def list_sectors(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SectorAsset.sector, func.count(SectorAsset.id))
        .where(SectorAsset.is_active == True)
        .group_by(SectorAsset.sector)
        .order_by(SectorAsset.sector)
    )
    sectors = [SectorSummary(sector=row[0], asset_count=row[1]) for row in result.all()]
    return SectorListResponse(sectors=sectors)


@router.get("/{sector}/assets", response_model=SectorAssetListResponse)
async def get_sector_assets(
    sector: str,
    asset_type: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(SectorAsset).where(SectorAsset.sector == sector, SectorAsset.is_active == True)
    if asset_type:
        query = query.where(SectorAsset.asset_type == asset_type)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    result = await db.execute(query.order_by(SectorAsset.created_at.desc()))
    items = [SectorAssetResponse.model_validate(a) for a in result.scalars().all()]
    return SectorAssetListResponse(items=items, total=total)


@router.get("/{sector}/assets/{asset_id}", response_model=SectorAssetResponse)
async def get_sector_asset(
    sector: str,
    asset_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SectorAsset).where(SectorAsset.id == asset_id, SectorAsset.sector == sector)
    )
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Sector asset not found")
    return SectorAssetResponse.model_validate(asset)
