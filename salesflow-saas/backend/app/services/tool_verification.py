"""
Tool Verification Layer — Dealix AI Revenue OS
Records what agents intended, claimed, and actually executed.
Provides evidence-based audit trail for all AI actions.
"""
import logging
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class VerificationStatus(str, Enum):
    VERIFIED = "verified"
    PARTIALLY_VERIFIED = "partially_verified"
    UNVERIFIED = "unverified"
    CONTRADICTED = "contradicted"
    PENDING = "pending"


class ToolCall(BaseModel):
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    agent_id: str
    agent_name: str
    intended_action: str
    intended_params: dict[str, Any] = {}
    claimed_result: Optional[str] = None
    actual_result: Optional[str] = None
    actual_side_effects: list[str] = []
    status: VerificationStatus = VerificationStatus.PENDING
    contradiction_flags: list[str] = []
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    tenant_id: Optional[str] = None
    metadata: dict[str, Any] = {}


class ToolVerifier:
    """
    Verification layer between agents and tools.
    Records intent vs claim vs execution evidence.
    """

    def __init__(self):
        self._log: list[ToolCall] = []
        self._max_log_size = 10000

    def start_call(
        self,
        agent_id: str,
        agent_name: str,
        intended_action: str,
        intended_params: dict[str, Any] = None,
        tenant_id: str = None,
    ) -> ToolCall:
        call = ToolCall(
            agent_id=agent_id,
            agent_name=agent_name,
            intended_action=intended_action,
            intended_params=intended_params or {},
            tenant_id=tenant_id,
        )
        self._log.append(call)
        if len(self._log) > self._max_log_size:
            self._log = self._log[-self._max_log_size:]
        logger.info(
            f"[ToolVerify] START {call.request_id}: "
            f"agent={agent_name} action={intended_action}"
        )
        return call

    def record_claim(self, call: ToolCall, claimed_result: str) -> None:
        call.claimed_result = claimed_result
        logger.info(
            f"[ToolVerify] CLAIM {call.request_id}: {claimed_result[:200]}"
        )

    def record_execution(
        self,
        call: ToolCall,
        actual_result: str,
        side_effects: list[str] = None,
    ) -> None:
        call.actual_result = actual_result
        call.actual_side_effects = side_effects or []
        call.completed_at = datetime.now(timezone.utc)
        call.duration_ms = int(
            (call.completed_at - call.started_at).total_seconds() * 1000
        )
        self._verify(call)
        logger.info(
            f"[ToolVerify] EXEC {call.request_id}: "
            f"status={call.status} duration={call.duration_ms}ms"
        )

    def _verify(self, call: ToolCall) -> None:
        if not call.claimed_result or not call.actual_result:
            call.status = VerificationStatus.UNVERIFIED
            return

        claimed = call.claimed_result.lower().strip()
        actual = call.actual_result.lower().strip()

        if "error" in actual and "success" in claimed:
            call.status = VerificationStatus.CONTRADICTED
            call.contradiction_flags.append(
                "Agent claimed success but execution returned error"
            )
        elif "error" in actual:
            call.status = VerificationStatus.PARTIALLY_VERIFIED
            call.contradiction_flags.append("Execution had errors")
        elif actual == claimed or claimed in actual:
            call.status = VerificationStatus.VERIFIED
        else:
            keywords_claimed = set(claimed.split())
            keywords_actual = set(actual.split())
            overlap = len(keywords_claimed & keywords_actual)
            total = len(keywords_claimed)
            if total > 0 and overlap / total > 0.5:
                call.status = VerificationStatus.VERIFIED
            elif total > 0 and overlap / total > 0.2:
                call.status = VerificationStatus.PARTIALLY_VERIFIED
            else:
                call.status = VerificationStatus.UNVERIFIED

    def get_log(
        self,
        agent_id: str = None,
        status: VerificationStatus = None,
        tenant_id: str = None,
        limit: int = 100,
    ) -> list[ToolCall]:
        results = self._log
        if agent_id:
            results = [c for c in results if c.agent_id == agent_id]
        if status:
            results = [c for c in results if c.status == status]
        if tenant_id:
            results = [c for c in results if c.tenant_id == tenant_id]
        return results[-limit:]

    def get_contradictions(self, tenant_id: str = None) -> list[ToolCall]:
        return self.get_log(
            status=VerificationStatus.CONTRADICTED, tenant_id=tenant_id
        )

    def get_stats(self, tenant_id: str = None) -> dict[str, Any]:
        calls = self.get_log(tenant_id=tenant_id, limit=10000)
        total = len(calls)
        if total == 0:
            return {"total": 0}
        by_status = {}
        for call in calls:
            by_status[call.status] = by_status.get(call.status, 0) + 1
        durations = [c.duration_ms for c in calls if c.duration_ms]
        avg_duration = sum(durations) / len(durations) if durations else 0
        return {
            "total": total,
            "by_status": by_status,
            "avg_duration_ms": round(avg_duration, 1),
            "contradiction_rate": round(
                by_status.get(VerificationStatus.CONTRADICTED, 0) / total * 100, 2
            ),
            "verification_rate": round(
                by_status.get(VerificationStatus.VERIFIED, 0) / total * 100, 2
            ),
        }


# Global singleton
tool_verifier = ToolVerifier()
