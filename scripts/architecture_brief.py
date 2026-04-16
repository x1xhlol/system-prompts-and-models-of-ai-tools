#!/usr/bin/env python3
"""Code-backed discovery brief for repo root (Claude / Cursor custom command: architecture-map)."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Paths that should exist for Dealix + constitution wiring
KEY_PATHS = [
    "MASTER_OPERATING_PROMPT.md",
    "AGENTS.md",
    "CLAUDE.md",
    "docs/ai-operating-model.md",
    "docs/governance/approval-policy.md",
    "salesflow-saas/AGENTS.md",
    "salesflow-saas/backend/app/main.py",
    "salesflow-saas/backend/app/services/agents/router.py",
    "salesflow-saas/backend/app/services/agents/executor.py",
    "salesflow-saas/backend/app/ai/agent_executor.py",
    "salesflow-saas/backend/app/services/model_router.py",
    "salesflow-saas/ai-agents/prompts",
    "salesflow-saas/docs/LAUNCH_CHECKLIST.md",
    "salesflow-saas/verify-launch.ps1",
]


def main() -> None:
    print(f"Repository root: {ROOT}\n")
    print("--- Constitution & governance ---")
    for rel in KEY_PATHS[:6]:
        p = ROOT / rel
        tag = "OK" if p.exists() else "MISS"
        print(f"  [{tag}] {rel}")

    print("\n--- Application spine (sample) ---")
    for rel in KEY_PATHS[6:]:
        p = ROOT / rel
        tag = "OK" if p.exists() else "MISS"
        extra = ""
        if p.is_dir():
            try:
                n = sum(1 for _ in p.rglob("*") if _.is_file())
                extra = f"  ({n} files under tree)"
            except OSError:
                pass
        print(f"  [{tag}] {rel}{extra}")

    print("\nNext: read MASTER_OPERATING_PROMPT.md + docs/ai-operating-model.md; then map stack per AGENTS.md before coding.")


if __name__ == "__main__":
    main()
