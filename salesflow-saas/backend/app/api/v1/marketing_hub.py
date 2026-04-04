"""
Marketing asset URLs for frontends and operators (single source of truth for paths).
"""
from __future__ import annotations

from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(tags=["Marketing"])
settings = get_settings()


@router.get("/marketing/hub")
async def marketing_hub() -> dict:
    """
    Returns absolute paths (same host in production behind nginx) and API base.
    Use NEXT_PUBLIC_APP_URL or API_URL to build full URLs on the client if needed.
    """
    base = settings.API_URL.rstrip("/")
    return {
        "app_name": settings.APP_NAME,
        "api_base": base,
        "paths": {
            "marketing_index": "/dealix-marketing/",
            "marketing_zip": "/dealix-marketing/dealix-marketing-bundle.zip",
            "presentations_index": "/dealix-presentations/",
            "company_master_html": "/dealix-presentations/00-dealix-company-master-ar.html",
            "use_cases_master": "/dealix-marketing/dealix-use-cases-2026/00-master-use-cases-ar.html",
            "diagrams_viewer": "/dealix-marketing/dealix-use-cases-2026/diagrams-viewer.html",
            "access_urls_txt": "/dealix-marketing/ACCESS-URLS.txt",
            "strategy_page": "/strategy",
            "strategy_doc_md": "/strategy/DEALIX_NEXT_LEVEL_MASTER_PLAN_AR.md",
            "ultimate_execution_doc_md": "/strategy/ULTIMATE_EXECUTION_MASTER_AR.md",
            "integration_master_ar_md": "/strategy/INTEGRATION_MASTER_AR.md",
            "go_live_gate_api": "/api/v1/autonomous-foundation/integrations/go-live-gate",
            "live_readiness_api": "/api/v1/autonomous-foundation/integrations/live-readiness",
            "strategy_summary_api": "/api/v1/strategy/summary",
        },
        "notes": {
            "nginx": "Behind nginx, /dealix-marketing and /dealix-presentations must proxy to this API (see nginx.conf).",
            "next_dev": "Use next.config.js rewrites to proxy these paths to API in local dev.",
        },
    }
