#!/usr/bin/env bash
# From repo root: bash salesflow-saas/scripts/package_dealix_marketing_assets.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STAGING="$(mktemp -d)"
OUT="$ROOT/salesflow-saas/sales_assets/dealix-marketing-bundle.zip"
cleanup() { rm -rf "$STAGING"; }
trap cleanup EXIT
cp -a "$ROOT/salesflow-saas/sales_assets" "$STAGING/sales_assets"
rm -f "$STAGING/sales_assets/dealix-marketing-bundle.zip"
if [[ -d "$ROOT/salesflow-saas/presentations/dealix-2026-sectors" ]]; then
  cp -a "$ROOT/salesflow-saas/presentations/dealix-2026-sectors" "$STAGING/presentations-dealix-2026-sectors"
fi
rm -f "$OUT"
( cd "$STAGING" && zip -r -q "$OUT" . )
echo "OK: $OUT"
ls -la "$OUT"
