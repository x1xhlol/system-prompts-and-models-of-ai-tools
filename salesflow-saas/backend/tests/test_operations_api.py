import pytest


@pytest.mark.asyncio
async def test_operations_snapshot_public_demo(client):
    r = await client.get("/api/v1/operations/snapshot")
    assert r.status_code == 200
    data = r.json()
    assert data.get("demo_mode") is True
    assert "connectors" in data
    assert len(data["connectors"]) >= 1
