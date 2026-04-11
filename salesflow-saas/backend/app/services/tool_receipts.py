"""
Tool Receipts — Dealix ToolProof Enhancement
Signed execution receipts, pre-execution policy, and trust analytics.
Extends tool_verification.py with cryptographic receipts and policy enforcement.
"""
import hashlib
import logging
import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class PolicyDecisionType(str, Enum):
    ALLOW = "allow"
    BLOCK = "block"
    HOLD = "hold"


class VerificationVerdict(str, Enum):
    VERIFIED = "verified"
    PARTIALLY_VERIFIED = "partially_verified"
    UNVERIFIED = "unverified"
    CONTRADICTED = "contradicted"
    BLOCKED = "blocked"


# ---------------------------------------------------------------------------
# Models — نماذج البيانات
# ---------------------------------------------------------------------------

class PolicyDecision(BaseModel):
    """Pre-execution policy decision — قرار السياسة قبل التنفيذ"""
    decision: PolicyDecisionType
    reason: str
    reason_ar: str
    tool_name: str
    requires_approval_from: Optional[str] = None
    pdpl_consent_required: bool = False
    budget_remaining: Optional[float] = None


class ToolReceipt(BaseModel):
    """Signed execution receipt — إيصال تنفيذ موقّع"""
    receipt_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    run_id: str = ""
    session_id: str = ""
    agent_id: str = ""
    tool_name: str
    parameters: dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    execution_result: str = ""
    normalized_result: str = ""
    hash_signature: str = ""
    policy_decision: PolicyDecisionType = PolicyDecisionType.ALLOW
    side_effects: list[str] = []
    verification_verdict: VerificationVerdict = VerificationVerdict.UNVERIFIED
    cost_estimate: float = 0.0
    tenant_id: str = ""

    def compute_hash(self) -> str:
        """Generate SHA-256 hash of (tool_name + params + result + timestamp)."""
        payload = (
            f"{self.tool_name}|"
            f"{_stable_dict_str(self.parameters)}|"
            f"{self.execution_result}|"
            f"{self.timestamp.isoformat()}"
        )
        self.hash_signature = hashlib.sha256(payload.encode("utf-8")).hexdigest()
        return self.hash_signature

    def normalize_result(self) -> str:
        """Normalize execution result for comparison."""
        raw = self.execution_result.lower().strip()
        for noise in ["ok", "success", "done", "completed", "تم", "نجح"]:
            raw = raw.replace(noise, "SUCCESS")
        for err in ["error", "fail", "exception", "خطأ", "فشل"]:
            raw = raw.replace(err, "ERROR")
        self.normalized_result = raw
        return raw


def _stable_dict_str(d: dict) -> str:
    """Deterministic string representation of a dict for hashing."""
    return "|".join(f"{k}={v}" for k, v in sorted(d.items()))


# ---------------------------------------------------------------------------
# Pre-Execution Policy — سياسة ما قبل التنفيذ
# ---------------------------------------------------------------------------

