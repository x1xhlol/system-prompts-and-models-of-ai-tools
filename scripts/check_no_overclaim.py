#!/usr/bin/env python3
"""
Fail-closed scan for obvious documentation overclaim (Tier-1 governance CI).

Rules (conservative): flag lines that assert production deployment of gated tech
(Temporal, OPA, OpenFGA, Vault, Keycloak) without a negation on the same line.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Scan governance-facing markdown under repo root + salesflow-saas/docs subset.
GLOBS = [
    "docs/**/*.md",
    "MASTER_OPERATING_PROMPT.md",
    "AGENTS.md",
    "CLAUDE.md",
    "salesflow-saas/docs/**/*.md",
]

NEGATION = re.compile(
    r"\b(planned|pilot|doconly|watch|target|not\s+implemented|spike|proposed|optional)\b",
    re.IGNORECASE,
)
TECH = re.compile(
    r"\b(temporal|open\s*fga|openfga|\bopa\b|vault|keycloak)\b",
    re.IGNORECASE,
)
CLAIM = re.compile(
    r"\b(in\s+production|production\s+deploy|fully\s+shipped|deployed\s+to\s+prod)\b",
    re.IGNORECASE,
)


def collect_files() -> list[Path]:
    out: list[Path] = []
    for g in GLOBS:
        if "**" in g:
            out.extend(p for p in ROOT.glob(g) if p.is_file())
        else:
            p = ROOT / g
            if p.is_file():
                out.append(p)
    return sorted(set(out))


def main() -> int:
    errors: list[str] = []
    for path in collect_files():
        if "node_modules" in path.parts or ".cursor" in path.parts:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        rel = path.relative_to(ROOT)
        for i, line in enumerate(text.splitlines(), 1):
            if not CLAIM.search(line) or not TECH.search(line):
                continue
            if NEGATION.search(line):
                continue
            errors.append(f"{rel}:{i}: possible overclaim: {line.strip()[:200]}")

    if errors:
        print("NO_OVERCLAIM_FAIL", file=sys.stderr)
        for e in errors[:50]:
            print(e, file=sys.stderr)
        if len(errors) > 50:
            print(f"... and {len(errors) - 50} more", file=sys.stderr)
        return 1
    print(f"no-overclaim OK ({len(collect_files())} files scanned)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
