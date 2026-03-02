# End-to-End Review: `/yolo-full` Workflow

**Date:** 2026-02-18  
**Reviewer:** AI Agent (Auto)  
**Scope:** Complete workflow definition, command file, validation script, and alignment with Agent Action Policy

---

## Executive Summary

The `/yolo-full` workflow is **mostly aligned** with the Agent Action Policy recommendations but has **discrepancies** between the command file (`.cursor/commands/yolo-full.md`) and the workflow definition (`config/workflows.json`). The validation script (`validate-autonomous-mode.sh`) is correctly categorized as "run without asking" and functions correctly. **Recommendations:** Align command file with workflow, remove legacy/Claude-specific content, add MCP tool verification step, optimize JSON output handling.

---

## 1. Alignment with Agent Action Policy

### ✅ Correctly Aligned

1. **Script categorization**: `validate-autonomous-mode.sh` is correctly listed in the action policy under "Run without asking" (validation scripts). ✅
2. **Workflow auto-approve**: `config/workflows.json` has `"auto_approve": true` for `yolo-full`, which aligns with the policy that validation scripts run without asking. ✅
3. **Script location**: Uses absolute path (`/Users/a00288946/Agents/cursor-ops/scripts/validate-autonomous-mode.sh`), which aligns with the policy's guidance for running cursor-ops scripts from any directory. ✅

### ⚠️ Misalignments Found

1. **Command file vs workflow discrepancy**: 
   - **Command file** (`.cursor/commands/yolo-full.md`) instructs: "Run `validate-autonomous-mode.sh --json`" and includes workspace checks, MCP status, permissions checks.
   - **Workflow** (`config/workflows.json`) only runs: `bash /Users/.../validate-autonomous-mode.sh` (no `--json` flag, no additional steps).
   - **Impact**: When invoked as a workflow, the command file's instructions are ignored. The workflow doesn't produce JSON output, making programmatic parsing harder.

2. **Command file tool names**: 
   - Command file lists: `Bash, Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Task, TodoWrite`
   - Actual Cursor tools: `run_terminal_cmd, read_file, write, search_replace, glob_file_search, grep, web_search, browser_navigate, todo_write`
   - **Impact**: Tool names don't match Cursor's actual tool names; suggests this file was written for Claude Code, not Cursor IDE.

3. **Command file mentions workspace checks**:
   - Command file includes: "Ensure you opened a multi-root workspace (`~/.cursor-workspaces/<project>.code-workspace`) created by `csp`/`switch-cursor-project.sh`"
   - This is **Claude Code-specific** (not Cursor IDE). Cursor IDE doesn't use `.cursor-workspaces/` or `csp` commands.
   - **Impact**: Confusing for Cursor IDE users; irrelevant for Cursor IDE workflow execution.

---

## 2. Processes to Optimize

### 2.1 Add `--json` flag to workflow

**Current:** Workflow runs script without `--json`, producing human-readable output.  
**Recommendation:** Add `--json` flag so output can be parsed programmatically:

```json
"yolo-full": {
  "description": "Initialize full autonomous mode with MCP validation",
  "commands": [
    "bash /Users/a00288946/Agents/cursor-ops/scripts/validate-autonomous-mode.sh --json"
  ],
  "auto_approve": true,
  "timeout": 30000,
  "on_error": "continue"
}
```

**Benefit:** Enables structured output parsing, easier integration with other tools, consistent with command file instructions.

### 2.2 Add MCP tool verification step

**Current:** Validation script checks MCP server config and env vars but doesn't verify tools are actually available/responding.  
**Recommendation:** Add a step that lists MCP tools (via `list_mcp_resources` or equivalent) to confirm servers are connected and responding.

**Implementation options:**
- Add to `validate-autonomous-mode.sh` (if it can call MCP tools)
- Add as a second command in the workflow: `echo "MCP tools: $(list_mcp_resources | jq -r '.[] | .name' | wc -l) available"`
- Or document that agents should verify MCP tools separately after running the workflow

**Benefit:** Catches cases where MCP servers are configured but not actually connected/responding.

### 2.3 Consolidate command file and workflow

**Current:** Command file has detailed instructions that don't match what the workflow actually does.  
**Recommendation:** Update command file to match the workflow's actual behavior, or make the workflow match the command file's instructions.

**Preferred approach:** Update command file to:
1. Remove Claude Code-specific references (workspace checks, `csp`, `.cursor-workspaces/`)
2. Use correct Cursor tool names (`run_terminal_cmd` not `Bash`, etc.)
3. Match the workflow's actual steps (run validation script with `--json`, optionally verify MCP tools)

