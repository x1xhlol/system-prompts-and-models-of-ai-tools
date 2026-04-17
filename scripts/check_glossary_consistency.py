#!/usr/bin/env python3
"""Lightweight glossary presence check for Tier-1 Docs/Governance CI."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GLOSSARY = ROOT / "docs" / "glossary-dealix-planes-tracks.md"

# Stable anchors that must remain if the glossary is the naming contract.
REQUIRED_SUBSTRINGS = (
    "Decision",
    "Execution",
    "Trust",
    "Operating",
    "Plane",
)


def main() -> int:
    if not GLOSSARY.is_file():
        print("MISSING", GLOSSARY, file=sys.stderr)
        return 1
    text = GLOSSARY.read_text(encoding="utf-8")
    missing = [s for s in REQUIRED_SUBSTRINGS if s not in text]
    if missing:
        print("GLOSSARY_FAIL missing:", missing, file=sys.stderr)
        return 1
    print("glossary consistency OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
