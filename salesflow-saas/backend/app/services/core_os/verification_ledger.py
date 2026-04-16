import os
import json
import uuid
import hashlib
from typing import Dict, Any, List
from datetime import datetime
from pathlib import Path

class VerificationLedger:
    """
    Tool Verification Layer for Dealix Sovereign OS.
    Prevents Agent Hallucinations and ensures all autonomous actions are verifiable.
    Implements the ToolProof pattern: logging Intent, Claim, Actual Execution, and side-effects.
    """
    
    def __init__(self, ledger_path: str = "memory/verification_ledger"):
        self.ledger_path = Path(ledger_path)
        self.ledger_path.mkdir(parents=True, exist_ok=True)
        
    def hash_parameters(self, params: Dict[str, Any]) -> str:
        """Create a deterministic hash of tool parameters for audit matching."""
        serialized = json.dumps(params, sort_keys=True)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def create_proof(self, agent_id: str, task_id: str, intended_action: str, 
                     claimed_action: str, current_tool_call: str, 
                     parameters: Dict[str, Any]) -> str:
        """
        Creates an unverified tool proof record BEFORE the tool executes.
        """
        run_id = f"tx_{uuid.uuid4().hex[:10]}"
        timestamp = datetime.utcnow().isoformat()
        
        proof = {
            "run_id": run_id,
            "agent_id": agent_id,
            "task_id": task_id,
            "intended_action": intended_action,
            "claimed_action": claimed_action,
            "actual_tool_call": current_tool_call,
            "parameters_hash": self.hash_parameters(parameters),
            "timestamps": {"started": timestamp},
            "side_effects": [],
            "evidence_paths": [],
            "verification_status": "unverified",
            "contradiction_flag": False,
        }
        
        self._write_proof(run_id, proof)
        return run_id
        
    def resolve_proof(
        self,
        run_id: str,
        side_effects: List[str],
        evidence_paths: List[str],
        status: str,
        *,
        contradiction_flag: bool = False,
    ):
        """
        Updates the proof AFTER execution with actual side effects and sets status to verified.
        Status must be 'verified', 'partially_verified', 'unverified', or 'contradicted'.
        If contradiction_flag is True, status is forced to 'contradicted' and the flag is stored.
        """
        valid_statuses = ["verified", "partially_verified", "unverified", "contradicted"]
        if status not in valid_statuses:
            raise ValueError(f"Status must be one of {valid_statuses}")

        final_status = "contradicted" if contradiction_flag else status
        if final_status not in valid_statuses:
            final_status = "contradicted"

        proof = self._read_proof(run_id)
        if not proof:
            raise KeyError(f"Run ID {run_id} not found in ledger.")

        proof["side_effects"] = side_effects
        proof["evidence_paths"] = evidence_paths
        proof["verification_status"] = final_status
        proof["contradiction_flag"] = bool(contradiction_flag)
        proof["timestamps"]["resolved"] = datetime.utcnow().isoformat()
        
        self._write_proof(run_id, proof)
        
    def _write_proof(self, run_id: str, proof: Dict[str, Any]):
        file_path = self.ledger_path / f"{run_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(proof, f, ensure_ascii=False, indent=2)

    def _read_proof(self, run_id: str) -> Dict[str, Any]:
        file_path = self.ledger_path / f"{run_id}.json"
        if not file_path.exists():
            return None
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
