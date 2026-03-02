#!/usr/bin/env bash
# production-sync-check — Dry-run only: compare server vs local, recommend preserve path. No renames or syncs.
# Invoke from chat: production-sync-check (workflow in config/workflows.json)
# 1) Dry-run compare server vs local onlinecourses
# 2) Flag potential misalignments with otter (test)
# 3) Recommend preserve path (with -v2/-v3 if path exists)
# 4) Output recommendations; to execute, user runs production-new-local
# Optional: --update-state [suffix] — manually update state file after an external sync.
# Version: 1.2.0

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_OPS="${CURSOR_OPS:-$(dirname "$SCRIPT_DIR")}"
PROJECT_PATHS="${CURSOR_OPS}/config/project-paths.json"
RESOURCES_OTTER="${RESOURCES_OTTER:-}"
LOCAL_COPY="${LOCAL_COPY:-}"
OTTER_DEV="${OTTER_DEV:-}"

# Resolve paths from project-paths.json (otter or canvas_reports key)
if [[ -f "$PROJECT_PATHS" ]] && command -v jq &>/dev/null; then
  RESOURCES_OTTER="${RESOURCES_OTTER:-$(jq -r '.otter.resources.folder // .canvas_reports.resources.folder // empty' "$PROJECT_PATHS")}"
  LOCAL_COPY="${LOCAL_COPY:-$(jq -r '.otter.production_current.folder // .canvas_reports.production_current.folder // empty' "$PROJECT_PATHS")}"
  OTTER_DEV="${OTTER_DEV:-$(jq -r '.otter.development.folder // .canvas_reports.development.folder // empty' "$PROJECT_PATHS")}"
fi
RESOURCES_OTTER="${RESOURCES_OTTER:-/Users/a00288946/Agents/resources/otter}"
LOCAL_COPY="${LOCAL_COPY:-/Users/a00288946/Projects/onlinecourses}"
OTTER_DEV="${OTTER_DEV:-/Users/a00288946/Projects/otter}"
STATE_FILE="${RESOURCES_OTTER}/production-sync-state.json"
SSH_HOST="${SSH_HOST:-webaim-deploy}"
SERVER_PATH="/var/websites/webaim/htdocs/onlinecourses"

# Parse --update-state [suffix] (manual state update only)
UPDATE_STATE=false
UPDATE_SUFFIX=""
for arg in "$@"; do
  if [[ "$arg" == "--update-state" ]]; then
    UPDATE_STATE=true
  elif [[ "$arg" =~ ^--update-state=(.+)$ ]]; then
    UPDATE_STATE=true
    UPDATE_SUFFIX="${BASH_REMATCH[1]}"
  fi
done
if [[ "$UPDATE_STATE" == true ]]; then
  TODAY=$(date +%Y-%m-%d)
  SUFFIX="${UPDATE_SUFFIX:-$(date +%b-%d | tr '[:upper:]' '[:lower:]')}"
  if command -v jq &>/dev/null; then
    if [[ -f "$STATE_FILE" ]]; then
      jq --arg d "$TODAY" --arg s "$SUFFIX" '.last_sync_date = $d | .preserved_suffix = $s' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
    else
      printf '%s\n' "{\"preserved_suffix\":\"$SUFFIX\",\"last_sync_date\":\"$TODAY\",\"description\":\"Used by production-sync-check / production-new-local.\"}" | jq . > "$STATE_FILE"
    fi
  else
    printf '%s\n' "{\"preserved_suffix\":\"$SUFFIX\",\"last_sync_date\":\"$TODAY\"}" > "$STATE_FILE"
  fi
  echo "Updated $STATE_FILE: last_sync_date=$TODAY, preserved_suffix=$SUFFIX"
  exit 0
fi

echo "=============================================="
echo "Production sync check — dry-run and recommendations only"
echo "=============================================="
echo ""
echo "Server: ${SSH_HOST}:${SERVER_PATH}"
echo "Local production copy: ${LOCAL_COPY}"
echo "Otter (test) codebase: ${OTTER_DEV}"
echo "State file: ${STATE_FILE}"
echo ""

# --- 1. Read preserved suffix / last sync date ---
PRESERVED_SUFFIX=""
LAST_SYNC_DATE=""
if [[ -f "$STATE_FILE" ]] && command -v jq &>/dev/null; then
  PRESERVED_SUFFIX="$(jq -r '.preserved_suffix // empty' "$STATE_FILE")"
  LAST_SYNC_DATE="$(jq -r '.last_sync_date // empty' "$STATE_FILE")"
fi
PRESERVED_SUFFIX="${PRESERVED_SUFFIX:-feb-23}"
LAST_SYNC_DATE="${LAST_SYNC_DATE:-unknown}"

