"""
Agent Executor — Runs AI agents with LLM calls, input validation,
output parsing, escalation checks, and action dispatch.

This is the engine that powers every single AI agent in Dealix.
"""

import time
import uuid
import json
import logging
from typing import Optional
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.llm.provider import get_llm, LLMResponse
from app.services.agents.router import AgentRouter

logger = logging.getLogger("dealix.agents.executor")

# Load prompt files path
PROMPTS_DIR = Path(__file__).parent.parent.parent.parent.parent / "ai-agents" / "prompts"


class AgentResult:
    """Standardized agent execution result."""
    def __init__(self, agent_type: str, output: dict, tokens_used: int = 0,
                 latency_ms: int = 0, status: str = "success",
                 escalation: dict = None, actions: list = None):
        self.agent_type = agent_type
        self.output = output
        self.tokens_used = tokens_used
        self.latency_ms = latency_ms
        self.status = status  # success, error, escalated
        self.escalation = escalation  # {needed: bool, reason: str, target: str}
        self.actions = actions or []  # [{type: "send_message", ...}, ...]

    def to_dict(self) -> dict:
        return {
            "agent_type": self.agent_type,
            "output": self.output,
            "tokens_used": self.tokens_used,
            "latency_ms": self.latency_ms,
            "status": self.status,
            "escalation": self.escalation,
            "actions": self.actions,
        }


