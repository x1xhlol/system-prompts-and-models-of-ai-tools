#!/usr/bin/env python3
"""Verify relative markdown links from repo root (Tier-1 docs governance CI)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")

# Markdown files to scan (repo-grounded governance spine)
GLOBS = [
    "docs/**/*.md",
    "MASTER_OPERATING_PROMPT.md",
    "AGENTS.md",
    "CLAUDE.md",
    "Execution_Matrix.md",
    "Execution_Matrix_v2.md",
    "Architecture_Pack.md",
]


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


def resolve_link(source: Path, raw_target: str) -> Path | None:
    target = raw_target.split("#", 1)[0].strip()
    if not target or target.startswith(("http://", "https://", "mailto:", "vscode:", "file:")):
        return None
    if target.startswith("/"):
        return (ROOT / target.lstrip("/")).resolve()
    base = source.parent
    return (base / target).resolve()


def main() -> int:
    errors: list[str] = []
    for md in collect_files():
        try:
            text = md.read_text(encoding="utf-8")
        except OSError as e:
            errors.append(f"{md.relative_to(ROOT)}: read error {e}")
            continue
        for m in LINK_RE.finditer(text):
            raw = m.group(1).strip()
            if "`" in raw or raw.startswith("{{"):
                continue
            resolved = resolve_link(md, raw)
            if resolved is None:
                continue
            try:
                resolved.relative_to(ROOT)
            except ValueError:
                errors.append(f"{md.relative_to(ROOT)}: escape path {raw}")
                continue
            if not resolved.exists():
                errors.append(f"{md.relative_to(ROOT)}: broken link -> {raw} (resolved {resolved.relative_to(ROOT)})")

    if errors:
        print("Docs link check FAILED:\n", file=sys.stderr)
        for e in errors[:80]:
            print(f"  {e}", file=sys.stderr)
        if len(errors) > 80:
            print(f"  ... and {len(errors) - 80} more", file=sys.stderr)
        return 1
    print(f"Docs link check OK ({len(collect_files())} files scanned)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
