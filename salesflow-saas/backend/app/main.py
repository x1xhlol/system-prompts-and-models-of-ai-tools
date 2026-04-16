# ── SQLite Patch (must be first!) ─────────────────────────────
from app.sqlite_patch import apply_patch
apply_patch()
# ──────────────────────────────────────────────────────────────

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio

from app.config import get_settings
from app.database import IS_SQLITE, init_db
from app.api.v1.router import api_router
from app.flows.self_improvement_flow import self_improvement_flow
from app.middleware.internal_api import InternalApiTokenMiddleware

settings = get_settings()


def _cors_origins() -> list[str]:
    base = [
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
        "https://dealix.sa",
        "https://app.dealix.sa",
    ]
    extra = [x.strip() for x in (settings.CORS_EXTRA_ORIGINS or "").split(",") if x.strip()]
    seen: set[str] = set()
    out: list[str] = []
    for o in base + extra:
        if o not in seen:
            seen.add(o)
            out.append(o)
    return out


def _openapi_urls() -> tuple[str | None, str | None, str | None]:
    if not settings.EXPOSE_OPENAPI:
        return None, None, None
    return "/api/docs", "/api/redoc", "/api/openapi.json"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    stop_event = asyncio.Event()

    async def _self_improvement_worker():
        while not stop_event.is_set():
            await self_improvement_flow.run("system_tenant", None)
            await asyncio.sleep(max(60, settings.SELF_IMPROVEMENT_INTERVAL_SECONDS))

    worker_task = asyncio.create_task(_self_improvement_worker())

    # Startup
    print(f"[startup] {settings.APP_NAME} starting...")
    print(f"   Environment: {settings.ENVIRONMENT}")
    print(f"   LLM Primary: {settings.LLM_PRIMARY_PROVIDER}")
    print(f"   LLM Fallback: {settings.LLM_FALLBACK_PROVIDER}")
    if IS_SQLITE:
        await init_db()
    yield
    # Shutdown
    stop_event.set()
    worker_task.cancel()
    print(f"[shutdown] {settings.APP_NAME} shutting down...")


_docs, _redoc, _openapi = _openapi_urls()

_docs_static_dir = Path(__file__).resolve().parent / "static" / "docs"
_swagger_ui_parameters = None
if _docs and (_docs_static_dir / "swagger-dealix.css").is_file():
    _swagger_ui_parameters = {
        "persistAuthorization": True,
        "displayRequestDuration": True,
        "filter": True,
        "tryItOutEnabled": True,
        "customCssUrl": "/api/docs-assets/swagger-dealix.css",
    }

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description=(
        "AI-powered B2B Revenue Operating System for the Saudi market. "
        "Lead management, AI agents, affiliate system, meeting automation, "
        "deal pipeline, and commission processing — all driven by 18 specialized AI agents."
    ),
    version="2.0.0",
    docs_url=_docs,
    redoc_url=_redoc,
    openapi_url=_openapi,
    lifespan=lifespan,
    swagger_ui_parameters=_swagger_ui_parameters,
)

app.add_middleware(InternalApiTokenMiddleware)
# CORS runs outermost (added last) so browser preflight is handled first
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(api_router, prefix="/api/v1")

if _docs and _docs_static_dir.is_dir():
    app.mount(
        "/api/docs-assets",
        StaticFiles(directory=str(_docs_static_dir)),
        name="docs_assets",
    )


@app.get("/", include_in_schema=False)
async def root_redirect():
    """Avoid bare 404 on API origin; send developers to interactive docs."""
    if _docs:
        return RedirectResponse(url=_docs, status_code=307)
    return {
        "service": settings.APP_NAME,
        "api": "/api/v1",
        "health": "/api/v1/health",
        "note": "OpenAPI UI disabled (EXPOSE_OPENAPI=false).",
    }


# ── Static marketing assets (browse + direct download) ─────────
def _resolve_salesflow_root() -> Path:
    if settings.MARKETING_STATIC_ROOT.strip():
        return Path(settings.MARKETING_STATIC_ROOT).resolve()
    # backend/app/main.py -> parents: app, backend, salesflow-saas
    return Path(__file__).resolve().parent.parent.parent


_salesflow_root = _resolve_salesflow_root()
_marketing_dir = _salesflow_root / "sales_assets"
_presentations_dir = _salesflow_root / "presentations" / "dealix-2026-sectors"

if settings.MARKETING_STATIC_ENABLED:
    if _marketing_dir.is_dir():
        app.mount(
            "/dealix-marketing",
            StaticFiles(directory=str(_marketing_dir), html=True),
            name="dealix_marketing",
        )
        print("   Marketing static: /dealix-marketing/ (index, ZIP, use cases)")
    if _presentations_dir.is_dir():
        app.mount(
            "/dealix-presentations",
            StaticFiles(directory=str(_presentations_dir), html=True),
            name="dealix_presentations",
        )
        print("   Marketing static: /dealix-presentations/ (sector HTML)")
