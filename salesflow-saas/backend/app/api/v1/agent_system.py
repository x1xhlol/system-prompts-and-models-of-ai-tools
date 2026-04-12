"""
Dealix AI Agent System — REST API
==================================
Endpoints to control and monitor all 22 agents.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import logging

logger = logging.getLogger("dealix.api.agents")
router = APIRouter(prefix="/agent-system", tags=["AI Agent System"])


# ═══ Schemas ═══════════════════════════════════════════════

class AgentTask(BaseModel):
    agent_name: str = Field(..., description="Name of the agent to execute")
    action: str = Field("execute", description="Action to perform")
    params: Dict[str, Any] = Field(default_factory=dict, description="Task parameters")

class ProspectRequest(BaseModel):
    sector: str = "clinics"
    city: str = "الرياض"
    count: int = 20

class EmailRequest(BaseModel):
    lead_name: str
    lead_email: str
    lead_company: str = ""
    lead_sector: str = ""
    sequence: str = "cold_b2b"

class AnalyzeRequest(BaseModel):
    messages: List[Dict] = []
    lead: Dict = {}


class LangGraphDealCycleRequest(BaseModel):
    company_name: str = Field(..., min_length=1, description="Target company for the deal cycle")
    deal_id: str = Field("DEAL-LG-001")
    tenant_id: str = Field("default_tenant")
    decision_maker: str = Field("CEO")
    industry: str = Field("enterprise")
    city: str = Field("Riyadh")


# ═══ Empire Status ═════════════════════════════════════════

@router.get("/empire/status")
async def get_empire_status():
    """Get the full status of the Dealix AI Empire — all 22 agents."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        
        ceo = bus.get_agent("ceo_agent")
        if ceo:
            return ceo.get_empire_status()
        
        return {
            "empire": "Dealix AI",
            "status": "initializing",
            "agents_registered": len(bus.agents),
            "agents": [a.get_status() for a in bus.agents.values()],
        }
    except Exception as e:
        return {"empire": "Dealix AI", "status": "error", "error": str(e)}


@router.get("/list")
async def list_agents():
    """List all registered agents with their status."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        return {
            "total": len(bus.agents),
            "agents": [
                {
                    "name": agent.name,
                    "name_ar": agent.name_ar,
                    "layer": agent.layer,
                    "status": agent.status.value,
                    "capabilities": agent.get_capabilities(),
                    "tasks_completed": agent.metrics.get("tasks_completed", 0),
                }
                for agent in sorted(bus.agents.values(), key=lambda a: a.layer)
            ],
        }
    except Exception as e:
        return {"error": str(e)}


# ═══ Agent Execution ═══════════════════════════════════════

@router.post("/execute")
async def execute_agent_task(task: AgentTask, background_tasks: BackgroundTasks):
    """Execute a task on a specific agent."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        
        agent = bus.get_agent(task.agent_name)
        if not agent:
            raise HTTPException(404, f"Agent '{task.agent_name}' not found. Available: {list(bus.agents.keys())}")
        
        result = await agent.run({
            "action": task.action,
            **task.params,
        })
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


# ═══ Prospector Endpoints ═════════════════════════════════