class AgentExecutor:
    """
    Executes AI agents by:
    1. Loading the agent's system prompt
    2. Building context from input data
    3. Calling the LLM
    4. Parsing structured output
    5. Checking escalation rules
    6. Dispatching actions (DB updates, messages, bookings)
    7. Logging to ai_conversations
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.llm = get_llm()
        self.router = AgentRouter()

    async def execute(self, agent_type: str, input_data: dict,
                      tenant_id: str = None, lead_id: str = None,
                      conversation_id: str = None) -> AgentResult:
        """Execute an AI agent and return structured result."""
        start = time.time()

        try:
            # 1. Load system prompt
            system_prompt = self._load_prompt(agent_type)

            # 1b. Enrich input with memory context
            if lead_id:
                try:
                    from app.services.agents.memory import agent_memory
                    input_data = await agent_memory.build_agent_context(
                        lead_id, agent_type, input_data
                    )
                except Exception:
                    pass  # Memory is optional enhancement

            # 2. Build user message from input data
            user_message = self._build_user_message(agent_type, input_data)

            # 3. Call LLM
            llm_response = await self.llm.complete(
                system_prompt=system_prompt,
                user_message=user_message,
                json_mode=True,
                temperature=self._get_temperature(agent_type),
                max_tokens=self._get_max_tokens(agent_type),
            )

            # 4. Parse output
            output = llm_response.parse_json()
            if output is None:
                output = {"raw_response": llm_response.content}

            # 4b. Store output in memory
            if lead_id:
                try:
                    from app.services.agents.memory import agent_memory
                    await agent_memory.remember(
                        lead_id=lead_id,
                        agent_type=agent_type,
                        event="agent_execution",
                        data=output,
                        tenant_id=tenant_id or "",
                    )
                except Exception:
                    pass  # Memory storage is optional

            # 5. Check escalation
            escalation = self._check_escalation(agent_type, output, input_data)

            # 6. Build actions
            actions = self._build_actions(agent_type, output, input_data)

            latency = int((time.time() - start) * 1000)

            result = AgentResult(
                agent_type=agent_type,
                output=output,
                tokens_used=llm_response.tokens_used,
                latency_ms=latency,
                status="escalated" if escalation and escalation.get("needed") else "success",
                escalation=escalation,
                actions=actions,
            )

            # 7. Quality gate for customer-facing agents
            try:
                from app.services.agents.quality_gate import QualityGate
                gate = QualityGate(self.db)
                final_output, qa_result = await gate.check_and_correct(
                    agent_type, output, input_data, tenant_id
                )
                if final_output != output:
                    output = final_output
                    result.output = output
                    result.output["_qa_applied"] = True
                result.output["_qa_score"] = qa_result.get("qa_score", 100)
            except Exception as qe:
                logger.debug(f"Quality gate skipped: {qe}")

            # 8. Dispatch actions to external services
            if actions:
                try:
                    from app.services.agents.action_dispatcher import ActionDispatcher
                    dispatcher = ActionDispatcher(self.db)
                    dispatch_results = await dispatcher.dispatch(actions, tenant_id)
                    result.output["_dispatch_results"] = dispatch_results
                except Exception as de:
                    logger.warning(f"Action dispatch partial failure: {de}")

            # 7b. Handle escalations formally
            if escalation and escalation.get("needed"):
                try:
                    from app.services.agents.escalation_handler import handle_agent_escalation
                    await handle_agent_escalation(
                        agent_type=agent_type,
                        escalation=escalation,
                        input_data=input_data,
                        output=output,
                        tenant_id=tenant_id or "",
                        lead_id=lead_id or "",
                    )
                except Exception as ee:
                    logger.warning(f"Escalation handler error: {ee}")

            # 8. Log to database
            await self._log_conversation(
                tenant_id=tenant_id,
                agent_type=agent_type,
                lead_id=lead_id,
                input_data=input_data,
                output=result.to_dict(),
                tokens_used=llm_response.tokens_used,
                latency_ms=latency,
                status=result.status,
            )

            logger.info(
                f"Agent {agent_type} executed: "
                f"tokens={llm_response.tokens_used} "
                f"latency={latency}ms "
                f"status={result.status} "
                f"actions={len(actions)}"
            )

            return result

        except Exception as e:
            latency = int((time.time() - start) * 1000)
            logger.error(f"Agent {agent_type} failed: {e}")

            result = AgentResult(
                agent_type=agent_type,
                output={"error": str(e)},
                latency_ms=latency,
                status="error",
            )

            await self._log_conversation(
                tenant_id=tenant_id,
                agent_type=agent_type,
                lead_id=lead_id,
                input_data=input_data,
                output=result.to_dict(),
                tokens_used=0,
                latency_ms=latency,
                status="error",
            )

            return result

    async def execute_event(self, event_type: str, input_data: dict,
                            tenant_id: str = None, **kwargs) -> list[AgentResult]:
        """Execute all agents registered for an event type."""
        from app.services.agents.router import ExecutionMode
        import asyncio

        exec_mode = self.router.get_execution_mode(event_type)
        agent_configs = self.router.get_agents_config_for_event(event_type)

        if not agent_configs:
            agent_ids = self.router.get_agents_for_event(event_type)
            results = []
            for agent_id in agent_ids:
                result = await self.execute(
                    agent_type=agent_id,
                    input_data=input_data,
                    tenant_id=tenant_id,
                    **kwargs,
                )
                results.append(result)
                if result.escalation and result.escalation.get("needed"):
                    break
            return results

        if exec_mode == ExecutionMode.PARALLEL:
            return await self._execute_event_parallel(agent_configs, input_data, tenant_id, **kwargs)
        else:
            return await self._execute_event_sequential(agent_configs, input_data, tenant_id, **kwargs)

    async def _execute_event_sequential(self, agent_configs, input_data: dict,
                                         tenant_id: str, **kwargs) -> list[AgentResult]:
        """Execute agents one after another, chaining outputs."""
        results = []
        chain_data = dict(input_data)

        for agent_cfg in agent_configs:
            try:
                import asyncio
                result = await asyncio.wait_for(
                    self.execute(
                        agent_type=agent_cfg.agent_id,
                        input_data=chain_data,
                        tenant_id=tenant_id,
                        **kwargs,
                    ),
                    timeout=agent_cfg.timeout_seconds,
                )
                results.append(result)

                # Chain output into next agent's input
                if result.output and isinstance(result.output, dict):
                    chain_data = {**chain_data, f"{agent_cfg.agent_id}_output": result.output}

                # Stop on escalation
                if result.escalation and result.escalation.get("needed"):
                    logger.info(f"Sequential chain stopped at {agent_cfg.agent_id} — escalation")
                    break

                # Stop on required agent failure
                if result.status == "error" and agent_cfg.required:
                    logger.error(f"Required agent {agent_cfg.agent_id} failed, stopping chain")
                    break

            except Exception as e:
                logger.error(f"Agent {agent_cfg.agent_id} error in chain: {e}")
                if agent_cfg.required:
                    break

        return results

    async def _execute_event_parallel(self, agent_configs, input_data: dict,
                                       tenant_id: str, **kwargs) -> list[AgentResult]:
        """Execute agents simultaneously."""
        import asyncio

        async def _run(agent_cfg):
            try:
                return await asyncio.wait_for(
                    self.execute(
                        agent_type=agent_cfg.agent_id,
                        input_data=input_data,
                        tenant_id=tenant_id,
                        **kwargs,
                    ),
                    timeout=agent_cfg.timeout_seconds,
                )
            except Exception as e:
                logger.error(f"Parallel agent {agent_cfg.agent_id} failed: {e}")
                return AgentResult(
                    agent_type=agent_cfg.agent_id,
                    output={"error": str(e)},
                    status="error",
                )

        tasks = [_run(cfg) for cfg in agent_configs]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        return list(results)

    # ── Prompt Loading ──────────────────────────────

    def _load_prompt(self, agent_type: str) -> str:
        """Load system prompt from the ai-agents/prompts directory."""
        # Map agent_type to filename
        filename_map = {
            # ── Original 20 Sales Agents ──
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
            # ── 10 Strategic Growth & Enterprise Agents ──
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
            # ── 7 Advanced Strategic & M&A Core ──
            "alliance_structuring": "alliance-structuring-agent.md",
            "due_diligence_analyst": "due-diligence-agent.md",
            "valuation_synergy": "valuation-synergy-agent.md",
            "strategic_pmo": "strategic-pmo-agent.md",
            "executive_negotiator": "executive-negotiator-agent.md",
            "post_merger_integration": "post-merger-integration-agent.md",
            "sovereign_intelligence": "sovereign-growth-agent.md",
        }

        filename = filename_map.get(agent_type)
        if not filename:
            return f"You are the {agent_type} agent for Dealix. Respond with structured JSON."

        # Check primary prompts dir
        prompt_path = PROMPTS_DIR / filename
        if prompt_path.exists():
            return prompt_path.read_text(encoding="utf-8")
        
        # Check fallback backend prompts dir
        backend_prompts_dir = Path(__file__).parent.parent.parent / "ai" / "prompts"
        fallback_path = backend_prompts_dir / filename
        if fallback_path.exists():
            return fallback_path.read_text(encoding="utf-8")
        
        logger.warning(f"Prompt file not found for {agent_type}: {filename}")
        return f"You are the {agent_type} agent for Dealix. Respond with structured JSON."

    def _build_user_message(self, agent_type: str, input_data: dict) -> str:
        """Build the user message from input data."""
        # General format: JSON dump of input data with clear instructions
        context = json.dumps(input_data, ensure_ascii=False, indent=2, default=str)

        return f"""## Input Data
{context}

