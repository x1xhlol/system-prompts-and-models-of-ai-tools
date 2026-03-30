"""Dashboard API - agent status, stats, and recent activity."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter
from sqlalchemy import func

from storage.database import get_db
from storage.models import AgentLog, Post, Email, Opportunity, ContentCalendar

router = APIRouter()


@router.get("/status")
async def get_system_status():
    """Get overall system status and stats."""
    db = get_db()
    try:
        now = datetime.now(timezone.utc)
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)

        # Agent activity
        total_runs_24h = db.query(func.count(AgentLog.id)).filter(
            AgentLog.created_at >= last_24h
        ).scalar() or 0

        failed_runs_24h = db.query(func.count(AgentLog.id)).filter(
            AgentLog.created_at >= last_24h,
            AgentLog.status == "failed",
        ).scalar() or 0

        # Content stats
        posts_published = db.query(func.count(Post.id)).filter(
            Post.status == "published",
            Post.published_at >= last_7d,
        ).scalar() or 0

        # Email stats
        emails_processed = db.query(func.count(Email.id)).filter(
            Email.created_at >= last_24h,
        ).scalar() or 0

        # Opportunity stats
        new_opportunities = db.query(func.count(Opportunity.id)).filter(
            Opportunity.created_at >= last_24h,
            Opportunity.status == "new",
        ).scalar() or 0

        return {
            "status": "running",
            "owner": "Sami Assiri",
            "stats": {
                "agent_runs_24h": total_runs_24h,
                "failed_runs_24h": failed_runs_24h,
                "success_rate": (
                    round((1 - failed_runs_24h / total_runs_24h) * 100, 1)
                    if total_runs_24h > 0
                    else 100.0
                ),
                "posts_published_7d": posts_published,
                "emails_processed_24h": emails_processed,
                "new_opportunities_24h": new_opportunities,
            },
            "timestamp": now.isoformat(),
        }
    finally:
        db.close()


@router.get("/agents")
async def get_agent_activity():
    """Get recent agent activity logs."""
    db = get_db()
    try:
        logs = (
            db.query(AgentLog)
            .order_by(AgentLog.created_at.desc())
            .limit(50)
            .all()
        )
        return [
            {
                "agent": log.agent_name,
                "task": log.task,
                "status": log.status,
                "duration": log.duration_seconds,
                "details": log.details[:200] if log.details else None,
                "timestamp": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ]
    finally:
        db.close()


@router.get("/opportunities")
async def get_opportunities():
    """Get recent opportunities found by the scout bot."""
    db = get_db()
    try:
        opps = (
            db.query(Opportunity)
            .order_by(Opportunity.created_at.desc())
            .limit(20)
            .all()
        )
        return [
            {
                "id": opp.id,
                "source": opp.source,
                "title": opp.title,
                "company": opp.company,
                "url": opp.url,
                "relevance_score": opp.relevance_score,
                "status": opp.status,
                "created_at": opp.created_at.isoformat() if opp.created_at else None,
            }
            for opp in opps
        ]
    finally:
        db.close()


@router.get("/content")
async def get_content_calendar():
    """Get upcoming content calendar."""
    db = get_db()
    try:
        items = (
            db.query(ContentCalendar)
            .order_by(ContentCalendar.date.desc())
            .limit(14)
            .all()
        )
        return [
            {
                "id": item.id,
                "date": item.date.isoformat() if item.date else None,
                "pillar": item.pillar,
                "topic": item.topic,
                "platform": item.platform,
                "status": item.status,
            }
            for item in items
        ]
    finally:
        db.close()