@router.post("/prospect")
async def prospect_leads(req: ProspectRequest):
    """Discover new leads using the Strategic Prospector Agent."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        
        prospector = bus.get_agent("strategic_prospector")
        if not prospector:
            raise HTTPException(500, "Prospector agent not available")
        
        result = await prospector.run({
            "action": "discover",
            "sector": req.sector,
            "city": req.city,
            "count": req.count,
        })
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/prospect/sectors")
async def get_sectors():
    """Get all available Saudi sectors for prospecting."""
    try:
        from app.agents.discovery.prospector_agent import SAUDI_SECTORS, SAUDI_CITIES
        return {
            "sectors": {
                key: {
                    "name_ar": val["name_ar"],
                    "name_en": val["name_en"],
                    "priority_score": val["priority_score"],
                    "avg_deal_size": val["avg_deal_size"],
                    "sales_cycle_days": val["sales_cycle_days"],
                }
                for key, val in SAUDI_SECTORS.items()
            },
            "cities": [
                {"name": c["name"], "en": c["en"], "priority": c["priority"]}
                for c in SAUDI_CITIES
            ],
        }
    except Exception as e:
        return {"error": str(e)}


@router.post("/prospect/market-analysis")
async def analyze_market(sector: str = "clinics", city: str = "الرياض"):
    """Run AI-powered market opportunity analysis."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        
        prospector = bus.get_agent("strategic_prospector")
        if not prospector:
            raise HTTPException(500, "Prospector agent not available")
        
        result = await prospector.run({
            "action": "analyze_market",
            "sector": sector,
            "city": city,
        })
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


# ═══ Email Endpoints ══════════════════════════════════════

@router.post("/email/start-sequence")
async def start_email_sequence(req: EmailRequest):
    """Start an automated email sequence for a lead."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        
        email_agent = bus.get_agent("email_agent")
        if not email_agent:
            raise HTTPException(500, "Email agent not available")
        
        result = await email_agent.run({
            "action": "start_sequence",
            "lead": {
                "name": req.lead_name,
                "email": req.lead_email,
                "company": req.lead_company,
                "sector": req.lead_sector,
            },
            "sequence": req.sequence,
        })
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


# ═══ Intelligence Endpoints ═══════════════════════════════

@router.post("/intelligence/analyze-conversation")
async def analyze_conversation(req: AnalyzeRequest):
    """Analyze a sales conversation — Gong-style intelligence."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        
        intel = bus.get_agent("conversation_intel")
        if not intel:
            raise HTTPException(500, "Conversation Intel agent not available")
        
        result = await intel.run({
            "action": "analyze_conversation",
            "messages": req.messages,
            "lead": req.lead,
        })
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/intelligence/deal-health")
async def assess_deal_health(lead: Dict):
    """Assess the health of a deal — Clari-style intelligence."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        
        intel = bus.get_agent("conversation_intel")
        if not intel:
            raise HTTPException(500, "Conversation Intel agent not available")
        
        result = await intel.run({
            "action": "deal_health",
            "lead": lead,
        })
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


# ═══ Revenue Forecast ═════════════════════════════════════

@router.post("/forecast/revenue")
async def forecast_revenue(pipeline_data: Dict = {}):
    """AI-powered revenue forecasting."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        
        forecaster = bus.get_agent("revenue_forecast")
        if not forecaster:
            raise HTTPException(500, "Revenue Forecast agent not available")
        
        result = await forecaster.run({
            "action": "forecast",
            "pipeline_data": pipeline_data,
        })
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


# ═══ CEO Agent Operations ════════════════════════════════


@router.get("/langgraph/health")
async def langgraph_orchestrator_health():
    """LangGraph compiler status — for launch checks and ops dashboards."""
    try:
        from app.agents import get_agent_system
        from app.agents.master_langgraph import CEOLangGraphOrchestrator, GRAPH_VERSION, LANGGRAPH_AVAILABLE

        bus = get_agent_system()
        ceo = bus.get_agent("ceo_agent")
        orch = getattr(ceo, "orchestrator", None) if ceo else None
        if orch is not None:
            detail = orch.describe()
        else:
            detail = CEOLangGraphOrchestrator().describe()
        detail["langgraph_import_ok"] = LANGGRAPH_AVAILABLE
        detail["graph_version_constant"] = GRAPH_VERSION
        return detail
    except Exception as e:
        logger.exception("langgraph health")
        return {"error": str(e), "langgraph_import_ok": False}


