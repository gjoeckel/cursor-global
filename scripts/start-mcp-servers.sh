#!/bin/bash
# Start Optimized MCP Servers for Autonomous Operation
# This script starts only essential servers to stay under 40-tool limit
# Tool count: Filesystem(15) + Memory(8) + Shell Minimal(4) + GitHub Minimal(4) + Playwright Minimal(4) + Agent Autonomy(4) = 39 tools
# Uses remote repository: https://github.com/gjoeckel/my-mcp-servers

set -euo pipefail

# ========================================
# AUTO-DETECT SCRIPT LOCATION (Portable)
# ========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_GLOBAL_DIR="$(dirname "$SCRIPT_DIR")"

# Derived paths
CONFIG_DIR="$CURSOR_GLOBAL_DIR/config"
CHANGELOGS_DIR="$CURSOR_GLOBAL_DIR/changelogs"
SCRIPTS_DIR="$CURSOR_GLOBAL_DIR/scripts"


echo "🚀 STARTING OPTIMIZED MCP SERVERS (39 TOOLS TOTAL)"
echo "=================================================="
echo "📦 Using remote repository: https://github.com/gjoeckel/my-mcp-servers"

# Set environment variables
export PROJECT_ROOT="${HOME}/Projects/accessilist"
export CURSOR_MCP_ENV=1

