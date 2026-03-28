from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from decimal import Decimal
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.deal import Deal
from app.schemas.deal import DealCreate, DealUpdate, DealResponse, StageUpdate, PipelineResponse

router = APIRouter()

PIPELINE_STAGES = ["new", "negotiation", "proposal", "closed_won", "closed_lost"]


@router.get("", response_model=list[DealResponse])
async def list_deals(
    stage: str = Query(None),
    assigned_to: UUID = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Deal).where(Deal.tenant_id == current_user.tenant_id)
    if stage:
        query = query.where(Deal.stage == stage)
    if assigned_to:
        query = query.where(Deal.assigned_to == assigned_to)

    query = query.order_by(Deal.created_at.desc())
    result = await db.execute(query)
    return [DealResponse.model_validate(d) for d in result.scalars().all()]


@router.get("/pipeline", response_model=PipelineResponse)
async def get_pipeline(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Deal).where(Deal.tenant_id == current_user.tenant_id))
    deals = result.scalars().all()

    stages = {s: [] for s in PIPELINE_STAGES}
    total_value = Decimal("0")
    for deal in deals:
        stage_key = deal.stage if deal.stage in stages else "new"
        stages[stage_key].append(DealResponse.model_validate(deal))
        if deal.value:
            total_value += deal.value

    return PipelineResponse(stages=stages, total_value=total_value, total_deals=len(deals))


@router.post("", response_model=DealResponse, status_code=201)
async def create_deal(
    data: DealCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deal = Deal(tenant_id=current_user.tenant_id, **data.model_dump(exclude_none=True))
    db.add(deal)
    await db.flush()
    await db.refresh(deal)
    return DealResponse.model_validate(deal)


@router.put("/{deal_id}", response_model=DealResponse)
async def update_deal(
    deal_id: UUID,
    data: DealUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Deal).where(Deal.id == deal_id, Deal.tenant_id == current_user.tenant_id))
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(deal, field, value)

    await db.flush()
    await db.refresh(deal)
    return DealResponse.model_validate(deal)


@router.put("/{deal_id}/stage", response_model=DealResponse)
async def update_deal_stage(
    deal_id: UUID,
    data: StageUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.stage not in PIPELINE_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {PIPELINE_STAGES}")

    result = await db.execute(select(Deal).where(Deal.id == deal_id, Deal.tenant_id == current_user.tenant_id))
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal.stage = data.stage
    if data.stage in ("closed_won", "closed_lost"):
        deal.closed_at = datetime.now(timezone.utc)
        deal.probability = 100 if data.stage == "closed_won" else 0

    await db.flush()
    await db.refresh(deal)
    return DealResponse.model_validate(deal)
