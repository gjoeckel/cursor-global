#!/usr/bin/env bash
# Deploy to https://webaim.org/onlinecourses-otter via rsync (no GitHub push).
# Deploys whatever branch is currently checked out. Procedure: resources/otter/PROCEDURE-DEPLOY-ONLINECOURSES-OTTER.md (Option C)
# Version: 2.1.0

set -euo pipefail
CURSOR_OPS="${CURSOR_OPS:-}"
OTTER_DEV="${OTTER_DEV:-/Users/a00288946/Projects/otter}"
if [[ -n "$CURSOR_OPS" && -f "$CURSOR_OPS/config/project-paths.json" ]]; then
  if jq -e '.otter.development.folder' "$CURSOR_OPS/config/project-paths.json" >/dev/null 2>&1; then
    OTTER_DEV="$(jq -r '.otter.development.folder' "$CURSOR_OPS/config/project-paths.json")"
  elif jq -e '.canvas_reports.development.folder' "$CURSOR_OPS/config/project-paths.json" >/dev/null 2>&1; then
    OTTER_DEV="$(jq -r '.canvas_reports.development.folder' "$CURSOR_OPS/config/project-paths.json")"
  fi
fi

SSH_HOST="${OTTER_SSH_HOST:-webaim-deploy}"
DEPLOY_PATH="/var/websites/webaim/htdocs/onlinecourses-otter"

echo "=============================================="
echo "Deploy to https://webaim.org/onlinecourses-otter"
echo "Procedure: resources/otter/PROCEDURE-DEPLOY-ONLINECOURSES-OTTER.md (Option C — rsync, no GitHub push)"
echo "=============================================="
echo ""

if [[ ! -d "$OTTER_DEV/.git" ]]; then
  echo "Error: Otter repo not found at $OTTER_DEV"
  exit 1
fi

CURRENT_BRANCH="$(git -C "$OTTER_DEV" rev-parse --abbrev-ref HEAD)"
echo "Otter repo: $OTTER_DEV"
echo "Deploying current branch: $CURRENT_BRANCH"
echo ""

# Rsync: push local tree (current branch) to server — no branch switch, no GitHub
echo "Syncing code to $SSH_HOST:$DEPLOY_PATH ..."
# Rsync: push content only; server step will set permissions (SSH user may not own dirs)
if rsync -avz --delete --omit-dir-times --no-perms --no-owner --no-group \
  --exclude='.git' --exclude='.DS_Store' --exclude='*.swp' --exclude='*~' \
  --exclude='.cursor' --exclude='.github' --exclude='node_modules' \
  --exclude='services/auth/logs' --exclude='services/shared/logs' \
  "$OTTER_DEV/" "$SSH_HOST:$DEPLOY_PATH/"; then
  echo "✅ Rsync completed."
else
  echo "⚠️  Rsync failed."
  exit 1
fi

# Server: chmod and cache clear only; exclude .git (no sudo — validated process; see DEPLOY-SUDO-REVIEW-2026-02-26.md)
echo "Running server steps on $SSH_HOST..."
if ssh -o ConnectTimeout=15 -o BatchMode=yes "$SSH_HOST" "cd $DEPLOY_PATH && find . -path ./.git -prune -o -type f -exec chmod 644 {} \\; && find . -path ./.git -prune -o -type d -exec chmod 755 {} \\; && (chmod 775 services/cache clients/cache 2>/dev/null || true) && (rm -rf services/cache/*.json clients/cache/sess_* 2>/dev/null || true)"; then
  echo "✅ Server steps completed. Test instance updated."
else
  echo "⚠️  Server steps failed. Code was synced; run manually (ssh $SSH_HOST):"
  echo "  cd $DEPLOY_PATH"
  echo "  find . -path ./.git -prune -o -type f -exec chmod 644 {} \\;"
  echo "  find . -path ./.git -prune -o -type d -exec chmod 755 {} \\;"
  echo "  chmod 775 services/cache clients/cache 2>/dev/null || true"
  echo "  rm -rf services/cache/*.json clients/cache/sess_* 2>/dev/null || true"
  exit 1
fi

echo ""
echo "--------------------------------------------------------------"
echo "Updates pushed to test instance on server."
echo "Verify: https://webaim.org/onlinecourses-otter"
echo "See LOGIN-TROUBLESHOOTING.md if you see 'Invalid security token'."
echo "--------------------------------------------------------------"
