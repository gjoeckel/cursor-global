---
description: Rewire next — show current phase and next steps; read Otter workflow state and AGENT-STARTUP
allowed-tools: read_file, run_terminal_cmd, glob_file_search, grep, todo_write
---

# Rewire next / status

**Trigger:** Type `/rewire-next` in chat to invoke.

Execute the following:

1. **Read workflow state:** Read `rewire_workflow_state.md` from Otter resources. From cursor-ops use path: `/Users/a00288946/Agents/resources/otter/rewire_workflow_state.md` (or `../resources/otter/rewire_workflow_state.md` if relative from workspace).
2. **Read AGENT-STARTUP:** Read `/Users/a00288946/Agents/resources/otter/AGENT-STARTUP.md` for project boundaries and paths.
3. **Summarize for the user:**
   - **Current phase** (1, 2, or 3) and branch
   - **Active goal**
   - **Next steps** (from workflow state)
   - Optionally: open rewire items from the state file or from `rewire-file-manifest.md` in the same resources folder.
4. If the user wants to proceed, use REWIRE-OVERVIEW.md and the phase doc for the current phase to execute the next step; then update `rewire_workflow_state.md` and optionally append to `rewire_changelog.md`.

**Paths (macOS):**
- Otter resources: `/Users/a00288946/Agents/resources/otter`
- Otter dev: `/Users/a00288946/Projects/otter`
