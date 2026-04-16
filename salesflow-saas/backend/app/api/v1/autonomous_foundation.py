from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.api.deps import get_optional_user
from app.flows.prospecting_durable_flow import prospecting_durable_flow
from app.flows.self_improvement_flow import self_improvement_flow
from app.models.user import User
from app.openclaw.gateway import openclaw_gateway
from app.openclaw.media_bridge import media_bridge
from app.openclaw.memory_bridge import memory_bridge
from app.openclaw.observability_bridge import observability_bridge
from app.openclaw.policy import classify_action
from app.openclaw.task_router import task_router
from app.services.contract_intelligence_service import contract_intelligence_service
from app.services.executive_roi_service import executive_roi_service
from app.services.predictive_revenue_service import predictive_revenue_service
from app.openclaw.plugins.salesforce_agentforce_plugin import SalesforceAgentforcePlugin
from app.openclaw.plugins.whatsapp_plugin import WhatsAppCloudPlugin
from app.openclaw.plugins.stripe_plugin import StripeBillingPlugin
from app.openclaw.plugins.voice_plugin import VoiceAgentsPlugin
from app.openclaw.plugins.contract_intelligence_plugin import ContractIntelligencePlugin
from app.config import get_settings
from app.services.go_live_matrix import build_matrix_report


router = APIRouter(prefix="/autonomous-foundation", tags=["Autonomous Foundation"])
settings = get_settings()


class DealPayload(BaseModel):
    tenant_id: str = "default_tenant"
    deal: Dict[str, Any] = Field(default_factory=dict)


class ROIRequest(BaseModel):
    baseline: Dict[str, Any] = Field(default_factory=dict)
    current: Dict[str, Any] = Field(default_factory=dict)


class PredictiveRequest(BaseModel):
    pipeline: List[Dict[str, Any]] = Field(default_factory=list)
    accounts: List[Dict[str, Any]] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)


class MobileActionRequest(BaseModel):
    tenant_id: str = "default_tenant"
    rep_id: str
    action: str
    payload: Dict[str, Any] = Field(default_factory=dict)


class ConnectivityRequest(BaseModel):
    tenant_id: str = "default_tenant"
    company_name: str = "Dealix Test Account"
    phone: str = "966500000000"
    customer_id: str = "cus_test"
    amount_sar: int = 10


class MemoryCollectRequest(BaseModel):
    tenant_id: str = "default_tenant"
    domain: str = "operational"
    content: str
    evidence: Dict[str, Any] = Field(default_factory=dict)
    signal_count: int = 0
    repetition_count: int = 0
    impact_score: float = 0.0
    threshold: float = 60.0


class MediaDraftRequest(BaseModel):
    tenant_id: str = "default_tenant"
    media_type: str = Field(..., description="video | music")
    prompt: str
    provider_hint: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PolicyCheckRequest(BaseModel):
    tenant_id: str = "default_tenant"
    action: str
    payload: Dict[str, Any] = Field(default_factory=dict)


def _canary_enabled(tenant_id: str) -> bool:
    canary = [x.strip() for x in (settings.OPENCLAW_CANARY_TENANTS or "").split(",") if x.strip()]
    if not canary:
        return True
    return tenant_id in canary


def _resolve_tenant(user: Optional[User], fallback_tenant_id: str) -> str:
    return str(user.tenant_id) if user else fallback_tenant_id


_TASKS_REGISTERED = False


