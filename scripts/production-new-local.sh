#!/usr/bin/env bash
# production-new-local — Create new local production copy: rename current to preserve path, mkdir new, sync from server, update state.
# Invoke from chat when production-sync-check recommended creating a new local copy and user has approved.
# Version: 1.0.0

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_OPS="${CURSOR_OPS:-$(dirname "$SCRIPT_DIR")}"
PROJECT_PATHS="${CURSOR_OPS}/config/project-paths.json"
RESOURCES_OTTER="${RESOURCES_OTTER:-}"
LOCAL_COPY="${LOCAL_COPY:-}"

if [[ -f "$PROJECT_PATHS" ]] && command -v jq &>/dev/null; then
  RESOURCES_OTTER="${RESOURCES_OTTER:-$(jq -r '.otter.resources.folder // .canvas_reports.resources.folder // empty' "$PROJECT_PATHS")}"
  LOCAL_COPY="${LOCAL_COPY:-$(jq -r '.otter.production_current.folder // .canvas_reports.production_current.folder // empty' "$PROJECT_PATHS")}"
fi
RESOURCES_OTTER="${RESOURCES_OTTER:-/Users/a00288946/Agents/resources/otter}"
LOCAL_COPY="${LOCAL_COPY:-/Users/a00288946/Projects/onlinecourses}"
STATE_FILE="${RESOURCES_OTTER}/production-sync-state.json"
SSH_HOST="${SSH_HOST:-webaim-deploy}"
SERVER_PATH="/var/websites/webaim/htdocs/onlinecourses"

echo "=============================================="
echo "Production new local — rename, create, sync, update state"
echo "=============================================="
echo ""

if [[ ! -d "$LOCAL_COPY" ]]; then
  echo "Error: Local copy does not exist at $LOCAL_COPY. Nothing to preserve. Create the directory and run an initial sync first (see PROCEDURE-PRODUCTION-BASELINE.md)." >&2
  exit 1
fi

# Read state and compute preserve path (with -v2/-v3 if needed)
PRESERVED_SUFFIX=""
if [[ -f "$STATE_FILE" ]] && command -v jq &>/dev/null; then
  PRESERVED_SUFFIX="$(jq -r '.preserved_suffix // empty' "$STATE_FILE")"
fi
PRESERVED_SUFFIX="${PRESERVED_SUFFIX:-feb-23}"
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

echo "Step 1: Rename current copy to preserve path"
echo "  mv \"$LOCAL_COPY\" \"$PRESERVED_PATH\""
mv "$LOCAL_COPY" "$PRESERVED_PATH"
echo "  Done."
echo ""

echo "Step 2: Create new local copy directory"
echo "  mkdir -p \"$LOCAL_COPY\""
mkdir -p "$LOCAL_COPY"
echo "  Done."
echo ""

echo "Step 3: Sync from server (rsync)"
echo "  rsync from ${SSH_HOST}:${SERVER_PATH}/ to $LOCAL_COPY/"
rsync -avz --delete \
  --exclude='.git' --exclude='.DS_Store' --exclude='*.swp' --exclude='*~' \
  "${SSH_HOST}:${SERVER_PATH}/" "${LOCAL_COPY}/"
echo "  Done."
echo ""

echo "Step 4: Update state file"
TODAY=$(date +%Y-%m-%d)
if command -v jq &>/dev/null; then
  if [[ -f "$STATE_FILE" ]]; then
    jq --arg d "$TODAY" --arg s "$PRESERVED_SUFFIX_USED" '.last_sync_date = $d | .preserved_suffix = $s' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
  else
    printf '%s\n' "{\"preserved_suffix\":\"$PRESERVED_SUFFIX_USED\",\"last_sync_date\":\"$TODAY\",\"description\":\"Used by production-sync-check / production-new-local.\"}" | jq . > "$STATE_FILE"
  fi
else
  printf '%s\n' "{\"preserved_suffix\":\"$PRESERVED_SUFFIX_USED\",\"last_sync_date\":\"$TODAY\"}" > "$STATE_FILE"
fi
echo "  Updated $STATE_FILE: last_sync_date=$TODAY, preserved_suffix=$PRESERVED_SUFFIX_USED"
echo ""

echo "=============================================="
echo "Done. Preserved copy: $PRESERVED_PATH"
echo "New local copy: $LOCAL_COPY (synced from server)"
echo "=============================================="
