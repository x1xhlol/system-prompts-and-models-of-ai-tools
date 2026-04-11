"""
Layer 7: CEO Agent — The Master Orchestrator
=============================================
The brain that runs the entire Dealix sales operation.

Daily Autonomous Routine:
06:00 — System health check
07:00 — Run prospector (discover 100+ companies)
08:00 — Launch morning campaigns (WhatsApp + Email)
12:00 — Process replies + smart follow-ups
16:00 — Analyze daily performance
20:00 — Send CEO daily report
22:00 — Plan tomorrow's strategy
"""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List

try:
    from app.agents.master_langgraph import CEOLangGraphOrchestrator, build_ceo_deal_state

    LANGGRAPH_MASTER_AVAILABLE = True
except ImportError:
    CEOLangGraphOrchestrator = None  # type: ignore[misc, assignment]
    build_ceo_deal_state = None  # type: ignore[misc, assignment]
    LANGGRAPH_MASTER_AVAILABLE = False

try:
    from app.services.salesforce_agentforce import agentforce_service
except ImportError:
    agentforce_service = None

from app.agents.base_agent import BaseAgent, AgentPriority, get_message_bus

logger = logging.getLogger("dealix.agents.ceo")


class CEOAgent(BaseAgent):
    """
    The Master Orchestrator — manages all 21 other agents.
    
    Responsibilities:
    1. Strategic decision making (which sector, which city, which channel)
    2. Resource allocation (budget, API credits, message limits)
    3. Performance monitoring (which agents are performing, which aren't)
    4. Autonomous daily operations (run the entire sales machine)
    5. Continuous optimization (learn from results, improve strategy)
    """

    def __init__(self):
        super().__init__(
            name="ceo_agent",
            name_ar="المدير العام الذكي",
            layer=7,
            description="يدير جميع الوكلاء الأذكياء ويتخذ القرارات الاستراتيجية ذاتياً",
        )
        self.daily_targets = {
            "leads_to_discover": 100,
            "messages_to_send": 50,
            "followups_to_process": 30,
            "meetings_to_book": 5,
        }
        self.strategy = {
            "priority_sectors": ["clinics", "real_estate", "manufacturing"],
            "priority_cities": ["الرياض", "جدة", "الدمام"],
            "primary_channel": "whatsapp",
            "secondary_channel": "email",
            "message_style": "ceo_personal",
            "budget_mode": "free_tier",
        }
        self.orchestrator = (
            CEOLangGraphOrchestrator()
            if LANGGRAPH_MASTER_AVAILABLE and CEOLangGraphOrchestrator
            else None
        )

    def get_capabilities(self) -> List[str]:
        return [
            "إدارة 22 وكيل ذكي (7 طبقات)",
            "اتخاذ قرارات استراتيجية ذاتياً",
            "تشغيل دورة مبيعات يومية كاملة",
            "توزيع الموارد والميزانية",
            "مراقبة أداء كل وكيل",
            "تحسين الاستراتيجية باستمرار",
            "إرسال تقرير يومي للمدير التنفيذي",
            "التعلم من النتائج والتكيّف",
            "دورة صفقة كاملة عبر LangGraph (استكشاف، بوابة استراتيجية، امتثال، HITL، تفاعل)",
        ]

    async def execute(self, task: Dict) -> Dict:
        action = task.get("action", "status")
        
        if action == "daily_cycle":
            return await self.run_daily_cycle()
        elif action == "morning_operations":
            return await self.morning_operations()
        elif action == "afternoon_operations":
            return await self.afternoon_operations()
        elif action == "langgraph_deal_cycle":
            return await self.run_langgraph_deal_cycle(task.get("deal_state", {}))
        elif action == "evening_report":
            return await self.evening_report()
        elif action == "optimize_strategy":
            return await self.optimize_strategy(task.get("performance_data", {}))
        elif action == "status":
            return self.get_empire_status()
        
        return {"error": f"Unknown action: {action}"}

    # ══════════════════════════════════════════════════
    # Daily Autonomous Cycle
    # ══════════════════════════════════════════════════

    async def run_daily_cycle(self) -> Dict:
        """Run the complete daily autonomous sales cycle."""
        cycle_start = datetime.now(timezone.utc)
        logger.info(f"🌅 [{self.name}] === DAILY CYCLE STARTED ===")
        
        results = {
            "cycle_start": cycle_start.isoformat(),
            "phases": {},
        }

        # Phase 1: Morning — Discovery & Outreach
        try:
            results["phases"]["morning"] = await self.morning_operations()
        except Exception as e:
            results["phases"]["morning"] = {"error": str(e)}
            logger.error(f"Morning operations error: {e}")

        # Phase 2: Afternoon — Follow-ups & Engagement
        try:
            results["phases"]["afternoon"] = await self.afternoon_operations()
        except Exception as e:
            results["phases"]["afternoon"] = {"error": str(e)}

        # Phase 3: Evening — Analysis & Reporting
        try:
            results["phases"]["evening"] = await self.evening_report()
        except Exception as e:
            results["phases"]["evening"] = {"error": str(e)}

        results["cycle_end"] = datetime.now(timezone.utc).isoformat()
        logger.info(f"🌙 [{self.name}] === DAILY CYCLE COMPLETED ===")
        
        return results

    async def run_langgraph_deal_cycle(self, initial_state: Dict) -> Dict:
        """Run a single deal through LangGraph (async ainvoke — correct for async nodes)."""
        if not self.orchestrator or not build_ceo_deal_state:
            return {"error": "LangGraph Orchestrator is not available."}

        logger.info(
            "🔄 [%s] LangGraph deal cycle start: %s",
            self.name,
            initial_state.get("company_name"),
        )
        seed = {
            "tenant_id": initial_state.get("tenant_id", "default_tenant"),
            "deal_id": initial_state.get("deal_id", "DEAL-001"),
            "company_name": initial_state.get("company_name", "Unknown"),
            "decision_maker": initial_state.get("decision_maker", "CEO"),
            "industry": initial_state.get("industry", "enterprise"),
            "city": initial_state.get("city", "Riyadh"),
        }
        result = await self.orchestrator.run_deal_cycle_async(build_ceo_deal_state(seed))

        if agentforce_service and "error" not in result:
            try:
                await agentforce_service.sync_deal(result)
            except Exception as e:
                logger.warning("Salesforce sync after LangGraph skipped: %s", e)

        return result

    async def morning_operations(self) -> Dict:
        """06:00-12:00: Discovery + Campaign Launch."""
        logger.info(f"☀️ [{self.name}] Morning operations starting")
        
        results = {"phase": "morning", "actions": []}

        # 1. System Health Check
        health = self.get_empire_status()
        results["system_health"] = health
        results["actions"].append("system_health_check")

        # 2. Discover new leads (via Prospector Agent)
        self.send_message(
            "strategic_prospector", "daily_discovery",
            {"sectors": self.strategy["priority_sectors"],
             "cities": self.strategy["priority_cities"]},
            AgentPriority.HIGH,
        )
        results["actions"].append("prospector_launched")

        # 3. Launch morning campaigns
        self.send_message(
            "whatsapp_agent", "send_campaign",
            {"target": "new_leads", "style": self.strategy["message_style"]},
            AgentPriority.NORMAL,
        )
        results["actions"].append("whatsapp_campaign_launched")

        # 4. Send email sequences
        self.send_message(
            "email_agent", "process_sequences",
            {"process_pending": True},
            AgentPriority.NORMAL,
        )
        results["actions"].append("email_sequences_processed")

        return results

    async def afternoon_operations(self) -> Dict:
        """12:00-18:00: Follow-ups + Reply Processing."""
        logger.info(f"🌤️ [{self.name}] Afternoon operations starting")
        
        results = {"phase": "afternoon", "actions": []}

        # 1. Process all pending follow-ups
        self.send_message(
            "whatsapp_agent", "run_followups",
            {},
            AgentPriority.HIGH,
        )
        results["actions"].append("followups_processed")

        # 2. Analyze conversations
        self.send_message(
            "conversation_intel", "analyze_today",
            {"date": datetime.now(timezone.utc).strftime("%Y-%m-%d")},
            AgentPriority.NORMAL,
        )
        results["actions"].append("conversations_analyzed")

        # 3. Score and re-qualify leads
        self.send_message(
            "lead_qualifier", "requalify_batch",
            {"scope": "engaged_today"},
            AgentPriority.NORMAL,
        )
        results["actions"].append("leads_requalified")

        return results

    async def evening_report(self) -> Dict:
        """18:00-22:00: Analysis + CEO Report."""
        logger.info(f"🌙 [{self.name}] Evening report generation")
        
        # Generate comprehensive daily report
        report = await self.think(
            f"""أنشئ تقرير يومي للمدير التنفيذي:

الاستراتيجية الحالية: {self.strategy}
الأهداف اليومية: {self.daily_targets}

اكتب تقرير عربي مختصر ومفيد يشمل:
1. ملخص الأداء
2. أهم الإنجازات
3. التحديات
4. توصيات الغد
5. مقاييس KPI""",
            task_type="ceo_report",
        )

        # Send report via WhatsApp
        from app.services.auto_pipeline import get_pipeline
        try:
            pipeline = get_pipeline()
            await pipeline.reporter.send_daily_report()
        except Exception as e:
            logger.warning(f"Could not send daily report: {e}")

        return {"phase": "evening", "report_generated": True, "report": report}

    # ══════════════════════════════════════════════════
    # Strategy & Optimization
    # ══════════════════════════════════════════════════

    async def optimize_strategy(self, performance_data: Dict) -> Dict:
        """AI-driven strategy optimization based on performance data."""
        optimization = await self.think_json(
            f"""حلل أداء المبيعات واقترح تحسينات:

البيانات: {performance_data}
الاستراتيجية الحالية: {self.strategy}

أعطني:
{{
  "recommendations": ["..."],
  "sector_priority_change": {{"sector": "new_priority_score"}},
  "channel_optimization": {{"best_channel": "...", "worst_channel": "..."}},
  "message_optimization": "...",
  "budget_reallocation": {{}},
  "confidence": 0-100
}}""",
            task_type="strategy_optimization",
        )
        
        # Auto-apply recommendations with high confidence
        if optimization.get("confidence", 0) >= 80:
            sector_changes = optimization.get("sector_priority_change", {})
            if sector_changes:
                self.strategy["priority_sectors"] = list(sector_changes.keys())[:3]
                self.remember("strategy_update", {
                    "old": self.strategy,
                    "new_priorities": sector_changes,
                    "reason": optimization.get("recommendations", []),
                })
        
        return optimization

    # ══════════════════════════════════════════════════
    # Empire Status
    # ══════════════════════════════════════════════════

    def get_empire_status(self) -> Dict:
        """Get the full status of the Dealix AI Empire."""
        bus = get_message_bus()
        
        return {
            "empire": "Dealix AI",
            "version": "2.0",
            "status": "operational",
            "master_agent": self.name,
            "strategy": self.strategy,
            "daily_targets": self.daily_targets,
            "layers": {
                "layer_1_infrastructure": ["crm_agent", "analytics_agent", "report_agent", "security_agent", "scheduler_agent"],
                "layer_2_discovery": ["strategic_prospector", "data_enricher", "company_researcher"],
                "layer_3_qualification": ["lead_qualifier", "lead_scorer", "intent_detector"],
                "layer_4_engagement": ["whatsapp_agent", "email_agent", "voice_agent", "linkedin_agent"],
                "layer_5_revenue": ["closer_agent", "pricing_agent", "forecast_agent"],
                "layer_6_intelligence": ["conversation_intel", "revenue_intel", "market_intel"],
                "layer_7_master": ["ceo_agent"],
            },
            "total_agents": 22,
            "registered_agents": len(bus.agents),
            "agent_statuses": bus.get_all_statuses() if bus.agents else [],
            "ai_models": {
                "groq_llama3": "active — fast classification & intent",
                "glm5_zai": "active — sales decisions & closing",
                "claude_sonnet": "active — writing & proposals",
                "gemini": "active — research & analysis",
                "deepseek": "active — code & integration",
            },
            "channels": {
                "whatsapp": "active (Ultramsg)",
                "email": "ready (Resend API)",
                "voice": "planned (Twilio + ElevenLabs)",
                "linkedin": "planned",
            },
            "autonomous_features": [
                "✅ Lead discovery (100+/day)",
                "✅ AI qualification & scoring",
                "✅ Personalized WhatsApp outreach",
                "✅ Smart follow-up sequences",
                "✅ Conversation intelligence",
                "✅ Revenue forecasting",
                "✅ Daily CEO reports",
                "✅ Strategy self-optimization",
            ],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