class PreExecutionPolicy:
    """
    Decide allow/block/hold before tool execution.
    تحديد السماح/الحظر/التعليق قبل تنفيذ الأداة.
    """

    SAFE_TOOLS: set[str] = {
        "read_file", "search", "query_db_readonly", "get_status",
        "list_leads", "get_deal", "get_pipeline", "view_analytics",
        "check_consent", "get_sequence_status",
    }

    HOLD_TOOLS: set[str] = {
        "send_message", "send_whatsapp", "send_email", "send_sms",
        "update_deal", "assign_lead", "create_proposal",
        "change_stage", "update_score", "create_sequence",
        "schedule_meeting", "update_territory",
    }

    BLOCK_TOOLS: set[str] = {
        "delete_tenant", "drop_table", "bulk_delete", "export_all_data",
        "reset_database", "delete_all_leads", "purge_audit_log",
        "disable_pdpl", "bypass_consent", "modify_permissions_bulk",
    }

    MESSAGING_TOOLS: set[str] = {
        "send_message", "send_whatsapp", "send_email", "send_sms",
    }

    ROLE_PERMISSIONS: dict[str, set[str]] = {
        "owner": SAFE_TOOLS | HOLD_TOOLS,
        "admin": SAFE_TOOLS | HOLD_TOOLS,
        "manager": SAFE_TOOLS | {"update_deal", "assign_lead", "create_proposal", "change_stage"},
        "sales_rep": SAFE_TOOLS | {"send_message", "send_whatsapp", "send_email", "update_deal"},
        "viewer": SAFE_TOOLS,
    }

    DEFAULT_BUDGET_LIMIT: float = 100.0  # SAR per session

    def __init__(self):
        self._session_costs: dict[str, float] = defaultdict(float)

    def evaluate(
        self,
        tool_name: str,
        params: dict[str, Any],
        user_context: dict[str, Any],
    ) -> PolicyDecision:
        """
        Check tool against policy classes, role, PDPL, and budget.
        فحص الأداة مقابل فئات السياسة والدور والموافقة والميزانية.
        """
        user_role = user_context.get("role", "viewer")
        session_id = user_context.get("session_id", "unknown")
        has_consent = user_context.get("has_consent", False)
        budget_limit = user_context.get("budget_limit", self.DEFAULT_BUDGET_LIMIT)

        # Class C — absolute block
        if tool_name in self.BLOCK_TOOLS:
            logger.warning(
                "محظور: أداة %s محظورة بالكامل (المستخدم: %s)",
                tool_name, user_context.get("user_id", "unknown"),
            )
            return PolicyDecision(
                decision=PolicyDecisionType.BLOCK,
                reason=f"Tool '{tool_name}' is in the BLOCK list. This action is forbidden.",
                reason_ar=f"الأداة '{tool_name}' محظورة. هذا الإجراء ممنوع.",
                tool_name=tool_name,
            )

        # Role check
        allowed_tools = self.ROLE_PERMISSIONS.get(user_role, self.SAFE_TOOLS)
        if tool_name not in allowed_tools and tool_name not in self.SAFE_TOOLS:
            return PolicyDecision(
                decision=PolicyDecisionType.BLOCK,
                reason=f"Role '{user_role}' lacks permission for tool '{tool_name}'.",
                reason_ar=f"الدور '{user_role}' لا يملك صلاحية استخدام الأداة '{tool_name}'.",
                tool_name=tool_name,
            )

        # PDPL consent check for messaging
        if tool_name in self.MESSAGING_TOOLS and not has_consent:
            return PolicyDecision(
                decision=PolicyDecisionType.BLOCK,
                reason="PDPL consent required before sending messages.",
                reason_ar="مطلوب موافقة نظام حماية البيانات قبل إرسال الرسائل.",
                tool_name=tool_name,
                pdpl_consent_required=True,
            )

        # Budget check
        estimated_cost = self._estimate_cost(tool_name, params)
        current_spent = self._session_costs[session_id]
        if current_spent + estimated_cost > budget_limit:
            return PolicyDecision(
                decision=PolicyDecisionType.HOLD,
                reason=f"Budget limit would be exceeded. Spent: {current_spent:.2f}, "
                       f"estimated: {estimated_cost:.2f}, limit: {budget_limit:.2f} SAR.",
                reason_ar=f"سيتم تجاوز حد الميزانية. المصروف: {current_spent:.2f}، "
                          f"التقدير: {estimated_cost:.2f}، الحد: {budget_limit:.2f} ريال.",
                tool_name=tool_name,
                budget_remaining=budget_limit - current_spent,
            )

        # Hold tools need approval
        if tool_name in self.HOLD_TOOLS:
            approver = "manager" if user_role == "sales_rep" else "admin"
            return PolicyDecision(
                decision=PolicyDecisionType.HOLD,
                reason=f"Tool '{tool_name}' requires approval before execution.",
                reason_ar=f"الأداة '{tool_name}' تتطلب موافقة قبل التنفيذ.",
                tool_name=tool_name,
                requires_approval_from=approver,
            )

        # Safe tools — allow
        return PolicyDecision(
            decision=PolicyDecisionType.ALLOW,
            reason=f"Tool '{tool_name}' is safe for execution.",
            reason_ar=f"الأداة '{tool_name}' آمنة للتنفيذ.",
            tool_name=tool_name,
        )

    def record_cost(self, session_id: str, cost: float) -> None:
        """Record actual cost for budget tracking."""
        self._session_costs[session_id] += cost

    def _estimate_cost(self, tool_name: str, params: dict) -> float:
        """Estimate cost in SAR for a tool call."""
        cost_map = {
            "send_whatsapp": 0.15,
            "send_sms": 0.08,
            "send_email": 0.02,
            "send_message": 0.10,
            "create_proposal": 0.50,
            "query_db_readonly": 0.001,
            "search": 0.001,
        }
        base = cost_map.get(tool_name, 0.01)
        # Bulk operations cost more
        if "count" in params or "bulk" in tool_name:
            base *= params.get("count", 1)
        return base


# ---------------------------------------------------------------------------
# Receipt Store — مخزن الإيصالات
# ---------------------------------------------------------------------------

class ReceiptStore:
    """In-memory receipt storage with query capabilities."""

    def __init__(self, max_size: int = 50000):
        self._receipts: list[ToolReceipt] = []
        self._max_size = max_size

    def store(self, receipt: ToolReceipt) -> str:
        """Store a receipt and return its ID."""
        receipt.compute_hash()
        receipt.normalize_result()
        self._receipts.append(receipt)
        if len(self._receipts) > self._max_size:
            self._receipts = self._receipts[-self._max_size:]
        logger.info(
            "إيصال محفوظ: %s أداة=%s حكم=%s",
            receipt.receipt_id, receipt.tool_name, receipt.verification_verdict.value,
        )
        return receipt.receipt_id

    def get(self, receipt_id: str) -> Optional[ToolReceipt]:
        for r in self._receipts:
            if r.receipt_id == receipt_id:
                return r
        return None

    def query(
        self,
        agent_id: str = None,
        tool_name: str = None,
        verdict: VerificationVerdict = None,
        since: datetime = None,
        limit: int = 100,
    ) -> list[ToolReceipt]:
        results = self._receipts
        if agent_id:
            results = [r for r in results if r.agent_id == agent_id]
        if tool_name:
            results = [r for r in results if r.tool_name == tool_name]
        if verdict:
            results = [r for r in results if r.verification_verdict == verdict]
        if since:
            results = [r for r in results if r.timestamp >= since]
        return results[-limit:]


