#!/usr/bin/env python3
"""Code-backed discovery brief for repo root (Claude / Cursor custom command: architecture-map)."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Constitution + governance library + Cursor command stubs
CONSTITUTION_PATHS = [
    "MASTER_OPERATING_PROMPT.md",
    "AGENTS.md",
    "CLAUDE.md",
    "docs/ai-operating-model.md",
    "docs/dealix-six-tracks.md",
    "docs/blueprint-master-architecture.md",
    "docs/completion-program-workstreams.md",
    "docs/architecture-register.md",
    "docs/execution-matrix-90d-tier1.md",
    "docs/enterprise-readiness.md",
    "docs/adr/0001-tier1-execution-policy-spikes.md",
    "docs/adr/0002-execution-matrix-canonical-source.md",
    "docs/TIER1_MASTER_CLOSURE_CHECKLIST_AR.md",
    "docs/glossary-dealix-planes-tracks.md",
    "docs/tracks-tier1-artifact-paths.md",
    "docs/governance/README.md",
    "docs/governance/approval-policy.md",
    "docs/governance/planes-and-runtime.md",
    "docs/governance/events-and-schema.md",
    "docs/governance/trust-fabric.md",
    "docs/governance/execution-fabric.md",
    "docs/governance/connectors-and-data-plane.md",
    "docs/governance/github-and-release.md",
    "docs/governance/design-and-arabic.md",
    "docs/governance/discovery-and-output-checklist.md",
    "docs/governance/strategic-ops-pmi.md",
    "docs/governance/technology-radar-tier1.md",
    "docs/governance/saudi-compliance-and-ai-governance.md",
    ".cursor/commands/architecture-map.md",
    ".cursor/commands/review-policy.md",
    ".cursor/commands/generate-evidence.md",
    ".cursor/commands/release-gate.md",
]

# Dealix application spine (sample)
SPINE_PATHS = [
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
    print("--- Constitution, governance library, Cursor commands ---")
    for rel in CONSTITUTION_PATHS:
        p = ROOT / rel
        tag = "OK" if p.exists() else "MISS"
        print(f"  [{tag}] {rel}")

    print("\n--- Application spine (sample) ---")
    for rel in SPINE_PATHS:
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

    print(
        "\nNext: read MASTER_OPERATING_PROMPT.md (TOC) + docs/governance/README.md; "
        "then docs/ai-operating-model.md; map stack per AGENTS.md before coding."
    )


if __name__ == "__main__":
    main()
