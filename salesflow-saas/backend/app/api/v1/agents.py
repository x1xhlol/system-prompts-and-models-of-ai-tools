"""
Manus-Style Agent Orchestration API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Any
import os

router = APIRouter(prefix="/agents", tags=["🤖 Manus Agents"])


class GoalRequest(BaseModel):
    goal: str
    context: Optional[dict] = None


class LeadRequest(BaseModel):
    name: str
    phone: str
    budget: Optional[float] = None
    property_type: Optional[str] = None
    region: Optional[str] = "الرياض"
    source: Optional[str] = "whatsapp"


class WhatsAppRequest(BaseModel):
    message: str
    customer_phone: str
    customer_name: Optional[str] = None


def get_orchestrator_instance():
    from app.services.agents.manus_orchestrator import get_orchestrator
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    return get_orchestrator(api_key)


@router.post("/execute")
async def execute_goal(request: GoalRequest):
    """
    🧠 Execute any goal using the Manus-style multi-agent orchestration.
    The orchestrator will coordinate the right sub-agents automatically.
    """
    orchestrator = get_orchestrator_instance()
    result = await orchestrator.execute_goal(request.goal, request.context)
    return result


@router.post("/process-lead")
async def process_lead(lead: LeadRequest):
    """
    🎯 Process a new lead through the full autonomous sales pipeline.
    Uses: Researcher → Qualifier → Outreach agents.
    """
    orchestrator = get_orchestrator_instance()
    result = await orchestrator.process_lead(lead.model_dump())
    return result


@router.post("/whatsapp-reply")
async def generate_whatsapp_reply(request: WhatsAppRequest):
    """
    💬 Generate an intelligent WhatsApp reply using the Outreach + Closer agents.
    """
    orchestrator = get_orchestrator_instance()
    customer_data = {
        "phone": request.customer_phone,
        "name": request.customer_name or "العميل"
    }
    result = await orchestrator.handle_whatsapp_message(request.message, customer_data)
    return result


@router.get("/market-report/{region}")
async def get_market_report(region: str = "الرياض"):
    """
    📊 Generate a comprehensive market analysis report for a Saudi region.
    Uses: Researcher + Analytics agents.
    """
    orchestrator = get_orchestrator_instance()
    result = await orchestrator.generate_market_report(region)
    return result


@router.post("/close-deal")
async def close_deal(deal: dict):
    """
    🤝 Run the deal-closing pipeline with compliance verification.
    Uses: Closer + Compliance agents.
    """
    orchestrator = get_orchestrator_instance()
    result = await orchestrator.close_deal(deal)
    return result


@router.get("/status")
async def agents_status():
    """
    ❤️ Check the status of all Manus-style agents.
    """
    return {
        "status": "operational",
        "architecture": "Manus-inspired hierarchical multi-agent",
        "agents": [
            {"role": "orchestrator", "model": "llama-3.3-70b-versatile", "status": "active"},
            {"role": "researcher", "model": "llama-3.1-8b-instant", "status": "active"},
            {"role": "qualifier", "model": "llama-3.1-8b-instant", "status": "active"},
            {"role": "outreach", "model": "llama-3.1-8b-instant", "status": "active"},
            {"role": "closer", "model": "llama-3.3-70b-versatile", "status": "active"},
            {"role": "compliance", "model": "llama-3.3-70b-versatile", "status": "active"},
            {"role": "analytics", "model": "llama-3.1-8b-instant", "status": "active"},
            {"role": "memory", "model": "llama-3.1-8b-instant", "status": "active"},
        ],
        "capabilities": [
            "Autonomous lead processing",
            "WhatsApp conversation handling",
            "Saudi market research",
            "Deal closing negotiation",
            "ZATCA compliance verification",
            "Revenue analytics",
        ],
        "powered_by": "Groq + llama-3.3-70b",
        "inspired_by": "Manus AI (Monica, 2025)"
    }