# ---------------------------------------------------------------------------
# Trust Analytics — تحليلات الثقة
# ---------------------------------------------------------------------------

class TrustAnalytics:
    """
    Track trust metrics across agent workflows.
    تتبع مقاييس الثقة عبر سير عمل الوكلاء.
    """

    def __init__(self, store: ReceiptStore):
        self._store = store

    def get_trust_score(self, agent_id: str) -> float:
        """
        Trust score 0-1 for an agent based on verification history.
        درجة الثقة 0-1 للوكيل بناءً على سجل التحقق.
        """
        receipts = self._store.query(agent_id=agent_id, limit=500)
        if not receipts:
            return 0.5  # Neutral for unknown agents

        weights = {
            VerificationVerdict.VERIFIED: 1.0,
            VerificationVerdict.PARTIALLY_VERIFIED: 0.6,
            VerificationVerdict.UNVERIFIED: 0.3,
            VerificationVerdict.CONTRADICTED: 0.0,
            VerificationVerdict.BLOCKED: 0.2,
        }
        total_weight = sum(weights.get(r.verification_verdict, 0.3) for r in receipts)
        return round(total_weight / len(receipts), 4)

    def get_contradiction_rate(self, agent_id: str) -> float:
        """
        Contradiction rate for an agent.
        معدل التناقض للوكيل.
        """
        receipts = self._store.query(agent_id=agent_id, limit=500)
        if not receipts:
            return 0.0
        contradictions = sum(
            1 for r in receipts
            if r.verification_verdict == VerificationVerdict.CONTRADICTED
        )
        return round(contradictions / len(receipts), 4)

    def get_cost_by_agent(self, period_days: int = 30) -> dict[str, float]:
        """
        Total cost per agent in period.
        إجمالي التكلفة لكل وكيل خلال الفترة.
        """
        since = datetime.now(timezone.utc) - timedelta(days=period_days)
        receipts = self._store.query(since=since, limit=50000)
        costs: dict[str, float] = defaultdict(float)
        for r in receipts:
            costs[r.agent_id] += r.cost_estimate
        return {k: round(v, 4) for k, v in costs.items()}

    def get_blocked_attempts(self, period_days: int = 30) -> list[ToolReceipt]:
        """
        All blocked tool attempts in period.
        جميع محاولات الأدوات المحظورة خلال الفترة.
        """
        since = datetime.now(timezone.utc) - timedelta(days=period_days)
        return self._store.query(
            verdict=VerificationVerdict.BLOCKED, since=since, limit=1000
        )

    def get_hallucination_suspects(self) -> list[ToolReceipt]:
        """
        Claims without matching receipts — possible hallucinations.
        ادعاءات بدون إيصالات مطابقة — هلوسات محتملة.
        """
        all_receipts = self._store.query(limit=5000)
        suspects = []
        for r in all_receipts:
            if r.verification_verdict == VerificationVerdict.CONTRADICTED:
                suspects.append(r)
            elif (
                r.verification_verdict == VerificationVerdict.UNVERIFIED
                and r.execution_result == ""
                and r.tool_name not in PreExecutionPolicy.SAFE_TOOLS
            ):
                suspects.append(r)
        return suspects

    def get_summary(self, agent_id: str = None) -> dict[str, Any]:
        """
        Overall trust summary.
        ملخص الثقة العام.
        """
        receipts = self._store.query(agent_id=agent_id, limit=10000)
        total = len(receipts)
        if total == 0:
            return {"total": 0, "trust_score": 0.5, "message_ar": "لا توجد بيانات"}

        by_verdict: dict[str, int] = defaultdict(int)
        total_cost = 0.0
        for r in receipts:
            by_verdict[r.verification_verdict.value] += 1
            total_cost += r.cost_estimate

        trust = self.get_trust_score(agent_id) if agent_id else 0.5
        return {
            "total": total,
            "by_verdict": dict(by_verdict),
            "trust_score": trust,
            "total_cost_sar": round(total_cost, 2),
            "contradiction_rate": round(
                by_verdict.get("contradicted", 0) / total * 100, 2
            ),
            "message_ar": f"إجمالي العمليات: {total}، درجة الثقة: {trust:.2f}",
        }


# ---------------------------------------------------------------------------
# Global singletons
# ---------------------------------------------------------------------------

pre_execution_policy = PreExecutionPolicy()
receipt_store = ReceiptStore()
trust_analytics = TrustAnalytics(receipt_store)
