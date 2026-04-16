from pydantic import BaseModel, ConfigDict, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

class RiskRegisterItem(BaseModel):
    risk: str
    severity: str  # "high", "medium", "low", "critical"
    mitigation: str

class FinancialImpact(BaseModel):
    revenue_upside_sar: float = 0.0
    cost_downside_sar: float = 0.0
    capital_at_risk_sar: float = 0.0

class AuditMetadata(BaseModel):
    verified: bool = False
    tool_proof_id: Optional[str] = None
    policy_check_passed: bool = False
    agent_id: str
    timestamp: str

class DecisionMemo(BaseModel):
    """
    The Universal Output Contract (Decision Memo)
    All Sovereign Growth OS Agents MUST return this exact schema.
    """
    model_config = ConfigDict(extra="allow")

    memo_id: str = Field(default_factory=lambda: f"memo_{uuid.uuid4().hex[:10]}")
    objective: str
    decision_context: str
    inputs_used: List[str]
    assumptions: List[str]
    recommendation_ar: str
    alternatives_considered: List[str]
    expected_financial_impact: FinancialImpact
    risk_register: List[RiskRegisterItem]
    confidence_score: float = Field(ge=0, le=100)
    required_approvals: List[str]
    next_best_action: str
    rollback_plan: str
    evidence_links: List[str]
    audit_metadata: AuditMetadata

    def to_json(self) -> Dict[str, Any]:
        return self.model_dump()
        
    @classmethod
    def create_memo(cls, agent_id: str, objective: str, recommendation: str, 
                    confidence: float, **kwargs) -> 'DecisionMemo':
        """Helper to safely instantiate memos with timestamps included."""
        audit = AuditMetadata(
            agent_id=agent_id,
            timestamp=datetime.utcnow().isoformat()
        )
        kwargs["audit_metadata"] = audit
        kwargs["objective"] = objective
        kwargs["recommendation_ar"] = recommendation
        kwargs["confidence_score"] = confidence
        return cls(**kwargs)
