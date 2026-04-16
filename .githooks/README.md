# Git hooks (اختياري — Root-safe)

**مصدر الحقيقة للامتثال:** CI في `.github/workflows/docs-governance.yml` (وليس هذا المجلد).

## الهدف

تذكير محلي بأن أوامر الحوكمة تُشغَّل من **جذر الريبو** (`cwd` = المجلد الذي يحتوي `scripts/` و`docs/`).

## تفعيل pre-push (فرع `main` فقط)

من جذر الريبو:

```bash
git config core.hooksPath .githooks
```

انسخ أو أنشئ ملف `.githooks/pre-push` (تنفيذي) بالمحتوى التالي:

```bash
#!/usr/bin/env bash
set -euo pipefail

protected_branch="refs/heads/main"
while read local_ref local_sha remote_ref remote_sha; do
  if [[ "$remote_ref" != "$protected_branch" ]]; then
    continue
  fi
  repo_root="$(git rev-parse --show-toplevel)"
  cd "$repo_root"
  if command -v python3 >/dev/null 2>&1; then
    python3 scripts/architecture_brief.py
  elif command -v py >/dev/null 2>&1; then
    py -3 scripts/architecture_brief.py
  else
    echo "pre-push: لا يوجد python3/py — تخطي architecture_brief"
  fi
done
```

ثم (على Unix): `chmod +x .githooks/pre-push`.

على Windows يمكن استخدام Git Bash أو WSL لتشغيل نفس السكربت.
