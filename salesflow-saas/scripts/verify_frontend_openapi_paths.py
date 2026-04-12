#!/usr/bin/env python3
"""
Scan frontend/src for literal /api/v1/... path strings and verify exact matches
against the FastAPI OpenAPI schema.

Run from anywhere:
  py salesflow-saas/scripts/verify_frontend_openapi_paths.py

Requires backend deps on PYTHONPATH (run after: cd salesflow-saas/backend && py -m pip install -r requirements.txt).
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path


def main() -> int:
    saas = Path(__file__).resolve().parent.parent
    backend = saas / "backend"
    fe_src = saas / "frontend" / "src"

    os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./openapi_verify.db")
    os.environ.setdefault("DEALIX_INTERNAL_API_TOKEN", "")
    sys.path.insert(0, str(backend))
    os.chdir(backend)

    from app.main import app

    schema = app.openapi()
    open_paths = {p.rstrip("/") or "/" for p in schema.get("paths", {}).keys()}

    # Literal path segments in quotes or template strings (no ${...} inside path)
    pat = re.compile(r"""['"`]((/api/v1/[a-zA-Z0-9_\-./]+))['"`]""")
    found: set[str] = set()
    for p in fe_src.rglob("*"):
        if p.suffix not in (".ts", ".tsx"):
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        for m in pat.finditer(text):
            raw = m.group(1).rstrip("/")
            if "${" in raw or "{" in raw:
                continue
            if raw.endswith("/api/v1"):
                continue
            found.add(raw)

    missing = sorted(p for p in found if p not in open_paths)
    if missing:
        print("Frontend literal paths not found as exact OpenAPI paths (may use path params or be dynamic):")
        for m in missing:
            print(f"  - {m}")
        print("\nTip: paths with {{id}} in OpenAPI need manual review.")
        return 1

    print(f"OK: {len(found)} literal /api/v1 paths match OpenAPI.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
