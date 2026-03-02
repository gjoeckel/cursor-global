# Agent Communication System Integration

**Status**: ✅ Integrated into autonomous workflow
**Date**: November 25, 2025

---

## Overview

The agent-comms system has been integrated into the autonomous workflow that runs when a new chat starts. This allows AI agents to automatically check for and display pending messages from other agents.

---

## How It Works

### Automatic Check on Session Start

When a new chat session starts, the `ai-start` workflow automatically:

1. **Runs `session-start.sh`** - Loads session context
2. **Checks for agent-comms messages** - Calls `check-agent-comms.sh`
3. **Displays pending messages** - Shows any messages waiting in the queue

### Message Queue Location

- **Queue Directory**: `/tmp/agent-comms`
- **Message Format**: JSON files named `{uuid}.msg`
- **Processed Messages**: Moved to `/tmp/agent-comms/processed/`

---

## Message Structure

```json
{
  "id": "uuid-v4",
  "from": "sender-agent-name",
  "to": "recipient-agent-name",
  "type": "message-type",
  "payload": { /* any data */ },
  "timestamp": 1234567890
}
```

---

## Usage

### Automatic (On Session Start)

Messages are automatically checked when you start a new chat session:

```bash
# In Cursor chat, type:
ai-start
```

The workflow will display any pending messages.

### Manual Check

You can manually check for messages at any time:

```bash
# In Cursor chat, type:
agent-comms-check
```

Or run the script directly:

```bash
bash /Users/a00288946/Agents/cursor-ops/scripts/check-agent-comms.sh
```

---

## Agent Name Filtering

By default, the script looks for messages addressed to:
- `cursor-ops` (default agent name)
- `*` (broadcast messages)

To filter for a different agent name, set the `AGENT_NAME` environment variable:

```bash
export AGENT_NAME="my-agent"
agent-comms-check
```

---

## Sending Messages

To send a message to another agent, use the agent-comms library:

```typescript
import { send } from '/Users/a00288946/Agents/agent-comms/src/index.js';

await send('cursor-ops', 'command', {
  action: 'deploy',
  target: 'production'
});
```

Or use the Node.js/TypeScript API directly from the agent-comms directory.

---

## Integration Points

### Files Modified

1. **`scripts/session-start.sh`**
   - Added agent-comms message check after MCP tools status
   - Runs automatically when `ai-start` workflow executes

2. **`scripts/check-agent-comms.sh`** (NEW)
   - Checks `/tmp/agent-comms` for pending messages
   - Parses and displays message details
   - Filters by agent name if specified

3. **`config/workflows.json`**
   - Added `agent-comms-check` workflow for manual message checking

---

## Example Output

When messages are found, the output looks like:

```
📬 Agent Communication System - Pending Messages
==================================
Found 2 pending message(s)

📨 Message #1
   From: antigravity
   To: cursor-ops
   Type: command
   Time: 2025-11-25 22:45:30
   Payload: {"action":"deploy","target":"production"}

📨 Message #2
   From: another-agent
   To: cursor-ops
   Type: task
   Time: 2025-11-25 22:46:15
   Payload: {"task":"fix-bug","issue":"#123"}

==================================
💡 Agent-comms system location: /tmp/agent-comms
💡 To process messages, use the agent-comms receiver
💡 Set AGENT_NAME environment variable to filter messages
```

---

## Dependencies

- **agent-comms library**: Located at `/Users/a00288946/Agents/agent-comms`
- **jq** (optional): For better JSON parsing (falls back to grep if not available)
- **bash**: Standard shell scripting

---

## Future Enhancements

Potential improvements:

1. **Auto-process messages**: Automatically process and respond to messages
2. **Message history**: Track processed messages
3. **Message priorities**: Support for priority levels
4. **Response handling**: Built-in response mechanism
5. **Message acknowledgment**: Confirm message receipt

---

## Troubleshooting

### No messages showing

1. Check if `/tmp/agent-comms` directory exists
2. Verify messages are being written to the queue
3. Check agent name filter matches message `to` field
4. Ensure messages are valid JSON format

### Messages not being processed

- Messages are only **displayed**, not automatically processed
- Use the agent-comms receiver to actually process messages
- Messages remain in queue until moved to `processed/` directory

---

**Integration Complete** ✅
**Ready for use in autonomous workflows**


