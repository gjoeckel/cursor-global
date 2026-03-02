#!/usr/bin/env bash
# scripts/rewire-next.sh
# Prints Otter rewire workflow state path for agent context. Full behavior: use /rewire-next in chat (see .cursor/commands/rewire-next.md).

CURSOR_OPS="${CURSOR_OPS:-$(cd "$(dirname "$0")/.." && pwd)}"
RESOURCES_OTTER="${CURSOR_OPS}/../resources/otter"
if [[ ! -d "$RESOURCES_OTTER" ]]; then
  RESOURCES_OTTER="/Users/a00288946/Agents/resources/otter"
fi
echo "Rewire workflow state: ${RESOURCES_OTTER}/rewire_workflow_state.md"
echo "Agent: read that file and AGENT-STARTUP.md, then summarize current phase and next steps (see .cursor/commands/rewire-next.md)."
