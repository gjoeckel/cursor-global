#!/bin/bash

# Portable MCP server setup helper for cursor-global
# Installs custom MCP servers from git repository and configures paths

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

# ========================================
# AUTO-DETECT SCRIPT LOCATION (Portable)
# ========================================
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
if [ -f "$TARGET_FILE" ] || [ -L "$TARGET_FILE" ]; then
  BACKUP_FILE="$TARGET_FILE.backup-$(date +%Y%m%d-%H%M%S)"
  if [ -L "$TARGET_FILE" ]; then
    # If it's a symlink, backup the actual file it points to
    cp "$(readlink -f "$TARGET_FILE")" "$BACKUP_FILE" 2>/dev/null || cp "$TARGET_FILE" "$BACKUP_FILE"
  else
    cp "$TARGET_FILE" "$BACKUP_FILE"
  fi
  echo -e "${GREEN}✓${NC} Backup created: $BACKUP_FILE"
fi

# Remove symlink if it exists (we'll create a regular file with resolved paths)
if [ -L "$TARGET_FILE" ]; then
  rm "$TARGET_FILE"
fi

echo ""
echo "📦 Installing/Verifying Custom MCP Servers..."

# Determine custom MCP servers location
# Option 1: Use MCP_SERVERS_REPO environment variable
# Option 2: Check for local installation at ~/.cursor/mcp-servers
# Option 3: Install to ~/.cursor/mcp-servers
MCP_SERVERS_REPO="${MCP_SERVERS_REPO:-}"
MCP_SERVERS_PATH="${MCP_SERVERS_REPO:-$HOME/.cursor/mcp-servers}"

# Custom servers to install
CUSTOM_SERVERS=("github-minimal" "shell-minimal" "playwright-minimal" "agent-autonomy")
CUSTOM_SERVERS_REPO="https://github.com/gjoeckel/my-mcp-servers.git"

# Check if custom servers need to be installed
NEEDS_INSTALL=false
PACKAGES_DIR=""

# Check for packages directory (account for nested structure)
if [ -n "$MCP_SERVERS_REPO" ]; then
  if [ -d "$MCP_SERVERS_REPO/packages" ]; then
    PACKAGES_DIR="$MCP_SERVERS_REPO/packages"
    echo -e "${BLUE}Using existing MCP servers repository: $MCP_SERVERS_REPO${NC}"
  elif [ -d "$MCP_SERVERS_REPO/my-mcp-servers/packages" ]; then
    PACKAGES_DIR="$MCP_SERVERS_REPO/my-mcp-servers/packages"
    echo -e "${BLUE}Using existing MCP servers repository: $MCP_SERVERS_REPO${NC}"
  fi
fi

if [ -z "$PACKAGES_DIR" ]; then
  # Check default installation location (account for nested structure)
  if [ -d "$MCP_SERVERS_PATH/my-mcp-servers/packages" ]; then
    PACKAGES_DIR="$MCP_SERVERS_PATH/my-mcp-servers/packages"
    echo -e "${BLUE}Using installed MCP servers: $PACKAGES_DIR${NC}"
  elif [ -d "$MCP_SERVERS_PATH/packages" ]; then
    PACKAGES_DIR="$MCP_SERVERS_PATH/packages"
    echo -e "${BLUE}Using installed MCP servers: $PACKAGES_DIR${NC}"
  else
    # Need to install
    NEEDS_INSTALL=true
    echo -e "${YELLOW}Custom MCP servers not found, will install to: $MCP_SERVERS_PATH${NC}"
  fi
fi

