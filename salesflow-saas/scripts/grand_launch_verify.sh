#!/usr/bin/env bash
# Dealix grand launch: backend pytest, frontend lint + build, optional HTTP checks.
# Usage:
#   ./scripts/grand_launch_verify.sh
#   DEALIX_BASE_URL=http://127.0.0.1:8000 ./scripts/grand_launch_verify.sh --http
#   ./scripts/grand_launch_verify.sh --http --soft-ready
#   ./scripts/grand_launch_verify.sh --http-only --soft-ready   # API only, no pytest/lint/build

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

HTTP=0
SOFT_READY=0
HTTP_ONLY=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --http) HTTP=1; shift ;;
    --soft-ready) SOFT_READY=1; shift ;;
    --http-only) HTTP_ONLY=1; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ "$HTTP_ONLY" -eq 1 ]]; then
  echo "Dealix root: $ROOT"
  echo "== HTTP only =="
  PY_ARGS=(scripts/full_stack_launch_test.py --http-only)
  [[ "$SOFT_READY" -eq 1 ]] && PY_ARGS+=(--soft-ready)
  (cd "$BACKEND" && python "${PY_ARGS[@]}")
  echo "HTTP-only verify OK."
  exit 0
fi

echo "Dealix root: $ROOT"
echo "== Backend: pytest =="
(cd "$BACKEND" && python -m pytest tests -q --tb=line)

echo "== Sync marketing -> frontend/public =="
(cd "$ROOT" && node scripts/sync-marketing-to-public.cjs)

echo "== Frontend: lint =="
(cd "$FRONTEND" && npm run lint)

echo "== Frontend: build =="
(cd "$FRONTEND" && npm run build)

if [[ "$HTTP" -eq 1 ]]; then
  echo "== HTTP: full_stack_launch_test =="
  PY_ARGS=(scripts/full_stack_launch_test.py)
  [[ "$SOFT_READY" -eq 1 ]] && PY_ARGS+=(--soft-ready)
  (cd "$BACKEND" && python "${PY_ARGS[@]}")
else
  echo "Skip HTTP (start API and run: ./scripts/grand_launch_verify.sh --http)" >&2
fi

echo "Grand launch verify OK."
