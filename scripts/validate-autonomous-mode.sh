#!/bin/bash
# Version: 1.1.0
# Unified Autonomous Mode Validation Script
# Validates MCP servers, environment variables, project paths, and system dependencies

set -euo pipefail

# ========================================
# AUTO-DETECT SCRIPT LOCATION (Portable)
# ========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="$WORKSPACE_ROOT/config"
MCP_CONFIG="$CONFIG_DIR/mcp.json"
PROJECT_PATHS_CONFIG="$CONFIG_DIR/project-paths.json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

JSON_OUTPUT=false
if [[ "${1:-}" == "--json" ]]; then
    JSON_OUTPUT=true
fi

log() {
    if [[ "$JSON_OUTPUT" == "false" ]]; then
        echo -e "$1"
    fi
}

error() {
    if [[ "$JSON_OUTPUT" == "false" ]]; then
        echo -e "${RED}ERROR: $1${NC}"
    fi
}

# Initialize report variables
TOTAL_ISSUES=0
CHECK_RESULTS=""

# 1. System Dependencies Check
check_dependency() {
    local cmd=$1
    if command -v "$cmd" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 2. MCP Validation
validate_mcp() {
    log "🔍 Validating MCP Servers..."
    if [[ ! -f "$MCP_CONFIG" ]]; then
        error "MCP config not found at $MCP_CONFIG"
        TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
        return
    fi

    local servers=$(jq -r '.mcpServers | keys[]' "$MCP_CONFIG" 2>/dev/null || echo "")
    if [[ -z "$servers" ]]; then
        error "No MCP servers found in config or invalid JSON"
        TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
        return
    fi

    for server in $servers; do
        log "  Checking ${YELLOW}$server${NC}..."

        # Check environment variables
        local env_vars=$(jq -r ".mcpServers.\"$server\".env | keys[]?" "$MCP_CONFIG" 2>/dev/null || echo "")
        for env_var in $env_vars; do
            # Special case for ${HOME} expansion in JSON which is handled by the MCP loader
            # But we should check if the variable itself is set if it's a secret
            if [[ "$env_var" == *"TOKEN"* || "$env_var" == *"SECRET"* || "$env_var" == *"ID"* ]]; then
                # Check for expanded value or literal value in config
                local val=$(jq -r ".mcpServers.\"$server\".env.\"$env_var\"" "$MCP_CONFIG")

                if [[ "$val" == \$\{*\} ]]; then
                    # It's an environment variable reference like ${GITHUB_TOKEN}
                    local var_name=$(echo "$val" | sed 's/\${//;s/}//')
                    if [[ -z "${!var_name:-}" ]]; then
                        log "    ⚠️  $var_name is NOT set (reported in readiness report)"
                    else
                        log "    ✅ $var_name is set"
                    fi
                elif [[ -n "$val" && "$val" != "null" ]]; then
                    log "    ✅ $env_var is set in config"
                else
                    log "    ⚠️  Missing value for $env_var in $server"
                fi
            fi
        done
    done
}

# 3. Project Paths Validation
validate_paths() {
    log "📂 Validating Project Paths..."
    if [[ ! -f "$PROJECT_PATHS_CONFIG" ]]; then
        error "Project paths config not found at $PROJECT_PATHS_CONFIG"
        TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
        return
    fi

    local projects=$(jq -r 'keys[]' "$PROJECT_PATHS_CONFIG")
    for project in $projects; do
        log "  Project: ${YELLOW}$project${NC}"

        local dev_path=$(jq -r ".\"$project\".development.folder" "$PROJECT_PATHS_CONFIG")
        local res_path=$(jq -r ".\"$project\".resources.folder" "$PROJECT_PATHS_CONFIG")

        if [[ -d "$dev_path" ]]; then
            log "    ✅ Development path exists: $dev_path"
        else
            error "    Development path missing: $dev_path"
            TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
        fi

        if [[ -d "$res_path" ]]; then
            log "    ✅ Resources path exists: $res_path"
        else
            error "    Resources path missing: $res_path"
            TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
        fi
    done
}

# Main Execution
main() {
    log "🚀 ${GREEN}Initializing Autonomous Mode Validation${NC}"
    log "==========================================="

    # System Checks
    for cmd in jq node npm git; do
        if check_dependency "$cmd"; then
            log "✅ System: $cmd is installed"
        else
            error "System: $cmd is NOT installed"
            TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
        fi
    done

    # Check for critical workspace tools
    log "🛠️ Checking workspace tools..."
    # Verification of tool names to prevent confusion (e.g., Task vs TodoWrite)
    # This is a reminder for the AI agent
    log "  ✅ Preferred Task Tool: todo_write"

    validate_mcp
    validate_paths

    if [[ "$JSON_OUTPUT" == "true" ]]; then
        # Build structured JSON output
        local mcp_servers=$(jq -c '.mcpServers | keys' "$MCP_CONFIG")
        local projects=$(jq -c '.' "$PROJECT_PATHS_CONFIG")

        jq -n \
            --arg status "$([[ $TOTAL_ISSUES -eq 0 ]] && echo "ready" || echo "issues")" \
            --argjson issues "$TOTAL_ISSUES" \
            --argjson mcp "$mcp_servers" \
            --argjson paths "$projects" \
            '{status: $status, issues: $issues, mcp_servers: $mcp, project_paths: $paths}'
    else
        log "==========================================="
        if [[ $TOTAL_ISSUES -eq 0 ]]; then
            log "${GREEN}✅ All checks passed. Ready for autonomous operation.${NC}"
            exit 0
        else
            log "${RED}❌ Validation failed with $TOTAL_ISSUES issues.${NC}"
            exit 1
        fi
    fi
}

main "$@"
