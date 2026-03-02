#!/bin/bash
# Test script for validate-autonomous-mode.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(dirname "$SCRIPT_DIR")"
VALIDATE_SCRIPT="$SCRIPT_DIR/validate-autonomous-mode.sh"

echo "🧪 Running Programmatic Tests for validate-autonomous-mode.sh"
echo "=========================================================="

# 1. Test basic execution
echo "Test 1: Basic execution..."
# Allow failure if there are real issues, but check if it outputs correctly
if "$VALIDATE_SCRIPT" > /dev/null 2>&1 || [[ $? -eq 1 ]]; then
    echo "✅ Success: Script ran and returned a valid exit code."
else
    echo "❌ Failure: Script crashed or failed basic execution."
fi

# 2. Test JSON output
echo "Test 2: JSON output format..."
JSON_OUT=$("$VALIDATE_SCRIPT" --json)
if echo "$JSON_OUT" | jq empty; then
    echo "✅ Success: Script returned valid JSON."

    # Check for required keys in JSON
    STATUS=$(echo "$JSON_OUT" | jq -r '.status')
    if [[ "$STATUS" == "ready" || "$STATUS" == "issues" ]]; then
        echo "✅ Success: JSON contains 'status' key."
    else
        echo "❌ Failure: JSON missing or invalid 'status' key."
    fi
else
    echo "❌ Failure: Script returned invalid JSON."
fi

# 3. Test dependency on config files
echo "Test 3: Missing config handling..."
mv "$WORKSPACE_ROOT/config/mcp.json" "$WORKSPACE_ROOT/config/mcp.json.bak"
# The script should log an error to stderr or stdout which we catch
# We use a subshell to run the script and capture everything
OUT=$("$VALIDATE_SCRIPT" 2>&1 || true)
if echo "$OUT" | grep -q "MCP config not found"; then
    echo "✅ Success: Handled missing MCP config."
else
    echo "❌ Failure: Did not detect missing MCP config."
    echo "Debug: Output was: $OUT"
fi
mv "$WORKSPACE_ROOT/config/mcp.json.bak" "$WORKSPACE_ROOT/config/mcp.json"

echo "=========================================================="
echo "🎉 Tests completed."
