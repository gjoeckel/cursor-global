#!/bin/bash
# Cursor Global Configuration Setup Script
# Automated installation for new machines
# PORTABLE: Works from any location!

set -e

# ========================================
# AUTO-DETECT INSTALLATION LOCATION
# ========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_GLOBAL_DIR="$SCRIPT_DIR"

# Derived paths
CONFIG_DIR="$CURSOR_GLOBAL_DIR/config"
SCRIPTS_DIR="$CURSOR_GLOBAL_DIR/scripts"
CHANGELOGS_DIR="$CURSOR_GLOBAL_DIR/changelogs"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Cursor Global Configuration Setup${NC}"
echo -e "${BLUE}  (Portable - works from any location!)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}📍 Detected location: ${CURSOR_GLOBAL_DIR}${NC}"
echo ""

# Verify structure
if [ ! -d "$CONFIG_DIR" ] || [ ! -d "$SCRIPTS_DIR" ]; then
    echo -e "${RED}❌ Invalid cursor-global structure!${NC}"
    echo -e "${YELLOW}   Missing config/ or scripts/ directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ cursor-global structure verified${NC}"

# Create ~/.cursor directory if it doesn't exist
echo -e "${BLUE}📁 Setting up ~/.cursor directory...${NC}"
mkdir -p "$HOME/.cursor"

# Create symlinks for Cursor IDE
echo -e "${BLUE}🔗 Creating symlinks...${NC}"

# Backup existing files
if [ -f "$HOME/.cursor/workflows.json" ] && [ ! -L "$HOME/.cursor/workflows.json" ]; then
    echo -e "${YELLOW}   Backing up existing workflows.json${NC}"
    mv "$HOME/.cursor/workflows.json" "$HOME/.cursor/workflows.json.backup.$(date +%Y%m%d-%H%M%S)"
fi

# Create symlink for workflows.json
ln -sf "$CONFIG_DIR/workflows.json" "$HOME/.cursor/workflows.json"
echo -e "${GREEN}   ✅ workflows.json symlinked${NC}"

# Note: mcp.json is handled by setup-mcp-servers.sh (creates file with resolved paths)
echo -e "${BLUE}   ℹ️  mcp.json will be configured by MCP server setup${NC}"

# Make all scripts executable
echo -e "${BLUE}🔧 Making scripts executable...${NC}"
chmod +x "$SCRIPTS_DIR"/*.sh
echo -e "${GREEN}   ✅ All scripts are now executable${NC}"

# Update workflows.json with detected paths
echo -e "${BLUE}📝 Updating workflows.json with detected paths...${NC}"
WORKFLOWS_JSON="$CONFIG_DIR/workflows.json"

if [ -f "$WORKFLOWS_JSON" ]; then
    # Update all script paths in workflows.json to use the detected location
    # Handle various path patterns (cursor-global, cursor-ops, absolute paths)
    sed -i.bak "s|bash ~/cursor-global/scripts/|bash $SCRIPTS_DIR/|g" "$WORKFLOWS_JSON"
    sed -i.bak "s|bash \$HOME/cursor-global/scripts/|bash $SCRIPTS_DIR/|g" "$WORKFLOWS_JSON"
    sed -i.bak "s|bash /Users/[^/]*/Agents/cursor-ops/scripts/|bash $SCRIPTS_DIR/|g" "$WORKFLOWS_JSON"
    sed -i.bak "s|bash /Users/[^/]*/cursor-global/scripts/|bash $SCRIPTS_DIR/|g" "$WORKFLOWS_JSON"

    # Clean up backup file
    rm -f "$WORKFLOWS_JSON.bak"

    echo -e "${GREEN}   ✅ workflows.json updated with actual paths${NC}"
else
    echo -e "${YELLOW}   ⚠️  workflows.json not found${NC}"
fi

# Add to PATH
echo -e "${BLUE}📝 Configuring PATH...${NC}"

# Detect shell
SHELL_CONFIG=""
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
else
    # Try to detect from SHELL variable
    case "$SHELL" in
        */zsh)
            SHELL_CONFIG="$HOME/.zshrc"
            ;;
        */bash)
            SHELL_CONFIG="$HOME/.bashrc"
            ;;
        *)
            echo -e "${YELLOW}   ⚠️  Could not detect shell config file${NC}"
            SHELL_CONFIG=""
            ;;
    esac
fi

PATH_LINE="export PATH=\"$SCRIPTS_DIR:\$PATH\""

