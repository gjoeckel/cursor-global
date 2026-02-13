#!/usr/bin/env bash
# After running get-oauth-token.js, run this so the Box MCP can pick up the new token.
# Optionally touches ~/.cursor/mcp.json to trigger MCP reconnect; always reminds to fully quit Cursor.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_OPS="$(dirname "$SCRIPT_DIR")"
BOX_ENV="$CURSOR_OPS/config/box.env"
CURSOR_MCP="$HOME/.cursor/mcp.json"

echo "📦 Box token applied – next steps for MCP"
echo "=========================================="

if [ ! -f "$BOX_ENV" ]; then
  echo "⚠️  config/box.env not found at $BOX_ENV"
  echo "   Run: node mcp-box-minimal/scripts/get-oauth-token.js"
  exit 1
fi

if ! grep -q 'BOX_ACCESS_TOKEN=' "$BOX_ENV"; then
  echo "⚠️  config/box.env does not contain BOX_ACCESS_TOKEN"
  exit 1
fi

echo "✅ config/box.env exists and contains BOX_ACCESS_TOKEN"
echo ""

# Touch global MCP config so Cursor may restart the Box MCP (best-effort)
if [ -f "$CURSOR_MCP" ]; then
  touch "$CURSOR_MCP"
  echo "✅ Touched ~/.cursor/mcp.json (may trigger Box MCP to restart)"
else
  echo "ℹ️  ~/.cursor/mcp.json not found; skipping touch"
fi

echo ""
echo "⚠️  IMPORTANT: The Box MCP only reads box.env when its process starts."
echo "   To guarantee it picks up the new token:"
echo ""
echo "   → Fully QUIT Cursor (e.g. Cmd+Q), then open Cursor again."
echo "   (Reload Window is not enough.)"
echo ""
echo "   If you already did a full quit and Box still says token expired,"
echo "   see config/README.md → Box MCP token → «Token just updated but Box still says expired?»"
echo ""
