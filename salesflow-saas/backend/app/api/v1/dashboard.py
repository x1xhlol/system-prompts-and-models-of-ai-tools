from datetime import datetime, timezone, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.lead import Lead
from app.models.deal import Deal
from app.models.message import Message
from app.schemas.dashboard import DashboardOverview, PipelineSummary

router = APIRouter()


@router.get("/overview", response_model=DashboardOverview)
async def dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = current_user.tenant_id
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    total_leads = (await db.execute(select(func.count()).where(Lead.tenant_id == tid))).scalar() or 0
    new_today = (await db.execute(select(func.count()).where(Lead.tenant_id == tid, Lead.created_at >= today_start))).scalar() or 0
    total_deals = (await db.execute(select(func.count()).where(Deal.tenant_id == tid))).scalar() or 0

    open_value = (await db.execute(
        select(func.coalesce(func.sum(Deal.value), 0)).where(Deal.tenant_id == tid, Deal.stage.notin_(["closed_won", "closed_lost"]))
    )).scalar() or Decimal("0")

    won_value = (await db.execute(
        select(func.coalesce(func.sum(Deal.value), 0)).where(Deal.tenant_id == tid, Deal.stage == "closed_won")
    )).scalar() or Decimal("0")

    won_count = (await db.execute(
        select(func.count()).where(Deal.tenant_id == tid, Deal.stage == "closed_won")
    )).scalar() or 0

    msgs_today = (await db.execute(
        select(func.count()).where(Message.tenant_id == tid, Message.created_at >= today_start, Message.direction == "outbound")
    )).scalar() or 0

    conversion = (won_count / total_leads * 100) if total_leads > 0 else 0

    return DashboardOverview(
        total_leads=total_leads,
        new_leads_today=new_today,
        total_deals=total_deals,
        open_deals_value=open_value,
        closed_won_value=won_value,
        closed_won_count=won_count,
        messages_sent_today=msgs_today,
        conversion_rate=round(conversion, 2),
        active_workflows=0,
    )


@router.get("/pipeline", response_model=PipelineSummary)
async def pipeline_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = current_user.tenant_id
    result = await db.execute(
        select(Deal.stage, func.count(), func.coalesce(func.sum(Deal.value), 0))
        .where(Deal.tenant_id == tid)
        .group_by(Deal.stage)
    )

    stages = {}
    values = {}
    for stage, count, value in result.all():
        stages[stage] = count
        values[stage] = float(value)

    return PipelineSummary(stages=stages, total_value_by_stage=values)