**Benefit:** Single source of truth, no confusion about what `/yolo-full` actually does.

### 2.4 Add status summary to workflow output

**Current:** Validation script outputs JSON or human-readable text, but workflow doesn't provide a final summary.  
**Recommendation:** Add a final echo command that summarizes status:

```json
"commands": [
  "bash /Users/a00288946/Agents/cursor-ops/scripts/validate-autonomous-mode.sh --json",
  "echo '✅ yolo-full validation complete. Check output above for status.'"
]
```

Or, if JSON output is used, parse it and display a summary.

**Benefit:** Clear confirmation that workflow completed and what the result was.

---

## 3. Processes to Remove (Legacy)

### 3.1 Remove Claude Code-specific content from command file

**Location:** `.cursor/commands/yolo-full.md`  
**Content to remove:**
- Line 10: "Ensure you opened a multi-root workspace (`~/.cursor-workspaces/<project>.code-workspace`) created by `csp`/`switch-cursor-project.sh`"
- Line 12: "Run `/mcp` to check which MCP servers are connected"
- References to `claude mcp list`

**Reason:** These are Claude Code-specific, not Cursor IDE. Cursor IDE doesn't use `.cursor-workspaces/`, `csp`, or `/mcp` commands.

**Action:** Rewrite command file to be Cursor IDE-specific or create separate files for Claude Code vs Cursor IDE.

### 3.2 Remove incorrect tool names from command file

**Location:** `.cursor/commands/yolo-full.md`, line 3  
**Current:** `allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Task, TodoWrite`  
**Should be:** `allowed-tools: run_terminal_cmd, read_file, write, search_replace, glob_file_search, grep, web_search, browser_navigate, todo_write` (or remove if not needed)

**Reason:** Tool names don't match Cursor IDE's actual tool names.

### 3.3 Consider removing redundant documentation

**Location:** `docs/YOLO-FULL-WORKFLOW.md`  
**Observation:** This file is comprehensive (500+ lines) but contains setup instructions that may be better in a setup guide. The workflow itself is simple (one script call).

**Recommendation:** Keep the file but mark sections as "setup" vs "workflow usage." Or split into:
- `YOLO-FULL-SETUP.md` (how to configure YOLO mode)
- `YOLO-FULL-WORKFLOW.md` (what the workflow does, how to use it)

**Benefit:** Clearer separation between "how to set up" vs "how to use the workflow."

---

## 4. Processes to Add

### 4.1 Add MCP tool count verification

**Recommendation:** After running validation script, verify MCP tools are actually available (not just configured).

**Implementation:** Add to workflow or command file:
```bash
# After validate-autonomous-mode.sh, verify MCP tools are responding
# (This would require MCP tool access, which may not be available in workflow context)
```

**Alternative:** Document that agents should verify MCP tools separately using `list_mcp_resources` or equivalent after running `/yolo-full`.

### 4.2 Add project paths display

**Current:** Validation script validates project paths exist but doesn't display them in a user-friendly way.  
**Recommendation:** Add a step that displays current project paths (development and resources) in a readable format.

**Implementation:** Could add to workflow:
```json
"commands": [
  "bash /Users/a00288946/Agents/cursor-ops/scripts/validate-autonomous-mode.sh --json",
  "bash /Users/a00288946/Agents/cursor-ops/scripts/display-project-paths.sh"
]
```

**Benefit:** Users see which project they're working with immediately.

### 4.3 Add action policy reminder

**Recommendation:** Add a comment or echo in the workflow that reminds agents of the action policy (e.g., "Validation scripts run without asking per agent-action-policy.mdc").

**Implementation:** Add to command file or workflow description:
```markdown
**Note:** This workflow runs `validate-autonomous-mode.sh`, which is categorized as "run without asking" per `.cursor/rules/agent-action-policy.mdc`.
```

**Benefit:** Explicit connection between workflow and action policy.

### 4.4 Add error handling guidance

**Current:** Workflow has `"on_error": "continue"` but doesn't document what to do if validation fails.  
**Recommendation:** Add to command file or workflow description:
- If validation fails, check the output for specific issues (missing env vars, missing paths, etc.)
- Common fixes: run `mcp-setup`, check `config/project-paths.json`, verify environment variables

**Benefit:** Clear next steps when validation fails.

---

## 5. Detailed Findings

### 5.1 Workflow Definition (`config/workflows.json`)

**Current state:**
```json
"yolo-full": {
  "description": "Initialize full autonomous mode with MCP validation",
  "commands": [
    "bash /Users/a00288946/Agents/cursor-ops/scripts/validate-autonomous-mode.sh"
  ],
  "auto_approve": true,
  "timeout": 30000,
  "on_error": "continue"
}
```

