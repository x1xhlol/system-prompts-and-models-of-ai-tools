"""
اختبار إطلاق شامل: pytest اختياري، ثم صحة API، DB، Go-Live، تدفقات أساسية، Marketing/Strategy،
وحالة الإمبراطورية، صحة LangGraph، وتشغيل دورة صفقة CEO عبر LangGraph (واقعي، مهلة أطول).
يشغّل محلياً ضد BASE_URL (افتراضي http://127.0.0.1:8000).

استخدام:
  py scripts/full_stack_launch_test.py
  py scripts/full_stack_launch_test.py --pytest
  py scripts/full_stack_launch_test.py --pytest --soft-ready
  py scripts/full_stack_launch_test.py --skip-http
  py scripts/full_stack_launch_test.py --http-only --soft-ready
  py scripts/full_stack_launch_test.py --http-only --quick --soft-ready
  $env:DEALIX_BASE_URL="http://127.0.0.1:8000"; py scripts/full_stack_launch_test.py

PowerShell — مسارات صحيحة:
  أنت داخل ...\\salesflow-saas\\backend  → لا تكتب cd salesflow-saas\\backend (يضاعف المسار).
  للفرونت من الـ backend:  cd ..\\frontend
  ثم: npm run test:e2e:install

قبل --http-only: شغّل API في طرفية أخرى:
  py -m uvicorn app.main:app --host 127.0.0.1 --port 8000

أوامر منفصلة (لا تلصق سطرين بدون مسافة بينهما):
  py -m pytest tests -q --tb=line
  py scripts/launch_gate_runner.py -- -m launch -q
"""
from __future__ import annotations

import argparse
import asyncio
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, List, Tuple

import httpx

BASE = os.environ.get("DEALIX_BASE_URL", "http://127.0.0.1:8000").rstrip("/")


def _looks_like_no_server_running(detail: str) -> bool:
    d = (detail or "").lower()
    needles = (
        "connection attempts failed",
        "connection refused",
        "connecterror",
        "errno 111",
        "name or service not known",
        "getaddrinfo failed",
        "actively refused",
        "no connection could be made",
        "failed to establish",
    )
    return any(n in d for n in needles)


def _safe_console(s: str, max_len: int = 320) -> str:
    """Avoid UnicodeEncodeError on Windows consoles (cp1252)."""
    chunk = (s or "")[:max_len]
    return chunk.encode("ascii", errors="replace").decode("ascii")


def run_pytest() -> int:
    backend = Path(__file__).resolve().parent.parent
    return subprocess.call(
        [sys.executable, "-m", "pytest", str(backend / "tests"), "-q", "--tb=line"],
        cwd=str(backend),
    )


async def check(
    name: str,
    method: str,
    path: str,
    *,
    allow_client_error: bool = False,
    allowed_statuses: Tuple[int, ...] | None = None,
    timeout: float = 15.0,
    **kw: Any,
) -> Tuple[str, bool, str]:
    """Launch checks expect 2xx unless allow_client_error (4xx counts as OK) or allowed_statuses is set."""
    url = f"{BASE}{path}"
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.request(method, url, **kw)
            if allowed_statuses is not None:
                ok = r.status_code in allowed_statuses
            elif allow_client_error:
                ok = r.status_code < 500
            else:
                ok = 200 <= r.status_code < 300
            body = _safe_console(r.text or "", 300)
            return name, ok, f"{r.status_code} {body}"
    except Exception as e:
        return name, False, _safe_console(str(e), 300)


