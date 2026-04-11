#!/usr/bin/env bash
# Dealix Pre-Commit Hook
# Runs linting, secret detection, Arabic consistency, and affected tests.
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
BACKEND_DIR="${ROOT_DIR}/backend"
STAGED_PY_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.py$' || true)

echo "============================================"
echo "  Dealix Pre-Commit Checks"
echo "============================================"

# ── 1. Ruff Linter ───────────────���─────────────
echo ""
echo "[1/4] Running ruff linter..."

if [ -n "${STAGED_PY_FILES}" ]; then
    if command -v ruff &>/dev/null; then
        LINT_FAILED=0
        echo "${STAGED_PY_FILES}" | xargs ruff check --select E,W,F,I --no-fix || LINT_FAILED=1
        if [ ${LINT_FAILED} -eq 1 ]; then
            echo "FAIL: ruff found issues. Fix them before committing."
            echo "  Run: ruff check --fix backend/"
            exit 1
        fi
        echo "PASS: ruff checks passed."
    else
        echo "WARN: ruff not installed. Skipping lint check."
        echo "  Install: pip install ruff"
    fi
else
    echo "SKIP: No Python files staged."
fi

# ── 2. Hardcoded Secrets Detection ─────────────
echo ""
echo "[2/4] Checking for hardcoded secrets..."

SECRETS_FOUND=0

if [ -n "${STAGED_PY_FILES}" ]; then
    MATCHES=$(echo "${STAGED_PY_FILES}" | xargs grep -n         -E "(API_KEY|SECRET_KEY|PASSWORD|PRIVATE_KEY|ACCESS_TOKEN)\s*=\s*['"][^'"]{8,}"         2>/dev/null | grep -v "os\.environ\|get_settings\|config\.\|settings\.\|# example\|# test\|# noqa" || true)

    if [ -n "${MATCHES}" ]; then
        echo "CRITICAL: Possible hardcoded secrets found:"
        echo "${MATCHES}"
        SECRETS_FOUND=1
    fi

    BEARER_MATCHES=$(echo "${STAGED_PY_FILES}" | xargs grep -n         -E "Bearer\s+[A-Za-z0-9_\-]{20,}"         2>/dev/null | grep -v "settings\.\|config\.\|Authorization.*Bearer.*{" || true)

    if [ -n "${BEARER_MATCHES}" ]; then
        echo "CRITICAL: Possible hardcoded Bearer tokens:"
        echo "${BEARER_MATCHES}"
        SECRETS_FOUND=1
    fi

    if [ ${SECRETS_FOUND} -eq 1 ]; then
        echo ""
        echo "FAIL: Remove hardcoded secrets. Use environment variables via get_settings()."
        exit 1
    fi

    echo "PASS: No hardcoded secrets detected."
else
    echo "SKIP: No Python files staged."
fi

# ── 3. Arabic String Consistency ────────────────
echo ""
echo "[3/4] Checking Arabic string consistency..."

STAGED_FRONTEND_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(tsx?|jsx?)$' || true)

if [ -n "${STAGED_FRONTEND_FILES}" ]; then
    UNTRANSLATED=$(echo "${STAGED_FRONTEND_FILES}" | xargs grep -n         -E "TODO.*translat|FIXME.*arabic|FIXME.*rtl"         2>/dev/null || true)

    if [ -n "${UNTRANSLATED}" ]; then
        echo "WARN: Found untranslated string markers:"
        echo "${UNTRANSLATED}"
        echo "  These should be resolved before release."
    else
        echo "PASS: No untranslated string markers found."
    fi
else
    echo "SKIP: No frontend files staged."
fi

if [ -n "${STAGED_PY_FILES}" ]; then
    MISSING_ARABIC=$(echo "${STAGED_PY_FILES}" | xargs grep -n         -E "detail=\"[A-Z][a-z]|message=\"[A-Z][a-z]"         2>/dev/null | grep -v "# en-only\|# internal\|HTTPException\|logger\." || true)

    if [ -n "${MISSING_ARABIC}" ]; then
        echo "WARN: Possible English-only user-facing strings in Python:"
        echo "${MISSING_ARABIC}"
        echo "  Consider adding Arabic translations."
    fi
fi

# ── 4. Run Affected Tests ──────────────────────
echo ""
echo "[4/4] Running affected tests..."

if [ -n "${STAGED_PY_FILES}" ]; then
    TEST_FILES=""
    for PY_FILE in ${STAGED_PY_FILES}; do
        BASENAME=$(basename "${PY_FILE}" .py)
        FOUND_TESTS=$(find "${BACKEND_DIR}/tests" -name "test_${BASENAME}.py" 2>/dev/null || true)
        if [ -n "${FOUND_TESTS}" ]; then
            TEST_FILES="${TEST_FILES} ${FOUND_TESTS}"
        fi
    done

    if [ -n "${TEST_FILES}" ]; then
        echo "Running tests:${TEST_FILES}"
        cd "${BACKEND_DIR}"
        if ! pytest ${TEST_FILES} -x -q --tb=short 2>/dev/null; then
            echo ""
            echo "FAIL: Some tests failed. Fix them before committing."
            exit 1
        fi
        echo "PASS: All affected tests passed."
    else
        echo "SKIP: No matching test files found for staged changes."
    fi
else
    echo "SKIP: No Python files staged."
fi

echo ""
echo "============================================"
echo "  All pre-commit checks passed"
echo "============================================"