**Issues:**
1. Missing `--json` flag (command file says to use it)
2. No MCP tool verification step
3. No project paths display
4. No final status summary

**Alignment with action policy:** ✅ Correct (`auto_approve: true` aligns with "run without asking" for validation scripts)

### 5.2 Command File (`.cursor/commands/yolo-full.md`)

**Current state:**
- Includes Claude Code-specific workspace checks
- Uses incorrect tool names (Bash vs run_terminal_cmd)
- Instructions don't match workflow's actual behavior
- Mentions `/mcp` command (Claude Code, not Cursor IDE)

**Issues:**
1. **Mismatch with workflow**: Command file says to run with `--json` and do workspace/MCP checks, but workflow doesn't do that
2. **Wrong tool names**: Lists Claude Code tool names, not Cursor IDE
3. **Claude Code references**: Mentions `.cursor-workspaces/`, `csp`, `/mcp` which don't exist in Cursor IDE

**Alignment with action policy:** ⚠️ Partial (mentions validation script correctly but includes irrelevant checks)

### 5.3 Validation Script (`scripts/validate-autonomous-mode.sh`)

**Current state:**
- ✅ Supports `--json` flag for structured output
- ✅ Validates MCP server config and env vars
- ✅ Validates project paths exist
- ✅ Checks system dependencies (jq, node, npm, git)
- ✅ Returns structured JSON when `--json` is used
- ✅ Correctly categorized in action policy as "run without asking"

**Issues:**
1. Doesn't verify MCP tools are actually responding (only checks config)
2. Doesn't display project paths in a user-friendly way (only validates they exist)

**Alignment with action policy:** ✅ Correct (listed under "run without asking")

### 5.4 Documentation (`docs/YOLO-FULL-WORKFLOW.md`)

**Current state:**
- Comprehensive (500+ lines)
- Covers setup, MCP config, command definition, workflow integration
- Some content may be outdated or redundant

**Issues:**
1. Mixes "setup" and "workflow usage" in one file
2. May contain outdated MCP server info (mentions playwright-minimal, but actual config has different servers)
3. Doesn't clearly distinguish Cursor IDE vs Claude Code

**Alignment with action policy:** ✅ Mentions validation script correctly

---

## 6. Recommendations Summary

### High Priority

1. **Add `--json` flag to workflow** (`config/workflows.json`)
2. **Update command file** to remove Claude Code references and use correct Cursor tool names
3. **Align command file with workflow** (make instructions match what workflow actually does)

### Medium Priority

4. **Add MCP tool verification** (either in workflow or document as separate step)
5. **Add project paths display** (call `display-project-paths.sh` after validation)
6. **Split documentation** (setup vs workflow usage)

### Low Priority

7. **Add action policy reminder** in command file or workflow description
8. **Add error handling guidance** (what to do if validation fails)
9. **Review and update** `YOLO-FULL-WORKFLOW.md` for accuracy (MCP server list, etc.)

---

## 7. Implementation Checklist

- [x] Update `config/workflows.json` to add `--json` flag to `yolo-full` workflow
- [x] Rewrite `.cursor/commands/yolo-full.md` to be Cursor IDE-specific (remove Claude Code references)
- [x] Update command file tool names to match Cursor IDE (`run_terminal_cmd` not `Bash`)
- [x] Align command file instructions with workflow's actual steps
- [x] Add `display-project-paths.sh` call to workflow
- [x] Document MCP tool verification as separate step (in command file: verify after workflow completes)
- [x] Review `docs/YOLO-FULL-WORKFLOW.md` for accuracy and add setup vs usage navigation
- [x] Add action policy reference to command file and workflow description

**Implementation completed:** 2026-02-18. Workflow now runs: `validate-autonomous-mode.sh --json`, `display-project-paths.sh`, and a summary echo. Command file is Cursor IDE–specific with correct tool names, error-handling guidance, and action policy note. **MCP tool verification:** Documented in the command file as a post-workflow step (agent should verify MCP tools are connected via the environment’s tool listing, since the workflow cannot call MCP tools directly).

---

## 8. Testing Recommendations

After implementing changes:

1. **Test workflow execution**: Run `/yolo-full` and verify it produces JSON output (if `--json` is added)
2. **Test command file**: Verify instructions in command file match what happens when workflow runs
3. **Test error handling**: Run workflow with missing env vars or invalid paths, verify error messages are clear
4. **Test from different directories**: Verify workflow works when invoked from a project's development folder (not cursor-ops)

---

**Report Generated:** 2026-02-18  
**Next Review:** After implementing high-priority recommendations