@router.post("/ceo/langgraph-deal-cycle")
async def ceo_langgraph_deal_cycle(body: LangGraphDealCycleRequest):
    """Run one full CEO deal DAG (prospecting → gate → compliance → HITL → outreach → self-improve)."""
    try:
        from app.agents import get_agent_system

        bus = get_agent_system()
        ceo = bus.get_agent("ceo_agent")
        if not ceo:
            raise HTTPException(status_code=500, detail="CEO Agent not available")

        wrapped = await ceo.run(
            {
                "action": "langgraph_deal_cycle",
                "deal_state": body.model_dump(),
            }
        )
        if wrapped.get("status") != "success":
            raise HTTPException(
                status_code=500,
                detail=wrapped.get("error") or wrapped.get("result") or str(wrapped),
            )
        result = wrapped.get("result", wrapped)
        if isinstance(result, dict) and result.get("error"):
            raise HTTPException(status_code=500, detail=str(result["error"]))
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("langgraph deal cycle")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ceo/daily-cycle")
async def run_daily_cycle(background_tasks: BackgroundTasks):
    """Trigger the CEO Agent's full daily autonomous cycle."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        
        ceo = bus.get_agent("ceo_agent")
        if not ceo:
            raise HTTPException(500, "CEO Agent not available")
        
        background_tasks.add_task(ceo.run, {"action": "daily_cycle"})
        return {"status": "daily_cycle_triggered", "message": "CEO Agent is running the full daily cycle"}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/ceo/optimize")
async def optimize_strategy(performance_data: Dict = {}):
    """Let the CEO Agent optimize the sales strategy based on performance."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        
        ceo = bus.get_agent("ceo_agent")
        if not ceo:
            raise HTTPException(500, "CEO Agent not available")
        
        result = await ceo.run({
            "action": "optimize_strategy",
            "performance_data": performance_data,
        })
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


# ═══ WhatsApp Campaign ════════════════════════════════════

class WhatsAppCampaignRequest(BaseModel):
    template: str = "cold_intro_general"
    leads: List[Dict] = []

@router.post("/whatsapp/campaign")
async def send_whatsapp_campaign(req: WhatsAppCampaignRequest, background_tasks: BackgroundTasks):
    """Send a WhatsApp campaign to multiple leads."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        wa = bus.get_agent("whatsapp_agent")
        if not wa:
            raise HTTPException(500, "WhatsApp agent not available")
        background_tasks.add_task(wa.run, {
            "action": "send_campaign", "leads": req.leads, "template": req.template
        })
        return {"status": "campaign_started", "leads_count": len(req.leads), "template": req.template}
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/whatsapp/stats")
async def get_whatsapp_stats():
    """Get WhatsApp agent campaign stats."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        wa = bus.get_agent("whatsapp_agent")
        if not wa:
            return {"sent": 0, "replies": 0}
        result = await wa.run({"action": "stats"})
        return result.get("result", {})
    except Exception as e:
        return {"error": str(e)}

@router.get("/whatsapp/templates")
async def get_whatsapp_templates():
    """Get all available WhatsApp message templates."""
    try:
        from app.agents.engagement.channels import WhatsAppSalesAgent
        return {"templates": list(WhatsAppSalesAgent.MESSAGE_TEMPLATES.keys())}
    except Exception as e:
        return {"error": str(e)}


# ═══ Content Generation ═══════════════════════════════════

class ContentRequest(BaseModel):
    content_type: str = "message"
    lead: Dict = {}
    topic: str = ""
    channel: str = "whatsapp"

