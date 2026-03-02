# RRW Protocol Workflow: Read-Request-Wait Communication

**Standardized communication protocol for AI interactions to ensure alignment and authorization.**

---

## Overview

The `RRW` (Read-Request-Wait) workflow is a communication protocol designed to prevent autonomous AI agents from making significant changes without explicit user alignment. It forces a three-step pause:

1. **Read**: Repeat the understanding of the prompt.
2. **Request**: Ask for missing information or clarifications.
3. **Wait**: explicitly wait for user authorization before proceeding.

---

## How it Works

When the `/RRW` command is used in a prompt, the AI agent is instructed by `.cursorrules` to activate this protocol.

### Command Trigger

1. **Type `/RRW`** at the end of your prompt.
2. **AI detects the trigger** and activates the protocol.

---

## Implementation Details

### 1. Cursor Command Definition
The command is registered in `~/.cursor/commands/RRW.md`.

```markdown
---
description: Read-Request-Wait Protocol: 1) Repeat understanding 2) Request info 3) Wait for auth
allowed-tools: read_file, run_terminal_cmd, glob_file_search, grep, todo_write
---

# RRW Protocol Activation

FOLLOW THESE STEPS STRICTLY:

1. **Activate Protocol**: Run the RRW script: `bash /Users/a00288946/Agents/cursor-ops/scripts/rrw-protocol.sh`
2. **Repeat Understanding**: Paraphrase the user's request to ensure complete alignment.
3. **Request Info**: Ask for any missing information, file paths, or clarifications required to complete the task accurately.
4. **Wait for Authorization**: explicitly state that you are waiting for the user's "GO" or authorization before proceeding with tool calls or edits.

DO NOT execute any other tools or make any code changes until the user provides authorization.
```

### 2. Global Workflow Registration
Added to `config/workflows.json`:

```json
  "RRW": {
    "description": "Read-Request-Wait Protocol: 1) Repeat understanding 2) Request info 3) Wait for auth",
    "commands": [
      "bash /Users/a00288946/Agents/cursor-ops/scripts/rrw-protocol.sh"
    ],
    "auto_approve": false,
    "timeout": 10000,
    "on_error": "stop"
  }
```

### 3. Protocol Script
The script `/scripts/rrw-protocol.sh` provides a visual confirmation in the terminal:

```bash
#!/bin/bash
echo "--------------------------------------------------------"
echo "🔄 RRW PROTOCOL ACTIVATED: Read, Request, Wait"
echo "--------------------------------------------------------"
```

---

## Best Practices

- **Use `/RRW`** for complex refactorings, multi-file changes, or ambiguous tasks.
- **Provide context** before the command so the AI has enough to "Read" and "Request" about.
- **Wait for the summary** before giving the "GO".

---

**Last Updated**: February 4, 2026
**Maintained By**: Cursor Ops Team
