# ── SQLite Patch (must be first!) ─────────────────────────────
from app.sqlite_patch import apply_patch
apply_patch()
# ──────────────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.api.v1.router import api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    print(f"🚀 {settings.APP_NAME} ({settings.APP_NAME_AR}) starting...")
    print(f"   Environment: {settings.ENVIRONMENT}")
    print(f"   LLM Primary: {settings.LLM_PRIMARY_PROVIDER}")
    print(f"   LLM Fallback: {settings.LLM_FALLBACK_PROVIDER}")
    yield
    # Shutdown
    print(f"👋 {settings.APP_NAME} shutting down...")


app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description=(
        "AI-powered B2B Revenue Operating System for the Saudi market. "
        "Lead management, AI agents, affiliate system, meeting automation, "
        "deal pipeline, and commission processing — all driven by 18 specialized AI agents."
    ),
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
        "https://dealix.sa",
        "https://app.dealix.sa",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(api_router, prefix="/api/v1")


# Health check (outside router for direct access)
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "ai_engine": {
            "primary": settings.LLM_PRIMARY_PROVIDER,
            "fallback": settings.LLM_FALLBACK_PROVIDER,
        },
    }