# Install custom servers if needed
if [ "$NEEDS_INSTALL" = true ]; then
  echo ""
  echo "🔧 Installing custom MCP servers from repository..."

  # Check if git is available
  if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is required to install custom MCP servers${NC}"
    echo -e "${YELLOW}Please install git or set MCP_SERVERS_REPO to point to existing installation${NC}"
    exit 1
  fi

  # Check if node is available
  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required to build custom MCP servers${NC}"
    exit 1
  fi

  # Clone repository
  if [ ! -d "$MCP_SERVERS_PATH" ]; then
    echo -e "${BLUE}Cloning custom MCP servers repository...${NC}"
    git clone "$CUSTOM_SERVERS_REPO" "$MCP_SERVERS_PATH" || {
      echo -e "${RED}❌ Failed to clone repository${NC}"
      exit 1
    }
  fi

  # Determine packages directory (account for nested structure)
  if [ -d "$MCP_SERVERS_PATH/my-mcp-servers/packages" ]; then
    PACKAGES_DIR="$MCP_SERVERS_PATH/my-mcp-servers/packages"
    BUILD_DIR="$MCP_SERVERS_PATH/my-mcp-servers"
  elif [ -d "$MCP_SERVERS_PATH/packages" ]; then
    PACKAGES_DIR="$MCP_SERVERS_PATH/packages"
    BUILD_DIR="$MCP_SERVERS_PATH"
  else
    # Try to find where packages actually are
    PACKAGES_DIR=$(find "$MCP_SERVERS_PATH" -type d -name "packages" -path "*/my-mcp-servers/packages" | head -1)
    if [ -z "$PACKAGES_DIR" ]; then
      PACKAGES_DIR="$MCP_SERVERS_PATH/my-mcp-servers/packages"
      BUILD_DIR="$MCP_SERVERS_PATH/my-mcp-servers"
    else
      BUILD_DIR="$(dirname "$PACKAGES_DIR")"
    fi
  fi

  # Build all custom servers
  echo -e "${BLUE}Building custom MCP servers...${NC}"
  cd "$BUILD_DIR"

  if [ -f "package.json" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install || {
      echo -e "${YELLOW}⚠ Warning: npm install failed, continuing...${NC}"
    }
  fi

  # Build each server package
  for server in "${CUSTOM_SERVERS[@]}"; do
    if [ -d "packages/$server" ]; then
      echo -e "${BLUE}Building $server...${NC}"
      cd "packages/$server"
      if [ -f "package.json" ]; then
        npm install 2>/dev/null || true
        npm run build 2>/dev/null || {
          echo -e "${YELLOW}⚠ Warning: Failed to build $server${NC}"
        }
      fi
      cd - > /dev/null
    fi
  done

  cd - > /dev/null
  echo -e "${GREEN}✓${NC} Custom MCP servers installation complete"
fi

# Verify server builds
echo ""
echo "🔍 Verifying MCP server builds..."
BUILD_STATUS="ok"

if [ -n "$PACKAGES_DIR" ] && [ -d "$PACKAGES_DIR" ]; then
  for server in "${CUSTOM_SERVERS[@]}"; do
    BUILD_DIR="$PACKAGES_DIR/$server/build"
    if [ -f "$BUILD_DIR/index.js" ]; then
      echo -e "${GREEN}✓${NC} $server"
    else
      echo -e "${YELLOW}⚠${NC} $server (build not found, will use npx fallback)"
      BUILD_STATUS="warning"
    fi
  done
else
  echo -e "${YELLOW}⚠${NC} Custom servers path not found, will use npx fallback"
  BUILD_STATUS="warning"
fi

# Create MCP config with actual paths
echo ""
echo "🔧 Creating MCP configuration with resolved paths..."

# Copy config template (force overwrite if symlink exists)
cp -f "$CONFIG_FILE" "$TARGET_FILE"

# Replace ${HOME} with actual home directory path (required for filesystem server)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS sed - replace HOME variable with actual path
  sed -i '' "s|\${HOME}|$HOME|g" "$TARGET_FILE"
else
  # Linux sed - replace HOME variable with actual path
  sed -i "s|\${HOME}|$HOME|g" "$TARGET_FILE"
fi
echo -e "${GREEN}✓${NC} HOME variable expanded to: $HOME"

# Substitute placeholder with actual path for custom servers
if [ -n "$PACKAGES_DIR" ] && [ -d "$PACKAGES_DIR" ]; then
  # Use sed to replace placeholder (works on macOS and Linux)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS sed
    sed -i '' "s|MCP_SERVERS_PATH_PLACEHOLDER|$PACKAGES_DIR|g" "$TARGET_FILE"
  else
    # Linux sed
    sed -i "s|MCP_SERVERS_PATH_PLACEHOLDER|$PACKAGES_DIR|g" "$TARGET_FILE"
  fi
  echo -e "${GREEN}✓${NC} Configuration updated with resolved paths: $PACKAGES_DIR"
else
  # No custom servers installed, but that's OK since we're using npx now
  echo -e "${BLUE}ℹ${NC} Custom servers will use npx (auto-install from npm)"
fi

echo ""
echo "===================="
if [ "$BUILD_STATUS" = "ok" ]; then
  echo -e "${GREEN}✅ MCP servers setup complete!${NC}"
elif [ "$BUILD_STATUS" = "warning" ]; then
  echo -e "${YELLOW}⚠ Setup complete with warnings - some servers may use npx fallback${NC}"
else
  echo -e "${YELLOW}⚠ Setup complete - custom servers will use npx fallback${NC}"
fi

echo ""
echo -e "${BLUE}Installed MCP Servers:${NC}"
echo "  • filesystem (official - via npx)"
echo "  • memory (official - via npx)"
for server in "${CUSTOM_SERVERS[@]}"; do
  if [ -n "$PACKAGES_DIR" ] && [ -f "$PACKAGES_DIR/$server/build/index.js" ]; then
    echo "  • $server (custom - installed)"
  else
    echo "  • $server (custom - npx fallback)"
  fi
done

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Restart Cursor IDE to load the updated MCP config"
echo "  2. Run 'mcp-health' workflow to verify all servers"
echo "  3. Set MCP_SERVERS_REPO env var to use different server location"
echo ""
