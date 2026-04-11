import pytest


@pytest.mark.asyncio
async def test_affiliate_program_public_json(client):
    r = await client.get("/api/v1/affiliates/program")
    assert r.status_code == 200
    data = r.json()
    assert "journey_ar" in data
    assert "commission_rates" in data
    assert len(data["journey_ar"]) >= 3


@pytest.mark.asyncio
async def test_leaderboard_path_not_confused_with_uuid(client):
    """Regression: /leaderboard/top must not match /{affiliate_id}."""
    r = await client.get("/api/v1/affiliates/leaderboard/top")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