@router.post("/content/generate")
async def generate_content(req: ContentRequest):
    """Generate AI sales content — messages, proposals, case studies, social posts."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        agent = bus.get_agent("content_agent")
        if not agent:
            raise HTTPException(500, "Content agent not available")
        result = await agent.run({
            "action": "generate", "type": req.content_type,
            "lead": req.lead, "topic": req.topic, "channel": req.channel,
        })
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


# ═══ CRM Pipeline ═════════════════════════════════════════

class DealRequest(BaseModel):
    company: str
    contact: str = ""
    value: int = 0
    sector: str = ""
    city: str = ""

@router.post("/crm/deal")
async def create_deal(req: DealRequest):
    """Create a new deal in the CRM pipeline."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        crm = bus.get_agent("crm_agent")
        if not crm:
            raise HTTPException(500, "CRM agent not available")
        result = await crm.run({
            "action": "create_deal", "company": req.company,
            "contact": req.contact, "value": req.value,
            "sector": req.sector, "city": req.city,
        })
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/crm/pipeline")
async def get_pipeline():
    """Get the full CRM pipeline view."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        crm = bus.get_agent("crm_agent")
        if not crm:
            return {"pipeline": {}, "total_deals": 0}
        result = await crm.run({"action": "pipeline_view"})
        return result.get("result", {})
    except Exception as e:
        return {"error": str(e)}


# ═══ Lead Qualification ═══════════════════════════════════

@router.post("/qualify/lead")
async def qualify_lead(lead: Dict):
    """Qualify a lead using BANT methodology + AI."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        qualifier = bus.get_agent("lead_qualifier")
        if not qualifier:
            raise HTTPException(500, "Qualifier not available")
        result = await qualifier.run({"action": "qualify", "lead": lead})
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/qualify/score")
async def score_lead(lead: Dict):
    """Score a lead from 0-100."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        scorer = bus.get_agent("lead_scorer")
        if not scorer:
            raise HTTPException(500, "Scorer not available")
        result = await scorer.run({"action": "score", "lead": lead})
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/qualify/intent")
async def detect_intent(message: str, context: Dict = {}):
    """Detect the intent of a customer message."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        detector = bus.get_agent("intent_detector")
        if not detector:
            raise HTTPException(500, "Intent Detector not available")
        result = await detector.run({"action": "detect", "message": message, "context": context})
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


# ═══ Close & Objections ═══════════════════════════════════

@router.post("/close/handle-objection")
async def handle_objection(objection: str, lead: Dict = {}):
    """Handle a sales objection with AI."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        closer = bus.get_agent("closer_agent")
        if not closer:
            raise HTTPException(500, "Closer not available")
        result = await closer.run({"action": "handle_objection", "objection": objection, "lead": lead})
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/close/proposal")
async def generate_proposal(lead: Dict):
    """Generate a professional sales proposal."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        closer = bus.get_agent("closer_agent")
        if not closer:
            raise HTTPException(500, "Closer not available")
        result = await closer.run({"action": "generate_proposal", "lead": lead})
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


# ═══ Market Intelligence ══════════════════════════════════

@router.get("/market/competitors")
async def analyze_competitors(sector: str = ""):
    """Analyze competitors in a given sector."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        intel = bus.get_agent("market_intel")
        if not intel:
            raise HTTPException(500, "Market Intel not available")
        result = await intel.run({"action": "competitors", "sector": sector})
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/market/opportunities")
async def find_opportunities():
    """Find new market opportunities."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        intel = bus.get_agent("market_intel")
        if not intel:
            raise HTTPException(500, "Market Intel not available")
        result = await intel.run({"action": "opportunities"})
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


# ═══ System Overview ══════════════════════════════════════

