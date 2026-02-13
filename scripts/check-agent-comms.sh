#!/bin/bash

# Check for Agent Communication Messages
# Checks the agent-comms queue for pending messages and displays them

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

QUEUE_DIR="/tmp/agent-comms"
AGENT_NAME="${AGENT_NAME:-cursor-ops}"

# Check if agent-comms directory exists
if [ ! -d "$QUEUE_DIR" ]; then
    echo -e "${YELLOW}📭 Agent-comms queue directory not found: $QUEUE_DIR${NC}"
    echo -e "${BLUE}💡 Agent-comms system not initialized${NC}"
    exit 0
fi

# Count pending messages (files in queue, excluding processed)
PENDING_COUNT=$(find "$QUEUE_DIR" -maxdepth 1 -name "*.msg" -type f 2>/dev/null | wc -l | tr -d ' ')

if [ "$PENDING_COUNT" -eq 0 ]; then
    echo -e "${GREEN}📭 No pending messages in agent-comms queue${NC}"
    exit 0
fi

echo -e "${CYAN}📬 Agent Communication System - Pending Messages${NC}"
echo "=================================="
echo -e "${YELLOW}Found $PENDING_COUNT pending message(s)${NC}"
echo ""

# Display messages (limit to first 10 to avoid overwhelming output)
MESSAGE_COUNT=0
for msg_file in "$QUEUE_DIR"/*.msg; do
    [ -f "$msg_file" ] || continue

    MESSAGE_COUNT=$((MESSAGE_COUNT + 1))
    if [ "$MESSAGE_COUNT" -gt 10 ]; then
        echo -e "${YELLOW}... and $((PENDING_COUNT - 10)) more message(s)${NC}"
        break
    fi

    # Parse JSON message (basic parsing, assumes valid JSON)
    if command -v jq &> /dev/null; then
        FROM=$(jq -r '.from // "unknown"' "$msg_file" 2>/dev/null || echo "unknown")
        TO=$(jq -r '.to // "unknown"' "$msg_file" 2>/dev/null || echo "unknown")
        TYPE=$(jq -r '.type // "unknown"' "$msg_file" 2>/dev/null || echo "unknown")
        TIMESTAMP=$(jq -r '.timestamp // 0' "$msg_file" 2>/dev/null || echo "0")
        PAYLOAD=$(jq -c '.payload // {}' "$msg_file" 2>/dev/null || echo "{}")
    else
        # Fallback: basic grep parsing (less reliable)
        FROM=$(grep -o '"from"[[:space:]]*:[[:space:]]*"[^"]*"' "$msg_file" | head -1 | cut -d'"' -f4 || echo "unknown")
        TO=$(grep -o '"to"[[:space:]]*:[[:space:]]*"[^"]*"' "$msg_file" | head -1 | cut -d'"' -f4 || echo "unknown")
        TYPE=$(grep -o '"type"[[:space:]]*:[[:space:]]*"[^"]*"' "$msg_file" | head -1 | cut -d'"' -f4 || echo "unknown")
        TIMESTAMP=$(grep -o '"timestamp"[[:space:]]*:[[:space:]]*[0-9]*' "$msg_file" | head -1 | cut -d':' -f2 | tr -d ' ' || echo "0")
        PAYLOAD="{}"
    fi

    # Format timestamp
    if [ "$TIMESTAMP" != "0" ] && [ -n "$TIMESTAMP" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            DATE_STR=$(date -r "$TIMESTAMP" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "unknown")
        else
            DATE_STR=$(date -d "@$TIMESTAMP" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "unknown")
        fi
    else
        DATE_STR="unknown"
    fi

    # Check if message is for this agent
    if [ "$TO" = "$AGENT_NAME" ] || [ "$TO" = "cursor-ops" ] || [ "$TO" = "*" ]; then
        echo -e "${GREEN}📨 Message #$MESSAGE_COUNT${NC}"
        echo "   From: $FROM"
        echo "   To: $TO"
        echo "   Type: $TYPE"
        echo "   Time: $DATE_STR"
        echo "   Payload: $PAYLOAD"
        echo ""
    else
        echo -e "${BLUE}📨 Message #$MESSAGE_COUNT (not for this agent)${NC}"
        echo "   From: $FROM"
        echo "   To: $TO (this agent: $AGENT_NAME)"
        echo ""
    fi
done

echo "=================================="
echo -e "${CYAN}💡 Agent-comms system location: $QUEUE_DIR${NC}"
echo -e "${YELLOW}💡 To process messages, use the agent-comms receiver${NC}"
echo -e "${BLUE}💡 Set AGENT_NAME environment variable to filter messages${NC}"


