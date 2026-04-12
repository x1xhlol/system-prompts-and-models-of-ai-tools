#!/usr/bin/env python3
"""
Print a short summary of GET /api/v1/autonomous-foundation/integrations/go-live-gate.

Uses the in-process FastAPI app (same deps as pytest). Does not start uvicorn.

Run from repo:
  cd salesflow-saas && py -3 scripts/check_go_live_gate.py

Against a running API instead:
  curl -sS http://127.0.0.1:8000/api/v1/autonomous-foundation/integrations/go-live-gate | py -3 -m json.tool

Exit code: 0 always (informational). Use HTTP status / launch_allowed in the JSON when calling from CI.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path


def main() -> int:
    saas = Path(__file__).resolve().parent.parent
    backend = saas / "backend"
    os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./go_live_gate_cli.db")
    os.environ.setdefault("DEALIX_INTERNAL_API_TOKEN", "")
    sys.path.insert(0, str(backend))
    os.chdir(backend)

    from fastapi.testclient import TestClient
    from app.main import app

    c = TestClient(app)
    r = c.get("/api/v1/autonomous-foundation/integrations/go-live-gate")
    try:
        body = r.json()
    except Exception:
        print("HTTP", r.status_code, "non-JSON body", r.text[:500])
        return 0

    la = body.get("launch_allowed")
    print(f"HTTP {r.status_code}  launch_allowed={la}")
    print(f"readiness_percent_total={body.get('readiness_percent_total')}")
    br = body.get("blocked_reasons") or []
    if br:
        print("blocked_reasons (up to 8):")
        for line in br[:8]:
            print(f"  - {line}")
    blocking = body.get("blocking") or []
    print(f"blocking_checks={len(blocking)}")
    if "--json" in sys.argv:
        print(json.dumps(body, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
