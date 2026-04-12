#!/usr/bin/env python3
"""
Scan frontend/src for /api/v1/... path strings (quoted literals and template tails
like `${base}/api/v1/foo`) and verify matches against the FastAPI OpenAPI schema.

Run from anywhere:
  py -3 salesflow-saas/scripts/verify_frontend_openapi_paths.py

Requires backend deps on PYTHONPATH (run after: cd salesflow-saas/backend && py -3 -m pip install -r requirements.txt).
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

# OpenAPI path keys that include `{param}` — frontend may call only a static prefix;
# add here if a component uses a dynamic segment we do not parse.
OPENAPI_PATH_ALLOWLIST: frozenset[str] = frozenset()


def _normalize_path(raw: str) -> str | None:
    s = raw.strip().rstrip("/")
    if "${" in s or (s.count("{") > s.count("}") and "{" in s):
        return None
    if s.endswith("/api/v1") or not s.startswith("/api/v1"):
        return None
    if "?" in s:
        s = s.split("?", 1)[0].rstrip("/")
    return s or None


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

    found: set[str] = set()

    # Quoted literals: '/api/v1/foo' or "/api/v1/foo"
    pat_quoted = re.compile(r"""['"`]((/api/v1/[a-zA-Z0-9_\-./?&=]+))['"`]""")

    # Template: ${base}/api/v1/foo  (same line may include ?query=…)
    pat_after_subst = re.compile(r"\$\{[^}]+\}(/api/v1/[a-zA-Z0-9_\-./]+)")

    for p in fe_src.rglob("*"):
        if p.suffix not in (".ts", ".tsx"):
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")

        for m in pat_quoted.finditer(text):
            norm = _normalize_path(m.group(1))
            if norm:
                found.add(norm)

        for m in pat_after_subst.finditer(text):
            # Path group stops before `?` (query string not part of OpenAPI path keys).
            norm = _normalize_path(m.group(1))
            if norm:
                found.add(norm)

    missing: list[str] = []
    for path in sorted(found):
        if path in OPENAPI_PATH_ALLOWLIST:
            continue
        if path in open_paths:
            continue
        # Accept if any OpenAPI path is this prefix followed by /{param}
        matched = False
        for op in open_paths:
            if op.startswith(path + "/{") or op == path:
                matched = True
                break
        if not matched:
            missing.append(path)

    if missing:
        print("Frontend paths not found as exact OpenAPI paths (or known prefix):")
        for m in missing:
            print(f"  - {m}")
        print("\nTip: path params in OpenAPI use {id}; extend OPENAPI_PATH_ALLOWLIST if intentional.")
        return 1

    print(f"OK: {len(found)} /api/v1 paths from frontend match OpenAPI.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
