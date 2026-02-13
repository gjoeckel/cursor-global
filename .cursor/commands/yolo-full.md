---
description: Initialize full autonomous mode with MCP validation
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Task, TodoWrite
---

# Autonomous Mode Initialization

Execute the following startup validation:

0. **Workspace Check**: Ensure you opened a multi-root workspace (`~/.cursor-workspaces/<project>.code-workspace`) created by `csp`/`switch-cursor-project.sh`, so both Development and Resources are in scope. If not, run `csp <project>` (or `csp --setup` then `csp <project>`) and reopen.

1. **MCP Server Status**: Run `/mcp` to check which MCP servers are connected. If servers are configured but not connected, notify the user they may need to restart Claude Code or run `claude mcp list` to diagnose.

2. **Permissions Check**: Confirm these tools are available without prompting:
   - Bash, Read, Write, Edit, Glob, Grep
   - WebSearch, WebFetch, Task, TodoWrite

3. **Environment Validation**:
   - Verify working directory access
   - Check additional directories from settings are accessible

4. **Status Report**: Provide a brief status:
   - Workspace: multi-root (dev+resources) opened? yes/no
   - MCP servers: connected/disconnected
   - Autonomous tools: enabled/disabled
   - Ready for autonomous operation: yes/no

If all checks pass, confirm: "Autonomous mode active. Ready for tasks."

If issues found, list them and suggest fixes.

