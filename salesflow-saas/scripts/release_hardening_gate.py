#!/usr/bin/env python3
"""
Dealix release hardening gate.

Checks only static assets/docs/env contracts (no network calls):
- Required env toggles exist in examples
- Public Dealix API routes are listed in docs/API-MAP.md
- Critical launch docs exist

Exit code:
- 0 => pass
- 1 => fail
"""
from __future__ import annotations

from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parent.parent


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _check_contains(content: str, needles: list[str], source: str) -> list[str]:
    misses: list[str] = []
    for needle in needles:
        if needle not in content:
            misses.append(f"{source}: missing `{needle}`")
    return misses


def main() -> int:
    issues: list[str] = []

    backend_env = ROOT / "backend" / ".env.phase2.example"
    frontend_env = ROOT / "frontend" / ".env.example"
    api_map = ROOT / "docs" / "API-MAP.md"

    required_docs = [
        ROOT / "docs" / "LAUNCH_CHECKLIST.md",
        ROOT / "docs" / "LAUNCH_SIMULATION.md",
        ROOT / "docs" / "DEALIX_AI_EVAL_AR.md",
        ROOT / "docs" / "DEALIX_GTM_EXECUTION_AR.md",
    ]

    if not backend_env.exists():
        issues.append(f"Missing file: {backend_env}")
    else:
        issues.extend(
            _check_contains(
                _read(backend_env),
                [
                    "DEALIX_ASYNC_ENRICH_JOBS",
                    "DEALIX_TAVILY_TENANT_ALLOWLIST",
                    "DEALIX_INTEL_CACHE_TTL_SEC",
                    "DEALIX_ENRICH_IDEMPOTENT_DAILY",
                ],
                "backend/.env.phase2.example",
            )
        )

    if not frontend_env.exists():
        issues.append(f"Missing file: {frontend_env}")
    else:
        issues.extend(
            _check_contains(
                _read(frontend_env),
                [
                    "NEXT_PUBLIC_API_URL",
                ],
                "frontend/.env.example",
            )
        )

    if not api_map.exists():
        issues.append(f"Missing file: {api_map}")
    else:
        issues.extend(
            _check_contains(
                _read(api_map),
                [
                    "/dealix/enrich-exploration",
                    "/dealix/enrich-exploration/async",
                    "/dealix/enrich-exploration/jobs/{job_id}",
                    "/dealix/channel-drafts",
                    "/dealix/intelligence-flags",
                    "/dealix/ai-eval/golden",
                ],
                "docs/API-MAP.md",
            )
        )

    for doc in required_docs:
        if not doc.exists():
            issues.append(f"Missing file: {doc}")

    if issues:
        print("Release hardening gate: FAILED")
        for item in issues:
            print(f"- {item}")
        return 1

    print("Release hardening gate: OK")
    print("Static contracts (env/docs/api-map) are present.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
