#!/usr/bin/env python3
"""Structural lint for docs/RELEASE_READINESS_MATRIX_AR.md (Tier-1 Runtime Trust CI, optional strict)."""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / "docs" / "RELEASE_READINESS_MATRIX_AR.md"

REQUIRED = (
    "مصفوفة جاهزية الإصدار",
    "docs truth",
    "schema adherence",
    "Saudi controls",
    "provenance",
)


def main() -> int:
    if not DOC.is_file():
        print("MISSING", DOC, file=sys.stderr)
        return 1 if os.environ.get("RELEASE_MATRIX_STRICT") == "1" else 0
    text = DOC.read_text(encoding="utf-8")
    missing = [s for s in REQUIRED if s not in text]
    if missing and os.environ.get("RELEASE_MATRIX_STRICT") == "1":
        print("RELEASE_MATRIX_STRICT missing:", missing, file=sys.stderr)
        return 1
    # Light mode: require template table row markers exist
    if "**docs truth**" not in text and "| docs truth |" not in text:
        if os.environ.get("RELEASE_MATRIX_STRICT") == "1":
            print("RELEASE_READINESS_MATRIX_AR.md: expected docs truth row", file=sys.stderr)
            return 1
    # Optional: RC row filled — look for non-empty status cell pattern (Arabic/English OK)
    if os.environ.get("RELEASE_MATRIX_RC_ROW_REQUIRED") == "1":
        # RC row: bold marker **RC-...** or plain | RC-... | with status in next cell
        if not re.search(r"\|\s*\*\*RC[\w.-]+\*\*\s*\|", text) and not re.search(
            r"\|\s*RC[\w.-]+\s*\|\s*(OK|Risk|Blocked|مكتمل)", text, re.I
        ):
            print(
                "Set RELEASE_MATRIX_RC_ROW_REQUIRED=1 only when an RC row is documented.",
                file=sys.stderr,
            )
            return 1
    print("release readiness matrix structure OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