@router.get("/overview")
async def agent_system_overview():
    """Complete overview of the Dealix AI Agent System."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        
        layers = {}
        for agent in bus.agents.values():
            layers.setdefault(agent.layer, []).append({
                "name": agent.name,
                "name_ar": agent.name_ar,
                "status": agent.status.value,
                "capabilities_count": len(agent.get_capabilities()),
                "tasks_done": agent.metrics.get("tasks_completed", 0),
            })
        
        layer_names = {
            1: "Infrastructure", 2: "Discovery", 3: "Qualification",
            4: "Engagement", 5: "Revenue", 6: "Intelligence", 7: "Master",
        }
        
        return {
            "system": "Dealix AI Empire",
            "version": "3.0",
            "total_agents": len(bus.agents),
            "layers": {
                f"L{k} — {layer_names.get(k, '')}": v
                for k, v in sorted(layers.items())
            },
            "api_endpoints": {
                "Empire": ["/agent-system/empire/status", "/agent-system/list", "/agent-system/overview"],
                "Discovery": [
                    "/agent-system/prospect",
                    "/agent-system/prospect/sectors",
                    "/agent-system/prospect/market-analysis",
                    "/agent-system/leads/discover",
                    "/agent-system/leads/sources",
                    "/agent-system/leads/verify-phone",
                ],
                "Engagement": [
                    "/agent-system/whatsapp/campaign",
                    "/agent-system/whatsapp/stats",
                    "/agent-system/email/start-sequence",
                ],
                "Qualification": [
                    "/agent-system/qualify/lead",
                    "/agent-system/qualify/score",
                    "/agent-system/qualify/intent",
                ],
                "Revenue": [
                    "/agent-system/close/handle-objection",
                    "/agent-system/close/proposal",
                    "/agent-system/forecast/revenue",
                ],
                "Intelligence": [
                    "/agent-system/intelligence/analyze-conversation",
                    "/agent-system/intelligence/deal-health",
                    "/agent-system/market/competitors",
                ],
                "CRM": ["/agent-system/crm/deal", "/agent-system/crm/pipeline"],
                "Content": ["/agent-system/content/generate"],
                "CEO": ["/agent-system/ceo/daily-cycle", "/agent-system/ceo/optimize"],
            },
        }
    except Exception as e:
        return {"error": str(e)}


# ═══ Lead Engine — Multi-Source Discovery ═════════════════

class LeadDiscoveryRequest(BaseModel):
    sector: str = "clinics"
    city: str = "الرياض"
    count: int = 20

@router.post("/leads/discover")
async def discover_leads(req: LeadDiscoveryRequest, background_tasks: BackgroundTasks):
    """Full multi-source lead discovery with phone verification."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        engine = bus.get_agent("lead_engine")
        if not engine:
            raise HTTPException(500, "Lead Engine not available")
        result = await engine.run({
            "action": "discover", "sector": req.sector,
            "city": req.city, "count": req.count,
        })
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/leads/sources")
async def list_lead_sources():
    """List all 12+ available lead sources and their capabilities."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        engine = bus.get_agent("lead_engine")
        if not engine:
            from app.agents.discovery.lead_engine import LEAD_SOURCES
            return {"sources": LEAD_SOURCES, "total": len(LEAD_SOURCES)}
        result = await engine.run({"action": "sources"})
        return result.get("result", {})
    except Exception as e:
        return {"error": str(e)}

class PhoneVerifyRequest(BaseModel):
    phone: str = ""
    phones: List[str] = []

@router.post("/leads/verify-phone")
async def verify_phone(req: PhoneVerifyRequest):
    """Verify Saudi phone numbers — mobile/landline/WhatsApp check."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        engine = bus.get_agent("lead_engine")
        if not engine:
            raise HTTPException(500, "Lead Engine not available")
        if req.phones:
            result = await engine.run({"action": "verify_batch", "phones": req.phones})
        else:
            result = await engine.run({"action": "verify_phone", "phone": req.phone})
        return result.get("result", result)
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/leads/quality")
async def lead_quality_report():
    """Get a data quality report for discovered leads."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        engine = bus.get_agent("lead_engine")
        if not engine:
            return {"total": 0}
        result = await engine.run({"action": "quality_report"})
        return result.get("result", {})
    except Exception as e:
        return {"error": str(e)}

@router.get("/leads/stats")
async def lead_engine_stats():
    """Get current Lead Engine stats."""
    try:
        from app.agents import get_agent_system
        bus = get_agent_system()
        engine = bus.get_agent("lead_engine")
        if not engine:
            return {"total_discovered": 0}
        result = await engine.run({"action": "stats"})
        return result.get("result", result)
    except Exception as e:
        return {"error": str(e)}
