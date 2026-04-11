from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timezone
from pydantic import BaseModel as Schema

from app.database import get_db
from app.config import get_settings

router = APIRouter()
_settings = get_settings()


class HealthResponse(Schema):
    status: str
    timestamp: str
    version: str = "2.0.0"
    app: str = "Dealix"
    environment: str = "production"


class ReadyResponse(Schema):
    status: str
    database: str
    timestamp: str


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc).isoformat(),
        version="2.0.0",
        app=_settings.APP_NAME,
        environment=_settings.ENVIRONMENT,
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