async def main() -> int:
    parser = argparse.ArgumentParser(description="Dealix full-stack launch verification")
    parser.add_argument(
        "--pytest",
        action="store_true",
        help="Run backend/tests with pytest before HTTP checks",
    )
    parser.add_argument(
        "--skip-http",
        action="store_true",
        help="Only run pytest (if --pytest); skip HTTP checks (CI without running API)",
    )
    parser.add_argument(
        "--soft-ready",
        action="store_true",
        help="Do not fail the run if /api/v1/ready fails (e.g. Postgres not running locally)",
    )
    parser.add_argument(
        "--http-only",
        action="store_true",
        help="Only run HTTP checks (no pytest); API must be reachable at DEALIX_BASE_URL",
    )
    parser.add_argument(
        "--quick",
        action="store_true",
        help="Skip long LangGraph CEO deal cycle POST (~2 min); use for fast HTTP smoke against live server",
    )
    args = parser.parse_args()
    if args.skip_http and not args.pytest:
        print("Use --pytest with --skip-http to run tests only without starting the API.", flush=True)
        return 2
    if args.http_only and (args.pytest or args.skip_http):
        print("Do not combine --http-only with --pytest or --skip-http.", flush=True)
        return 2

    if args.pytest:
        print("Running pytest (backend/tests)...", flush=True)
        rc = run_pytest()
        if rc != 0:
            print("pytest failed; fix tests before launch.", flush=True)
            return rc
        print("pytest OK.\n", flush=True)

    if args.skip_http:
        print("HTTP checks skipped (--skip-http).")
        return 0

    if args.http_only:
        print("HTTP-only mode (--http-only).\n")

    print(f"Full stack launch test -> {BASE}\n")
    results: List[Tuple[str, bool, str]] = []

    results.append(await check("health", "GET", "/api/v1/health"))
    results.append(await check("ready (DB)", "GET", "/api/v1/ready"))
    results.append(await check("marketing hub", "GET", "/api/v1/marketing/hub"))
    results.append(await check("strategy summary", "GET", "/api/v1/strategy/summary"))
    results.append(await check("value proposition", "GET", "/api/v1/value-proposition/"))
    results.append(await check("customer onboarding journey", "GET", "/api/v1/customer-onboarding/journey"))
    results.append(await check("sales-os overview", "GET", "/api/v1/sales-os/overview"))
    results.append(await check("operations snapshot", "GET", "/api/v1/operations/snapshot"))
    results.append(
        await check(
            "go-live gate",
            "GET",
            "/api/v1/autonomous-foundation/integrations/go-live-gate",
            allowed_statuses=(200, 403),
        )
    )
    results.append(
        await check("live readiness report", "GET", "/api/v1/autonomous-foundation/integrations/live-readiness")
    )
    results.append(
        await check(
            "executive ROI",
            "POST",
            "/api/v1/autonomous-foundation/dashboard/executive-roi",
            json={"baseline": {"revenue": 100000}, "current": {"revenue": 120000, "win_rate": 0.3, "pipeline_velocity_days": 20, "manual_work_reduction_percent": 75}},
        )
    )
    results.append(
        await check(
            "MCP ping substitute - autonomous ping",
            "POST",
            "/api/v1/autonomous-foundation/flows/self-improvement",
            json={"tenant_id": "launch_test", "deal": {"signals": []}},
        )
    )
    results.append(await check("affiliates program (public)", "GET", "/api/v1/affiliates/program"))
    results.append(await check("affiliates leaderboard", "GET", "/api/v1/affiliates/leaderboard/top"))
    results.append(await check("agents list", "GET", "/api/v1/agents/list"))
    results.append(await check("agents empire status", "GET", "/api/v1/agents/empire/status"))
    results.append(await check("LangGraph orchestrator health", "GET", "/api/v1/agents/langgraph/health"))
    results.append(
        await check(
            "integration connectivity matrix",
            "POST",
            "/api/v1/autonomous-foundation/integrations/connectivity-test",
            json={},
        )
    )
    if not args.quick:
        results.append(
            await check(
                "LangGraph CEO deal cycle (realistic, slow)",
                "POST",
                "/api/v1/agents/ceo/langgraph-deal-cycle",
                timeout=120.0,
                json={
                    "company_name": "Launch Verification Co",
                    "deal_id": "LAUNCH-LG-1",
                    "tenant_id": "launch_verify",
                    "industry": "enterprise",
                    "city": "Riyadh",
                },
            )
        )
    else:
        results.append(
            (
                "LangGraph CEO deal cycle (skipped --quick)",
                True,
                "200 SKIPPED use full_stack_launch_test without --quick for end-to-end graph against live LeadEngine",
            )
        )

    failed = 0
    soft_ready = args.soft_ready
    for name, ok, detail in results:
        status = "OK  " if ok else "FAIL"
        soft = soft_ready and name == "ready (DB)" and not ok
        if soft:
            status = "SOFT"
        print(f"[{status}] {name}")
        if not ok and not soft:
            failed += 1
        print(f"       {detail[:200]}...\n" if len(detail) > 200 else f"       {detail}\n")

    # Note: /ready may fail if Postgres not running — use --soft-ready for local dev
    print("---")
    if failed == 0:
        print("All launch checks passed (expected status codes, no 5xx).")
        return 0
    print(f"Some checks failed ({failed}). Fix server/DB or URLs.", flush=True)

    failed_rows: List[Tuple[str, str]] = []
    for name, ok, detail in results:
        if ok:
            continue
        if soft_ready and name == "ready (DB)":
            continue
        failed_rows.append((name, detail))
    if failed_rows and all(_looks_like_no_server_running(d) for _, d in failed_rows):
        print(
            "\n>>> تشخيص: يبدو أن لا خادم FastAPI يستمع على هذا العنوان.\n"
            f"    الهدف الحالي: {BASE}\n"
            "    رسالة httpx الشائعة: 'All connection attempts failed' = المنفذ فارغ أو جدار ناري.\n\n"
            "    افتح طرفية جديدة داخل مجلد backend وشغّل:\n"
            "      py -m uvicorn app.main:app --host 127.0.0.1 --port 8000\n\n"
            "    إن كان الخادم على منفذ آخر:\n"
            '      $env:DEALIX_BASE_URL="http://127.0.0.1:PORT"; py scripts/full_stack_launch_test.py --http-only\n\n'
            "    للتحقق بدون خادم حي استخدم pytest فقط (ASGI):\n"
            "      py -m pytest tests -q --tb=line\n",
            flush=True,
        )

    for name, ok, detail in results:
        if ok or name not in ("marketing hub", "strategy summary"):
            continue
        if "404" in detail or "Not Found" in detail:
            print(
                "Hint: 404 on marketing/strategy means the process on "
                f"{BASE} is likely an OLD server build. Restart from repo root:\n"
                "  cd backend && py -m uvicorn app.main:app --host 127.0.0.1 --port 8000\n"
                "Or set DEALIX_BASE_URL to a port running the current code.",
                flush=True,
            )
            break
    return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
