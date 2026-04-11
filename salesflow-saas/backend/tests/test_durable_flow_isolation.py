import pytest

from app.flows.prospecting_durable_flow import prospecting_durable_flow


@pytest.mark.asyncio
async def test_prospecting_flow_tenant_isolation():
    deal = {
        "company_name": "Isolation Co",
        "decision_maker": "CEO",
        "phone": "966500000001",
        "approval_token": "approved",
        "web_signals": [{"score": 80}],
        "email_signals": [{"score": 70}],
        "call_signals": [{"score": 60}],
        "linkedin_signals": [{"score": 50}],
    }

    run_a = await prospecting_durable_flow.run("tenant_a", deal)
    run_b = await prospecting_durable_flow.run("tenant_b", deal)

    assert run_a["tenant_id"] == "tenant_a"
    assert run_b["tenant_id"] == "tenant_b"
    assert run_a["tenant_id"] != run_b["tenant_id"]
    assert run_a["run_id"] != run_b["run_id"]
