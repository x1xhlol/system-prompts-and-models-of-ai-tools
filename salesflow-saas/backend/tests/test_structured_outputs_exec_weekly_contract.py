"""Schema / contract CI: ExecWeeklyGovernanceContract round-trip."""

from app.schemas.structured_outputs import ExecWeeklyGovernanceContract, Provenance


def test_exec_weekly_governance_contract_roundtrip():
    p = Provenance(generated_by="pytest", confidence=0.9)
    m = ExecWeeklyGovernanceContract(
        week_of="2026-W16",
        changes_summary="Closed Tier-1 gates",
        pending_decisions=["CFO sign-off"],
        blockers_summary="None",
        at_risk_items=["connector X"],
        next_best_actions=["Run RC checklist"],
        provenance=p,
    )
    d = m.model_dump(mode="json")
    m2 = ExecWeeklyGovernanceContract.model_validate(d)
    assert m2.pending_decisions == ["CFO sign-off"]
