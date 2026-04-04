"""Sales OS: commission ledger (شفافية عمولة)، مهام، حصص، تأهيل مندوب."""

from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user, get_optional_user, require_role, get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.services.sales_os_service import (
    build_commission_ledger,
    build_daily_digest,
    build_deal_health,
    build_manager_team_summary,
    demo_commission_ledger,
    merge_quota_view,
    pipeline_value_open_deals,
    pipeline_value_open_deals_scoped,
    rep_onboarding_playbook,
    tasks_inbox_today,
)

router = APIRouter(prefix="/sales-os", tags=["Sales OS"])


class QuotaUpdate(BaseModel):
    default_monthly_quota_sar: Optional[float] = None
    rep_quotas: Optional[Dict[str, float]] = Field(default=None, description="user_id -> monthly SAR target")


@router.get("/commission-ledger")
async def commission_ledger(
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """
    صفقة → عمولة → دفعة. بدون توكن: بيانات توضيحية. مع توكن: بيانات المستأجر (أو توضيحي إن فارغ).
    """
    if user:
        data = await build_commission_ledger(db, user.tenant_id)
        if not data["items"]:
            return demo_commission_ledger()
        return data
    return demo_commission_ledger()


@router.get("/tasks-inbox")
async def tasks_inbox(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """أنشطة مرتبطة بالمستخدم — بداية صندوق مهام."""
    items = await tasks_inbox_today(db, user.tenant_id, user.id)
    return {"items": items, "count": len(items)}


@router.get("/quota")
async def quota_overview(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
):
    pipeline = await pipeline_value_open_deals_scoped(
        db, user.tenant_id, user_id=user.id, role=user.role or "agent"
    )
    settings = tenant.settings if isinstance(tenant.settings, dict) else {}
    return merge_quota_view(settings, user.id, pipeline)


@router.put("/quota")
async def quota_update(
    body: QuotaUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("owner", "admin", "manager")),
    tenant: Tenant = Depends(get_current_tenant),
):
    base = tenant.settings if isinstance(tenant.settings, dict) else {}
    sales_os = dict(base.get("sales_os") or {})
    if body.default_monthly_quota_sar is not None:
        sales_os["default_monthly_quota_sar"] = body.default_monthly_quota_sar
    if body.rep_quotas is not None:
        sales_os["rep_quotas"] = {str(k): float(v) for k, v in body.rep_quotas.items()}
    tenant.settings = {**base, "sales_os": sales_os}
    db.add(tenant)
    await db.flush()
    pipeline = await pipeline_value_open_deals_scoped(
        db, user.tenant_id, user_id=user.id, role=user.role or "agent"
    )
    return merge_quota_view(tenant.settings or {}, user.id, pipeline)


@router.get("/rep-onboarding")
async def rep_onboarding_playbook_endpoint():
    """مسار 7/14/30 يوم — محتوى ثابت يُربط لاحقاً بتتبع DB."""
    return rep_onboarding_playbook()


@router.get("/overview")
async def sales_os_overview(
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """لقطة واحدة للواجهة: عمولة + حصة + مهام + تأهيل."""
    out: Dict[str, Any] = {"rep_onboarding": rep_onboarding_playbook()}
    if user:
        t_result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
        tenant = t_result.scalar_one_or_none()
        settings = tenant.settings if tenant and isinstance(tenant.settings, dict) else {}
        pipeline = await pipeline_value_open_deals_scoped(
            db, user.tenant_id, user_id=user.id, role=user.role or "agent"
        )
        ledger = await build_commission_ledger(db, user.tenant_id)
        if not ledger["items"]:
            ledger = demo_commission_ledger()
        out["commission_ledger"] = ledger
        out["quota"] = merge_quota_view(settings, user.id, pipeline)
        out["tasks"] = await tasks_inbox_today(db, user.tenant_id, user.id)
        out["daily_digest"] = await build_daily_digest(
            db, user.tenant_id, user.id, user.role or "agent", settings
        )
    else:
        out["commission_ledger"] = demo_commission_ledger()
        out["quota"] = None
        out["tasks"] = []
        out["daily_digest"] = None
    return out


@router.get("/daily-digest")
async def daily_digest(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
):
    """ملخّص يومي: مهام، حصة، إغلاقات قريبة، اقتراحات."""
    settings = tenant.settings if isinstance(tenant.settings, dict) else {}
    return await build_daily_digest(db, user.tenant_id, user.id, user.role or "agent", settings)


@router.get("/manager-summary")
async def manager_summary(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("owner", "admin", "manager")),
):
    """أنبوب الفريق حسب المندوب — للمدير."""
    return await build_manager_team_summary(db, user.tenant_id)


@router.get("/deal-health")
async def deal_health(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """صحة الصفقات المفتوحة — إشارات أولية."""
    return await build_deal_health(db, user.tenant_id, user.id, user.role or "agent")
