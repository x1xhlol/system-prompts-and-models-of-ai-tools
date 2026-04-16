from typing import Dict, Any, List
from datetime import datetime, timedelta

class StrategicPMOAgent:
    """
    Strategic PMO Agent for Sovereign OS.
    Translates long-term strategies (e.g., Post-Merger Integration, Global Expansion)
    into tracked workstreams, RAG statuses (Red/Amber/Green), and escalates blockers.
    """
    
    def __init__(self, memory_store, decision_engine):
        self.memory_store = memory_store
        self.decision_engine = decision_engine
        
    def breakdown_initiative(self, initiative_title: str, goals: List[str], deadline_days: int) -> Dict[str, Any]:
        """Takes an executive goal and breaks it down into tracks."""
        # Simulated LLM generation of tasks based on the M&A DD or Expansion Playbook
        tasks = [
            {"task": "Legal Entity Setup", "owner": "Legal", "due_in": min(14, deadline_days), "status": "green"},
            {"task": "Financial Integration", "owner": "Finance", "due_in": min(30, deadline_days), "status": "amber"},
            {"task": "IT Systems Merge", "owner": "IT", "due_in": min(45, deadline_days), "status": "green"}
        ]
        
        return {
            "initiative": initiative_title,
            "overall_status": "amber",
            "deadline_date": (datetime.utcnow() + timedelta(days=deadline_days)).isoformat(),
            "workstreams": tasks
        }
        
    def check_health_and_escalate(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs on CRON (`execution.milestone_due`).
        Escalates if a task belongs in red territory.
        """
        red_tasks = [t for t in initiative_data.get("workstreams", []) if t["status"] == "red"]
        
        if not red_tasks:
            return {"status": "healthy", "escalation_needed": False}
            
        memo_kwargs = {
            "decision_context": f"Critical path slippage detected in: {initiative_data['initiative']}",
            "inputs_used": ["PMO Task Tracker", "Jira Integration"],
            "assumptions": ["Delaying IT systems merge jeopardizes synergy realization"],
            "alternatives_considered": ["Extend deadline", "Allocate emergency budget"],
            "expected_financial_impact": {
                "revenue_upside_sar": 0.0,
                "cost_downside_sar": 50000.0,  # Penalty for delay
                "capital_at_risk_sar": 0.0
            },
            "risk_register": [
                {"risk": "Integration Failure", "severity": "critical", "mitigation": "CEO Intervention required"}
            ],
            "required_approvals": ["CEO", "Chief of Staff"],
            "next_best_action": "Schedule emergency steering committee meeting",
            "rollback_plan": "N/A - Execution pipeline blocker",
            "evidence_links": ["https://jira.dealix.local/board/INT-1"]
        }
        
        memo = self.decision_engine.create_memo(
            agent_id="strategic_pmo",
            objective="Escalate blocked strategic initiative",
            recommendation=f"Intervene immediately in the following red tasks: {[t['task'] for t in red_tasks]}",
            confidence=95.0,
            **memo_kwargs
        )
        
        # Save escalation to memory
        self.memory_store.store_item(
            domain="runbooks",
            title=f"ESCALATION: {initiative_data['initiative']}",
            memory_type="Escalation Memo",
            owner="Chief of Staff",
            confidence=95,
            summary=memo.recommendation_ar,
            tags=["escalation", "red-flag"]
        )
        
        return {"status": "escalated", "memo": memo.to_json()}