def _register_task_router() -> None:
    global _TASKS_REGISTERED
    if _TASKS_REGISTERED:
        return

    async def _prospecting(tenant_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        return await prospecting_durable_flow.run(tenant_id, payload)

    async def _self_improve(tenant_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        return await self_improvement_flow.run(tenant_id, None)

    task_router.register("prospecting_flow", _prospecting)
    task_router.register("self_improvement_flow", _self_improve)
    _TASKS_REGISTERED = True


def build_go_live_readiness_report() -> Dict[str, Any]:
    """
    Full commercial go-live: blocking checks across security, data, LLM, email, CRM,
    WhatsApp (incl. webhook verify + live mode), Stripe (incl. webhook secret), voice, e-sign.
    """
    matrix = build_matrix_report(settings)
    checks: Dict[str, str] = matrix["checks"]
    passed = matrix["passed_count"]
    total = matrix["total_count"]
    readiness_percent = matrix["readiness_percent"]
    launch_allowed = matrix["launch_allowed"]
    missing_rows = matrix["missing"]
    missing_legacy: List[Dict[str, str]] = [
        {"check_id": m["check_id"], "env_var": m["env_var"], "hint": m["hint"]}
        for m in missing_rows
    ]
    blocked_reasons = [
        f"غير مُعرّف أو غير صالح: {item['env_var']} ({item['check_id']})"
        for item in missing_legacy
    ]
    if launch_allowed:
        summary_ar = (
            "جميع فحوص الإطلاق التجاري (الإلزامية) ناجحة — يمكن البيع والتشغيل الفعلي عند اكتمال الاختبارات اليدوية."
        )
        summary_en = "All blocking commercial checks passed — ready for paid rollout after manual smoke tests."
    else:
        summary_ar = (
            f"الإطلاق التجاري ممنوع: الجاهزية الإلزامية {readiness_percent}% ({passed}/{total}). "
            f"أكمل {len(missing_legacy)} بندًا في backend/.env — راجع ملف الربط الشامل."
        )
        summary_en = (
            f"Commercial launch blocked: {readiness_percent}% ({passed}/{total}). "
            f"Complete {len(missing_legacy)} item(s); see INTEGRATION_MASTER_AR.md."
        )
    base_url = (settings.API_URL or "http://localhost:8000").rstrip("/")
    gate_path = "/api/v1/autonomous-foundation/integrations/go-live-gate"
    gate_url = f"{base_url}{gate_path}"
    cli_examples = {
        "powershell": (
            f'Invoke-RestMethod -Uri "{gate_url}" -Method Get | ConvertTo-Json -Depth 12'
        ),
        "curl": f'curl -sS "{gate_url}"',
    }
    warnings: List[str] = []
    if getattr(settings, "WHATSAPP_MOCK_MODE", True):
        warnings.append(
            "WHATSAPP_MOCK_MODE is enabled — WhatsApp sends are simulated until you set WHATSAPP_MOCK_MODE=false and real tokens."
        )
    if getattr(settings, "ENVIRONMENT", "") == "development" and launch_allowed:
        warnings.append("ENVIRONMENT=development — use production settings before real go-live.")
    return {
        "gate": "go_live",
        "launch_mode": "full_commercial",
        "launch_allowed": launch_allowed,
        "readiness_percent": readiness_percent,
        "readiness_percent_total": matrix["full_matrix"]["readiness_percent"],
        "passed_count": passed,
        "total_count": total,
        "score": matrix["score"],
        "overall": "PASS" if launch_allowed else "FAIL",
        "summary": summary_ar,
        "summary_en": summary_en,
        "blocked_reasons": blocked_reasons,
        "checks": checks,
        "categories": matrix["categories"],
        "blocking": matrix["blocking"],
        "full_matrix": matrix["full_matrix"],
        "missing": missing_legacy,
        "missing_detail": missing_rows,
        "missing_optional": matrix["missing_optional"],
        "missing_count": len(missing_legacy),
        "missing_optional_count": matrix["missing_optional_count"],
        "env_template_file": "salesflow-saas/backend/.env.phase2.example",
        "integration_docs": {
            "integration_master_ar": "salesflow-saas/docs/INTEGRATION_MASTER_AR.md",
            "launch_checklist": "salesflow-saas/docs/LAUNCH_CHECKLIST.md",
            "frontend_env_example": "salesflow-saas/frontend/.env.example",
        },
        "cli_examples": cli_examples,
        "warnings": warnings,
        "notes": [
            "الفحوص الإلزامية تشمل: أمان، قاعدة بيانات، ذكاء، بريد، Salesforce، واتساب (ومنع الوضع التجريبي)، Stripe + webhook، Twilio، توقيع إلكتروني.",
            "راجع docs/INTEGRATION_MASTER_AR.md لجدول الربط الشامل وروابط الويبهوك.",
            "انسخ backend/.env.phase2.example إلى backend/.env وعبّئ كل البنود الفاشلة.",
            "ثم GET /integrations/go-live-gate حتى launch_allowed=true.",
            "أخيراً POST /integrations/connectivity-test للتحقق من وقت التشغيل.",
        ],
    }


@router.post("/flows/prospecting")
async def run_prospecting_flow(payload: DealPayload) -> Dict[str, Any]:
    _register_task_router()
    if not settings.OPENCLAW_SAFE_CORE_ENABLED:
        return await prospecting_durable_flow.run(payload.tenant_id, payload.deal)
    if not _canary_enabled(payload.tenant_id):
        return {"status": "skipped", "reason": "tenant_not_in_canary", "tenant_id": payload.tenant_id}
    result = await openclaw_gateway.execute(
        tenant_id=payload.tenant_id,
        task_type="prospecting_flow",
        action="send_whatsapp",
        payload=payload.deal,
        model_provider="openclaw-router",
        cache_hint="prospecting-cache",
    )
    return result


@router.post("/flows/self-improvement")
async def run_self_improvement_flow(payload: DealPayload) -> Dict[str, Any]:
    _register_task_router()
    if not settings.OPENCLAW_SAFE_CORE_ENABLED:
        return await self_improvement_flow.run(payload.tenant_id, None)
    result = await openclaw_gateway.execute(
        tenant_id=payload.tenant_id,
        task_type="self_improvement_flow",
        action="collect_signals",
        payload=payload.deal,
        model_provider="openclaw-router",
        cache_hint="self-improve-cache",
    )
    return result


@router.get("/openclaw/health")
async def openclaw_health() -> Dict[str, Any]:
    return {
        "safe_core_enabled": settings.OPENCLAW_SAFE_CORE_ENABLED,
        "media_drafts_enabled": settings.OPENCLAW_MEDIA_DRAFTS_ENABLED,
        "memory_enabled": settings.OPENCLAW_MEMORY_ENABLED,
        "canary_tenants": [x.strip() for x in (settings.OPENCLAW_CANARY_TENANTS or "").split(",") if x.strip()],
        "registered_task_types": ["prospecting_flow", "self_improvement_flow"],
    }


@router.get("/openclaw/runs")
async def list_openclaw_runs(
    tenant_id: Optional[str] = None,
    limit: int = 50,
    user: Optional[User] = Depends(get_optional_user),
) -> Dict[str, Any]:
    tid = _resolve_tenant(user, tenant_id or "default_tenant")
    return {"items": observability_bridge.list_runs(tenant_id=tid, limit=limit)}


@router.post("/openclaw/policy/check")
async def policy_check(body: PolicyCheckRequest) -> Dict[str, Any]:
    from app.openclaw.approval_bridge import approval_bridge

    gate = approval_bridge.evaluate(action=body.action, payload=body.payload, tenant_id=body.tenant_id)
    return {"gate": gate, "classification": classify_action(body.action).as_dict()}


@router.post("/openclaw/memory/promote")
async def memory_collect_promote(body: MemoryCollectRequest, user: Optional[User] = Depends(get_optional_user)) -> Dict[str, Any]:
    if not settings.OPENCLAW_MEMORY_ENABLED:
        raise HTTPException(status_code=403, detail="OpenClaw memory bridge is disabled")
    tid = _resolve_tenant(user, body.tenant_id)
    item = memory_bridge.collect(tenant_id=tid, domain=body.domain, content=body.content, evidence=body.evidence)
    scored = memory_bridge.score(
        item["memory_id"],
        signal_count=body.signal_count,
        repetition_count=body.repetition_count,
        impact_score=body.impact_score,
    )
    promoted = memory_bridge.promote(item["memory_id"], threshold=body.threshold)
    return {"collected": item, "scored": scored, "promoted": promoted}


@router.get("/openclaw/memory")
async def list_memory(
    tenant_id: Optional[str] = None,
    promoted_only: bool = False,
    domain: Optional[str] = None,
    limit: int = 100,
    user: Optional[User] = Depends(get_optional_user),
) -> Dict[str, Any]:
    if not settings.OPENCLAW_MEMORY_ENABLED:
        raise HTTPException(status_code=403, detail="OpenClaw memory bridge is disabled")
    tid = _resolve_tenant(user, tenant_id or "default_tenant")
    return {"items": memory_bridge.list_items(tenant_id=tid, promoted_only=promoted_only, domain=domain, limit=limit)}


@router.post("/openclaw/media/drafts")
async def create_media_draft(body: MediaDraftRequest, user: Optional[User] = Depends(get_optional_user)) -> Dict[str, Any]:
    if not settings.OPENCLAW_MEDIA_DRAFTS_ENABLED:
        raise HTTPException(status_code=403, detail="OpenClaw media draft bridge is disabled")
    tid = _resolve_tenant(user, body.tenant_id)
    # Draft-only in phase-1: always require approval at policy layer for video/music.
    gate = classify_action(f"{body.media_type}_generate").as_dict()
    if not gate["requires_approval"]:
        raise HTTPException(status_code=400, detail="Invalid media policy state")
    row = media_bridge.create_draft(
        tenant_id=tid,
        media_type=body.media_type,
        prompt=body.prompt,
        provider_hint=body.provider_hint,
        metadata=body.metadata,
    )
    return {"draft": row, "policy": gate}


@router.get("/openclaw/media/drafts")
async def list_media_drafts(
    tenant_id: Optional[str] = None,
    media_type: Optional[str] = None,
    limit: int = 100,
    user: Optional[User] = Depends(get_optional_user),
) -> Dict[str, Any]:
    if not settings.OPENCLAW_MEDIA_DRAFTS_ENABLED:
        raise HTTPException(status_code=403, detail="OpenClaw media draft bridge is disabled")
    tid = _resolve_tenant(user, tenant_id or "default_tenant")
    return {"items": media_bridge.list_drafts(tenant_id=tid, media_type=media_type, limit=limit)}


@router.post("/intelligence/contract")
async def run_contract_intelligence(payload: DealPayload) -> Dict[str, Any]:
    return await contract_intelligence_service.generate_and_send(payload.deal)


@router.post("/intelligence/predictive")
async def run_predictive(payload: PredictiveRequest) -> Dict[str, Any]:
    return {
        "forecast": predictive_revenue_service.forecast(payload.pipeline),
        "churn": predictive_revenue_service.predict_churn(payload.accounts),
        "anomalies": predictive_revenue_service.detect_anomalies(payload.metrics),
    }


@router.post("/dashboard/executive-roi")
async def executive_roi(payload: ROIRequest) -> Dict[str, Any]:
    return executive_roi_service.build_snapshot(payload.baseline, payload.current)


@router.post("/mobile/field-action")
async def mobile_field_action(payload: MobileActionRequest) -> Dict[str, Any]:
    return {
        "status": "accepted",
        "tenant_id": payload.tenant_id,
        "rep_id": payload.rep_id,
        "action": payload.action,
        "payload": payload.payload,
    }


@router.post("/integrations/webhook-hub/{provider}")
async def webhook_hub(provider: str, body: Dict[str, Any]) -> Dict[str, Any]:
    return {"status": "received", "provider": provider, "body": body}


@router.post("/integrations/connectivity-test")
async def integrations_connectivity_test(payload: ConnectivityRequest) -> Dict[str, Any]:
    """
    Live runtime probe of each integration. Never raises HTTP 500: each provider is isolated;
    demo/placeholder .env keys will often return provider errors inside the JSON — expected until real credentials.
    """
    sf = SalesforceAgentforcePlugin()
    wa = WhatsAppCloudPlugin()
    stripe = StripeBillingPlugin()
    voice = VoiceAgentsPlugin()
    contract = ContractIntelligencePlugin()

    async def _safe(name: str, coro):
        try:
            return {"status": "ok", "data": await coro}
        except Exception as e:
            return {"status": "error", "error": str(e), "provider": name}

    account = await _safe("salesforce", sf.get_account_360(payload.company_name))
    wa_result = await _safe(
        "whatsapp",
        wa.send_message(payload.phone, "Connectivity test from Dealix."),
    )
    stripe_result = await _safe(
        "stripe",
        stripe.create_charge(payload.customer_id, payload.amount_sar),
    )
    voice_result = await _safe(
        "voice",
        voice.trigger_call(payload.company_name, payload.phone, "connectivity_test"),
    )
    contract_result = await _safe(
        "contract",
        contract.request_signature("phase2-connectivity-contract", provider="docusign"),
    )

    parts = [account, wa_result, stripe_result, voice_result, contract_result]
    ok_n = sum(1 for p in parts if p.get("status") == "ok")

    return {
        "tenant_id": payload.tenant_id,
        "summary": {
            "ok_count": ok_n,
            "total": len(parts),
            "note_ar": "البوابة تفحص وجود المتغيرات؛ هذا الاختبار يفحص الشبكة. أخطاء متوقعة مع مفاتيح تجريبية.",
            "note_en": "Go-live gate validates env vars; this call hits real APIs — errors are expected with demo keys.",
        },
        "salesforce": account,
        "whatsapp": wa_result,
        "stripe": stripe_result,
        "voice": voice_result,
        "contract": contract_result,
    }


@router.get("/integrations/live-readiness")
async def live_readiness_report() -> Dict[str, Any]:
    report = build_go_live_readiness_report()
    return {
        "overall": report["overall"],
        "launch_mode": report["launch_mode"],
        "score": report["score"],
        "readiness_percent": report["readiness_percent"],
        "readiness_percent_total": report["readiness_percent_total"],
        "summary": report["summary"],
        "summary_en": report["summary_en"],
        "blocked_reasons": report["blocked_reasons"],
        "checks": report["checks"],
        "categories": report["categories"],
        "blocking": report["blocking"],
        "full_matrix": report["full_matrix"],
        "missing": report["missing"],
        "missing_detail": report["missing_detail"],
        "missing_optional": report["missing_optional"],
        "integration_docs": report["integration_docs"],
        "cli_examples": report["cli_examples"],
        "notes": report["notes"],
    }


@router.get("/integrations/go-live-gate")
async def go_live_gate():
    """
    Blocks production launch until all required env integrations are configured (100%).
    Returns 200 with full report when ready; 403 with the same report shape when blocked.
    """
    report = build_go_live_readiness_report()
    if report["launch_allowed"]:
        return report
    return JSONResponse(status_code=403, content=report)
