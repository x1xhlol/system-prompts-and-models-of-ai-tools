"""
Tool Receipts — Dealix ToolProof Enhancement
Signed execution receipts, pre-execution policy, and trust analytics.
Extends tool_verification.py with cryptographic receipts and policy enforcement.
"""
import hashlib, logging, uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class PolicyDecisionType(str, Enum):
    ALLOW = "allow"; BLOCK = "block"; HOLD = "hold"

class VerificationVerdict(str, Enum):
    VERIFIED = "verified"; PARTIALLY_VERIFIED = "partially_verified"
    UNVERIFIED = "unverified"; CONTRADICTED = "contradicted"; BLOCKED = "blocked"


class PolicyDecision(BaseModel):
    """قرار السياسة قبل التنفيذ"""
    decision: PolicyDecisionType; reason: str; reason_ar: str; tool_name: str
    requires_approval_from: Optional[str] = None
    pdpl_consent_required: bool = False
    budget_remaining: Optional[float] = None


class ToolReceipt(BaseModel):
    """إيصال تنفيذ موقّع"""
    receipt_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    run_id: str = ""; session_id: str = ""; agent_id: str = ""
    tool_name: str; parameters: dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    execution_result: str = ""; normalized_result: str = ""
    hash_signature: str = ""
    policy_decision: PolicyDecisionType = PolicyDecisionType.ALLOW
    side_effects: list[str] = []
    verification_verdict: VerificationVerdict = VerificationVerdict.UNVERIFIED
    cost_estimate: float = 0.0; tenant_id: str = ""

    def compute_hash(self) -> str:
        payload = f"{self.tool_name}|{'|'.join(f'{k}={v}' for k,v in sorted(self.parameters.items()))}|{self.execution_result}|{self.timestamp.isoformat()}"
        self.hash_signature = hashlib.sha256(payload.encode()).hexdigest()
        return self.hash_signature

    def normalize_result(self) -> str:
        raw = self.execution_result.lower().strip()
        for w in ["ok","success","done","completed","تم","نجح"]: raw = raw.replace(w, "SUCCESS")
        for w in ["error","fail","exception","خطأ","فشل"]: raw = raw.replace(w, "ERROR")
        self.normalized_result = raw; return raw


class PreExecutionPolicy:
    """تحديد السماح/الحظر/التعليق قبل تنفيذ الأداة."""
    SAFE_TOOLS = {"read_file","search","query_db_readonly","get_status","list_leads",
        "get_deal","get_pipeline","view_analytics","check_consent","get_sequence_status"}
    HOLD_TOOLS = {"send_message","send_whatsapp","send_email","send_sms","update_deal",
        "assign_lead","create_proposal","change_stage","update_score","create_sequence",
        "schedule_meeting","update_territory"}
    BLOCK_TOOLS = {"delete_tenant","drop_table","bulk_delete","export_all_data",
        "reset_database","delete_all_leads","purge_audit_log","disable_pdpl",
        "bypass_consent","modify_permissions_bulk"}
    MSG_TOOLS = {"send_message","send_whatsapp","send_email","send_sms"}
    ROLE_PERMS: dict[str, set[str]] = {
        "owner": SAFE_TOOLS | HOLD_TOOLS, "admin": SAFE_TOOLS | HOLD_TOOLS,
        "manager": SAFE_TOOLS | {"update_deal","assign_lead","create_proposal","change_stage"},
        "sales_rep": SAFE_TOOLS | {"send_message","send_whatsapp","send_email","update_deal"},
        "viewer": SAFE_TOOLS}
    BUDGET_LIMIT = 100.0  # SAR per session
    COST_MAP = {"send_whatsapp": 0.15, "send_sms": 0.08, "send_email": 0.02,
        "send_message": 0.10, "create_proposal": 0.50, "query_db_readonly": 0.001}

    def __init__(self):
        self._costs: dict[str, float] = defaultdict(float)

    def evaluate(self, tool_name: str, params: dict[str, Any], user_context: dict[str, Any]) -> PolicyDecision:
        role = user_context.get("role", "viewer")
        sid = user_context.get("session_id", "unknown")
        limit = user_context.get("budget_limit", self.BUDGET_LIMIT)
        if tool_name in self.BLOCK_TOOLS:
            logger.warning("محظور: %s (المستخدم: %s)", tool_name, user_context.get("user_id", "?"))
            return PolicyDecision(decision=PolicyDecisionType.BLOCK, tool_name=tool_name,
                reason=f"Tool '{tool_name}' is forbidden.", reason_ar=f"الأداة '{tool_name}' محظورة.")
        allowed = self.ROLE_PERMS.get(role, self.SAFE_TOOLS)
        if tool_name not in allowed and tool_name not in self.SAFE_TOOLS:
            return PolicyDecision(decision=PolicyDecisionType.BLOCK, tool_name=tool_name,
                reason=f"Role '{role}' lacks permission for '{tool_name}'.",
                reason_ar=f"الدور '{role}' لا يملك صلاحية '{tool_name}'.")
        if tool_name in self.MSG_TOOLS and not user_context.get("has_consent", False):
            return PolicyDecision(decision=PolicyDecisionType.BLOCK, tool_name=tool_name,
                reason="PDPL consent required.", reason_ar="مطلوب موافقة حماية البيانات.",
                pdpl_consent_required=True)
        est = self.COST_MAP.get(tool_name, 0.01) * params.get("count", 1)
        if self._costs[sid] + est > limit:
            return PolicyDecision(decision=PolicyDecisionType.HOLD, tool_name=tool_name,
                reason=f"Budget exceeded ({self._costs[sid]:.2f}+{est:.2f} > {limit:.2f} SAR).",
                reason_ar=f"تجاوز الميزانية.", budget_remaining=limit - self._costs[sid])
        if tool_name in self.HOLD_TOOLS:
            approver = "manager" if role == "sales_rep" else "admin"
            return PolicyDecision(decision=PolicyDecisionType.HOLD, tool_name=tool_name,
                reason=f"'{tool_name}' requires approval.", reason_ar=f"'{tool_name}' تتطلب موافقة.",
                requires_approval_from=approver)
        return PolicyDecision(decision=PolicyDecisionType.ALLOW, tool_name=tool_name,
            reason=f"'{tool_name}' is safe.", reason_ar=f"'{tool_name}' آمنة.")

    def record_cost(self, session_id: str, cost: float) -> None:
        self._costs[session_id] += cost


