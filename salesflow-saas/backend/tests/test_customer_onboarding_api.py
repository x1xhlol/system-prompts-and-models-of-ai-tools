import pytest


@pytest.mark.asyncio
async def test_customer_journey_shape(client):
    r = await client.get("/api/v1/customer-onboarding/journey")
    assert r.status_code == 200
    data = r.json()
    assert data.get("product") == "Dealix"
    assert "roles" in data and len(data["roles"]) >= 4
    assert "phases" in data and len(data["phases"]) >= 4
    first = data["phases"][0]
    assert "steps" in first and len(first["steps"]) >= 1
    step = first["steps"][0]
    assert step.get("id")
    assert step.get("primary_owner_role")
    assert "customer_must_provide_ar" in step


@pytest.mark.asyncio
async def test_acceptance_test_checklist(client):
    r = await client.get("/api/v1/customer-onboarding/acceptance-test")
    assert r.status_code == 200
    body = r.json()
    assert "sections" in body
    assert any("automated" in s.get("id", "") for s in body["sections"]) or any(
        "فحوص آلية" in s.get("title_ar", "") for s in body["sections"]
    )