echo "--- 1. Dry-run: server vs local ---"
echo ""

if [[ ! -d "$LOCAL_COPY" ]]; then
  echo "Local copy does not exist: $LOCAL_COPY"
  echo "Recommendation: Create directory and run initial sync from server (see PROCEDURE-PRODUCTION-BASELINE.md)."
  echo ""
else
  echo "Running rsync dry-run (server → local; no files modified)..."
  echo ""
  RSYNC_OUT=$(rsync -avzn --delete \
    --exclude='.git' --exclude='.DS_Store' --exclude='*.swp' --exclude='*~' \
    "${SSH_HOST}:${SERVER_PATH}/" "${LOCAL_COPY}/" 2>&1) || true
  echo "$RSYNC_OUT"
  echo ""

  # Count would-be changes from rsync output
  ADD_OR_UPDATE=$(echo "$RSYNC_OUT" | grep -c '^[^d].*>' 2>/dev/null || echo "0")
  DELETES=$(echo "$RSYNC_OUT" | grep -c '^deleting ' 2>/dev/null || echo "0")
  echo "Summary: ~${ADD_OR_UPDATE} files would be added/updated; ${DELETES} would be deleted from local."
  echo ""
fi

echo "--- 2. Potential misalignments with test (otter) ---"
echo ""

if [[ -d "$OTTER_DEV" ]] && [[ -d "$LOCAL_COPY" ]]; then
  echo "Key production files that may need alignment with otter:"
  echo "  - scripts/map_quizzes_to_database.php  → otter: services/canvas/ (Phase 2 aligned)"
  echo "  - includes/db.php                      → do NOT port; otter uses class db (mysqli)"
  echo "  - cron/*, phpfunctions/*               → review if any logic should be ported to otter"
  echo ""
  echo "For full prod-vs-test tree diff, run:"
  echo "  diff -rq --exclude=.git --exclude=.DS_Store --exclude=node_modules $LOCAL_COPY $OTTER_DEV"
  echo "See resources/otter/MAPPING-DIVERGENCE-METHODS.md for methods."
  echo ""
  if [[ -n "${RSYNC_OUT:-}" ]]; then
    echo "Files that would be updated from server (sample; check if otter has counterpart):"
    echo "$RSYNC_OUT" | grep '^[^d].*>' | head -20 | sed 's/^/  /'
    echo "  ... (run full dry-run above for complete list)"
    echo ""
  fi
else
  echo "Otter or local copy missing; skip otter alignment notes."
  echo ""
fi

echo "--- 3. New directory / preservation recommendation ---"
echo ""

if [[ -d "$LOCAL_COPY" ]]; then
  BASE_SUFFIX="${PRESERVED_SUFFIX%-v*}"
  PRESERVED_PATH="${LOCAL_COPY}-${BASE_SUFFIX}"
  PRESERVED_SUFFIX_USED="$BASE_SUFFIX"
  if [[ -e "$PRESERVED_PATH" ]]; then
    V=2
    while [[ -e "${LOCAL_COPY}-${BASE_SUFFIX}-v${V}" ]]; do
      ((V++)) || true
    done
    PRESERVED_PATH="${LOCAL_COPY}-${BASE_SUFFIX}-v${V}"
    PRESERVED_SUFFIX_USED="${BASE_SUFFIX}-v${V}"
  fi
  echo "Current state: Local copy exists at $LOCAL_COPY"
  echo "Stored preserved_suffix (from $STATE_FILE): ${PRESERVED_SUFFIX}"
  echo "last_sync_date: ${LAST_SYNC_DATE}"
  echo "Recommended preserve path: $PRESERVED_PATH"
  echo ""
  echo "To perform the refresh (rename current → preserve path, create new folder, sync from server, update state):"
  echo "  Run workflow  production-new-local  from chat."
  echo ""
  echo "No changes have been made by this workflow."
else
  PRESERVED_PATH="${LOCAL_COPY}-${PRESERVED_SUFFIX}"
  PRESERVED_SUFFIX_USED="$PRESERVED_SUFFIX"
  echo "No local copy at $LOCAL_COPY; no preservation step needed. Create directory and run initial sync."
  echo ""
fi

echo "--- 4. Summary ---"
echo ""
echo "  [ ] Review dry-run output above"
echo "  [ ] If you want to create a new local production copy: run workflow  production-new-local  from chat"
echo "  [ ] Check otter alignment for any ported files (MAPPING-DIVERGENCE-METHODS.md)"
echo ""
echo "Procedure: resources/otter/PROCEDURE-PRODUCTION-BASELINE.md"
echo "=============================================="
