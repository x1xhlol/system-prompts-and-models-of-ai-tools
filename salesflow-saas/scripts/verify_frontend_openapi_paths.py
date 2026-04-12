#!/usr/bin/env python3
"""
Scan frontend/src for /api/v1/... path strings and verify exact matches
against the FastAPI OpenAPI schema.

Detects:
  - Quoted literals: '/api/v1/foo', "/api/v1/foo", `/api/v1/foo`
  - Template tails after ${...}: `${base}/api/v1/foo` (query string stripped)

Run from anywhere:
  py -3 salesflow-saas/scripts/verify_frontend_openapi_paths.py

Requires backend deps on PYTHONPATH (run after: cd salesflow-saas/backend && py -m pip install -r requirements.txt).
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

# Paths that appear in the frontend but use OpenAPI path parameters ({id}, etc.)
# or are intentionally not registered as separate operations — extend only with a comment.
OPENAPI_PATH_ALLOWLIST: frozenset[str] = frozenset()


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

    quoted = re.compile(r"""['"`]((/api/v1/[a-zA-Z0-9_\-./]+))['"`]""")
    after_subst = re.compile(r"\$\{[^}]+\}(/api/v1/[a-zA-Z0-9_\-./]+)")

    found: set[str] = set()
    for p in fe_src.rglob("*"):
        if p.suffix not in (".ts", ".tsx"):
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        for pat in (quoted,):
            for m in pat.finditer(text):
                raw = m.group(1).split("?")[0].rstrip("/")
                if "${" in raw or "{" in raw:
                    continue
                if raw.endswith("/api/v1"):
                    continue
                found.add(raw)
        for m in after_subst.finditer(text):
            raw = m.group(1).split("?")[0].rstrip("/")
            if raw.endswith("/api/v1"):
                continue
            found.add(raw)

    missing = sorted(p for p in found if p not in open_paths and p not in OPENAPI_PATH_ALLOWLIST)
    if missing:
        print("Frontend paths not found as exact OpenAPI paths (may use path params or be dynamic):")
        for m in missing:
            print(f"  - {m}")
        print("\nTip: paths with {id} in OpenAPI need allowlisting or a manual mapping.")
        return 1

    print(f"OK: {len(found)} /api/v1 paths in frontend match OpenAPI.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
