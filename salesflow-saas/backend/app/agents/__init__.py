"""
Dealix AI Agent System — Complete Package Init
================================================
All 27 Agents across 7 Layers, managed by the CEO Agent.

Layer 1 — Infrastructure (6): CRM, Analytics, Report, Security, Scheduler, Onboarding
Layer 2 — Discovery (3): Strategic Prospector, Data Enricher, Company Researcher
Layer 3 — Qualification (3): Lead Qualifier, Lead Scorer, Intent Detector
Layer 4 — Engagement (5): WhatsApp, Email, Voice, LinkedIn, Content
Layer 5 — Revenue (3): Closer, Pricing, Revenue Forecast
Layer 6 — Intelligence (3): Conversation Intel, Revenue Intel, Market Intel
Layer 7 — Master (1): CEO Agent
"""

from app.agents.base_agent import (
    BaseAgent, AgentStatus, AgentPriority,
    AgentMessage, AgentMessageBus, get_message_bus,
)

__all__ = [
    "BaseAgent", "AgentStatus", "AgentPriority", "AgentMessage",
    "AgentMessageBus", "get_message_bus", "initialize_agents", "get_agent_system",
]


def initialize_agents():
    """Initialize and register ALL agents with the message bus."""
    bus = get_message_bus()
    
    # ═══ Layer 1: Infrastructure ═══
    try:
        from app.agents.infrastructure.core import (
            CRMAgent, AnalyticsAgent, ReportAgent, SecurityAgent, SchedulerAgent,
        )
        bus.register(CRMAgent())
        bus.register(AnalyticsAgent())
        bus.register(ReportAgent())
        bus.register(SecurityAgent())
        bus.register(SchedulerAgent())
    except Exception as e:
        print(f"⚠️ Layer 1 partial: {e}")

    try:
        from app.agents.engagement.channels import OnboardingAgent
        bus.register(OnboardingAgent())
    except Exception as e:
        print(f"⚠️ Onboarding: {e}")

    # ═══ Layer 2: Discovery ═══
    try:
        from app.agents.discovery.prospector_agent import StrategicProspectorAgent
        from app.agents.discovery.enrichment import DataEnricherAgent, CompanyResearcherAgent
        from app.agents.discovery.lead_engine import LeadEngine
        bus.register(StrategicProspectorAgent())
        bus.register(DataEnricherAgent())
        bus.register(CompanyResearcherAgent())
        bus.register(LeadEngine())
    except Exception as e:
        print(f"⚠️ Layer 2 partial: {e}")

    # ═══ Layer 3: Qualification ═══
    try:
        from app.agents.qualification.qualifiers import (
            LeadQualifierAgent, LeadScorerAgent, IntentDetectorAgent,
        )
        bus.register(LeadQualifierAgent())
        bus.register(LeadScorerAgent())
        bus.register(IntentDetectorAgent())
    except Exception as e:
        print(f"⚠️ Layer 3 partial: {e}")

    # ═══ Layer 4: Engagement ═══
    try:
        from app.agents.engagement.multi_channel import EmailAgent, VoiceAgent
        from app.agents.engagement.channels import (
            WhatsAppSalesAgent, LinkedInAgent, ContentAgent,
        )
        bus.register(WhatsAppSalesAgent())
        bus.register(EmailAgent())
        bus.register(VoiceAgent())
        bus.register(LinkedInAgent())
        bus.register(ContentAgent())
    except Exception as e:
        print(f"⚠️ Layer 4 partial: {e}")

    # ═══ Layer 5: Revenue ═══
    try:
        from app.agents.revenue.closers import CloserAgent, PricingAgent
        from app.agents.engagement.multi_channel import RevenueForecastAgent
        bus.register(CloserAgent())
        bus.register(PricingAgent())
        bus.register(RevenueForecastAgent())
    except Exception as e:
        print(f"⚠️ Layer 5 partial: {e}")

    # ═══ Layer 6: Intelligence ═══
    try:
        from app.agents.engagement.multi_channel import ConversationIntelAgent
        from app.agents.engagement.channels import RevenueIntelAgent
        from app.agents.revenue.closers import MarketIntelAgent
        bus.register(ConversationIntelAgent())
        bus.register(RevenueIntelAgent())
        bus.register(MarketIntelAgent())
    except Exception as e:
        print(f"⚠️ Layer 6 partial: {e}")

    # ═══ Layer 7: Master ═══
    try:
        from app.agents.master_agent import CEOAgent
        bus.register(CEOAgent())
    except Exception as e:
        print(f"⚠️ Layer 7: {e}")

    # ═══ Startup Report ═══
    total = len(bus.agents)
    print(f"\n{'='*60}")
    print(f"  🤖 DEALIX AI EMPIRE — {total} AGENTS ONLINE")
    print(f"{'='*60}")
    
    layers = {}
    for agent in bus.agents.values():
        layers.setdefault(agent.layer, []).append(agent)
    
    layer_names = {
        1: "⚙️  Infrastructure",
        2: "🔍 Discovery",
        3: "🧪 Qualification",
        4: "🤝 Engagement",
        5: "💰 Revenue",
        6: "📊 Intelligence",
        7: "👑 Master",
    }
    
    for layer_num in sorted(layers.keys()):
        agents = layers[layer_num]
        name = layer_names.get(layer_num, f"Layer {layer_num}")
        print(f"\n  L{layer_num} │ {name} ({len(agents)} agents)")
        for agent in agents:
            print(f"     ├─ {agent.name_ar} ({agent.name})")
    
    print(f"\n{'='*60}")
    print(f"  ✅ System Ready — {total} agents registered")
    print(f"{'='*60}\n")
    
    return bus


def get_agent_system():
    """Get or initialize the agent system."""
    bus = get_message_bus()
    if not bus.agents:
        initialize_agents()
    return bus
