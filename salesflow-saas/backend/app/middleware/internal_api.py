"""Optional bearer token for /api/v1 when DEALIX_INTERNAL_API_TOKEN is set (production hardening).

Exemption list is broad (public marketing, demo widgets). Before strict production, see
docs/LAUNCH_CHECKLIST.md section 6.
"""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import get_settings


def _exempt_path(path: str) -> bool:
    if path in ("/api/v1/health", "/api/v1/ready"):
        return True
    if path.startswith("/api/v1/webhooks"):
        return True
    if path.startswith("/api/v1/marketing"):
        return True
    if path.startswith("/api/v1/strategy"):
        return True
    if path.startswith("/api/v1/value-proposition"):
        return True
    if path.startswith("/api/v1/customer-onboarding"):
        return True
    # Public demo GETs only; /sales-os/quota, /tasks-inbox, PUT /quota require token when set
    if path in (
        "/api/v1/sales-os/commission-ledger",
        "/api/v1/sales-os/rep-onboarding",
        "/api/v1/sales-os/overview",
        "/api/v1/operations/snapshot",
    ):
        return True
    # مسارات المسوقين العامة (تسجيل، لوحة، برنامج) دون كشف بيانات فردية حساسة
    if path == "/api/v1/affiliates/program" or path == "/api/v1/affiliates/register":
        return True
    if path.startswith("/api/v1/affiliates/leaderboard"):
        return True
    # Dashboard / demo widgets that call the API from the browser without internal token
    # (still require JWT on routes that use Depends(get_current_user).)
    if path in (
        "/api/v1/agents/status",
        "/api/v1/intelligence/health",
        "/api/v1/intelligence/run-pipeline",
        "/api/v1/dealix/generate-leads",
        "/api/v1/dealix/full-power",
    ):
        return True
    return False


class InternalApiTokenMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        settings = get_settings()
        token = (settings.DEALIX_INTERNAL_API_TOKEN or "").strip()
        if not token:
            return await call_next(request)

        path = request.url.path
        if not path.startswith("/api/v1"):
            return await call_next(request)
        if _exempt_path(path):
            return await call_next(request)

        auth = request.headers.get("authorization") or ""
        expected = f"Bearer {token}"
        if auth != expected:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or missing Authorization bearer token"},
            )
        return await call_next(request)
