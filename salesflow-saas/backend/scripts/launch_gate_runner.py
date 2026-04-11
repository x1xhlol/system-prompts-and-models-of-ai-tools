#!/usr/bin/env python3
"""
بوابة إطلاق موحّدة: pytest كامل ثم (اختياري) فحوص HTTP ضد خادم حي.

1) دائماً: تشغيل كل اختبارات backend/tests (واقعية عبر ASGI، بدون خادم).
2) اختياري --live-http: يتصل بـ DEALIX_BASE_URL (يشغّل uvicorn أولاً).

أمثلة:
  py scripts/launch_gate_runner.py
  py scripts/launch_gate_runner.py -- -m launch -q
  py scripts/launch_gate_runner.py --live-http --soft-ready
  $env:DEALIX_BASE_URL="http://127.0.0.1:8000"; py scripts/launch_gate_runner.py --live-http --quick-http

أخطاء شائعة (PowerShell):
  - أنت بالفعل داخل ...\\salesflow-saas\\backend فلا تستخدم cd salesflow-saas\\backend.
  - npm و Playwright من مجلد frontend:  cd ..\\frontend  ثم npm run test:e2e
  - لا تدمج أمرين:  py -m pytest ... --tb=line   ثم سطر جديد   py scripts/...
    (بدون مسافة تصبح --tb=linepy وتفشل pytest)
  - --live-http يفشل إن لم يكن uvicorn شغّال على DEALIX_BASE_URL (افتراضي :8000).
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent


def _pytest(extra_args: list[str]) -> int:
    cmd = [sys.executable, "-m", "pytest", str(BACKEND / "tests"), "--tb=short", *extra_args]
    print("Running:", " ".join(cmd), flush=True)
    return subprocess.call(cmd, cwd=str(BACKEND))


def _live_http(soft_ready: bool, quick: bool) -> int:
    script = BACKEND / "scripts" / "full_stack_launch_test.py"
    cmd = [sys.executable, str(script), "--http-only"]
    if soft_ready:
        cmd.append("--soft-ready")
    if quick:
        cmd.append("--quick")
    print("Running live HTTP:", " ".join(cmd), flush=True)
    return subprocess.call(cmd, cwd=str(BACKEND))


def main() -> int:
    argv = sys.argv[1:]
    pytest_extra: list[str] = []
    if "--" in argv:
        sep = argv.index("--")
        pytest_extra = [x for x in argv[sep + 1 :] if x != "--"]
        argv = argv[:sep]

    p = argparse.ArgumentParser(description="Dealix launch gate: pytest + optional live HTTP smoke")
    p.add_argument(
        "--live-http",
        action="store_true",
        help="After pytest, run full_stack_launch_test against DEALIX_BASE_URL (start uvicorn first)",
    )
    p.add_argument(
        "--soft-ready",
        action="store_true",
        help="Pass --soft-ready to HTTP script (/ready DB may fail locally)",
    )
    p.add_argument(
        "--quick-http",
        action="store_true",
        help="Pass --quick to HTTP script (skip slow LangGraph POST)",
    )
    args = p.parse_args(argv)

    extra = pytest_extra if pytest_extra else ["-q"]
    rc = _pytest(extra)
    if rc != 0:
        print("pytest FAILED — fix tests before launch.", flush=True)
        return rc

    print("pytest OK.", flush=True)

    if not args.live_http:
        print(
            "Live HTTP skipped. Start API then run:\n"
            f"  py scripts/full_stack_launch_test.py --http-only\n"
            f"Or: py scripts/launch_gate_runner.py --live-http --soft-ready",
            flush=True,
        )
        return 0

    return _live_http(args.soft_ready, args.quick_http)


if __name__ == "__main__":
    sys.exit(main())
