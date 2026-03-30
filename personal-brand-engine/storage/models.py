"""SQLAlchemy 2.0 models for the personal brand automation engine."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import JSON


class Base(DeclarativeBase):
    """Shared declarative base for all models."""

    pass


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    platform: Mapped[str] = mapped_column(String(20), nullable=False)  # linkedin / twitter
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )  # draft / scheduled / published / failed
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    engagement_stats: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    # Reverse relation from ContentCalendar
    calendar_entries: Mapped[list[ContentCalendar]] = relationship(
        "ContentCalendar", back_populates="post"
    )

    __table_args__ = (
        Index("ix_posts_platform", "platform"),
        Index("ix_posts_status", "status"),
        Index("ix_posts_scheduled_at", "scheduled_at"),
    )

    def __repr__(self) -> str:
        return f"<Post id={self.id} platform={self.platform!r} status={self.status!r}>"


class Email(Base):
    __tablename__ = "emails"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    from_addr: Mapped[str] = mapped_column(String(320), nullable=False)
    to_addr: Mapped[str] = mapped_column(String(320), nullable=False)
    subject: Mapped[str] = mapped_column(String(998), nullable=False, default="")
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
    classification: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )  # urgent / reply_needed / spam / info
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="unread"
    )  # unread / drafted / sent / archived
    draft_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    __table_args__ = (
        Index("ix_emails_classification", "classification"),
        Index("ix_emails_status", "status"),
        Index("ix_emails_from_addr", "from_addr"),
    )

    def __repr__(self) -> str:
        return f"<Email id={self.id} from={self.from_addr!r} status={self.status!r}>"


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    platform: Mapped[str | None] = mapped_column(String(20), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_contact_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    __table_args__ = (
        Index("ix_contacts_email", "email"),
        Index("ix_contacts_name", "name"),
        Index("ix_contacts_platform", "platform"),
    )

    def __repr__(self) -> str:
        return f"<Contact id={self.id} name={self.name!r}>"


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False)
    task: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # success / failed
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    __table_args__ = (
        Index("ix_agent_logs_agent_name", "agent_name"),
        Index("ix_agent_logs_status", "status"),
        Index("ix_agent_logs_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<AgentLog id={self.id} agent={self.agent_name!r} status={self.status!r}>"


class ContentCalendar(Base):
    __tablename__ = "content_calendar"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    pillar: Mapped[str] = mapped_column(String(100), nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    platform: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="planned"
    )  # planned / drafted / published
    post_id: Mapped[int | None] = mapped_column(
        ForeignKey("posts.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    post: Mapped[Post | None] = relationship("Post", back_populates="calendar_entries")

    __table_args__ = (
        Index("ix_content_calendar_date", "date"),
        Index("ix_content_calendar_platform", "platform"),
        Index("ix_content_calendar_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<ContentCalendar id={self.id} date={self.date} topic={self.topic!r}>"


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # linkedin / indeed / google / twitter
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    relevance_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="new"
    )  # new / notified / applied / dismissed
    notified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    __table_args__ = (
        Index("ix_opportunities_source", "source"),
        Index("ix_opportunities_status", "status"),
        Index("ix_opportunities_relevance_score", "relevance_score"),
    )

    def __repr__(self) -> str:
        return f"<Opportunity id={self.id} title={self.title!r} source={self.source!r}>"
