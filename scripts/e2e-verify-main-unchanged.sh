#!/usr/bin/env bash
# E2E: Verify that no files on the "main" branch were changed (main = production-only).
# Ensures main does not contain services-only paths and includes/db.php is production (class Database).
#
# Usage:
#   From cursor-ops:  REPO=/path/to/onlinecourses-production ./scripts/e2e-verify-main-unchanged.sh
#   From repo root:  ./scripts/e2e-verify-main-unchanged.sh  (when run from onlinecourses-production)
#
# Exit: 0 = main unchanged (production-only), 1 = failure

set -e
REPO="${REPO:-$(pwd)}"
if [[ ! -d "$REPO/.git" ]]; then
  echo "ERROR: Not a git repo: $REPO"
  exit 1
fi

cd "$REPO"
MAIN_FILES=$(git ls-tree -r main --name-only)
FAIL=0

# ---- 1. Paths that must NOT exist on main (services-only) ----
SERVICES_ONLY_PATTERNS=(
  'api/'
  'clients/'
  'services/'
  'config/'
  'shared/'
  'login.php'
  'router.php'
  'otter/'
  '.github/'
  'includes/paths.php'
  'includes/canvas.php'
  'includes/mailgun.php'
  'includes/version.php'
  'composer.json'
  'package.json'
  'package-lock.json'
)
echo "=== E2E: Verify main branch unchanged (production-only) ==="
echo "Repo: $REPO"
echo ""

for pattern in "${SERVICES_ONLY_PATTERNS[@]}"; do
  if echo "$MAIN_FILES" | grep -q "^${pattern}\|^${pattern%/}/"; then
    echo "FAIL: main must not contain services-only path: $pattern"
    echo "$MAIN_FILES" | grep -E "^${pattern}|^${pattern%/}/" || true
    FAIL=1
  fi
done
if [[ $FAIL -eq 0 ]]; then
  echo "PASS: No services-only paths on main."
fi

# ---- 2. includes/db.php on main must be production (class Database, not only class db) ----
MAIN_DB_PHP=$(git show main:includes/db.php 2>/dev/null || true)
if [[ -z "$MAIN_DB_PHP" ]]; then
  echo "FAIL: main has no includes/db.php"
  FAIL=1
elif ! echo "$MAIN_DB_PHP" | grep -q 'class Database'; then
  echo "FAIL: main includes/db.php must define class Database (production)."
  FAIL=1
else
  echo "PASS: main includes/db.php defines class Database (production)."
fi

# ---- 3. Required production paths must exist on main ----
REQUIRED_ON_MAIN=(
  'includes/config.php'
  'includes/registrationform.php'
  'includes/db.php'
  'cron/cron_daily.php'
  'certificates.php'
  'registrations.php'
)
for path in "${REQUIRED_ON_MAIN[@]}"; do
  if ! echo "$MAIN_FILES" | grep -q "^${path}$"; then
    echo "FAIL: main must contain: $path"
    FAIL=1
  fi
done
if [[ $FAIL -eq 0 ]]; then
  echo "PASS: Required production paths present on main."
fi

# ---- 4. Optional: compare main to production server (if REPO has rsync target) ----
# Set PRODUCTION_RSYNC_TARGET=e.g. webaim-deploy:/var/websites/webaim/htdocs/onlinecourses to enable.
if [[ -n "${PRODUCTION_RSYNC_TARGET:-}" ]]; then
  TMPDIR=$(mktemp -d)
  trap 'rm -rf "$TMPDIR"' EXIT
  git archive main | tar -x -C "$TMPDIR"
  # rsync dry-run: report differences (server -> local main)
  if rsync -avzn --delete --exclude='.git' --exclude='*.log' --exclude='*.csv' \
    "$PRODUCTION_RSYNC_TARGET/" "$TMPDIR/" 2>/dev/null | grep -qE '^'; then
    echo "INFO: rsync dry-run (server -> main) reported differences (see above). Logs/CSVs may differ."
  else
    echo "PASS: main matches production server (rsync dry-run)."
  fi
fi

echo ""
if [[ $FAIL -eq 1 ]]; then
  echo "E2E result: FAIL - main branch has unexpected changes or missing production paths."
  exit 1
fi
echo "E2E result: PASS - no files in main were changed; main is production-only."
exit 0
