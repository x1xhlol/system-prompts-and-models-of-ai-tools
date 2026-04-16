#!/usr/bin/env python3
"""Dealix Architecture Brief — Preflight & Discovery Script.

Run from repository root:
    python scripts/architecture_brief.py

Validates governance docs, code structure, and cross-references.
Outputs JSON report + human-readable summary.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ── Required governance documents ──────────────────────────────
REQUIRED_DOCS = {
    "MASTER_OPERATING_PROMPT.md": ROOT / "MASTER_OPERATING_PROMPT.md",
    "ai-operating-model.md": ROOT / "docs" / "ai-operating-model.md",
    "dealix-six-tracks.md": ROOT / "docs" / "dealix-six-tracks.md",
    "execution-fabric.md": ROOT / "docs" / "governance" / "execution-fabric.md",
    "trust-fabric.md": ROOT / "docs" / "governance" / "trust-fabric.md",
    "saudi-compliance-and-ai-governance.md": ROOT / "docs" / "governance" / "saudi-compliance-and-ai-governance.md",
    "technology-radar-tier1.md": ROOT / "docs" / "governance" / "technology-radar-tier1.md",
    "partnership-os.md": ROOT / "docs" / "governance" / "partnership-os.md",
    "ma-os.md": ROOT / "docs" / "governance" / "ma-os.md",
    "expansion-os.md": ROOT / "docs" / "governance" / "expansion-os.md",
    "pmi-os.md": ROOT / "docs" / "governance" / "pmi-os.md",
    "executive-board-os.md": ROOT / "docs" / "governance" / "executive-board-os.md",
    "execution-matrix-90d-tier1.md": ROOT / "docs" / "execution-matrix-90d-tier1.md",
    "ADR-0001": ROOT / "docs" / "adr" / "0001-tier1-execution-policy-spikes.md",
}

# ── Required backend components ────────────────────────────────
REQUIRED_MODELS = {
    "contradiction.py": ROOT / "backend" / "app" / "models" / "contradiction.py",
    "evidence_pack.py": ROOT / "backend" / "app" / "models" / "evidence_pack.py",
    "compliance_control.py": ROOT / "backend" / "app" / "models" / "compliance_control.py",
}

REQUIRED_SERVICES = {
    "contradiction_engine.py": ROOT / "backend" / "app" / "services" / "contradiction_engine.py",
    "evidence_pack_service.py": ROOT / "backend" / "app" / "services" / "evidence_pack_service.py",
    "connector_governance.py": ROOT / "backend" / "app" / "services" / "connector_governance.py",
    "model_routing_dashboard.py": ROOT / "backend" / "app" / "services" / "model_routing_dashboard.py",
    "saudi_compliance_matrix.py": ROOT / "backend" / "app" / "services" / "saudi_compliance_matrix.py",
    "forecast_control_center.py": ROOT / "backend" / "app" / "services" / "forecast_control_center.py",
}

REQUIRED_APIS = {
    "contradiction.py": ROOT / "backend" / "app" / "api" / "v1" / "contradiction.py",
    "evidence_packs.py": ROOT / "backend" / "app" / "api" / "v1" / "evidence_packs.py",
    "executive_room.py": ROOT / "backend" / "app" / "api" / "v1" / "executive_room.py",
    "connector_governance.py": ROOT / "backend" / "app" / "api" / "v1" / "connector_governance.py",
    "model_routing.py": ROOT / "backend" / "app" / "api" / "v1" / "model_routing.py",
    "saudi_compliance.py": ROOT / "backend" / "app" / "api" / "v1" / "saudi_compliance.py",
    "forecast_control.py": ROOT / "backend" / "app" / "api" / "v1" / "forecast_control.py",
    "approval_center.py": ROOT / "backend" / "app" / "api" / "v1" / "approval_center.py",
}

REQUIRED_FRONTEND = {
    "executive-room.tsx": ROOT / "frontend" / "src" / "components" / "dealix" / "executive-room.tsx",
    "evidence-pack-viewer.tsx": ROOT / "frontend" / "src" / "components" / "dealix" / "evidence-pack-viewer.tsx",
    "approval-center.tsx": ROOT / "frontend" / "src" / "components" / "dealix" / "approval-center.tsx",
    "connector-governance-board.tsx": ROOT / "frontend" / "src" / "components" / "dealix" / "connector-governance-board.tsx",
    "saudi-compliance-dashboard.tsx": ROOT / "frontend" / "src" / "components" / "dealix" / "saudi-compliance-dashboard.tsx",
    "actual-vs-forecast-dashboard.tsx": ROOT / "frontend" / "src" / "components" / "dealix" / "actual-vs-forecast-dashboard.tsx",
    "risk-heatmap.tsx": ROOT / "frontend" / "src" / "components" / "dealix" / "risk-heatmap.tsx",
    "policy-violations-board.tsx": ROOT / "frontend" / "src" / "components" / "dealix" / "policy-violations-board.tsx",
    "partner-pipeline-board.tsx": ROOT / "frontend" / "src" / "components" / "dealix" / "partner-pipeline-board.tsx",
}


def check_files(label: str, file_map: dict[str, Path]) -> dict:
    results = {}
    for name, path in file_map.items():
        results[name] = {"exists": path.exists(), "path": str(path.relative_to(ROOT))}
    found = sum(1 for v in results.values() if v["exists"])
    return {"label": label, "total": len(file_map), "found": found, "items": results}


def count_directory(pattern: str, base: Path | None = None) -> int:
    search_base = base or ROOT
    return len(list(search_base.glob(pattern)))


def main() -> None:
    report: dict = {"project": "Dealix", "root": str(ROOT), "checks": {}}

    # Check all required file groups
    report["checks"]["governance_docs"] = check_files("Governance Documents", REQUIRED_DOCS)
    report["checks"]["backend_models"] = check_files("Backend Models (Tier-1)", REQUIRED_MODELS)
    report["checks"]["backend_services"] = check_files("Backend Services (Tier-1)", REQUIRED_SERVICES)
    report["checks"]["backend_apis"] = check_files("Backend APIs (Tier-1)", REQUIRED_APIS)
    report["checks"]["frontend_components"] = check_files("Frontend Components (Tier-1)", REQUIRED_FRONTEND)

    # Count existing components
    report["counts"] = {
        "total_models": count_directory("backend/app/models/*.py") - 2,  # exclude __init__, base
        "total_services": count_directory("backend/app/services/*.py") - 1,  # exclude __init__
        "total_api_routes": count_directory("backend/app/api/v1/*.py") - 2,  # exclude __init__, router
        "total_frontend_components": count_directory("frontend/src/components/dealix/*.tsx"),
        "total_agents": count_directory("ai-agents/prompts/*.md"),
        "total_governance_docs": count_directory("docs/governance/*.md"),
        "total_legal_docs": count_directory("docs/legal/*.md"),
        "total_tests": count_directory("backend/tests/test_*.py"),
    }

    # Overall score
    all_checks = []
    for section in report["checks"].values():
        for item in section["items"].values():
            all_checks.append(item["exists"])

    total = len(all_checks)
    passed = sum(all_checks)
    report["summary"] = {
        "total_checks": total,
        "passed": passed,
        "failed": total - passed,
        "score_percent": round((passed / total) * 100, 1) if total else 0,
        "tier1_ready": passed == total,
    }

    # Print human-readable summary
    print("=" * 60)
    print("  DEALIX ARCHITECTURE BRIEF")
    print("=" * 60)
    print()

    for section in report["checks"].values():
        label = section["label"]
        found = section["found"]
        total_section = section["total"]
        status = "PASS" if found == total_section else "PARTIAL"
        print(f"  [{status}] {label}: {found}/{total_section}")
        for name, info in section["items"].items():
            mark = "+" if info["exists"] else "-"
            print(f"    {mark} {name}")
        print()

    print("-" * 60)
    print(f"  Component Counts:")
    for key, val in report["counts"].items():
        print(f"    {key}: {val}")
    print()
    print("-" * 60)
    score = report["summary"]["score_percent"]
    ready = report["summary"]["tier1_ready"]
    print(f"  OVERALL SCORE: {score}% ({passed}/{total})")
    print(f"  TIER-1 READY: {'YES' if ready else 'NO'}")
    print("=" * 60)

    # Write JSON report
    report_path = ROOT / "scripts" / "architecture_brief_report.json"
    report_path.write_text(json.dumps(report, indent=2, default=str))
    print(f"\n  JSON report: {report_path.relative_to(ROOT)}")

    sys.exit(0 if ready else 1)


if __name__ == "__main__":
    main()
