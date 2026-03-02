#!/bin/bash
# Version: 1.0.0
# Output current project key and path to its AGENT-STARTUP.md.
# Precedence: CURSOR_CURRENT_PROJECT env → first project in config/project-paths.json.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_OPS="${CURSOR_OPS:-$(dirname "$SCRIPT_DIR")}"
CONFIG="$CURSOR_OPS/config/project-paths.json"

if [[ ! -f "$CONFIG" ]] || ! command -v jq &>/dev/null; then
  echo "{}"
  exit 0
fi

# 1. Env override
if [[ -n "${CURSOR_CURRENT_PROJECT:-}" ]]; then
  KEY="$CURSOR_CURRENT_PROJECT"
  if jq -e "has(\"$KEY\")" "$CONFIG" &>/dev/null; then
    RESOURCES=$(jq -r ".\"$KEY\".resources.folder" "$CONFIG")
    STARTUP="$RESOURCES/AGENT-STARTUP.md"
    jq -n --arg key "$KEY" --arg resources "$RESOURCES" --arg startup "$STARTUP" \
      '{project: $key, resources_folder: $resources, agent_startup_path: $startup}'
    exit 0
  fi
fi

# 2. First project in config
KEY=$(jq -r 'keys[0]' "$CONFIG")
if [[ -z "$KEY" || "$KEY" == "null" ]]; then
  echo "{}"
  exit 0
fi

RESOURCES=$(jq -r ".\"$KEY\".resources.folder" "$CONFIG")
STARTUP="$RESOURCES/AGENT-STARTUP.md"
jq -n --arg key "$KEY" --arg resources "$RESOURCES" --arg startup "$STARTUP" \
  '{project: $key, resources_folder: $resources, agent_startup_path: $startup}'
