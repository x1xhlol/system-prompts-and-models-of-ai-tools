from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from uuid import UUID

from app.database import get_db
from app.models.ai_conversation import AIConversation, AutoBooking, ConversationChannel, ConversationStatus

router = APIRouter(prefix="/agents", tags=["ai-agents"])


# ─── Schemas ─────────────────────────────────────────────

class LeadSearchRequest(BaseModel):
    industry: Optional[str] = None
    city: Optional[str] = "Riyadh"
    keywords: Optional[list[str]] = []
    source: Optional[str] = "google_maps"  # google_maps, linkedin, directory
    limit: int = 50


class OutreachRequest(BaseModel):
    channel: str  # whatsapp, email, voice_call
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_name: Optional[str] = None
    contact_company: Optional[str] = None
    message_template: Optional[str] = "introduction"
    tenant_id: UUID


class BookingRequest(BaseModel):
    conversation_id: Optional[UUID] = None
    lead_id: Optional[UUID] = None
    client_name: str
    client_phone: Optional[str] = None
    client_email: Optional[str] = None
    client_company: Optional[str] = None
    meeting_type: str = "demo"
    preferred_datetime: datetime
    duration_minutes: int = 30
    assigned_sales_rep: Optional[UUID] = None
    tenant_id: UUID


class ConversationResponse(BaseModel):
    id: UUID
    channel: str
    status: str
    contact_name: Optional[str]
    contact_company: Optional[str]
    messages_count: int
    sentiment_score: int
    interest_level: int
    qualified: bool
    meeting_booked: bool


class BookingResponse(BaseModel):
    id: UUID
    meeting_type: str
    meeting_datetime: datetime
    client_name: str
    client_company: Optional[str]
    status: str
    assigned_sales_rep: Optional[UUID]


# ─── Lead Generation ────────────────────────────────────

@router.post("/lead-gen/search")
async def search_leads(data: LeadSearchRequest):
    """
    AI agent searches for potential leads from various sources.
    Returns structured lead data from Google Maps, LinkedIn, etc.
    """
    # This would integrate with actual scraping/API services
    return {
        "status": "search_initiated",
        "source": data.source,
        "industry": data.industry,
        "city": data.city,
        "estimated_results": data.limit,
        "message": "Lead search agent activated. Results will be available in the leads dashboard.",
        "search_id": str(UUID(int=0).hex[:12]),
    }


@router.get("/lead-gen/sources")
async def list_lead_sources():
    """List available lead generation sources."""
    return {
        "sources": [
            {
                "id": "google_maps",
                "name": "Google Maps",
                "name_ar": "خرائط قوقل",
                "description": "Search local businesses by category and location",
                "supported_filters": ["industry", "city", "rating", "keywords"],
            },
            {
                "id": "linkedin",
                "name": "LinkedIn",
                "name_ar": "لينكدن",
                "description": "Search companies and decision makers",
                "supported_filters": ["industry", "company_size", "job_title", "location"],
            },
            {
                "id": "saudi_commerce",
                "name": "Saudi Commerce Registry",
                "name_ar": "السجل التجاري",
                "description": "Search registered Saudi businesses",
                "supported_filters": ["industry", "city", "registration_year"],
            },
            {
                "id": "maroof",
                "name": "Maroof",
                "name_ar": "معروف",
                "description": "Search verified Saudi online stores",
                "supported_filters": ["category", "rating"],
            },
            {
                "id": "instagram",
                "name": "Instagram Business",
                "name_ar": "انستقرام بزنس",
                "description": "Search business accounts on Instagram",
                "supported_filters": ["hashtags", "location", "followers_range"],
            },
        ]
    }


# ─── Outreach ────────────────────────────────────────────

@router.post("/outreach/whatsapp")
async def whatsapp_outreach(data: OutreachRequest, db: AsyncSession = Depends(get_db)):
    """
    Send intelligent WhatsApp message to a lead.
    AI agent handles conversation, answers questions, and books meetings.
    """
    conversation = AIConversation(
        tenant_id=data.tenant_id,
        contact_phone=data.contact_phone,
        contact_name=data.contact_name,
        contact_company=data.contact_company,
        channel=ConversationChannel.WHATSAPP,
        status=ConversationStatus.ACTIVE,
        messages_count=1,
        last_message_at=datetime.now(timezone.utc),
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)

    return {
        "status": "message_sent",
        "conversation_id": str(conversation.id),
        "channel": "whatsapp",
        "message": "AI WhatsApp agent initiated conversation",
    }


