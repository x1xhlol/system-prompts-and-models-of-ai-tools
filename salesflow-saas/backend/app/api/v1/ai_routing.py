"""Tenant-level LLM routing policy (no API keys exposed)."""

from __future__ import annotations

from typing import Any, Dict, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.config import get_settings
from app.database import get_db
from app.models.tenant import Tenant
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI — routing"])

TaskKey = Literal["discovery", "negotiation", "compliance", "strategy_summary", "embeddings"]


class TaskRoute(BaseModel):
    provider: str = Field(..., description="groq | openai | anthropic | etc.")
    model: str = Field(..., description="Model id for that provider")


class RoutingMap(BaseModel):
    discovery: TaskRoute | None = None
    negotiation: TaskRoute | None = None
    compliance: TaskRoute | None = None
    strategy_summary: TaskRoute | None = None
    embeddings: TaskRoute | None = None


def _defaults_from_settings() -> Dict[str, Dict[str, str]]:
    s = get_settings()
    primary = (s.LLM_PRIMARY_PROVIDER or "groq").lower()
    if primary == "openai":
        default_model = s.OPENAI_MODEL
    else:
        default_model = s.GROQ_MODEL
    return {
        "discovery": {"provider": primary, "model": default_model},
        "negotiation": {"provider": primary, "model": default_model},
        "compliance": {"provider": primary, "model": s.OPENAI_MINI_MODEL if primary == "openai" else s.GROQ_FAST_MODEL},
        "strategy_summary": {"provider": primary, "model": default_model},
        "embeddings": {"provider": "openai", "model": s.EMBEDDING_MODEL},
    }


def _available_providers() -> list[str]:
    s = get_settings()
    out = []
    if s.GROQ_API_KEY:
        out.append("groq")
    if s.OPENAI_API_KEY:
        out.append("openai")
    if s.ANTHROPIC_API_KEY:
        out.append("anthropic")
    if s.DEEPSEEK_API_KEY:
        out.append("deepseek")
    if s.GOOGLE_API_KEY:
        out.append("google")
    if s.ZAI_API_KEY:
        out.append("zai")
    return out


def _merge_routing(tenant_settings: dict | None) -> Dict[str, Dict[str, str]]:
    base = _defaults_from_settings()
    custom = (tenant_settings or {}).get("llm_routing") or {}
    for k, v in custom.items():
        if isinstance(v, dict) and v.get("provider") and v.get("model"):
            base[k] = {"provider": str(v["provider"]), "model": str(v["model"])}
    return base


@router.get("/routing")
async def get_ai_routing(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    r = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
    tenant = r.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {
        "effective": _merge_routing(tenant.settings),
        "available_providers": _available_providers(),
        "note_ar": "المفاتيح تبقى في الخادم فقط — الواجهة ترى أسماء المزودين والنماذج فقط.",
    }


@router.put("/routing", dependencies=[Depends(require_role("owner", "manager", "admin"))])
async def put_ai_routing(
    body: RoutingMap,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    r = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
    tenant = r.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    patch: Dict[str, Any] = {}
    data = body.model_dump(exclude_none=True)
    for task, spec in data.items():
        if isinstance(spec, dict):
            patch[task] = spec
    base = dict(tenant.settings or {})
    lr = dict(base.get("llm_routing") or {})
    lr.update(patch)
    base["llm_routing"] = lr
    tenant.settings = base
    await db.flush()
    return {"status": "ok", "effective": _merge_routing(base)}
