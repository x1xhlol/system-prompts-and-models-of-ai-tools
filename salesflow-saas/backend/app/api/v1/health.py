from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timezone
from pydantic import BaseModel as Schema

from app.database import get_db

router = APIRouter()


class HealthResponse(Schema):
    status: str
    timestamp: str
    version: str = "1.0.0"


class ReadyResponse(Schema):
    status: str
    database: str
    timestamp: str


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/ready", response_model=ReadyResponse)
async def readiness_check(db: AsyncSession = Depends(get_db)):
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unavailable"

    overall = "ready" if db_status == "connected" else "not_ready"
    return ReadyResponse(
        status=overall,
        database=db_status,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
