"""Unified inbox API -- aggregate messages from WhatsApp, Email, SMS."""

import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel as Schema
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.message import Message
from app.models.lead import Lead

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/inbox", tags=["Inbox"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class MessageResponse(Schema):
    id: UUID
    lead_id: Optional[UUID] = None
    channel: str
    direction: str
    content: Optional[str] = None
    status: str
    sent_at: Optional[datetime] = None
    created_at: datetime
    extra_metadata: Optional[dict] = None
    lead_name: Optional[str] = None

    model_config = {"from_attributes": True}


class MessageListResponse(Schema):
    items: list[MessageResponse]
    total: int
    page: int
    per_page: int


class ThreadResponse(Schema):
    lead_id: UUID
    lead_name: Optional[str] = None
    messages: list[MessageResponse]


class ReplyInput(Schema):
    lead_id: UUID
    channel: str
    content: str


class AssignInput(Schema):
    lead_id: UUID
    assigned_to: UUID


class InboxStats(Schema):
    total_unread: int
    whatsapp_unread: int
    email_unread: int
    sms_unread: int
    avg_response_minutes: Optional[float] = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=MessageListResponse)
async def list_inbox(
    channel: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    assigned_to: Optional[UUID] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all messages across channels with filters."""

    query = select(Message).where(Message.tenant_id == current_user.tenant_id)

    if channel:
        query = query.where(Message.channel == channel)
    if status_filter:
        query = query.where(Message.status == status_filter)
    if assigned_to:
        query = query.join(Lead, Lead.id == Message.lead_id).where(Lead.assigned_to == assigned_to)
    if search:
        query = query.where(Message.content.ilike(f"%{search}%"))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    rows = await db.execute(
        query.order_by(Message.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    )
    messages = rows.scalars().all()

    # Batch-load lead names
    lead_ids = {m.lead_id for m in messages if m.lead_id}
    lead_map: dict[UUID, str] = {}
    if lead_ids:
        leads_q = await db.execute(select(Lead.id, Lead.name).where(Lead.id.in_(lead_ids)))
        lead_map = {row[0]: row[1] for row in leads_q.all()}

    items = []
    for m in messages:
        resp = MessageResponse.model_validate(m)
        resp.lead_name = lead_map.get(m.lead_id)
        items.append(resp)

    return MessageListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/stats", response_model=InboxStats)
async def inbox_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Unread counts per channel and response-time metrics."""

    tid = current_user.tenant_id
    base = and_(Message.tenant_id == tid, Message.direction == "inbound", Message.status != "read")

    total = (await db.execute(select(func.count()).where(base))).scalar() or 0
    wa = (await db.execute(
        select(func.count()).where(base, Message.channel == "whatsapp")
    )).scalar() or 0
    em = (await db.execute(
        select(func.count()).where(base, Message.channel == "email")
    )).scalar() or 0
    sm = (await db.execute(
        select(func.count()).where(base, Message.channel == "sms")
    )).scalar() or 0

    return InboxStats(
        total_unread=total,
        whatsapp_unread=wa,
        email_unread=em,
        sms_unread=sm,
        avg_response_minutes=None,
    )


@router.get("/{message_id}", response_model=ThreadResponse)
async def get_thread(
    message_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full conversation thread for a message."""

    msg = (await db.execute(
        select(Message).where(Message.id == message_id, Message.tenant_id == current_user.tenant_id)
    )).scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="الرسالة غير موجودة")

    if not msg.lead_id:
        return ThreadResponse(lead_id=message_id, messages=[MessageResponse.model_validate(msg)])

    lead = (await db.execute(select(Lead).where(Lead.id == msg.lead_id))).scalar_one_or_none()
    thread_q = await db.execute(
        select(Message)
        .where(Message.lead_id == msg.lead_id, Message.tenant_id == current_user.tenant_id)
        .order_by(Message.created_at.asc())
    )
    messages = [MessageResponse.model_validate(m) for m in thread_q.scalars().all()]

    return ThreadResponse(
        lead_id=msg.lead_id,
        lead_name=lead.name if lead else None,
        messages=messages,
    )


@router.post("/reply", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def reply_message(
    data: ReplyInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reply to a conversation -- auto-routes to the correct channel."""

    lead = (await db.execute(
        select(Lead).where(Lead.id == data.lead_id, Lead.tenant_id == current_user.tenant_id)
    )).scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="العميل المحتمل غير موجود")

    if data.channel not in ("whatsapp", "email", "sms"):
        raise HTTPException(status_code=400, detail="قناة غير مدعومة")

    now = datetime.now(timezone.utc)
    message = Message(
        tenant_id=current_user.tenant_id,
        lead_id=data.lead_id,
        channel=data.channel,
        direction="outbound",
        content=data.content,
        status="pending",
        sent_at=now,
        extra_metadata={"sent_by": str(current_user.id)},
    )
    db.add(message)
    await db.flush()
    await db.refresh(message)

    logger.info("Inbox reply sent: lead=%s channel=%s by=%s", data.lead_id, data.channel, current_user.id)
    return MessageResponse.model_validate(message)


@router.post("/assign", status_code=status.HTTP_200_OK)
async def assign_conversation(
    data: AssignInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Assign a conversation (lead) to a team member."""

    lead = (await db.execute(
        select(Lead).where(Lead.id == data.lead_id, Lead.tenant_id == current_user.tenant_id)
    )).scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="العميل المحتمل غير موجود")

    lead.assigned_to = data.assigned_to
    await db.flush()
    logger.info("Conversation assigned: lead=%s to=%s", data.lead_id, data.assigned_to)
    return {"detail": "تم تعيين المحادثة بنجاح", "lead_id": str(data.lead_id), "assigned_to": str(data.assigned_to)}


@router.put("/{message_id}/read", status_code=status.HTTP_200_OK)
async def mark_read(
    message_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a message as read."""

    msg = (await db.execute(
        select(Message).where(Message.id == message_id, Message.tenant_id == current_user.tenant_id)
    )).scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="الرسالة غير موجودة")

    msg.status = "read"
    await db.flush()
    return {"detail": "تم تحديد الرسالة كمقروءة", "message_id": str(message_id)}
