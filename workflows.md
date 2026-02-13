# 🔀 Cursor Workflows Reference

**Project workflows documentation - Auto-generated**
**Combines global and project-specific workflows**

---

## 🌐 Global Workflows (Available in ALL Projects)

- **RRW** - Read-Request-Wait Protocol: 1) Repeat understanding 2) Request info 3) Wait for auth
- **agent-comms-check** - Check for pending agent communication messages
- **ai-clean** - Clean temporary files and logs (works in any project)
- **ai-compress** - Compress session context into summary
- **ai-docs-sync** - Generate project workflows.md from global and project configs
- **ai-end** - Save session context and generate changelog
- **ai-local-commit** - Update changelog and commit all changes to current local branch
- **ai-local-merge** - Merge current branch to main, auto-updates changelog (handles conflicts gracefully)
- **ai-merge-finalize** - Finalize merge after manual conflict resolution (updates changelog, run from main)
- **ai-repeat** - Reload session context
- **ai-start** - Load AI session context and initialize environment
- **ai-update** - Record mid-session progress
- **change-project** - Update project development and resources folder paths
- **mcp-health** - Check MCP server health and status
- **mcp-restart** - Restart all MCP servers
- **mcp-setup** - Setup and configure MCP servers (re-run if needed)
- **start-project** - Open multi-root workspace with development and resources folders
- **yolo-full** - Initialize full autonomous mode with MCP validation

**Total Global:** 18 workflows

## 📦 Project-Specific Workflows

**No project-specific workflows configured.**

---

## 🚀 Usage

### Type in Cursor Chat (Easiest)
Simply type the workflow name:
```
ai-start
ai-local-commit
mcp-health
proj-dry
```

### Command Palette
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type workflow name
3. Select and execute

### Terminal Alternative
Global workflow scripts are in PATH:
```bash
session-start.sh
git-local-commit.sh
check-mcp-health.sh
```

---

## 📊 Summary

**Total Workflows:** 18 (18 global + 0 project)

**Categories:**
- AI Session Management (ai-start, ai-end, ai-update, ai-repeat, ai-compress)
- Git Operations (ai-local-commit, ai-local-merge)
- MCP Management (mcp-health, mcp-restart)
- Utilities (ai-clean)

---

_Last updated: Wed Feb  4 14:09:11 MST 2026_
_Auto-generated from /Users/a00288946/Agents/cursor-ops/config/workflows.json and .cursor/workflows.json_
