"""
Agent Escalation Handler — Bridge between AI agents and human-in-the-loop.
==========================================================================
When an agent detects a situation it can't handle autonomously,
it generates an escalation. This handler creates proper EscalationPackets
and routes them to the right human team.
"""

import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.escalation import (
    EscalationService, EscalationPacket, EscalationPriority, EscalationReason,
    EscalationArtifact,
)

logger = logging.getLogger("dealix.agents.escalation_handler")

_escalation_service: Optional[EscalationService] = None


def get_escalation_service() -> EscalationService:
    global _escalation_service
    if _escalation_service is None:
        _escalation_service = EscalationService()
    return _escalation_service


# ── Target → Role Mapping ────────────────────────

TARGET_ROLE_MAP = {
    "human_agent": "support_team",
    "sales_manager": "sales_leadership",
    "vip_handler": "enterprise_team",
    "pricing_team": "sales_leadership",
    "legal_team": "compliance",
    "admin": "admin",
    "finance": "finance_team",
    "ceo": "executive",
    "compliance": "compliance",
}

TARGET_PRIORITY_MAP = {
    "human_agent": EscalationPriority.MEDIUM,
    "sales_manager": EscalationPriority.HIGH,
    "vip_handler": EscalationPriority.CRITICAL,
    "pricing_team": EscalationPriority.MEDIUM,
    "legal_team": EscalationPriority.HIGH,
    "admin": EscalationPriority.CRITICAL,
    "finance": EscalationPriority.HIGH,
    "ceo": EscalationPriority.CRITICAL,
    "compliance": EscalationPriority.HIGH,
}


async def handle_agent_escalation(
    agent_type: str,
    escalation: dict,
    input_data: dict,
    output: dict,
    tenant_id: str = "",
    lead_id: str = "",
) -> Optional[EscalationPacket]:
    """
    Process an agent's escalation request and create a proper EscalationPacket.
    
    Args:
        agent_type: The agent that triggered the escalation
        escalation: The escalation dict from the agent (needed, reason, target)
        input_data: Original input data to the agent
        output: Agent's output data
        tenant_id: The tenant ID
        lead_id: The lead ID
    """
    if not escalation or not escalation.get("needed"):
        return None

    target = escalation.get("target", "human_agent")
    reason_str = escalation.get("reason", "Agent escalation")

    # Map target to escalation priority
    priority = TARGET_PRIORITY_MAP.get(target, EscalationPriority.MEDIUM)

    # Map reason to EscalationReason enum
    reason_enum = _map_reason(reason_str)

    # Build artifacts
    artifacts = [
        EscalationArtifact(
            type="agent_output",
            name=f"{agent_type}_output",
            content=str(output)[:2000],  # Truncate to 2K
        ),
        EscalationArtifact(
            type="context",
            name="input_context",
            content=str(input_data)[:1000],
        ),
    ]

    # Create packet
    packet = EscalationPacket(
        tenant_id=tenant_id,
        title=f"Agent Escalation: {agent_type} → {target}",
        title_ar=f"تصعيد وكيل: {_agent_name_ar(agent_type)} → {reason_str}",
        entity_type="lead" if lead_id else "conversation",
        entity_id=lead_id or input_data.get("conversation_id", ""),
        workflow_name=f"agent_{agent_type}",
        failed_step="agent_execution",
        reason=reason_enum,
        priority=priority,
        risk_if_delayed=f"Delayed response may lose the customer. Agent: {agent_type}",
        risk_if_delayed_ar=f"التأخير قد يؤدي لخسارة العميل. الوكيل: {_agent_name_ar(agent_type)}",
        suggested_action=f"Review agent output and take action for: {reason_str}",
        suggested_action_ar=f"مراجعة مخرجات الوكيل واتخاذ إجراء بخصوص: {reason_str}",
        confidence=output.get("confidence", 0.5) if isinstance(output, dict) else 0.5,
        artifacts=artifacts,
    )

    service = get_escalation_service()
    created = await service.create(packet)

    logger.info(
        f"🚨 Agent escalation created: {created.id} "
        f"agent={agent_type} target={target} priority={priority.value}"
    )

    # Send notification
    await _notify_escalation(created, tenant_id)

    return created


async def _notify_escalation(packet: EscalationPacket, tenant_id: str):
    """Send a notification about the escalation."""
    try:
        from app.services.notification_service import notification_service
        await notification_service.send_internal(
            tenant_id=tenant_id,
            title=packet.title_ar,
            body=f"أولوية: {packet.priority.value} | {packet.suggested_action_ar}",
            category="escalation",
            priority=packet.priority.value,
            metadata={
                "escalation_id": packet.id,
                "entity_type": packet.entity_type,
                "entity_id": packet.entity_id,
            },
        )
    except Exception as e:
        logger.warning(f"Failed to send escalation notification: {e}")


def _map_reason(reason_str: str) -> EscalationReason:
    """Map agent reason string to EscalationReason enum."""
    reason_lower = reason_str.lower()

    if "confidence" in reason_lower:
        return EscalationReason.LOW_CONFIDENCE
    elif "fraud" in reason_lower:
        return EscalationReason.VALIDATION_FAILURE
    elif "compliance" in reason_lower:
        return EscalationReason.CONSENT_EXPIRED
    elif "vip" in reason_lower or "high value" in reason_lower or "50k" in reason_lower:
        return EscalationReason.HIGH_VALUE_DEAL
    elif "complaint" in reason_lower or "negative" in reason_lower:
        return EscalationReason.CUSTOMER_COMPLAINT
    elif "ambiguous" in reason_lower:
        return EscalationReason.AMBIGUOUS_DATA
    elif "missing" in reason_lower:
        return EscalationReason.MISSING_DATA
    else:
        return EscalationReason.LOW_CONFIDENCE


def _agent_name_ar(agent_type: str) -> str:
    """Return Arabic name for agent type."""
    names = {
        "closer_agent": "وكيل الإغلاق",
        "lead_qualification": "وكيل التأهيل",
        "arabic_whatsapp": "وكيل الواتساب",
        "english_conversation": "وكيل المحادثات الإنجليزية",
        "outreach_writer": "كاتب الرسائل",
        "meeting_booking": "وكيل الاجتماعات",
        "objection_handler": "معالج الاعتراضات",
        "proposal_drafter": "صائغ العروض",
        "sector_strategist": "استراتيجي القطاعات",
        "compliance_reviewer": "مراجع الامتثال",
        "fraud_reviewer": "كاشف الاحتيال",
        "guarantee_reviewer": "مراجع الضمان",
        "qa_reviewer": "مراجع الجودة",
    }
    return names.get(agent_type, agent_type)
