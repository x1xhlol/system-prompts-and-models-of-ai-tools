#!/usr/bin/env python3
"""
Dealix AI quality gate (lightweight).

Validates:
1) Golden rubric file exists and has expected top-level sections.
2) In-process API route /api/v1/dealix/ai-eval/golden returns JSON.

Optional:
--json prints the fetched payload.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    backend = root / "backend"
    golden = backend / "app" / "data" / "ai_eval_golden.json"

    if not golden.exists():
        print(f"AI quality gate FAILED: missing {golden}")
        return 1

    try:
        payload = json.loads(golden.read_text(encoding="utf-8"))
    except Exception as exc:  # pragma: no cover - defensive
        print(f"AI quality gate FAILED: invalid JSON in golden file ({exc})")
        return 1

    expected_any = ("channel_drafts", "enrich_exploration", "version")
    if not any(key in payload for key in expected_any):
        print("AI quality gate FAILED: golden rubric missing expected sections")
        print(f"Expected one of: {', '.join(expected_any)}")
        return 1

    os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./ai_quality_gate.db")
    os.environ.setdefault("DEALIX_INTERNAL_API_TOKEN", "")
    sys.path.insert(0, str(backend))
    os.chdir(backend)

    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    res = client.get("/api/v1/dealix/ai-eval/golden")
    if res.status_code != 200:
        print(f"AI quality gate FAILED: GET /dealix/ai-eval/golden => {res.status_code}")
        return 1

    if "--json" in sys.argv:
        try:
            print(json.dumps(res.json(), ensure_ascii=False, indent=2))
        except Exception:
            print(res.text[:1200])

    print("AI quality gate: OK")
    print("Golden rubric exists and API endpoint is readable.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
