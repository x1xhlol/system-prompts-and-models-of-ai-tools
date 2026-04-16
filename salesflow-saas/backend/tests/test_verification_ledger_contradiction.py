"""Verification ledger contradiction flag (Completion Program WS4)."""
from __future__ import annotations

from pathlib import Path

from app.services.core_os.verification_ledger import VerificationLedger


def test_resolve_proof_contradiction_flag_forces_status(tmp_path: Path):
    ledger = VerificationLedger(ledger_path=str(tmp_path / "vl"))
    run_id = ledger.create_proof(
        agent_id="a1",
        task_id="t1",
        intended_action="send_email",
        claimed_action="send_email",
        current_tool_call="email.send",
        parameters={"to": "x@y.com"},
    )
    ledger.resolve_proof(
        run_id,
        [],
        [],
        "verified",
        contradiction_flag=True,
    )
    proof = ledger._read_proof(run_id)
    assert proof["verification_status"] == "contradicted"
    assert proof["contradiction_flag"] is True
