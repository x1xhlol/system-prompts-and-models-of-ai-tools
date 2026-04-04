"""
Sales OS: commission ledger, quota helpers, rep onboarding playbook (in-memory / tenant.settings).
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.commission import Commission, CommissionStatus, Payout, PayoutStatus
from app.models.deal import Deal
from app.models.affiliate import AffiliateMarketer
from app.models.activity import Activity
from app.models.user import User


def _status_ar(cs: CommissionStatus) -> str:
    m = {
        CommissionStatus.DRAFT: "مسودة",
        CommissionStatus.PENDING: "قيد المراجعة",
        CommissionStatus.APPROVED: "معتمد — جاهز للدفع",
        CommissionStatus.HELD: "معلّق",
        CommissionStatus.PAID: "مدفوع للمسوّق",
        CommissionStatus.REJECTED: "مرفوض",
        CommissionStatus.DISPUTED: "نزاع",
        CommissionStatus.CLAWBACK: "استرداد",
    }
    return m.get(cs, cs.value if hasattr(cs, "value") else str(cs))


def _payout_status_ar(ps: Optional[PayoutStatus]) -> Optional[str]:
    if ps is None:
        return None
    m = {
        PayoutStatus.PENDING: "دفعة قيد الانتظار",
        PayoutStatus.PROCESSING: "قيد التحويل",
        PayoutStatus.PAID: "تم التحويل",
        PayoutStatus.FAILED: "فشل التحويل",
    }
    return m.get(ps, ps.value)


async def build_commission_ledger(
    db: AsyncSession,
    tenant_id: UUID,
    *,
    limit: int = 100,
) -> Dict[str, Any]:
    """Join commissions → deal → affiliate → payout for transparency UI."""
    q = (
        select(Commission, Deal, AffiliateMarketer, Payout)
        .join(Deal, Commission.deal_id == Deal.id)
        .join(AffiliateMarketer, Commission.affiliate_id == AffiliateMarketer.id)
        .outerjoin(Payout, Commission.payout_id == Payout.id)
        .where(Commission.tenant_id == tenant_id)
        .order_by(Commission.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(q)
    rows = result.all()
    items: List[Dict[str, Any]] = []
    for c, deal, aff, po in rows:
        items.append(
            {
                "commission_id": str(c.id),
                "deal_id": str(deal.id),
                "deal_title": deal.title,
                "deal_stage": deal.stage,
                "deal_value_sar": float(deal.value) if deal.value is not None else None,
                "affiliate_name": aff.full_name_ar or aff.full_name,
                "affiliate_id": str(aff.id),
                "amount_sar": float(c.amount),
                "rate": float(c.rate),
                "plan_type": c.plan_type,
                "status": c.status.value,
                "status_ar": _status_ar(c.status),
                "payout_id": str(c.payout_id) if c.payout_id else None,
                "payout_status": po.status.value if po else None,
                "payout_status_ar": _payout_status_ar(po.status if po else None),
                "payout_total_sar": float(po.total_amount) if po else None,
                "approved_at": c.approved_at.isoformat() if c.approved_at else None,
                "paid_at": c.paid_at.isoformat() if c.paid_at else None,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
        )

    totals = {
        "pending_review": sum(1 for i in items if i["status"] in ("draft", "pending")),
        "approved_unpaid": sum(1 for i in items if i["status"] == "approved"),
        "paid": sum(1 for i in items if i["status"] == "paid"),
        "total_amount_sar": sum(i["amount_sar"] for i in items if i["status"] != "rejected"),
    }
    return {
        "demo_mode": False,
        "items": items,
        "summary": totals,
    }


def demo_commission_ledger() -> Dict[str, Any]:
    return {
        "demo_mode": True,
        "items": [
            {
                "commission_id": "demo-1",
                "deal_id": "demo-deal-1",
                "deal_title": "اشتراك احترافي — عميل تجريبي",
                "deal_stage": "closed_won",
                "deal_value_sar": 699.0,
                "affiliate_name": "مسوّق تجريبي",
                "affiliate_id": "demo-aff",
                "amount_sar": 140.0,
                "rate": 0.2,
                "plan_type": "professional",
                "status": "approved",
                "status_ar": "معتمد — جاهز للدفع",
                "payout_id": None,
                "payout_status": None,
                "payout_status_ar": None,
                "payout_total_sar": None,
                "approved_at": datetime.now(timezone.utc).isoformat(),
                "paid_at": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "commission_id": "demo-2",
                "deal_id": "demo-deal-2",
                "deal_title": "تجديد سنوي",
                "deal_stage": "negotiation",
                "deal_value_sar": 12000.0,
                "affiliate_name": "مسوّق تجريبي",
                "affiliate_id": "demo-aff",
                "amount_sar": 2400.0,
                "rate": 0.2,
                "plan_type": "enterprise",
                "status": "pending",
                "status_ar": "قيد المراجعة",
                "payout_id": None,
                "payout_status": None,
                "payout_status_ar": None,
                "payout_total_sar": None,
                "approved_at": None,
                "paid_at": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        ],
        "summary": {
            "pending_review": 1,
            "approved_unpaid": 1,
            "paid": 0,
            "total_amount_sar": 2540.0,
        },
    }


async def pipeline_value_open_deals(db: AsyncSession, tenant_id: UUID) -> float:
    q = await db.execute(
        select(func.coalesce(func.sum(Deal.value), 0)).where(
            Deal.tenant_id == tenant_id,
            Deal.stage.notin_(["closed_lost", "closed_won"]),
        )
    )
    v = q.scalar()
    return float(v) if v is not None else 0.0


async def pipeline_value_open_deals_scoped(
    db: AsyncSession,
    tenant_id: UUID,
    *,
    user_id: UUID,
    role: str,
) -> float:
    """مندوب: أنبوبه فقط. مدير/مالك: كامل المستأجر."""
    q = select(func.coalesce(func.sum(Deal.value), 0)).where(
        Deal.tenant_id == tenant_id,
        Deal.stage.notin_(["closed_lost", "closed_won"]),
    )
    if role == "agent":
        q = q.where(Deal.assigned_to == user_id)
    r = await db.execute(q)
    v = r.scalar()
    return float(v) if v is not None else 0.0


def _deal_scope_filter(user_id: UUID, role: str):
    if role == "agent":
        return Deal.assigned_to == user_id
    return None


async def build_daily_digest(
    db: AsyncSession,
    tenant_id: UUID,
    user_id: UUID,
    role: str,
    tenant_settings: dict,
) -> Dict[str, Any]:
    tasks = await tasks_inbox_today(db, tenant_id, user_id)
    pipeline = await pipeline_value_open_deals_scoped(db, tenant_id, user_id=user_id, role=role)
    quota = merge_quota_view(tenant_settings, user_id, pipeline)

    dq = select(Deal).where(
        Deal.tenant_id == tenant_id,
        Deal.stage.notin_(["closed_lost", "closed_won"]),
    )
    cond = _deal_scope_filter(user_id, role)
    if cond is not None:
        dq = dq.where(cond)
    today = date.today()
    week = today + timedelta(days=7)
    dq = dq.where(Deal.expected_close_date.isnot(None)).where(Deal.expected_close_date <= week).where(Deal.expected_close_date >= today)
    dq = dq.order_by(Deal.expected_close_date.asc()).limit(15)
    upcoming = await db.execute(dq)
    upcoming_rows = []
    for d in upcoming.scalars().all():
        upcoming_rows.append(
            {
                "deal_id": str(d.id),
                "title": d.title,
                "stage": d.stage,
                "expected_close_date": d.expected_close_date.isoformat() if d.expected_close_date else None,
                "value_sar": float(d.value) if d.value is not None else None,
            }
        )

    suggested: List[str] = []
    if not tasks:
        suggested.append("لا أنشطة حديثة — جدّد أول اتصال أو رسالة متابعة لأعلى صفقة قيمة.")
    if quota.get("attainment_ratio", 0) < 0.25:
        suggested.append("الأنبوب أقل من ربع الهدف الشهري — ركّز على تأهيل 3 فرص جديدة هذا الأسبوع.")
    if upcoming_rows:
        suggested.append(f"لديك {len(upcoming_rows)} صفقة بإغلاق متوقع خلال 7 أيام — راجع المراحل والاعتراضات.")

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "tasks_preview": tasks[:12],
        "quota": quota,
        "upcoming_closes": upcoming_rows,
        "suggested_actions_ar": suggested[:6],
    }


async def build_manager_team_summary(db: AsyncSession, tenant_id: UUID) -> Dict[str, Any]:
    q = await db.execute(
        select(
            Deal.assigned_to,
            func.count(Deal.id),
            func.coalesce(func.sum(Deal.value), 0),
        )
        .where(Deal.tenant_id == tenant_id, Deal.stage.notin_(["closed_lost", "closed_won"]))
        .group_by(Deal.assigned_to)
    )
    rows = q.all()
    user_ids = [r[0] for r in rows if r[0] is not None]
    names: Dict[str, str] = {}
    if len(user_ids) > 0:
        uq = await db.execute(select(User).where(User.id.in_(user_ids)))
        for u in uq.scalars().all():
            names[str(u.id)] = u.full_name_ar or u.full_name or u.email

    reps = []
    open_pipeline_total = 0.0
    for assigned_to, cnt, val in rows:
        if assigned_to is None:
            continue
        v = float(val) if val is not None else 0.0
        open_pipeline_total += v
        reps.append(
            {
                "user_id": str(assigned_to),
                "name": names.get(str(assigned_to), "—"),
                "open_deals": int(cnt),
                "open_pipeline_sar": round(v, 2),
            }
        )
    reps.sort(key=lambda x: x["open_pipeline_sar"], reverse=True)

    total_open = await db.execute(
        select(func.count(Deal.id)).where(
            Deal.tenant_id == tenant_id,
            Deal.stage.notin_(["closed_lost", "closed_won"]),
        )
    )
    return {
        "open_pipeline_total_sar": round(open_pipeline_total, 2),
        "open_deals_total": int(total_open.scalar() or 0),
        "reps": reps,
        "note_ar": "ملخّص الفريق — أنبوب مفتوح حسب المندوب المسند.",
    }


async def build_deal_health(
    db: AsyncSession,
    tenant_id: UUID,
    user_id: UUID,
    role: str,
    *,
    limit: int = 40,
) -> Dict[str, Any]:
    q = select(Deal).where(Deal.tenant_id == tenant_id, Deal.stage.notin_(["closed_lost", "closed_won"]))
    cond = _deal_scope_filter(user_id, role)
    if cond is not None:
        q = q.where(cond)
    q = q.order_by(Deal.updated_at.asc()).limit(limit)
    result = await db.execute(q)
    deals = result.scalars().all()
    now = datetime.now(timezone.utc)
    today = date.today()
    items: List[Dict[str, Any]] = []
    for d in deals:
        flags: List[str] = []
        score = 100
        if d.updated_at:
            du = d.updated_at
            if du.tzinfo is None:
                du = du.replace(tzinfo=timezone.utc)
            age = now - du
            if age.days >= 14:
                flags.append("لا تحديث على الصفقة منذ 14+ يوماً")
                score -= 25
        else:
            flags.append("بلا تاريخ تحديث")
            score -= 10
        if d.expected_close_date and d.expected_close_date < today:
            flags.append("تاريخ إغلاق متوقع متجاوز")
            score -= 20
        if d.stage == "new" and d.probability and d.probability > 40:
            flags.append("احتمالية عالية لكن المرحلة ما زالت جديدة — راجع الجودة")
            score -= 10
        score = max(0, min(100, score))
        risk = "high" if score < 45 else "medium" if score < 70 else "low"
        items.append(
            {
                "deal_id": str(d.id),
                "title": d.title,
                "stage": d.stage,
                "health_score": score,
                "risk_level": risk,
                "flags_ar": flags,
                "value_sar": float(d.value) if d.value is not None else None,
            }
        )
    return {"items": items, "note_ar": "مؤشر أولي من التحديث والمواعيد — يُعزّى لاحقاً بسجل المكالمات."}


async def tasks_inbox_today(
    db: AsyncSession,
    tenant_id: UUID,
    user_id: UUID,
) -> List[Dict[str, Any]]:
    q = await db.execute(
        select(Activity)
        .where(
            Activity.tenant_id == tenant_id,
            Activity.user_id == user_id,
        )
        .order_by(Activity.created_at.desc())
        .limit(40)
    )
    out: List[Dict[str, Any]] = []
    for a in q.scalars().all():
        out.append(
            {
                "id": str(a.id),
                "type": a.type,
                "subject": a.subject or "",
                "description": (a.description or "")[:500],
                "scheduled_at": a.scheduled_at.isoformat() if a.scheduled_at else None,
                "completed_at": a.completed_at.isoformat() if a.completed_at else None,
                "deal_id": str(a.deal_id) if a.deal_id else None,
                "lead_id": str(a.lead_id) if a.lead_id else None,
            }
        )
    return out


def default_sales_os_settings() -> Dict[str, Any]:
    return {
        "default_monthly_quota_sar": 500_000,
        "rep_quotas": {},
        "currency": "SAR",
    }


def merge_quota_view(
    tenant_settings: dict,
    user_id: UUID,
    pipeline_open_sar: float,
) -> Dict[str, Any]:
    raw = (tenant_settings or {}).get("sales_os") or {}
    base = {**default_sales_os_settings(), **raw}
    target = float(base["rep_quotas"].get(str(user_id), base.get("default_monthly_quota_sar", 500_000)))
    ratio = (pipeline_open_sar / target) if target > 0 else 0.0
    return {
        "monthly_target_sar": target,
        "pipeline_open_sar": round(pipeline_open_sar, 2),
        "attainment_ratio": round(min(ratio, 2.0), 3),
        "note_ar": "الهدف مقابل أنبوب مفتوح (تقريبي) — يُحدَّث من إعدادات المستأجر.",
    }


def rep_onboarding_playbook() -> Dict[str, Any]:
    return {
        "title_ar": "تأهيل مندوب المبيعات — 30 يوماً",
        "phases": [
            {
                "day_range": "1–7",
                "title_ar": "الأسبوع الأول — الأدوات والقنوات",
                "tasks_ar": [
                    "إكمال الملف والقطاع في النظام",
                    "ربط واتساب التجريبي أو القناة المعتمدة",
                    "قراءة سكربت الافتتاحية + تسجيل محاكاة واحدة",
                ],
            },
            {
                "day_range": "8–14",
                "title_ar": "الأسبوع الثاني — الأنبوب والمتابعة",
                "tasks_ar": [
                    "10 اتصالات/محادثات مؤهّلة في CRM",
                    "استخدام تذكير المتابعة التلقائي",
                    "اجتماع مراجعة مع المدير (15 دقيقة)",
                ],
            },
            {
                "day_range": "15–30",
                "title_ar": "الأسبوعان 3–4 — الإغلاق والعمولة",
                "tasks_ar": [
                    "عرض سعر واحد على الأقل في مرحلة متأخرة",
                    "فهم شفافية العمولة من لوحة «دفتر العمولات»",
                    "تحليل أسبوعي: معدل التحويل مقابل الهدف",
                ],
            },
        ],
        "kpi_ar": [
            "عدد اللقاءات المؤهّلة",
            "قيمة الأنبوب المفتوح",
            "صفقات مغلقة / عمولة معتمدة",
        ],
    }
