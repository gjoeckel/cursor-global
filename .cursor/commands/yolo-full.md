---
description: Initialize full autonomous mode with MCP validation
allowed-tools: run_terminal_cmd, read_file, write, search_replace, glob_file_search, grep, web_search, browser_navigate, todo_write
---

# Autonomous Mode Initialization (Cursor IDE)

**Policy:** This workflow runs validation scripts that are "run without asking" per `.cursor/rules/agent-action-policy.mdc`.

Execute the following startup validation:

1. **Unified Validation**: The workflow runs `validate-autonomous-mode.sh --json` to perform a health check (MCP config, project paths, system deps). If you are running the command manually, use:
   `bash /Users/a00288946/Agents/cursor-ops/scripts/validate-autonomous-mode.sh --json`

2. **Project Paths**: The workflow runs `display-project-paths.sh` to show current development and resources folders from `config/project-paths.json`.

3. **Project startup**: The workflow runs `show-project-startup.sh` to print the current project (from `CURSOR_CURRENT_PROJECT` or first in project-paths), the path to that project’s `AGENT-STARTUP.md`, and the first ~25 lines if the file exists. Then read **docs/AGENT-QUICKSTART.md** for current-project context and next steps.

4. **MCP Tool Verification**: After the workflow completes, verify MCP tools are actually connected (config is validated, but servers may not be responding). Use your environment’s MCP tool listing (e.g. list available MCP tools/resources) to confirm. If servers are configured but not connected, suggest restarting Cursor or running `mcp-health` to diagnose.

5. **Status Report**: From the JSON output and tool verification, provide:
   - MCP servers: [list from JSON or tool list]
   - Autonomous tools: enabled/disabled (YOLO/autoApprove in settings)
   - Environment: required TOKENS/SECRETS set per validation output
   - Development path / Resources path: from project-paths output
   - Ready for autonomous operation: yes/no

6. **YOLO auto-apply (optional):** If the user wants agent edits applied without clicking Accept, tell them: *Enable in Cursor Settings (search “YOLO” or “auto-apply”)—no restart per session; setting persists. Or run from cursor-ops root `bash scripts/configure-cursor-autonomy.sh` and restart Cursor once; then it persists. See `docs/YOLO-FULL-WORKFLOW.md` (§ Enabling YOLO auto-apply).*

If all checks pass, confirm: **"Autonomous mode active. Ready for tasks."**

**If validation fails:** Check the script output for missing env vars, missing paths, or invalid MCP config. Common fixes: run `mcp-setup`, verify `config/project-paths.json`, ensure `GITHUB_TOKEN`, `ASANA_ACCESS_TOKEN`, and Box tokens (in `config/box.env`) are set. See `docs/YOLO-FULL-WORKFLOW.md` for full setup.
