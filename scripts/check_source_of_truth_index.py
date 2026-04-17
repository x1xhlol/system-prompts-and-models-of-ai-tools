#!/usr/bin/env python3
"""Minimal structural checks for docs/SOURCE_OF_TRUTH_INDEX.md (Tier-1 SOT hygiene)."""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / "docs" / "SOURCE_OF_TRUTH_INDEX.md"


def _split_table_row(line: str) -> list[str]:
    line = line.strip()
    if not line.startswith("|") or line.startswith("|---"):
        return []
    parts = [p.strip() for p in line.strip("|").split("|")]
    return parts


def main() -> int:
    strict = os.environ.get("SOURCE_OF_TRUTH_INDEX_STRICT") == "1"
    if not DOC.is_file():
        print("MISSING", DOC, file=sys.stderr)
        return 1 if strict else 0
    text = DOC.read_text(encoding="utf-8")
    if "| الموضوع |" not in text and "|الموضوع|" not in text.replace(" ", ""):
        if strict:
            print("SOURCE_OF_TRUTH_INDEX: expected topic column header", file=sys.stderr)
            return 1
    if "المالك" not in text or "دورة المراجعة" not in text:
        print("SOURCE_OF_TRUTH_INDEX: missing owner or review cadence column labels", file=sys.stderr)
        return 1
    pipe_rows = sum(1 for ln in text.splitlines() if ln.strip().startswith("|"))
    if pipe_rows < 3:
        print("SOURCE_OF_TRUTH_INDEX: expected markdown table rows", file=sys.stderr)
        return 1

    for line in text.splitlines():
        cells = _split_table_row(line)
        if len(cells) < 5:
            continue
        # topic | canonical | shadow | owner | cadence
        shadow = cells[2].strip()
        owner = cells[3].strip()
        if not shadow or shadow in ("—", "-", "—"):
            continue
        if not owner:
            print(
                f"SOURCE_OF_TRUTH_INDEX: shadow row without owner: {line[:120]}",
                file=sys.stderr,
            )
            return 1

    # Reject obvious placeholder owners in strict mode
    if strict:
        for line in text.splitlines():
            cells = _split_table_row(line)
            if len(cells) < 5:
                continue
            owner = cells[3].strip().lower()
            if owner in ("tbd", "todo", "n/a", ""):
                shadow = cells[2].strip()
                if shadow and shadow not in ("—", "-"):
                    print(
                        f"SOURCE_OF_TRUTH_INDEX: strict mode rejects placeholder owner: {line[:120]}",
                        file=sys.stderr,
                    )
                    return 1

    print("source of truth index structure OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
