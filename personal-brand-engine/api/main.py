"""FastAPI application - webhooks, health check, and status dashboard."""

from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config.settings import get_settings
from storage.database import init_db
from api.routes.health import router as health_router
from api.routes.webhooks import router as webhooks_router
from api.routes.dashboard import router as dashboard_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logging.basicConfig(
        level=getattr(logging, get_settings().log_level),
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    )
    init_db()
    logger.info("Personal Brand Engine API started")
    yield
    logger.info("Personal Brand Engine API shutting down")


app = FastAPI(
    title="Personal Brand Engine - Sami Assiri",
    description="AI-powered personal brand automation system",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health_router, tags=["Health"])
app.include_router(webhooks_router, prefix="/webhooks", tags=["Webhooks"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])

# Serve landing page as static files
landing_page_dir = Path(__file__).resolve().parent.parent / "landing_page"
if landing_page_dir.exists():
    app.mount("/", StaticFiles(directory=str(landing_page_dir), html=True), name="landing")


if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run(
        "api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=False,
    )