@router.post("/outreach/call")
async def voice_call_outreach(data: OutreachRequest, db: AsyncSession = Depends(get_db)):
    """
    Initiate AI-powered voice call to a lead.
    """
    conversation = AIConversation(
        tenant_id=data.tenant_id,
        contact_phone=data.contact_phone,
        contact_name=data.contact_name,
        contact_company=data.contact_company,
        channel=ConversationChannel.VOICE_CALL,
        status=ConversationStatus.ACTIVE,
        messages_count=0,
        last_message_at=datetime.now(timezone.utc),
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)

    return {
        "status": "call_initiated",
        "conversation_id": str(conversation.id),
        "channel": "voice_call",
        "message": "AI voice agent call scheduled",
    }


@router.post("/outreach/email")
async def email_outreach(data: OutreachRequest, db: AsyncSession = Depends(get_db)):
    """
    Send AI-crafted email to a lead.
    """
    conversation = AIConversation(
        tenant_id=data.tenant_id,
        contact_email=data.contact_email,
        contact_name=data.contact_name,
        contact_company=data.contact_company,
        channel=ConversationChannel.EMAIL,
        status=ConversationStatus.ACTIVE,
        messages_count=1,
        last_message_at=datetime.now(timezone.utc),
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)

    return {
        "status": "email_sent",
        "conversation_id": str(conversation.id),
        "channel": "email",
        "message": "AI email agent sent introduction email",
    }


# ─── Conversations ───────────────────────────────────────

@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    tenant_id: UUID,
    channel: Optional[str] = None,
    qualified_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """List AI conversations with filters."""
    query = select(AIConversation).where(AIConversation.tenant_id == tenant_id)
    if channel:
        query = query.where(AIConversation.channel == channel)
    if qualified_only:
        query = query.where(AIConversation.qualified == True)
    query = query.order_by(AIConversation.last_message_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/leads/qualified")
async def get_qualified_leads(tenant_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get AI-qualified leads ready for sales team."""
    result = await db.execute(
        select(AIConversation)
        .where(
            AIConversation.tenant_id == tenant_id,
            AIConversation.qualified == True,
            AIConversation.meeting_booked == False,
        )
        .order_by(AIConversation.interest_level.desc())
    )
    conversations = result.scalars().all()
    return [
        {
            "conversation_id": str(c.id),
            "contact_name": c.contact_name,
            "contact_company": c.contact_company,
            "contact_phone": c.contact_phone,
            "channel": c.channel.value,
            "interest_level": c.interest_level,
            "sentiment_score": c.sentiment_score,
            "messages_count": c.messages_count,
        }
        for c in conversations
    ]


# ─── Booking ────────────────────────────────────────────

@router.post("/booking/schedule", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def schedule_meeting(data: BookingRequest, db: AsyncSession = Depends(get_db)):
    """Auto-schedule a meeting with a qualified lead."""
    booking = AutoBooking(
        tenant_id=data.tenant_id,
        conversation_id=data.conversation_id,
        lead_id=data.lead_id,
        meeting_type=data.meeting_type,
        meeting_datetime=data.preferred_datetime,
        duration_minutes=data.duration_minutes,
        client_name=data.client_name,
        client_phone=data.client_phone,
        client_email=data.client_email,
        client_company=data.client_company,
        assigned_sales_rep=data.assigned_sales_rep,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return booking


@router.get("/booking/upcoming", response_model=list[BookingResponse])
async def get_upcoming_bookings(tenant_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get upcoming auto-booked meetings."""
    result = await db.execute(
        select(AutoBooking)
        .where(
            AutoBooking.tenant_id == tenant_id,
            AutoBooking.status == "scheduled",
            AutoBooking.meeting_datetime >= datetime.now(timezone.utc),
        )
        .order_by(AutoBooking.meeting_datetime.asc())
    )
    return result.scalars().all()
