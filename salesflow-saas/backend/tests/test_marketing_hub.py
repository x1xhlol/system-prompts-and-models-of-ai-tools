"""Marketing hub JSON + static paths."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_marketing_hub_json():
    r = client.get("/api/v1/marketing/hub")
    assert r.status_code == 200
    data = r.json()
    assert "paths" in data
    assert data["paths"]["marketing_zip"].endswith(".zip")
    assert "/dealix-marketing/" in data["paths"]["marketing_index"]


def test_dealix_marketing_index_when_enabled():
    r = client.get("/dealix-marketing/index.html")
    assert r.status_code == 200
    assert b"dealix-marketing-bundle" in r.content or b"Dealix" in r.content
