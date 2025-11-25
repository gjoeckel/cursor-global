#!/bin/bash

# Portable MCP server setup helper for cursor-global
# Copies the bundled MCP configuration into ~/.cursor and optionally
# verifies that all referenced local server builds exist.

set -euo pipefail

# Output styling
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🚀 MCP Servers Setup"
echo "===================="
echo ""

# Resolve repository paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_GLOBAL_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="$CURSOR_GLOBAL_DIR/config"
CONFIG_FILE="$CONFIG_DIR/mcp.json"
TARGET_DIR="$HOME/.cursor"
TARGET_FILE="$TARGET_DIR/mcp.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo -e "${RED}❌ Unable to find MCP config at $CONFIG_FILE${NC}"
  exit 1
fi

mkdir -p "$TARGET_DIR"

# Backup existing config if present
if [ -f "$TARGET_FILE" ]; then
  BACKUP_FILE="$TARGET_FILE.backup-$(date +%Y%m%d-%H%M%S)"
  cp "$TARGET_FILE" "$BACKUP_FILE"
  echo -e "${GREEN}✓${NC} Backup created: $BACKUP_FILE"
else
  echo -e "${YELLOW}⚠${NC} No existing ~/.cursor/mcp.json found, skipping backup"
fi

echo ""
echo "🔧 Applying new MCP configuration..."
cp "$CONFIG_FILE" "$TARGET_FILE"
echo -e "${GREEN}✓${NC} Configuration applied to $TARGET_FILE"

echo ""
echo "🔍 Verifying local MCP server builds..."

# Users can override the server workspace path; default to repo-local mirror
MCP_SERVERS_REPO="${MCP_SERVERS_REPO:-$CURSOR_GLOBAL_DIR/my-mcp-servers}"
PACKAGES_DIR="$MCP_SERVERS_REPO/my-mcp-servers/packages"
SERVERS=("agent-autonomy" "github-minimal" "shell-minimal" "puppeteer-minimal" "sequential-thinking-minimal" "everything-minimal")
BUILD_STATUS="ok"

if [ -d "$PACKAGES_DIR" ]; then
  for server in "${SERVERS[@]}"; do
    BUILD_DIR="$PACKAGES_DIR/$server/build"
    if [ -f "$BUILD_DIR/index.js" ]; then
      echo -e "${GREEN}✓${NC} $server"
    else
      echo -e "${RED}✗${NC} $server (build not found at $BUILD_DIR)"
      BUILD_STATUS="missing"
    fi
  done
else
  echo -e "${YELLOW}⚠${NC} No MCP server repository detected at $PACKAGES_DIR"
  echo "Set MCP_SERVERS_REPO to point at your my-mcp-servers checkout to enable build verification."
  BUILD_STATUS="skipped"
fi

echo ""
echo "===================="
if [ "$BUILD_STATUS" = "ok" ]; then
  echo -e "${GREEN}✅ Setup complete!${NC}"
elif [ "$BUILD_STATUS" = "skipped" ]; then
  echo -e "${YELLOW}⚠ Completed without verifying builds.${NC}"
else
  echo -e "${YELLOW}⚠ Setup complete with warnings - rebuild missing servers before starting MCP.${NC}"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Restart Cursor/Antigravity so the updated MCP config loads."
echo "  2. Run 'mcp-health' to confirm each server responds."
echo "  3. See VALIDATION-REPORT.md for troubleshooting tips."
echo ""