class ReceiptStore:
    """مخزن الإيصالات في الذاكرة"""
    def __init__(self, max_size: int = 50000):
        self._receipts: list[ToolReceipt] = []; self._max = max_size

    def store(self, receipt: ToolReceipt) -> str:
        receipt.compute_hash(); receipt.normalize_result()
        self._receipts.append(receipt)
        if len(self._receipts) > self._max: self._receipts = self._receipts[-self._max:]
        logger.info("إيصال: %s أداة=%s حكم=%s", receipt.receipt_id, receipt.tool_name, receipt.verification_verdict.value)
        return receipt.receipt_id

    def get(self, receipt_id: str) -> Optional[ToolReceipt]:
        return next((r for r in self._receipts if r.receipt_id == receipt_id), None)

    def query(self, agent_id: str = None, tool_name: str = None,
              verdict: VerificationVerdict = None, since: datetime = None, limit: int = 100) -> list[ToolReceipt]:
        r = self._receipts
        if agent_id: r = [x for x in r if x.agent_id == agent_id]
        if tool_name: r = [x for x in r if x.tool_name == tool_name]
        if verdict: r = [x for x in r if x.verification_verdict == verdict]
        if since: r = [x for x in r if x.timestamp >= since]
        return r[-limit:]


class TrustAnalytics:
    """تتبع مقاييس الثقة عبر سير عمل الوكلاء"""
    WEIGHTS = {VerificationVerdict.VERIFIED: 1.0, VerificationVerdict.PARTIALLY_VERIFIED: 0.6,
        VerificationVerdict.UNVERIFIED: 0.3, VerificationVerdict.CONTRADICTED: 0.0,
        VerificationVerdict.BLOCKED: 0.2}

    def __init__(self, store: ReceiptStore):
        self._store = store

    def get_trust_score(self, agent_id: str) -> float:
        recs = self._store.query(agent_id=agent_id, limit=500)
        if not recs: return 0.5
        return round(sum(self.WEIGHTS.get(r.verification_verdict, 0.3) for r in recs) / len(recs), 4)

    def get_contradiction_rate(self, agent_id: str) -> float:
        recs = self._store.query(agent_id=agent_id, limit=500)
        if not recs: return 0.0
        return round(sum(1 for r in recs if r.verification_verdict == VerificationVerdict.CONTRADICTED) / len(recs), 4)

    def get_cost_by_agent(self, period_days: int = 30) -> dict[str, float]:
        since = datetime.now(timezone.utc) - timedelta(days=period_days)
        costs: dict[str, float] = defaultdict(float)
        for r in self._store.query(since=since, limit=50000): costs[r.agent_id] += r.cost_estimate
        return {k: round(v, 4) for k, v in costs.items()}

    def get_blocked_attempts(self, period_days: int = 30) -> list[ToolReceipt]:
        return self._store.query(verdict=VerificationVerdict.BLOCKED,
            since=datetime.now(timezone.utc) - timedelta(days=period_days), limit=1000)

    def get_hallucination_suspects(self) -> list[ToolReceipt]:
        return [r for r in self._store.query(limit=5000)
            if r.verification_verdict == VerificationVerdict.CONTRADICTED
            or (r.verification_verdict == VerificationVerdict.UNVERIFIED
                and not r.execution_result and r.tool_name not in PreExecutionPolicy.SAFE_TOOLS)]

    def get_summary(self, agent_id: str = None) -> dict[str, Any]:
        recs = self._store.query(agent_id=agent_id, limit=10000)
        if not recs: return {"total": 0, "trust_score": 0.5, "message_ar": "لا توجد بيانات"}
        by_v: dict[str, int] = defaultdict(int)
        cost = 0.0
        for r in recs: by_v[r.verification_verdict.value] += 1; cost += r.cost_estimate
        ts = self.get_trust_score(agent_id) if agent_id else 0.5
        return {"total": len(recs), "by_verdict": dict(by_v), "trust_score": ts,
            "total_cost_sar": round(cost, 2),
            "contradiction_rate": round(by_v.get("contradicted", 0) / len(recs) * 100, 2),
            "message_ar": f"عمليات: {len(recs)}، ثقة: {ts:.2f}"}


pre_execution_policy = PreExecutionPolicy()
receipt_store = ReceiptStore()
trust_analytics = TrustAnalytics(receipt_store)