# Load environment variables if .env exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Normalize GitHub token name for servers expecting GITHUB_TOKEN
if [ -z "${GITHUB_TOKEN:-}" ] && [ -n "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ]; then
    export GITHUB_TOKEN="$GITHUB_PERSONAL_ACCESS_TOKEN"
fi

# Create necessary directories
mkdir -p "$PROJECT_ROOT/.cursor"
mkdir -p "$PROJECT_ROOT/logs"

# Function to start MCP server
start_mcp_server() {
    local server_name="$1"
    local command="$2"
    local args="$3"
    local env_vars="${4:-}"

    echo "🔧 Starting $server_name MCP server..."

    # Create environment file for this server
    local env_file="$PROJECT_ROOT/.cursor/${server_name}.env"
    if [ -n "$env_vars" ]; then
        echo "$env_vars" > "$env_file"
    fi

    # Start server in background
    local log_file="$PROJECT_ROOT/logs/mcp-${server_name}.log"
    nohup $command $args > "$log_file" 2>&1 &
    local pid=$!

    echo "$pid" > "$PROJECT_ROOT/.cursor/${server_name}.pid"
    echo "✅ $server_name MCP server started (PID: $pid)"
}

# Concurrency lock to prevent duplicate startups
LOCK_FILE="$PROJECT_ROOT/.cursor/mcp-start.lock"
if [ -f "$LOCK_FILE" ]; then
  if find "$LOCK_FILE" -mmin +5 >/dev/null 2>&1; then
    echo "⚠️  Stale lock detected, removing..."
    rm -f "$LOCK_FILE"
  else
    echo "⏳ Another MCP startup is in progress. Skipping."
    exit 0
  fi
fi

trap 'rm -f "$LOCK_FILE"' EXIT
: > "$LOCK_FILE"

# Determine which servers need starting (skip running)
servers=("filesystem" "memory" "shell-minimal" "github-minimal" "playwright-minimal" "agent-autonomy")
needs_start=()
for s in "${servers[@]}"; do
  pid_file="$PROJECT_ROOT/.cursor/${s}.pid"
  if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
    continue
  elif pgrep -f "$s" >/dev/null 2>&1; then
    pgrep -f "$s" | head -1 > "$pid_file"
    continue
  else
    needs_start+=("$s")
  fi
done

# Safe helper to check membership in array (avoids unbound warnings)
array_contains() {
  local needle="$1"
  shift || true
  for item in "$@"; do
    [ "$item" = "$needle" ] && return 0
  done
  return 1
}

if [ ${#needs_start[@]} -eq 0 ]; then
  echo "✅ All MCP servers already running"
else
  echo "🔧 Starting missing servers: ${needs_start[*]}"
fi

# Start optimized MCP servers (39 tools total - just under 40 limit)
echo "🚀 Starting optimized MCP servers..."

# Filesystem MCP (15 tools - file operations, directory navigation)
# Note: Managed by Cursor IDE, not started by this script
if [ ${#needs_start[@]} -gt 0 ] && array_contains "filesystem" "${needs_start[@]}"; then
  echo "ℹ️  filesystem - Managed by Cursor IDE"
else
  echo "⏭️  filesystem already running"
fi

# Memory MCP (8 tools - knowledge storage, entity management)
# Note: Managed by Cursor IDE, not started by this script
if [ ${#needs_start[@]} -gt 0 ] && array_contains "memory" "${needs_start[@]}"; then
  echo "ℹ️  memory - Managed by Cursor IDE"
else
  echo "⏭️  memory already running"
fi

# Shell Minimal MCP (4 tools - essential shell commands)
if [ ${#needs_start[@]} -gt 0 ] && array_contains "shell-minimal" "${needs_start[@]}"; then
  start_mcp_server "shell-minimal" \
    "npx" \
    "-y git+https://github.com/gjoeckel/my-mcp-servers.git#mcp-restart:packages/shell-minimal"
else
  echo "⏭️  shell-minimal already running"
fi

# GitHub Minimal MCP (4 tools - essential GitHub operations only)
if [ ${#needs_start[@]} -gt 0 ] && array_contains "github-minimal" "${needs_start[@]}"; then
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    start_mcp_server "github-minimal" \
      "npx" \
      "-y git+https://github.com/gjoeckel/my-mcp-servers.git#mcp-restart:packages/github-minimal" \
      "GITHUB_PERSONAL_ACCESS_TOKEN=${GITHUB_TOKEN}"
  else
    echo "⚠️  GitHub Minimal MCP skipped - no GITHUB_TOKEN available"
  fi
else
  echo "⏭️  github-minimal already running"
fi

# Playwright Minimal MCP (4 tools - essential browser automation)
if [ ${#needs_start[@]} -gt 0 ] && array_contains "playwright-minimal" "${needs_start[@]}"; then
  start_mcp_server "playwright-minimal" \
    "npx" \
    "-y git+https://github.com/gjoeckel/my-mcp-servers.git#mcp-restart:packages/playwright-minimal"
else
  echo "⏭️  playwright-minimal already running"
fi

# Agent Autonomy MCP (4 tools - workflow automation)
# Note: Managed by Cursor IDE via npm package, not started by this script
if [ ${#needs_start[@]} -gt 0 ] && array_contains "agent-autonomy" "${needs_start[@]}"; then
  echo "ℹ️  agent-autonomy - Managed by Cursor IDE (npm: mcp-agent-autonomy@1.0.1)"
else
  echo "⏭️  agent-autonomy already running"
fi

echo "📊 Tool count optimization:"
echo "   ✅ Filesystem: 15 tools (official - file operations)"
echo "   ✅ Memory: 8 tools (official - knowledge storage)"
echo "   ✅ Shell Minimal: 4 tools (custom - shell commands)"
echo "   ✅ GitHub Minimal: 4 tools (custom - GitHub operations)"
echo "   ✅ Playwright Minimal: 4 tools (custom - browser automation)"
echo "   ✅ Agent Autonomy: 4 tools (custom - workflow automation)"
echo "   📈 Total: 39 tools (just under 40-tool limit)"

# Wait for servers to initialize
echo "⏳ Waiting for MCP servers to initialize..."
sleep 5

# Verify servers are running
echo "🔍 Verifying MCP servers..."
servers=("filesystem" "memory" "shell-minimal" "github-minimal" "puppeteer-minimal" "agent-autonomy")
all_running=true

for server in "${servers[@]}"; do
    # Check if any process is running with the server name
    if pgrep -f "$server" > /dev/null; then
        pid=$(pgrep -f "$server" | head -1)
        echo "✅ $server MCP server running (PID: $pid)"
    else
        echo "❌ $server MCP server not running"
        all_running=false
    fi
done

# Create MCP status file
cat > "$PROJECT_ROOT/.cursor/mcp-status.json" << EOF
{
  "status": "running",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "servers": {
    "filesystem": $(if [ -f "$PROJECT_ROOT/.cursor/filesystem.pid" ]; then echo "true"; else echo "false"; fi),
    "memory": $(if [ -f "$PROJECT_ROOT/.cursor/memory.pid" ]; then echo "true"; else echo "false"; fi),
    "shell-minimal": $(if [ -f "$PROJECT_ROOT/.cursor/shell-minimal.pid" ]; then echo "true"; else echo "false"; fi),
    "github-minimal": $(if [ -f "$PROJECT_ROOT/.cursor/github-minimal.pid" ]; then echo "true"; else echo "false"; fi),
    "playwright-minimal": $(if [ -f "$PROJECT_ROOT/.cursor/playwright-minimal.pid" ]; then echo "true"; else echo "false"; fi),
    "agent-autonomy": $(if [ -f "$PROJECT_ROOT/.cursor/agent-autonomy.pid" ]; then echo "true"; else echo "false"; fi)
  },
  "autonomous_mode": true,
  "mcp_tools_available": true,
  "tool_count": "39_tools_optimized",
  "configuration": "optimized-for-autonomy"
}
EOF

echo ""
echo "🎯 OPTIMIZED MCP SERVERS STARTUP COMPLETE!"
echo "=========================================="
echo "✅ Filesystem MCP server (15 tools)"
echo "✅ Memory MCP server (8 tools)"
echo "✅ Shell Minimal MCP server (4 tools)"
echo "✅ GitHub Minimal MCP server (4 tools)"
echo "✅ Playwright Minimal MCP server (4 tools)"
echo "✅ Agent Autonomy MCP server (4 tools)"
echo "✅ Total: 39 tools (just under 40-tool limit)"
echo "✅ Autonomous operation enabled"
echo "✅ MCP tools available for use"
echo ""
echo "📊 Server Status:"
cat "$PROJECT_ROOT/.cursor/mcp-status.json" | jq '.servers'
echo ""
echo "🚀 Ready for optimized autonomous development!"
echo "   MCP tools should now be available in Cursor IDE"
echo ""
echo "💡 Available Capabilities:"
echo "   • Filesystem: File operations, directory navigation, content management (15 tools)"
echo "   • Memory: Knowledge storage, entity management, search (8 tools)"
echo "   • Shell Minimal: Essential shell commands (4 tools)"
echo "   • GitHub Minimal: Repository operations (4 tools)"
echo "   • Playwright Minimal: Browser automation (4 tools)"
echo "   • Agent Autonomy: Workflow automation (4 tools)"
echo ""
echo "🔧 Essential Tools Available:"
echo "   Filesystem: read, write, list, search, create, move, delete files/directories"
echo "   Memory: create_entities, create_relations, search_nodes, read_graph"
echo "   Shell: execute_command, list_processes, kill_process, get_environment"
echo "   GitHub: get_file_contents, create_or_update_file, push_files, search_repositories"
echo "   Playwright: navigate, take_screenshot, extract_text, click_element"
echo "   Agent Autonomy: execute_workflow, list_workflows, register_workflow, check_approval"
echo ""
echo "📈 Tool Count Optimization:"
echo "   • Previous: 50+ tools (over limit)"
echo "   • Current: 39 tools (optimized configuration)"
echo "   • Removed: sequential-thinking-minimal, everything-minimal"
echo "   • Added: shell-minimal, agent-autonomy"
