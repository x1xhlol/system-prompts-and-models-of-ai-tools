import pytest


@pytest.mark.asyncio
async def test_commission_ledger_public_demo(client):
    r = await client.get("/api/v1/sales-os/commission-ledger")
    assert r.status_code == 200
    data = r.json()
    assert data.get("demo_mode") is True
    assert len(data.get("items", [])) >= 1
    assert data["items"][0].get("amount_sar") is not None


@pytest.mark.asyncio
async def test_rep_onboarding(client):
    r = await client.get("/api/v1/sales-os/rep-onboarding")
    assert r.status_code == 200
    assert "phases" in r.json()


@pytest.mark.asyncio
async def test_overview_public_partial(client):
    r = await client.get("/api/v1/sales-os/overview")
    assert r.status_code == 200
    body = r.json()
    assert body.get("commission_ledger", {}).get("demo_mode") is True
    assert "rep_onboarding" in body
    assert body.get("daily_digest") is None
