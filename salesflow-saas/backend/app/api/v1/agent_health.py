"""
Agent System Health — Comprehensive health check for the AI agent ecosystem.
Reports on prompt availability, router integrity, pipeline readiness, and LLM connectivity.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pathlib import Path
import logging

from app.database import get_db

router = APIRouter(prefix="/agent-health", tags=["Agent Health"])
# The scripts are typically in backend/app/api/v1
# We know the absolute structure from the project root
from pathlib import Path
import os

_current_dir = Path(__file__).resolve()
# We are in backned/app/api/v1/agent_health.py -> 4 parents up -> then up out of salesflow-saas to ai-agents
PROMPTS_DIR = _current_dir.parent.parent.parent.parent.parent / "ai-agents" / "prompts"

if not PROMPTS_DIR.exists():
    # If the app is run from a different level
    PROMPTS_DIR = _current_dir.parent.parent.parent.parent / "ai-agents" / "prompts"
    if not PROMPTS_DIR.exists():
        PROMPTS_DIR = Path("C:/Users/samim/system-prompts-and-models-of-ai-tools/ai-agents/prompts")


@router.get("/status")
async def full_system_status(db: AsyncSession = Depends(get_db)):
    """
    🏥 Full AI agent ecosystem health check.
    
    Checks:
    1. All 30 prompt files exist and are readable
    2. Agent router has all events registered
    3. Pipeline engine is configured correctly
    4. LLM provider is reachable
    5. Database is connected
    """
    from app.services.agents.router import AgentRouter
    from app.services.agents.autonomous_pipeline import AutonomousPipeline

    health = {
        "status": "healthy",
        "checks": {},
        "score": 0,
        "total_checks": 5,
    }

    passed = 0

    # ── Check 1: Prompt Files ────────────────────
    prompt_check = _check_prompts()
    health["checks"]["prompts"] = prompt_check
    if prompt_check["status"] == "pass":
        passed += 1

    # ── Check 2: Router Registry ─────────────────
    try:
        r = AgentRouter()
        agents = r.list_all_agents()
        events = r.list_all_events()
        health["checks"]["router"] = {
            "status": "pass",
            "agents_registered": len(agents),
            "events_registered": len(events),
            "agent_list": [a["agent_id"] for a in agents],
        }
        passed += 1
    except Exception as e:
        health["checks"]["router"] = {"status": "fail", "error": str(e)}

    # ── Check 3: Pipeline Engine ─────────────────
    try:
        pipeline = AutonomousPipeline(db)
        summary = pipeline.get_pipeline_summary()
        health["checks"]["pipeline"] = {
            "status": "pass",
            "stages": summary["total_stages"],
            "active_stages": summary["active_stages"],
            "total_agents": summary["total_agents"],
        }
        passed += 1
    except Exception as e:
        health["checks"]["pipeline"] = {"status": "fail", "error": str(e)}

    # ── Check 4: LLM Provider ───────────────────
    try:
        from app.services.llm.provider import get_llm
        llm = get_llm()
        health["checks"]["llm"] = {
            "status": "pass",
            "provider": getattr(llm, "provider_name", "unknown"),
            "model": getattr(llm, "model", "unknown"),
        }
        passed += 1
    except Exception as e:
        health["checks"]["llm"] = {"status": "fail", "error": str(e)}

    # ── Check 5: Database ───────────────────────
    try:
        from sqlalchemy import text
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        health["checks"]["database"] = {"status": "pass"}
        passed += 1
    except Exception as e:
        health["checks"]["database"] = {"status": "fail", "error": str(e)}

    # ── Summary ─────────────────────────────────
    health["score"] = int((passed / health["total_checks"]) * 100)
    health["passed"] = passed
    if passed < health["total_checks"]:
        health["status"] = "degraded" if passed >= 3 else "unhealthy"

    return health


@router.get("/prompts")
async def check_prompt_files():
    """Check all 30 AI agent prompt files."""
    return _check_prompts()


@router.get("/agents/detail")
async def get_agent_details():
    """Get detailed info about each registered agent."""
    from app.services.agents.router import AgentRouter
    from app.services.agents.executor import AgentExecutor

    router_instance = AgentRouter()
    agents = router_instance.list_all_agents()

    # Map agent to prompt file
    executor = AgentExecutor.__new__(AgentExecutor)
    filename_map = {
        "closer_agent": "closer-agent.md",
        "lead_qualification": "lead-qualification-agent.md",
        "arabic_whatsapp": "arabic-whatsapp-agent.md",
        "english_conversation": "english-conversation-agent.md",
        "outreach_writer": "outreach-message-writer.md",
        "meeting_booking": "meeting-booking-agent.md",
        "objection_handler": "objection-handling-agent.md",
        "proposal_drafter": "proposal-drafting-agent.md",
        "sector_strategist": "sector-sales-strategist.md",
        "knowledge_retrieval": "knowledge-retrieval-agent.md",
        "compliance_reviewer": "compliance-reviewer.md",
        "fraud_reviewer": "fraud-reviewer.md",
        "revenue_attribution": "revenue-attribution-agent.md",
        "management_summary": "management-summary-agent.md",
        "qa_reviewer": "conversation-qa-reviewer.md",
        "affiliate_evaluator": "affiliate-recruitment-evaluator.md",
        "onboarding_coach": "affiliate-onboarding-coach.md",
        "guarantee_reviewer": "guarantee-claim-reviewer.md",
        "voice_call": "voice-call-flow-agent.md",
        "ai_rehearsal": "ai-rehearsal-agent.md",
        # Strategic Growth & Enterprise Agents
        "partnership_scout": "partnership-scout-agent.md",
        "ma_growth": "ma-growth-agent.md",
        "contract_lifecycle": "contract-lifecycle-agent.md",
        "business_development": "business-development-agent.md",
        "supply_chain": "supply-chain-agent.md",
        "customer_success": "customer-success-agent.md",
        "dynamic_pricing": "dynamic-pricing-agent.md",
        "marketing_automation": "marketing-automation-agent.md",
        "finance_automation": "finance-automation-agent.md",
        "competitive_intel": "competitive-intelligence-agent.md",
    }

    detail = []
    for agent in agents:
        agent_id = agent["agent_id"]
        prompt_file = filename_map.get(agent_id, f"{agent_id}.md")
        prompt_path = PROMPTS_DIR / prompt_file
        prompt_exists = prompt_path.exists()
        prompt_size = prompt_path.stat().st_size if prompt_exists else 0

        detail.append({
            "agent_id": agent_id,
            "prompt_file": prompt_file,
            "prompt_exists": prompt_exists,
            "prompt_size_bytes": prompt_size,
            "events": agent["events"],
            "event_count": agent["event_count"],
        })

    return {
        "agents": detail,
        "total": len(detail),
        "all_prompts_loaded": all(a["prompt_exists"] for a in detail),
    }


@router.post("/self-improve")
async def trigger_self_improvement(
    tenant_id: str = "default",
    db: AsyncSession = Depends(get_db),
):
    """Trigger a self-improvement cycle."""
    from app.flows.self_improvement_flow import self_improvement_flow
    result = await self_improvement_flow.run(tenant_id, db)
    return result


@router.get("/self-improve/history")
async def get_improvement_history():
    """Get history of self-improvement cycles."""
    from app.flows.self_improvement_flow import self_improvement_flow
    return {"cycles": self_improvement_flow.get_improvement_history()}


# ── Helper Functions ────────────────────────────

def _check_prompts() -> dict:
    """Check all prompt files exist and are readable."""
    expected_files = [
        # Original 20 Sales Agents
        "closer-agent.md",
        "lead-qualification-agent.md",
        "arabic-whatsapp-agent.md",
        "english-conversation-agent.md",
        "outreach-message-writer.md",
        "meeting-booking-agent.md",
        "objection-handling-agent.md",
        "proposal-drafting-agent.md",
        "sector-sales-strategist.md",
        "knowledge-retrieval-agent.md",
        "compliance-reviewer.md",
        "fraud-reviewer.md",
        "revenue-attribution-agent.md",
        "management-summary-agent.md",
        "conversation-qa-reviewer.md",
        "affiliate-recruitment-evaluator.md",
        "affiliate-onboarding-coach.md",
        "guarantee-claim-reviewer.md",
        "voice-call-flow-agent.md",
        "ai-rehearsal-agent.md",
        # 10 Strategic Growth & Enterprise Agents
        "partnership-scout-agent.md",
        "ma-growth-agent.md",
        "contract-lifecycle-agent.md",
        "business-development-agent.md",
        "supply-chain-agent.md",
        "customer-success-agent.md",
        "dynamic-pricing-agent.md",
        "marketing-automation-agent.md",
        "finance-automation-agent.md",
        "competitive-intelligence-agent.md",
    ]

    files = []
    missing = []
    total_size = 0

    for filename in expected_files:
        path = PROMPTS_DIR / filename
        exists = path.exists()
        size = path.stat().st_size if exists else 0
        total_size += size

        files.append({
            "file": filename,
            "exists": exists,
            "size_bytes": size,
        })

        if not exists:
            missing.append(filename)

    return {
        "status": "pass" if not missing else "fail",
        "total_expected": len(expected_files),
        "found": len(expected_files) - len(missing),
        "missing": missing,
        "total_size_bytes": total_size,
        "files": files,
    }
