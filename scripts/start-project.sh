#!/bin/bash
# Start Project: pick development/resources folders via macOS pickers and update config
# Mirrors change-project behavior but keeps output minimal (only final status).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$ROOT_DIR/config/project-paths.json"

# Dependencies
if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq is required (brew install jq)"
  exit 1
fi

if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "❌ macOS required for folder picker"
  exit 1
fi

# Ensure config exists
mkdir -p "$(dirname "$CONFIG_FILE")"
if [ ! -f "$CONFIG_FILE" ]; then
  cat <<EOF >"$CONFIG_FILE"
{
  "canvas_reports": {
    "development": {
      "folder": "$HOME",
      "description": ""
    },
    "resources": {
      "folder": "$HOME",
      "description": ""
    }
  }
}
EOF
fi

PROJECT_NAME=$(jq -r 'keys[0] // "canvas_reports"' "$CONFIG_FILE")
CURRENT_DEV_PATH=$(jq -r ".[\"$PROJECT_NAME\"].development.folder // \"$HOME\"" "$CONFIG_FILE")
CURRENT_RES_PATH=$(jq -r ".[\"$PROJECT_NAME\"].resources.folder // \"$HOME\"" "$CONFIG_FILE")
DEV_DESC=$(jq -r ".[\"$PROJECT_NAME\"].development.description // \"\"" "$CONFIG_FILE")
RES_DESC=$(jq -r ".[\"$PROJECT_NAME\"].resources.description // \"\"" "$CONFIG_FILE")

# Normalize existing paths
normalize_path() {
  local path="$1"
  if [ -d "$path" ]; then
    (cd "$path" && pwd)
  else
    local parent
    parent="$(dirname "$path" 2>/dev/null || echo "$path")"
    local base
    base="$(basename "$path")"
    local resolved_parent
    resolved_parent="$(cd "$parent" 2>/dev/null && pwd)"
    echo "${resolved_parent%/}/$base"
  fi
}

CURRENT_DEV_PATH=$(normalize_path "$CURRENT_DEV_PATH")
CURRENT_RES_PATH=$(normalize_path "$CURRENT_RES_PATH")

# Pickers
DEV_PARENT="/Users/a00288946/Projects"
RES_PARENT="/Users/a00288946/Agents/resources"

DEV_FOLDER=$(osascript -e "POSIX path of (choose folder with prompt \"Select development folder:\" default location (POSIX file \"$DEV_PARENT\"))" 2>/dev/null || echo "")
RES_FOLDER=$(osascript -e "POSIX path of (choose folder with prompt \"Select resources folder:\" default location (POSIX file \"$RES_PARENT\"))" 2>/dev/null || echo "")

if [ -z "$DEV_FOLDER" ]; then
  DEV_FOLDER="$CURRENT_DEV_PATH"
else
  DEV_FOLDER="${DEV_FOLDER%/}"
fi

if [ -z "$RES_FOLDER" ]; then
  RES_FOLDER="$CURRENT_RES_PATH"
else
  RES_FOLDER="${RES_FOLDER%/}"
fi

DEV_FOLDER=$(normalize_path "$DEV_FOLDER")
RES_FOLDER=$(normalize_path "$RES_FOLDER")

if [ "$DEV_FOLDER" != "$CURRENT_DEV_PATH" ] || [ "$RES_FOLDER" != "$CURRENT_RES_PATH" ]; then
  tmp_file="$(mktemp)"
  jq --arg project "$PROJECT_NAME" \
     --arg dev "$DEV_FOLDER" --arg res "$RES_FOLDER" \
     --arg devdesc "$DEV_DESC" --arg resdesc "$RES_DESC" \
     ".[\$project].development.folder = \$dev |
      .[\$project].development.description = \$devdesc |
      .[\$project].resources.folder = \$res |
      .[\$project].resources.description = \$resdesc" \
     "$CONFIG_FILE" > "$tmp_file"
  mv "$tmp_file" "$CONFIG_FILE"
fi

echo "✅ Project paths updated"
echo "Development: $DEV_FOLDER"
echo "Resources: $RES_FOLDER"