## Instructions
Process this input according to your role and return a structured JSON response.
Include all required output fields as defined in your schema.
Use Arabic where appropriate (especially for client-facing content).
Respond ONLY with valid JSON."""

    # ── Configuration per Agent ────────────────────

    def _get_temperature(self, agent_type: str) -> float:
        """Agent-specific temperature settings."""
        # Creative agents need higher temperature
        creative = {
            "outreach_writer": 0.7, "proposal_drafter": 0.5,
            "sector_strategist": 0.5, "objection_handler": 0.4,
            "closer_agent": 0.4, "onboarding_coach": 0.5,
            "ai_rehearsal": 0.4,
            # Strategic agents
            "partnership_scout": 0.5, "business_development": 0.5,
            "marketing_automation": 0.6, "customer_success": 0.4,
        }
        # Analytical agents need low temperature
        analytical = {
            "lead_qualification": 0.1, "compliance_reviewer": 0.1,
            "fraud_reviewer": 0.1, "revenue_attribution": 0.1,
            "guarantee_reviewer": 0.1, "qa_reviewer": 0.2,
            "affiliate_evaluator": 0.2,
            # Strategic analytical
            "ma_growth": 0.2, "contract_lifecycle": 0.1,
            "supply_chain": 0.2, "dynamic_pricing": 0.15,
            "finance_automation": 0.1, "competitive_intel": 0.2,
            # Advanced Core
            "alliance_structuring": 0.2, "due_diligence_analyst": 0.1,
            "valuation_synergy": 0.1, "strategic_pmo": 0.2,
            "executive_negotiator": 0.4, "post_merger_integration": 0.2,
            "sovereign_intelligence": 0.3,
        }
        return creative.get(agent_type, analytical.get(agent_type, 0.3))

    def _get_max_tokens(self, agent_type: str) -> int:
        """Agent-specific max token settings."""
        verbose = {
            "proposal_drafter": 4096, "management_summary": 4096,
            "sector_strategist": 3000, "ai_rehearsal": 3000,
            "objection_handler": 2500, "closer_agent": 2500,
            "onboarding_coach": 3000,
            # Strategic agents (complex analysis → need more tokens)
            "partnership_scout": 4096, "ma_growth": 5000,
            "contract_lifecycle": 5000, "business_development": 4096,
            "supply_chain": 3000, "customer_success": 3000,
            "dynamic_pricing": 2500, "marketing_automation": 4096,
            "finance_automation": 4096, "competitive_intel": 3500,
            # Advanced Core
            "alliance_structuring": 4096, "due_diligence_analyst": 6000,
            "valuation_synergy": 5000, "strategic_pmo": 4096,
            "executive_negotiator": 5000, "post_merger_integration": 6000,
            "sovereign_intelligence": 8000,  # Apex agent needs max context
        }
        return verbose.get(agent_type, 2048)

    # ── Escalation Rules ──────────────────────────

    def _check_escalation(self, agent_type: str, output: dict, input_data: dict) -> Optional[dict]:
        """Check if the agent output requires escalation to a human."""
        escalation = output.get("escalation", {})
        if isinstance(escalation, dict) and escalation.get("needed"):
            return escalation

        # Agent-specific checks
        if agent_type == "arabic_whatsapp":
            confidence = output.get("confidence", 1.0)
            if confidence < 0.5:
                return {"needed": True, "reason": "Low confidence response", "target": "human_agent"}
            sentiment = output.get("sentiment", "neutral")
            if sentiment == "negative":
                return {"needed": True, "reason": "Negative client sentiment detected", "target": "human_agent"}

        if agent_type == "lead_qualification":
            score = output.get("score", 50)
            if 40 <= score <= 60:
                return {"needed": True, "reason": "Ambiguous qualification score", "target": "sales_manager"}
            if score >= 90:
                return {"needed": True, "reason": "VIP lead detected — immediate human attention", "target": "vip_handler"}

        if agent_type == "fraud_reviewer":
            risk_score = output.get("risk_score", 0)
            if risk_score > 80:
                return {"needed": True, "reason": "High fraud risk detected", "target": "admin"}

        if agent_type == "compliance_reviewer":
            overall_risk = output.get("overall_risk", "low")
            if overall_risk in ("high", "critical"):
                return {"needed": True, "reason": f"Compliance risk: {overall_risk}", "target": "legal_team"}

        if agent_type == "guarantee_reviewer":
            claim_amount = output.get("claim_amount_sar", 0)
            if claim_amount > 50000:
                return {"needed": True, "reason": "Guarantee claim > 50K SAR", "target": "ceo"}
            elif claim_amount > 5000:
                return {"needed": True, "reason": "Guarantee claim > 5K SAR", "target": "finance"}

        if agent_type == "objection_handler":
            severity = output.get("objection_severity", "low")
            if severity == "deal_breaker":
                return {"needed": True, "reason": "Deal-breaking objection detected", "target": "sales_manager"}

        # ── Strategic Agent Escalations ────────────────
        if agent_type == "ma_growth":
            valuation = output.get("ma_analysis", {}).get("estimated_valuation_sar", 0)
            if valuation > 10_000_000:
                return {"needed": True, "reason": f"M&A deal > 10M SAR (valuation: {valuation:,.0f})", "target": "ceo"}
            elif valuation > 1_000_000:
                return {"needed": True, "reason": f"M&A deal > 1M SAR", "target": "board"}

        if agent_type == "contract_lifecycle":
            risk = output.get("contract", {}).get("risk_analysis", {}).get("overall_risk", "low")
            if risk in ("high", "critical"):
                return {"needed": True, "reason": f"Contract risk: {risk}", "target": "legal"}

        if agent_type == "finance_automation":
            cashflow = output.get("finance", {}).get("cashflow_forecast", {})
            if cashflow.get("risk_alert") == "critical":
                return {"needed": True, "reason": "Critical cash flow risk", "target": "cfo"}

        if agent_type == "customer_success":
            churn = output.get("customer_success", {}).get("customer_health", {}).get("churn_risk", "low")
            if churn == "critical":
                return {"needed": True, "reason": "Critical churn risk — VIP customer", "target": "account_manager"}

        if agent_type == "competitive_intel":
            threat = output.get("competitive_intel", {}).get("threat_level", "low")
            if threat in ("high", "critical"):
                return {"needed": True, "reason": f"Competitive threat level: {threat}", "target": "strategy_team"}

        # ── Advanced M&A Core Escalations ───────────────
        if agent_type == "due_diligence_analyst":
            risk = output.get("due_diligence_report", {}).get("overall_risk", "low")
            if risk in ("high", "critical"):
                return {"needed": True, "reason": "DD discovered high risk factors — board review required", "target": "board"}

        if agent_type == "sovereign_intelligence":
            alerts = output.get("sovereign_intelligence", {}).get("strategic_alerts", [])
            has_critical = any(a.get("severity") == "critical" for a in alerts)
            if has_critical:
                return {"needed": True, "reason": "Critical strategic alert raised in Sovereign Report", "target": "ceo"}

        return None

    # ── Action Building ───────────────────────────

    def _build_actions(self, agent_type: str, output: dict, input_data: dict) -> list:
        """Build a list of actions to execute based on agent output."""
        actions = []

        # ── WhatsApp Response ────────────────────────
        if agent_type == "arabic_whatsapp" and output.get("response_message_ar"):
            actions.append({
                "type": "send_whatsapp",
                "message": output["response_message_ar"],
                "phone": input_data.get("contact_phone", ""),
            })

        # ── English Response ─────────────────────────
        if agent_type == "english_conversation" and output.get("response_message_en"):
            actions.append({
                "type": "send_email",
                "message": output["response_message_en"],
                "email": input_data.get("contact_email", ""),
            })

        # ── Meeting Booking ──────────────────────────
        if agent_type == "meeting_booking" and output.get("meeting_booked", {}).get("confirmed"):
            meeting = output["meeting_booked"]
            actions.append({
                "type": "create_meeting",
                "datetime": meeting.get("datetime"),
                "duration_minutes": meeting.get("duration_minutes", 30),
                "location": meeting.get("location", "google_meet"),
                "lead_id": input_data.get("lead_id"),
            })
            # Send confirmation via WhatsApp
            if output.get("confirmation_message_ar"):
                actions.append({
                    "type": "send_whatsapp",
                    "message": output["confirmation_message_ar"],
                    "phone": input_data.get("contact_phone", ""),
                })

        # ── Outreach Writer ──────────────────────────
        if agent_type == "outreach_writer" and output.get("draft_message"):
            channel = output.get("channel", input_data.get("channel", "whatsapp"))
            actions.append({
                "type": "queue_message",
                "channel": channel,
                "message": output["draft_message"],
                "optimal_send_time": output.get("optimal_send_time"),
            })
            # Queue A/B variant if available
            if output.get("draft_message_alt"):
                actions.append({
                    "type": "queue_ab_variant",
                    "channel": channel,
                    "message": output["draft_message_alt"],
                })

        # ── Lead Qualification ───────────────────────
        if agent_type == "lead_qualification":
            actions.append({
                "type": "update_lead_score",
                "lead_id": input_data.get("lead_id"),
                "score": output.get("score", 0),
                "classification": output.get("classification", "cold"),
                "status": output.get("status_recommendation", "contacted"),
                "priority": output.get("priority", "medium"),
            })
            # Auto-route hot leads
            if output.get("score", 0) >= 80:
                actions.append({
                    "type": "trigger_event",
                    "event": "lead_qualified",
                    "lead_id": input_data.get("lead_id"),
                })

        # ── Closer Agent ─────────────────────────────
        if agent_type == "closer_agent":
            if output.get("response_message_ar"):
                actions.append({
                    "type": "send_whatsapp",
                    "message": output["response_message_ar"],
                    "phone": input_data.get("contact_phone", ""),
                })
            if output.get("payment_link_needed"):
                actions.append({
                    "type": "generate_payment_link",
                    "lead_id": input_data.get("lead_id"),
                    "amount_sar": output.get("amount_sar", 0),
                })

        # ── Proposal Drafter ─────────────────────────
        if agent_type == "proposal_drafter" and output.get("proposal"):
            actions.append({
                "type": "create_proposal",
                "proposal_data": output["proposal"],
                "lead_id": input_data.get("lead_id"),
            })

        # ── Compliance Reviewer ──────────────────────
        if agent_type == "compliance_reviewer":
            if not output.get("compliant", True):
                actions.append({
                    "type": "block_action",
                    "reason": "Compliance check failed",
                    "issues": output.get("issues", []),
                })

        # ── Fraud Reviewer ───────────────────────────
        if agent_type == "fraud_reviewer":
            risk = output.get("risk_score", 0)
            if risk > 60:
                actions.append({
                    "type": "suspend_entity",
                    "entity_type": output.get("fraud_type", "unknown"),
                    "risk_score": risk,
                    "affected": output.get("affected_entities", {}),
                })

        # ── Objection Handler ────────────────────────
        if agent_type == "objection_handler" and output.get("response_ar"):
            actions.append({
                "type": "send_whatsapp",
                "message": output["response_ar"],
                "phone": input_data.get("contact_phone", ""),
            })

        # ── Guarantee Reviewer ───────────────────────
        if agent_type == "guarantee_reviewer":
            decision = output.get("decision", "")
            if decision == "approved":
                actions.append({
                    "type": "process_refund",
                    "amount_sar": output.get("approved_amount_sar", 0),
                    "customer_id": input_data.get("customer_id"),
                })
            # Try retention offer first
            retention = output.get("retention_offer", {})
            if retention.get("offered"):
                actions.append({
                    "type": "send_retention_offer",
                    "offer": retention,
                    "customer_id": input_data.get("customer_id"),
                })

        # ── Partnership Scout ────────────────────────
        if agent_type == "partnership_scout" and output.get("partnership_analysis"):
            analysis = output["partnership_analysis"]
            actions.append({
                "type": "create_partnership_record",
                "partner_name": analysis.get("partner_name"),
                "partnership_type": analysis.get("partnership_type"),
                "compatibility_score": analysis.get("compatibility_score"),
            })
            if analysis.get("partnership_proposal_ar"):
                actions.append({
                    "type": "queue_message",
                    "channel": "email",
                    "message": analysis["partnership_proposal_ar"],
                })

        # ── M&A Growth ───────────────────────────────
        if agent_type == "ma_growth" and output.get("ma_analysis"):
            ma = output["ma_analysis"]
            actions.append({
                "type": "create_ma_opportunity",
                "target_company": ma.get("target_company"),
                "valuation_sar": ma.get("estimated_valuation_sar"),
                "go_no_go": ma.get("go_no_go"),
            })

        # ── Contract Lifecycle ───────────────────────
        if agent_type == "contract_lifecycle" and output.get("contract"):
            contract = output["contract"]
            actions.append({
                "type": "create_contract",
                "contract_type": contract.get("type"),
                "value_sar": contract.get("key_terms", {}).get("value_sar"),
                "action_required": contract.get("action_required"),
            })

        # ── Business Development ─────────────────────
        if agent_type == "business_development" and output.get("opportunity"):
            opp = output["opportunity"]
            actions.append({
                "type": "create_business_opportunity",
                "title": opp.get("title_ar"),
                "market": opp.get("market"),
                "opportunity_score": opp.get("opportunity_score"),
            })

        # ── Supply Chain ─────────────────────────────
        if agent_type == "supply_chain" and output.get("supply_chain"):
            sc = output["supply_chain"]
            if sc.get("recommendation"):
                actions.append({
                    "type": "create_purchase_order",
                    "supplier": sc["recommendation"].get("supplier"),
                    "total_cost_sar": sc["recommendation"].get("total_cost_sar"),
                })

        # ── Customer Success ─────────────────────────
        if agent_type == "customer_success" and output.get("customer_success"):
            cs = output["customer_success"]
            if cs.get("message_to_customer_ar"):
                actions.append({
                    "type": "send_whatsapp",
                    "message": cs["message_to_customer_ar"],
                    "phone": input_data.get("contact_phone", ""),
                })
            for action in cs.get("retention_actions", []):
                if action.get("urgency") == "now":
                    actions.append({
                        "type": "trigger_event",
                        "event": "upsell_opportunity_detected",
                        "lead_id": input_data.get("lead_id"),
                    })

        # ── Dynamic Pricing ──────────────────────────
        if agent_type == "dynamic_pricing" and output.get("pricing"):
            pricing = output["pricing"]
            actions.append({
                "type": "update_pricing",
                "recommended_price_sar": pricing.get("recommended_price_sar"),
                "strategy": pricing.get("strategy"),
            })

        # ── Marketing Automation ─────────────────────
        if agent_type == "marketing_automation" and output.get("campaign"):
            campaign = output["campaign"]
            actions.append({
                "type": "launch_campaign",
                "campaign_type": campaign.get("type"),
                "name": campaign.get("name_ar"),
                "schedule": campaign.get("schedule"),
            })

        # ── Finance Automation ───────────────────────
        if agent_type == "finance_automation" and output.get("finance"):
            fin = output["finance"]
            if fin.get("invoice"):
                actions.append({
                    "type": "issue_invoice",
                    "invoice_data": fin["invoice"],
                    "zatca_compliant": fin["invoice"].get("zatca_compliant", True),
                })
            for col in fin.get("collection", {}).get("collection_actions", []):
                if col.get("message_ar"):
                    actions.append({
                        "type": "send_collection_reminder",
                        "message": col["message_ar"],
                        "invoice_id": col.get("invoice_id"),
                    })

        # ── Competitive Intelligence ─────────────────
        if agent_type == "competitive_intel" and output.get("competitive_intel"):
            ci = output["competitive_intel"]
            if ci.get("battle_card"):
                actions.append({
                    "type": "update_battlecard",
                    "competitor": ci.get("competitor_profile", {}).get("name"),
                    "battle_card": ci["battle_card"],
                })

        # ── Advanced M&A Core Actions ────────────────
        if agent_type == "alliance_structuring" and output.get("alliance_structure"):
            actions.append({
                "type": "save_alliance_model",
                "partner_name": output["alliance_structure"].get("partner_name"),
                "financial_model": output["alliance_structure"].get("financial_model"),
                "term_sheet": output["alliance_structure"].get("term_sheet"),
            })

        if agent_type == "due_diligence_analyst" and output.get("due_diligence_report"):
            actions.append({
                "type": "finalize_dd_report",
                "target_company": output["due_diligence_report"].get("target_company"),
                "go_no_go_decision": output["due_diligence_report"].get("go_no_go"),
                "risk_level": output["due_diligence_report"].get("overall_risk"),
            })

        if agent_type == "valuation_synergy" and output.get("valuation_report"):
            actions.append({
                "type": "save_valuation",
                "blended_valuation_sar": output["valuation_report"].get("blended_valuation_sar"),
                "recommended_price_sar": output["valuation_report"].get("offer_recommendation", {}).get("recommended_price_sar"),
            })

        if agent_type == "strategic_pmo" and output.get("pmo_output"):
            actions.append({
                "type": "update_pmo_tracker",
                "initiative": output["pmo_output"].get("initiative"),
                "workstreams": output["pmo_output"].get("workstreams"),
            })

        if agent_type == "executive_negotiator" and output.get("negotiation_prep"):
            actions.append({
                "type": "save_negotiation_playbook",
                "tactics": output["negotiation_prep"].get("closing_tactics"),
                "batna": output["negotiation_prep"].get("batna"),
            })

        if agent_type == "post_merger_integration" and output.get("pmi_plan"):
            actions.append({
                "type": "update_pmi_dashboard",
                "day_1_readiness": output["pmi_plan"].get("day_1_readiness"),
                "synergy_tracking": output["pmi_plan"].get("synergy_tracker"),
            })

        if agent_type == "sovereign_intelligence" and output.get("sovereign_intelligence"):
            actions.append({
                "type": "publish_sovereign_dashboard",
                "report_date": output["sovereign_intelligence"].get("report_date"),
                "top_opportunities": output["sovereign_intelligence"].get("top_opportunities"),
                "board_recommendations": output["sovereign_intelligence"].get("board_recommendations"),
            })

        return actions

    # ── Database Logging ──────────────────────────

    async def _log_conversation(self, tenant_id: str, agent_type: str,
                                 lead_id: str, input_data: dict, output: dict,
                                 tokens_used: int, latency_ms: int, status: str):
        """Log agent execution to ai_conversations table."""
        try:
            from app.models.ai_conversation import AIConversation

            log_entry = AIConversation(
                tenant_id=uuid.UUID(tenant_id) if tenant_id else None,
                contact_name=input_data.get("contact_name"),
                contact_phone=input_data.get("contact_phone"),
                channel="system",
                status=status,
                lead_id=uuid.UUID(lead_id) if lead_id else None,
                context={
                    "agent_type": agent_type,
                    "input": input_data,
                    "output": output,
                    "tokens_used": tokens_used,
                    "latency_ms": latency_ms,
                },
            )
            self.db.add(log_entry)
            await self.db.flush()
        except Exception as e:
            logger.error(f"Failed to log agent conversation: {e}")
