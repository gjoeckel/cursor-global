#!/usr/bin/env bash
# Local validation test runner for onlinecourses (services branch).
#
# Runs PHP CLI validation scripts against the database configured via
# MASTER_INCLUDES_PATH (or the default master_includes path if unset).
# This is designed for **local/test databases with simulated data**.
#
# Usage examples:
#   REPO=/Users/a00288946/Projects/onlinecourses-production \
#   MASTER_INCLUDES_PATH=/path/to/test/onlinecourses_common.php \
#   VALIDATION_PASSWORD=4091 \
#   ./scripts/run-onlinecourses-local-validation.sh
#
# Env vars:
#   REPO                Path to onlinecourses-production repo (default: pwd)
#   MASTER_INCLUDES_PATH Optional override for master_includes file
#   VALIDATION_PASSWORD  Optional password for validate-login-local.php
#
# Exit codes:
#   0 = all non-skipped tests passed
#   1 = one or more tests failed

set -euo pipefail

REPO="${REPO:-$(pwd)}"
if [[ ! -d "$REPO/.git" ]]; then
  echo "ERROR: Not a git repo: $REPO" >&2
  exit 1
fi

cd "$REPO"

if [[ -n "${MASTER_INCLUDES_PATH:-}" ]]; then
  export MASTER_INCLUDES_PATH
  echo "Using MASTER_INCLUDES_PATH=$MASTER_INCLUDES_PATH"
else
  echo "MASTER_INCLUDES_PATH not set; DatabaseConfig will fall back to server path."
fi

echo "=== Local validation tests (onlinecourses) ==="
echo "Repo: $REPO"
echo "PHP:  $(php -v | head -1)"
echo ""

FAIL=0

run_test() {
  local name="$1"; shift
  echo "--- $name ---"
  echo "Command: $*"
  if "$@"; then
    echo "[$name] PASS"
  else
    local code=$?
    echo "[$name] FAIL (exit $code)" >&2
    FAIL=1
  fi
  echo ""
}

# 1) invited_date validation (registrations table)
run_test "validate-invited-date" \
  php scripts/validate-invited-date.php

# 2) earner status vs earner_date validation
run_test "validate-earner-status-earner-date" \
  php scripts/validate-earner-status-earner-date.php

# 3) E2E evaluation for registrations table (structure + value sanity)
run_test "e2e-evaluate-registrations" \
  php scripts/e2e-evaluate-registrations.php

# 4) Optional: login validation using test/master passwords
if [[ -n "${VALIDATION_PASSWORD:-}" ]]; then
  run_test "validate-login-local" \
    php scripts/validate-login-local.php "$VALIDATION_PASSWORD"
else
  echo "--- validate-login-local ---"
  echo "SKIP: VALIDATION_PASSWORD not set; skipping login test."
  echo ""
fi

if [[ $FAIL -eq 0 ]]; then
  echo "All local validation tests PASSED (non-skipped)."
  exit 0
fi

echo "One or more local validation tests FAILED." >&2
exit 1