if [ -n "$SHELL_CONFIG" ]; then
    # Check if PATH is already configured (check for this specific path)
    if grep -q "$SCRIPTS_DIR" "$SHELL_CONFIG" 2>/dev/null; then
        echo -e "${GREEN}   ✅ PATH already configured in $SHELL_CONFIG${NC}"
    else
        # Remove old cursor-global PATH entries if they exist
        if grep -q "cursor-global/scripts" "$SHELL_CONFIG" 2>/dev/null; then
            echo -e "${YELLOW}   Updating old PATH entry...${NC}"
            sed -i.bak '/cursor-global\/scripts/d' "$SHELL_CONFIG"
            rm -f "$SHELL_CONFIG.bak"
        fi

        echo "" >> "$SHELL_CONFIG"
        echo "# Cursor Global Scripts (auto-detected location)" >> "$SHELL_CONFIG"
        echo "$PATH_LINE" >> "$SHELL_CONFIG"
        echo -e "${GREEN}   ✅ Added $SCRIPTS_DIR to PATH in $SHELL_CONFIG${NC}"
        echo -e "${YELLOW}   ⚠️  Run 'source $SHELL_CONFIG' to apply changes${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Add this line to your shell config manually:${NC}"
    echo -e "${BLUE}      $PATH_LINE${NC}"
fi

# Create changelogs directories if they don't exist
echo -e "${BLUE}📂 Setting up changelogs...${NC}"
mkdir -p "$CHANGELOGS_DIR/projects"
mkdir -p "$CHANGELOGS_DIR/backups"
echo -e "${GREEN}   ✅ Changelog directories ready${NC}"

# Verify Node.js for MCP servers
echo -e "${BLUE}🔍 Checking dependencies...${NC}"
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}   ✅ Node.js $NODE_VERSION installed${NC}"
else
    echo -e "${YELLOW}   ⚠️  Node.js not found - required for MCP servers${NC}"
    echo -e "${YELLOW}      Install from: https://nodejs.org/${NC}"
fi

# Verify Git
if command -v git >/dev/null 2>&1; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    echo -e "${GREEN}   ✅ Git $GIT_VERSION installed${NC}"
else
    echo -e "${YELLOW}   ⚠️  Git not found - required for git workflows${NC}"
fi

# Verify jq
if command -v jq >/dev/null 2>&1; then
    JQ_VERSION=$(jq --version | awk -F'-' '{print $2}')
    echo -e "${GREEN}   ✅ jq $JQ_VERSION installed${NC}"
else
    echo -e "${YELLOW}   ⚠️  jq not found - recommended for JSON processing${NC}"
    echo -e "${YELLOW}      Install: brew install jq (macOS) or apt-get install jq (Linux)${NC}"
fi

# Setup autonomous operation
echo ""
echo -e "${BLUE}🤖 Configuring autonomous operation...${NC}"
if [ -f "$SCRIPTS_DIR/configure-cursor-autonomy.sh" ]; then
    chmod +x "$SCRIPTS_DIR/configure-cursor-autonomy.sh"
    "$SCRIPTS_DIR/configure-cursor-autonomy.sh" || {
        echo -e "${YELLOW}   ⚠️  Autonomy configuration had warnings (non-critical)${NC}"
    }
    echo -e "${GREEN}   ✅ Autonomous operation configured${NC}"
else
    echo -e "${YELLOW}   ⚠️  configure-cursor-autonomy.sh not found${NC}"
fi

# Setup MCP servers
echo ""
echo -e "${BLUE}📦 Setting up MCP servers...${NC}"
if [ -f "$SCRIPTS_DIR/setup-mcp-servers.sh" ]; then
    chmod +x "$SCRIPTS_DIR/setup-mcp-servers.sh"
    "$SCRIPTS_DIR/setup-mcp-servers.sh" || {
        echo -e "${YELLOW}   ⚠️  MCP server setup had warnings (check logs)${NC}"
    }
    echo -e "${GREEN}   ✅ MCP servers configured${NC}"
else
    echo -e "${YELLOW}   ⚠️  setup-mcp-servers.sh not found${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Cursor Global Configuration Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📍 Installed at:${NC} ${CURSOR_GLOBAL_DIR}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. ${BLUE}Reload shell:${NC} source $SHELL_CONFIG"
echo -e "  2. ${BLUE}Restart Cursor IDE${NC} to load new workflows and MCP servers"
echo -e "  3. ${BLUE}Verify MCP servers:${NC} Type 'mcp-health' in Cursor chat"
echo -e "  4. ${BLUE}Test workflows:${NC} Type 'ai-start' in Cursor chat"
echo -e "  5. ${BLUE}Verify scripts:${NC} Run 'session-start.sh' from any directory"
echo ""
echo -e "${GREEN}Available Global Workflows:${NC}"
echo -e "  • ${BLUE}ai-start${NC} - Load session context"
echo -e "  • ${BLUE}ai-end${NC} - Save session & changelog"
echo -e "  • ${BLUE}ai-local-commit${NC} - Commit with changelog"
echo -e "  • ${BLUE}ai-local-merge${NC} - Smart merge (prevents conflicts!)"
echo -e "  • ${BLUE}mcp-health${NC} - Check MCP servers"
echo -e "  • ${BLUE}and 7 more!${NC} (see README.md)"
echo ""
echo -e "${YELLOW}📖 Documentation:${NC} cat $CURSOR_GLOBAL_DIR/README.md"
echo -e "${YELLOW}💡 Portable:${NC} Move this folder anywhere and re-run setup.sh!"
echo ""
