#!/bin/bash
# Dealix Pre-Push Hook
set -e
echo "Dealix Pre-Push Checks..."

# Run tests
cd backend && python -m pytest -x -q --tb=short 2>/dev/null || {
    echo "ERROR: Tests failed!"
    exit 1
}
cd ..

echo "Pre-push checks passed."
