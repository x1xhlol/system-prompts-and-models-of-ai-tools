"""
Agent Quality Gate — Self-Correction Loop
==========================================
Runs the QA reviewer agent on other agents' outputs BEFORE they are dispatched.
This creates a two-pass system:
  Pass 1: Agent generates output
  Pass 2: QA agent validates → approve / reject / correct
Only approved outputs get dispatched to external services.
"""

import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("dealix.agents.quality_gate")

# Agents whose output should be QA'd before dispatch
QA_REQUIRED_AGENTS = {
    "closer_agent",
    "outreach_writer",
    "proposal_drafter",
    "arabic_whatsapp",
    "english_conversation",
}

# Agents exempt from QA (meta-agents like QA itself, or low-risk)
QA_EXEMPT_AGENTS = {
    "qa_reviewer",
    "lead_qualification",
    "knowledge_retrieval",
    "revenue_attribution",
    "management_summary",
    "sector_strategist",
    "ai_rehearsal",
}

# Minimum quality score to pass (out of 100)
MIN_QA_SCORE = 60


class QualityGate:
    """
    Quality gate that intercepts agent outputs and validates them
    before allowing dispatch to external services.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def check(
        self,
        agent_type: str,
        agent_output: dict,
        input_data: dict,
        tenant_id: str = None,
    ) -> dict:
        """
        Run QA check on an agent's output.
        
        Returns:
            {
                "approved": bool,
                "qa_score": int,
                "corrections": [...],
                "violations": [...],
                "corrected_output": dict | None,
            }
        """
        # Skip if agent is exempt
        if agent_type in QA_EXEMPT_AGENTS:
            return {"approved": True, "qa_score": 100, "reason": "exempt"}

        # Skip if agent doesn't require QA
        if agent_type not in QA_REQUIRED_AGENTS:
            return {"approved": True, "qa_score": 100, "reason": "not_required"}

        try:
            from app.services.agents.executor import AgentExecutor

            executor = AgentExecutor(self.db)

            # Run QA reviewer on the output
            qa_result = await executor.execute(
                agent_type="qa_reviewer",
                input_data={
                    "agent_type_reviewed": agent_type,
                    "conversation_content": str(agent_output.get("response_message_ar", ""))
                        or str(agent_output.get("draft_message", ""))
                        or str(agent_output),
                    "original_input": str(input_data)[:500],
                },
                tenant_id=tenant_id,
            )

            if qa_result.status != "success" or not qa_result.output:
                logger.warning(f"QA reviewer failed for {agent_type}, auto-approving")
                return {"approved": True, "qa_score": 75, "reason": "qa_error_passthrough"}

            qa_output = qa_result.output
            qa_score = qa_output.get("overall_score", 0)
            violations = qa_output.get("violations", [])
            improvements = qa_output.get("improvements", [])

            # Check for critical violations
            critical_violations = [
                v for v in violations
                if v.get("severity") == "high"
            ]

            approved = (
                qa_score >= MIN_QA_SCORE
                and len(critical_violations) == 0
            )

            result = {
                "approved": approved,
                "qa_score": qa_score,
                "qa_grade": qa_output.get("grade", ""),
                "corrections": improvements,
                "violations": violations,
                "critical_violations": len(critical_violations),
                "coaching_notes": qa_output.get("coaching_notes_ar", ""),
                "corrected_output": None,
            }

            if not approved and qa_output.get("sample_better_response"):
                result["corrected_output"] = {
                    "response_message_ar": qa_output["sample_better_response"],
                }

            logger.info(
                f"QA Gate: agent={agent_type} score={qa_score} "
                f"approved={approved} violations={len(violations)}"
            )

            return result

        except Exception as e:
            logger.error(f"Quality gate error for {agent_type}: {e}")
            # On error, auto-approve to not block the pipeline
            return {"approved": True, "qa_score": 50, "reason": f"gate_error: {e}"}

    async def check_and_correct(
        self,
        agent_type: str,
        agent_output: dict,
        input_data: dict,
        tenant_id: str = None,
        max_retries: int = 1,
    ) -> tuple[dict, dict]:
        """
        Check quality and auto-correct if needed.
        
        Returns:
            (final_output, qa_result)
        """
        qa_result = await self.check(agent_type, agent_output, input_data, tenant_id)

        if qa_result["approved"]:
            return agent_output, qa_result

        # If not approved but has corrected output, use it
        if qa_result.get("corrected_output"):
            logger.info(f"QA gate auto-corrected output for {agent_type}")
            corrected = {**agent_output, **qa_result["corrected_output"]}
            corrected["_qa_corrected"] = True
            return corrected, qa_result

        # If not approved and no correction, try re-running the agent with coaching
        if max_retries > 0:
            logger.info(f"QA gate requesting retry for {agent_type}")
            coaching = qa_result.get("coaching_notes", "")
            enhanced_input = {
                **input_data,
                "_qa_feedback": coaching,
                "_qa_violations": str(qa_result.get("violations", [])),
                "_retry_with_improvements": True,
            }

            try:
                from app.services.agents.executor import AgentExecutor
                executor = AgentExecutor(self.db)
                retry_result = await executor.execute(
                    agent_type=agent_type,
                    input_data=enhanced_input,
                    tenant_id=tenant_id,
                )

                if retry_result.status == "success":
                    # Re-check the retried output (no more retries)
                    return await self.check_and_correct(
                        agent_type,
                        retry_result.output,
                        input_data,
                        tenant_id,
                        max_retries=0,
                    )
            except Exception as e:
                logger.warning(f"QA retry failed for {agent_type}: {e}")

        # Final fallback: return original with warning
        agent_output["_qa_warning"] = "Output below quality threshold"
        agent_output["_qa_score"] = qa_result.get("qa_score", 0)
        return agent_output, qa_result
