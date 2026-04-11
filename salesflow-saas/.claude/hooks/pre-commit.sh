#!/bin/bash
# Dealix Pre-Commit Hook
set -e
echo "Dealix Pre-Commit Checks..."

# Check for hardcoded secrets
if grep -rn "API_KEY\s*=\s*['\"][^'\"]*['\"]" backend/app/ --include="*.py" 2>/dev/null | grep -v config.py | grep -v example; then
    echo "ERROR: Hardcoded API key found!"
    exit 1
fi

# Check .env not staged
if git diff --cached --name-only | grep -q "\.env$"; then
    echo "ERROR: .env file staged!"
    exit 1
fi

# Run linter
if command -v ruff &> /dev/null; then
    ruff check backend/app/ --fix --quiet 2>/dev/null || true
fi

echo "Pre-commit checks passed."
