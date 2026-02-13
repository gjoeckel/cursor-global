#!/bin/bash
# Change Project Paths
# Interactive script to update project-paths.json with new development and resources folders
# Uses macOS folder picker dialogs for path selection

set -euo pipefail

# ========================================
# AUTO-DETECT SCRIPT LOCATION (Portable)
# ========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_GLOBAL_DIR="$(dirname "$SCRIPT_DIR")"

# Derived paths
CONFIG_DIR="$CURSOR_GLOBAL_DIR/config"
CONFIG_FILE="$CONFIG_DIR/project-paths.json"
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}🔄 Change Project Paths${NC}"
echo "=========================="
echo ""

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq not found. Install with: brew install jq${NC}"
    exit 1
fi

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${YELLOW}⚠️  Folder picker UI is only available on macOS${NC}"
    exit 1
fi

# Backup existing config
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup created: $(basename "$BACKUP_FILE")${NC}"
    echo ""
fi

# Get current paths from config
if [ ! -f "$CONFIG_FILE" ]; then
    # Create default config if it doesn't exist
    mkdir -p "$CONFIG_DIR"
    echo "{\"canvas_reports\":{\"development\":{\"folder\":\"$HOME\",\"description\":\"\"},\"resources\":{\"folder\":\"$HOME\",\"description\":\"\"}}}" | jq '.' > "$CONFIG_FILE"
fi

PROJECT_NAME=$(jq -r 'keys[0] // "canvas_reports"' "$CONFIG_FILE" 2>/dev/null || echo "canvas_reports")
CURRENT_DEV_PATH=$(jq -r ".[\"$PROJECT_NAME\"].development.folder // \"$HOME\"" "$CONFIG_FILE" 2>/dev/null || echo "$HOME")
CURRENT_RES_PATH=$(jq -r ".[\"$PROJECT_NAME\"].resources.folder // \"$HOME\"" "$CONFIG_FILE" 2>/dev/null || echo "$HOME")

# Normalize current paths (resolve to absolute, handle non-existent directories)
if [ -d "$CURRENT_DEV_PATH" ]; then
    CURRENT_DEV_PATH=$(cd "$CURRENT_DEV_PATH" && pwd)
else
    CURRENT_DEV_PATH=$(cd "$(dirname "$CURRENT_DEV_PATH")" 2>/dev/null && pwd)/$(basename "$CURRENT_DEV_PATH") 2>/dev/null || echo "$CURRENT_DEV_PATH"
fi

if [ -d "$CURRENT_RES_PATH" ]; then
    CURRENT_RES_PATH=$(cd "$CURRENT_RES_PATH" && pwd)
else
    CURRENT_RES_PATH=$(cd "$(dirname "$CURRENT_RES_PATH")" 2>/dev/null && pwd)/$(basename "$CURRENT_RES_PATH") 2>/dev/null || echo "$CURRENT_RES_PATH"
fi

# Get parent directories for default location in picker
DEV_PARENT=$(dirname "$CURRENT_DEV_PATH" 2>/dev/null || echo "$HOME")
RES_PARENT=$(dirname "$CURRENT_RES_PATH" 2>/dev/null || echo "$HOME")

# Prompt for Development folder using macOS folder picker
echo -e "${BLUE}📁 Select Development folder...${NC}"
DEV_FOLDER=$(osascript -e "POSIX path of (choose folder with prompt \"Select development folder:\" default location (POSIX file \"$DEV_PARENT\"))" 2>/dev/null || echo "")

# If cancelled or empty, use current path
if [ -z "$DEV_FOLDER" ]; then
    DEV_FOLDER="$CURRENT_DEV_PATH"
    echo -e "${YELLOW}   Using current path: $DEV_FOLDER${NC}"
else
    # Remove trailing slash if present
    DEV_FOLDER="${DEV_FOLDER%/}"
    echo -e "${GREEN}   Selected: $DEV_FOLDER${NC}"
fi

echo ""

# Prompt for Resources folder using macOS folder picker
echo -e "${BLUE}📁 Select Resources folder...${NC}"
RES_FOLDER=$(osascript -e "POSIX path of (choose folder with prompt \"Select resources folder:\" default location (POSIX file \"$RES_PARENT\"))" 2>/dev/null || echo "")

# If cancelled or empty, use current path
if [ -z "$RES_FOLDER" ]; then
    RES_FOLDER="$CURRENT_RES_PATH"
    echo -e "${YELLOW}   Using current path: $RES_FOLDER${NC}"
else
    # Remove trailing slash if present
    RES_FOLDER="${RES_FOLDER%/}"
    echo -e "${GREEN}   Selected: $RES_FOLDER${NC}"
fi

echo ""

# Check if paths changed
if [ "$DEV_FOLDER" = "$CURRENT_DEV_PATH" ] && [ "$RES_FOLDER" = "$CURRENT_RES_PATH" ]; then
    echo -e "${YELLOW}ℹ️  No changes detected. Paths unchanged.${NC}"
    echo ""
    exit 0
fi

# Update JSON file using jq
jq --arg dev "$DEV_FOLDER" --arg res "$RES_FOLDER" \
   ".[\"$PROJECT_NAME\"].development.folder = \$dev |
    .[\"$PROJECT_NAME\"].resources.folder = \$res" \
   "$CONFIG_FILE" > "${CONFIG_FILE}.tmp" && mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"

echo ""
echo -e "${GREEN}✅ Project paths updated successfully!${NC}"
echo ""
echo "Updated paths:"
echo "  Development: $DEV_FOLDER"
echo "  Resources: $RES_FOLDER"
echo ""

