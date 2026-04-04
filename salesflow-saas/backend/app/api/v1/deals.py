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
from app.services.audit_service import record_audit
from app.services.operations_hub import emit_domain_event
from app.schemas.deal import DealCreate, DealUpdate, DealResponse, StageUpdate, PipelineResponse

router = APIRouter()

PIPELINE_STAGES = ["new", "negotiation", "proposal", "closed_won", "closed_lost"]


def _deal_tenant_scope(query, user: User):
    """مندوب يرى صفقاته المسندة فقط."""
    if getattr(user, "role", None) == "agent":
        return query.where(Deal.assigned_to == user.id)
    return query


def _ensure_deal_access(deal: Deal, user: User) -> None:
    if getattr(user, "role", None) == "agent" and deal.assigned_to != user.id:
        raise HTTPException(status_code=403, detail="Not assigned to this deal")


@router.get("", response_model=list[DealResponse])
async def list_deals(
    stage: str = Query(None),
    assigned_to: UUID = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Deal).where(Deal.tenant_id == current_user.tenant_id)
    query = _deal_tenant_scope(query, current_user)
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
    q = select(Deal).where(Deal.tenant_id == current_user.tenant_id)
    q = _deal_tenant_scope(q, current_user)
    result = await db.execute(q)
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
    await record_audit(
        db,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="deal.create",
        entity_type="deal",
        entity_id=deal.id,
        changes={"title": deal.title, "stage": deal.stage},
    )
    await emit_domain_event(
        db,
        tenant_id=current_user.tenant_id,
        event_type="deal.created",
        payload={"deal_id": str(deal.id), "stage": deal.stage},
    )
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
    _ensure_deal_access(deal, current_user)

    before = {"stage": deal.stage, "value": str(deal.value) if deal.value is not None else None}
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(deal, field, value)

    await db.flush()
    await record_audit(
        db,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="deal.update",
        entity_type="deal",
        entity_id=deal.id,
        changes={"before": before, "after": data.model_dump(exclude_none=True)},
    )
    await emit_domain_event(
        db,
        tenant_id=current_user.tenant_id,
        event_type="deal.updated",
        payload={"deal_id": str(deal.id)},
    )
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
    _ensure_deal_access(deal, current_user)

    prev_stage = deal.stage
    deal.stage = data.stage
    if data.stage in ("closed_won", "closed_lost"):
        deal.closed_at = datetime.now(timezone.utc)
        deal.probability = 100 if data.stage == "closed_won" else 0

    await db.flush()
    await record_audit(
        db,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="deal.stage_change",
        entity_type="deal",
        entity_id=deal.id,
        changes={"from": prev_stage, "to": data.stage},
    )
    await emit_domain_event(
        db,
        tenant_id=current_user.tenant_id,
        event_type="deal.stage_changed",
        payload={"deal_id": str(deal.id), "from": prev_stage, "to": data.stage},
    )
    await db.refresh(deal)
    return DealResponse.model_validate(deal)
