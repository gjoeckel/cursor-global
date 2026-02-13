# 🤖 Global Cursor Configuration - AI Agent Guide

**Purpose:** Global configuration for Cursor IDE across ALL projects
**Audience:** AI agents assisting with new projects
**Last Updated:** October 15, 2025

---

## 🎯 QUICK START - Working with a New Project

### **IMPORTANT: Most Features Are Already Global**

When working with a **new project**, these are **ALREADY AVAILABLE** without any setup:

✅ **39 MCP tools** (file operations, memory, GitHub, shell, browser automation)
✅ **8 global workflows** (ai-start, ai-end, mcp-health, etc.)
✅ **10 utility scripts** (in PATH, accessible from anywhere)
✅ **Global settings** (YOLO mode, autonomy enabled)

**You can use all global features immediately. No copying required.**

---

## 📦 What's Globally Available (No Setup Needed)

### **1. MCP Tools (39 tools)**
Available via `~/.cursor/mcp.json`:
- **filesystem** (15 tools) - File operations anywhere in `${HOME}/`
- **memory** (8 tools) - Knowledge storage and retrieval
- **github-minimal** (4 tools) - GitHub operations
- **shell-minimal** (4 tools) - Shell command execution
- **puppeteer-minimal** (4 tools) - Browser automation
- **sequential-thinking-minimal** (4 tools) - Problem-solving workflows
- **everything-minimal** (4 tools) - Protocol validation

**Usage:** Call MCP tools directly in responses (read_file, write, grep, etc.)

---

### **2. Global Workflows (8 workflows)**
Available via `~/.cursor/workflows.json`:

| Workflow | Purpose | When to Use |
|----------|---------|-------------|
| `ai-start` | Load session context | Start of session |
| `ai-end` | Save session & changelog | End of session |
| `ai-update` | Mid-session checkpoint | During long sessions |
| `ai-repeat` | Reload context | If context lost |
| `ai-clean` | Clean temp files | Any project with logs/ or node_modules/ |
| `ai-compress` | Compress context | Reduce context size |
| `mcp-health` | Check MCP servers | Diagnose MCP issues |
| `mcp-restart` | Restart MCP servers | Fix stuck servers |

**Usage:** User types workflow name in chat (e.g., "ai-start")

---

### **3. Global Scripts (10 scripts)**
Available in PATH via `~/.local/bin/cursor-tools/`:
- Session: `session-start.sh`, `session-end.sh`, `session-update.sh`, `compress-context.sh`
- MCP: `check-mcp-health.sh`, `check-mcp-tool-count.sh`, `start-mcp-servers.sh`, `restart-mcp-servers.sh`
- Setup: `setup-cursor-environment.sh`, `configure-cursor-autonomy.sh`

**Usage:** Can be called from terminal in any directory

---

## 🚀 Setting Up a New Project (Optional)

**Most features work globally. Only add project-specific workflows if needed.**

### **Step 1: Assess Project Needs**

**Question to ask:**
> Does this project need custom workflows for deployment, testing, or builds?

- **NO** → Skip all setup, use global workflows only ✅
- **YES** → Follow steps below to add project workflows

---

### **Step 2: Create Project .cursor/ Directory (If Needed)**

```bash
# Only if project needs custom workflows
mkdir -p .cursor
```

**When needed:**
- Project has deployment scripts
- Project has custom test scripts
- Project has build processes
- Project has specific automation needs

**When NOT needed:**
- Simple projects
- Projects using only global workflows
- No project-specific automation

---

### **Step 3: Create Project workflows.json (If Needed)**

**Template for project-specific workflows:**

```json
{
  "proj-deploy": {
    "description": "Deploy this project",
    "commands": ["./scripts/deploy.sh"],
    "auto_approve": true,
    "timeout": 60000,
    "on_error": "continue"
  },
  "proj-test": {
    "description": "Run project tests",
    "commands": ["npm test"],
    "auto_approve": true,
    "timeout": 30000,
    "on_error": "continue"
  },
  "proj-build": {
    "description": "Build project",
    "commands": ["npm run build"],
    "auto_approve": true,
    "timeout": 60000,
    "on_error": "continue"
  }
}
```

**Save as:** `.cursor/workflows.json` in project root

**Naming rule:** Always prefix with `proj-` for project-specific workflows

---

### **Step 4: Optional - Copy Session Scripts Template**

**Only if project wants local session tracking** (most don't need this):

```bash
# Create project scripts directory
mkdir -p scripts/session

# Copy template scripts (optional)
# These are examples - adapt to project needs
```

**Most projects should use the global session scripts instead.**

---

## 🧪 Critical Verification (New Project Setup)

### **Test 1: Global Workflows Accessible** ⚡ CRITICAL

```bash
# From project directory:
cat ~/.cursor/workflows.json | jq 'keys'
```

**Expected:** 8 workflows listed (ai-start, ai-end, etc.)
**If fails:** Global workflows.json missing or corrupted

---

### **Test 2: MCP Servers Running** ⚡ CRITICAL

```bash
# Check running MCP processes
ps aux | grep -E "(mcp|modelcontextprotocol|github-minimal|shell-minimal)" | grep -v grep | wc -l
```

**Expected:** 7+ processes
**If < 7:** MCP servers not started → User needs to restart Cursor IDE

**Alternative test (in Cursor):**
```
Type: mcp-health
```
**Expected:** Shows all 7 servers as healthy

---

### **Test 3: Global Scripts in PATH** ⚡ CRITICAL

```bash
which session-start.sh
```

**Expected:** `${HOME}/.local/bin/cursor-tools/session-start.sh`
**If fails:** PATH not configured → User needs to: `source ~/.zshrc`

---

### **Test 4: MCP Tools Available (Functional Test)** ⚡ CRITICAL

**Test filesystem MCP:**
```
Use: read_file tool on any file
```
**Expected:** File contents returned
**If fails:** Filesystem MCP not running

**Test memory MCP:**
```
Use: mcp_memory_read_graph
```
**Expected:** Returns graph or empty graph
**If fails:** Memory MCP not running

---

## 🚨 Critical Error Detection

### **Error 1: MCP Servers Not Running**

**Symptoms:**
- MCP tools don't work (read_file, memory tools, etc. fail)
- `mcp-health` workflow shows servers down
- Less than 7 MCP processes running

**Fix:**
```bash
# Option 1: Restart Cursor IDE (recommended)
# User must quit and restart Cursor

# Option 2: Manual start (temporary)
start-mcp-servers.sh
```

---

### **Error 2: Workflows Not Found**

**Symptoms:**
- Typing workflow name in chat does nothing
- Command palette doesn't show workflows

**Fix:**
```bash
# Verify global config exists
ls -la ~/.cursor/workflows.json

# If missing, restore from backup or recreate
```

---

### **Error 3: Scripts Not in PATH**

**Symptoms:**
- `which session-start.sh` returns nothing
- Terminal can't find global scripts

**Fix:**
```bash
# Reload shell configuration
source ~/.zshrc

# Verify PATH includes cursor-tools
echo $PATH | grep cursor-tools
```

---

### **Error 4: Custom MCP Servers Missing Dependencies**

**Symptoms:**
- MCP tools partially working (only filesystem & memory work)
- Custom servers show "module not found" errors

**Fix:**
```bash
cd ${HOME}/Projects/accessilist/my-mcp-servers
npm run install-all
# Then restart Cursor IDE
```

---

## 📦 Box MCP token (cursor-ops)

**cursor-ops is always available to any project.** You can store the Box OAuth token in cursor-ops so the Box MCP server gets it even when you **launch Cursor from the Dock** (not from a terminal), where `~/.zshrc` is never sourced.

### Token file: `config/box.env`

- **Path:** `config/box.env` inside the cursor-ops repo (e.g. `$HOME/Agents/cursor-ops/config/box.env`).
- **Gitignored:** Yes (in cursor-ops `.gitignore`). Never committed.
- **Contents:** `export BOX_ACCESS_TOKEN="…"` and optionally `export BOX_REFRESH_TOKEN="…"` (updated by the OAuth script; MCP also writes refreshed tokens here when it auto-refreshes).

### How the Box MCP gets the token when you start from the Dock

The Box MCP in `config/mcp.json` is started with a **wrapper** that sources env before running the server:

1. **Source `config/box.env`** from cursor-ops (so the token is available to the MCP process).
2. **Source `~/.zshrc`** (fallback and other vars).
3. **Run** `npx -y mcp-box-minimal`.

So the token is read from cursor-ops first; no need to start Cursor from a terminal.

### Getting a token (writes to both ~/.zshrc and config/box.env)

From a terminal (with `BOX_CLIENT_ID` and `BOX_CLIENT_SECRET` set, e.g. in `~/.zshrc`):

```bash
cd <cursor-ops>/mcp-box-minimal
node scripts/get-oauth-token.js
```

The script writes the new token to **both** `~/.zshrc` and cursor-ops **config/box.env**. The Box MCP process must then be restarted to pick up the new token (see below).

### ⚠️ Token just updated but Box still says "expired"?

**Root cause:** The Box MCP is a long-lived process. It reads `box.env` only when the process **starts**. Changing `box.env` on disk does not affect an already-running MCP. Cursor does not restart MCP servers when you "reload" the window.

**Best-practice fix (pick one):**

1. **Full quit and reopen (most reliable)**  
   **Quit Cursor completely** (e.g. Cmd+Q on Mac, or Cursor → Quit), then open Cursor again. That kills the Box MCP process; on next start it will run the wrapper, source `config/box.env`, and see the new token.

2. **Trigger MCP reconnect without full quit**  
   Edit and save the MCP config Cursor actually uses (usually `~/.cursor/mcp.json`): e.g. add a space or newline in the `box-minimal` section, then save. That can cause Cursor to restart the Box MCP so it re-sources `box.env`. If that doesn't restart the server, use (1).

**Verify:** After restart, run a simple Box tool (e.g. list folder `0`). If you still see "Developer token has expired", confirm `config/box.env` contains a single line like `export BOX_ACCESS_TOKEN="…"` with the token you just generated, and that you used **full quit** (not just Reload Window).

### If cursor-ops is not at `$HOME/Agents/cursor-ops`

The wrapper uses `CURSOR_OPS` if set, otherwise `$HOME/Agents/cursor-ops`. If your cursor-ops repo is elsewhere, set `CURSOR_OPS` (e.g. in Cursor’s environment or in the MCP server env in your Cursor settings) to the absolute path of the cursor-ops directory.

---

## 📁 File Locations Reference

### **Global Configuration (System-wide)**
```
~/.cursor/
├── mcp.json                    ✅ 7 MCP servers (39 tools)
├── workflows.json              ✅ 8 global workflows
├── workflows.md                ✅ Complete workflow reference
├── settings.json               ✅ YOLO mode, autonomy settings
├── README.md                   ✅ This file (AI agent guide)
└── global-scripts.json         ✅ Script registry

~/.local/bin/cursor-tools/      ✅ 10 global utility scripts
└── (10 symlinked scripts)

~/.zshrc                        ✅ PATH configuration

<cursor-ops>/config/
├── box.env                     ✅ Box OAuth token (gitignored; used when Cursor starts from Dock)
└── ...                         (mcp.json, workflows, etc.)
```

### **Project Configuration (Optional, per-project)**
```
<project>/.cursor/
└── workflows.json              ⚠️ OPTIONAL - Only if project needs custom workflows
```

---

## 🎯 AI Agent Checklist - New Project Setup

**When starting work on a new project:**

### **✅ Already Available (No Action Needed):**
1. ✅ 39 MCP tools work globally
2. ✅ 8 global workflows available
3. ✅ 10 scripts in PATH
4. ✅ Session management ready
5. ✅ MCP server management ready

### **❓ Assess Project Needs:**
- Does project need deployment workflows? → Create project `.cursor/workflows.json`
- Does project need custom builds? → Add `proj-build` workflow
- Does project need specific tests? → Add `proj-test` workflow

### **⚠️ Only If Project Needs Custom Workflows:**
1. Create `.cursor/` directory in project
2. Create `.cursor/workflows.json` with project-specific workflows
3. Prefix all workflows with `proj-`
4. Test workflows work in project directory

**Most projects don't need custom workflows!**

---

## 🔧 Workflow Naming Convention

**For AI agents creating new workflows:**

### **Global Workflows** (add to `~/.cursor/workflows.json`)
**Format:** `<category>-<action>`

**Categories:**
- `ai-*` = AI session & utilities
- `mcp-*` = MCP server operations
- `cursor-*` = Cursor IDE configuration

**Example:**
```json
{
  "ai-backup": {
    "description": "Backup AI session data",
    "commands": ["bash ~/.local/bin/cursor-tools/backup.sh"]
  }
}
```

---

### **Project Workflows** (add to `<project>/.cursor/workflows.json`)
**Format:** `proj-<action>`

**Must prefix with:** `proj-`

**Example:**
```json
{
  "proj-deploy": {
    "description": "Deploy this project",
    "commands": ["./scripts/deploy.sh"]
  }
}
```

---

## 🎓 Best Practices for AI Agents

### **1. Consider MCP Tools First**
- **For any new process/script, FIRST consider if using MCP tools is optimal**
- MCP tools provide standardized, well-tested functionality
- Available MCP tools include: filesystem operations, memory storage, GitHub operations, shell commands, browser automation
- Only create custom scripts when MCP tools cannot meet the requirement
- This ensures consistency, reduces maintenance, and leverages existing infrastructure

### **2. Prefer Global Over Project-Specific**
- Use global workflows when possible
- Only create project workflows for truly project-specific tasks
- Don't duplicate global functionality

### **2. Always Use Prefixes**
- Global: `ai-*`, `mcp-*`, `cursor-*`
- Project: `proj-*`
- Prevents conflicts with Cursor built-ins

### **3. Use Relative Paths in Project Workflows**
```json
✅ Good: "./scripts/deploy.sh"
❌ Bad:  "${HOME}/Projects/myproject/scripts/deploy.sh"
```

### **4. Keep Workflows Simple**
- One clear purpose per workflow
- Use existing scripts when possible
- Auto-approve for non-destructive operations

---

## 🔍 Quick Diagnostic Commands

**If something seems wrong, run these:**

```bash
# 1. Check MCP servers
mcp-health

# 2. Verify global workflows
cat ~/.cursor/workflows.json | jq 'keys'

# 3. Check PATH
which session-start.sh

# 4. Count MCP processes
ps aux | grep mcp | grep -v grep | wc -l

# Expected: 7+
```

**All tests pass?** ✅ Everything is working
**Any test fails?** ⚠️ See Critical Error Detection section above

---

## 📝 Summary for AI Agents

### **What You Have Available Globally:**
✅ 39 MCP tools (use in all projects)
✅ 8 workflows (type name in chat)
✅ 10 scripts (call from terminal)
✅ Full autonomy (YOLO mode enabled)

### **What New Projects Need:**
⚠️ **Usually nothing!** Global features work everywhere.
⚠️ **Only if project-specific:** Create `.cursor/workflows.json` with `proj-*` workflows

### **Critical Verification:**
1. MCP servers running (7+ processes)
2. Global workflows accessible (8 workflows in ~/.cursor/workflows.json)
3. Scripts in PATH (session-start.sh findable)
4. MCP tools functional (test read_file)

**If all 4 pass → Ready to work! 🚀**

---

## 🎯 New Project Setup Template (Only If Needed)

**Copy this to project root ONLY if project needs custom workflows:**

```bash
# Create project .cursor directory
mkdir -p .cursor

# Create project workflows.json
cat > .cursor/workflows.json << 'EOF'
{
  "proj-deploy": {
    "description": "Deploy project",
    "commands": ["./scripts/deploy.sh"],
    "auto_approve": true,
    "timeout": 60000
  },
  "proj-test": {
    "description": "Run tests",
    "commands": ["npm test"],
    "auto_approve": true,
    "timeout": 30000
  }
}
EOF

echo "✅ Project workflows created"
echo "💡 Available: proj-deploy, proj-test"
echo "💡 Use: Type 'proj-deploy' in Cursor chat"
```

**Remember:** Prefix all project workflows with `proj-`

---

## 📋 AI Agent Decision Tree

```
┌─ New Project Detected
│
├─ Q: Does project need custom deployment/build/test workflows?
│  │
│  ├─ NO  → Use global workflows only ✅
│  │        No setup needed!
│  │        All 8 global workflows available
│  │
│  └─ YES → Create project .cursor/workflows.json
│           Add proj-* workflows for project-specific tasks
│           Test workflows work from project directory
│
└─ Verification:
   1. Test MCP tools (use read_file)
   2. Test global workflow (type "ai-start")
   3. Test project workflow (if created)

   All pass? → Ready! ✅
```

---

## 🔧 Files to Copy to New Projects

### **For Standard Projects: NONE** ✅

Global configuration works everywhere. No files needed.

---

### **For Projects with Custom Workflows: 1 FILE** ⚠️

**File:** `.cursor/workflows.json` (create new, don't copy)

**Template:**
```json
{
  "proj-command-name": {
    "description": "What this does",
    "commands": ["relative/path/to/script.sh"],
    "auto_approve": true,
    "timeout": 30000,
    "on_error": "continue"
  }
}
```

**Rules:**
1. Always prefix: `proj-*`
2. Use relative paths: `./scripts/`
3. Keep descriptions concise
4. Set reasonable timeouts

**Location:** Save in project root as `.cursor/workflows.json`

---

### **For Projects Needing Session Scripts: OPTIONAL**

**Only if project needs localized session tracking:**

**Files to create (don't copy, create new):**
```
scripts/session/
├── session-start.sh     # Custom session init
├── session-end.sh       # Custom session save
└── session-update.sh    # Custom checkpoints
```

**Most projects should use global session scripts instead.**

---

## ✅ Critical Verification - 4 Tests Only

**Run these 4 tests ONLY to identify critical gaps:**

### **Test 1: MCP Tools Functional** ⚡
```
Action: Use read_file to read any file
Expected: File contents returned
If fails: MCP servers not running → restart Cursor
```

### **Test 2: Global Workflows Exist** ⚡
```bash
cat ~/.cursor/workflows.json | jq 'keys | length'
```
**Expected:** `8`
**If not 8:** Global workflows missing → restore from backup

### **Test 3: Scripts Accessible** ⚡
```bash
which session-start.sh
```
**Expected:** `${HOME}/.local/bin/cursor-tools/session-start.sh`
**If empty:** PATH not configured → `source ~/.zshrc`

### **Test 4: MCP Server Count** ⚡
```bash
ps aux | grep -E "(github-minimal|shell-minimal|puppeteer-minimal|sequential-thinking-minimal|everything-minimal|mcp-server)" | grep -v grep | wc -l
```
**Expected:** 7 or more
**If < 7:** Custom MCP servers not running → restart Cursor

---

## 🚨 Critical Errors Only

**Only report these as critical issues:**

| Issue | Symptom | Fix |
|-------|---------|-----|
| **MCP servers down** | < 7 processes running | Restart Cursor IDE |
| **MCP tools fail** | read_file, write, grep fail | Restart Cursor IDE |
| **No global workflows** | ~/.cursor/workflows.json missing | Restore from backup |
| **Scripts not in PATH** | `which session-start.sh` empty | `source ~/.zshrc` |

**Everything else is likely project-specific, not a critical gap.**

---

## 💡 Common AI Agent Scenarios

### **Scenario 1: Starting Work on Existing Project**
```
User says: "ai-start"
AI does:
  1. Check if global workflows exist ✅
  2. Execute ai-start workflow ✅
  3. Use MCP tools as needed ✅

No setup required! Everything works globally.
```

---

### **Scenario 2: Starting Work on Brand New Project**
```
User creates: new-project/
AI should:
  1. Verify MCP tools work (test read_file) ✅
  2. Use global workflows (ai-start, ai-end) ✅
  3. Only create .cursor/ IF project needs custom workflows ⚠️

Default: Use global features, no local setup.
```

---

### **Scenario 3: Project Needs Custom Deployment**
```
User says: "Set up deployment workflow"
AI should:
  1. Create .cursor/ directory
  2. Create workflows.json with proj-deploy workflow
  3. Ensure deployment script exists (./scripts/deploy.sh)
  4. Test: Type "proj-deploy" in chat

Only create project workflows when truly needed.
```

---

### **Scenario 4: MCP Issues**
```
User reports: "MCP tools not working"
AI should:
  1. Run: mcp-health workflow
  2. Check: ps aux | grep mcp
  3. If < 7 processes: Recommend Cursor restart
  4. If dependencies missing: Run npm install in my-mcp-servers/
```

---

## 📊 What's Global vs What's Project-Specific

### **GLOBAL (Available Everywhere)** ✅

**Configuration:**
- `~/.cursor/mcp.json` - 7 MCP servers (39 tools)
- `~/.cursor/workflows.json` - 8 workflows
- `~/.cursor/settings.json` - YOLO mode, autonomy
- `~/.local/bin/cursor-tools/` - 10 scripts

**Scope:** ALL Cursor projects automatically

**Setup:** None needed for new projects

---

### **PROJECT-SPECIFIC (Per-Project)** ⚠️

**Configuration:**
- `<project>/.cursor/workflows.json` - Project workflows (optional)

**Scope:** Only that specific project

**Setup:** Only create if project needs custom workflows

**Examples:**
- AccessiList: Has proj-dry, proj-deploy-check, proj-test-mirror
- Simple project: No project .cursor/ needed (use global only)

---

## 🎯 AI Agent Quick Reference

### **When User Types Workflow Name:**
1. Check if it's a global workflow (in ~/.cursor/workflows.json) → Execute
2. Check if it's a project workflow (in .cursor/workflows.json) → Execute
3. If not found → Inform user workflow doesn't exist

### **When Setting Up New Project:**
1. Verify global features work (4 critical tests)
2. Assess if project needs custom workflows
3. Only create `.cursor/workflows.json` if truly needed
4. Always prefix project workflows with `proj-`

### **When Debugging Issues:**
1. Run `mcp-health` workflow first
2. Check MCP process count (should be 7+)
3. Verify PATH includes cursor-tools
4. Test MCP tools functionally (read_file, etc.)

---

## 📖 Complete Documentation Index

**For AI Agents:**
- `~/.cursor/README.md` - This file (setup & verification guide)
- `~/.cursor/workflows.md` - Complete workflow reference
- `~/.cursor/global-scripts.json` - Script registry with metadata

**For Humans:**
- `GLOBAL-FUNCTIONS-ANALYSIS.md` - What is/should be global
- `WORKFLOW-NAMING-ANALYSIS.md` - Conflict analysis
- `GLOBAL-IMPLEMENTATION-COMPLETE.md` - Full implementation details

---

## ✅ Summary - AI Agent Essentials

**Key Points:**
1. **Global features work everywhere** - 39 MCP tools, 8 workflows, 10 scripts
2. **Most projects need NO setup** - Use global features
3. **Only create project workflows if needed** - Deployment, builds, custom tests
4. **Always prefix project workflows** with `proj-`
5. **Run 4 critical tests** to identify gaps - MCP tools, workflows, scripts, processes

**Critical verification (4 tests):**
```bash
1. read_file works → MCP functional ✅
2. cat ~/.cursor/workflows.json | jq 'keys | length' → 8 ✅
3. which session-start.sh → found in PATH ✅
4. ps aux | grep mcp | wc -l → 7+ processes ✅
```

**All pass? → Everything is ready! No setup needed for new project.** 🚀

**Any fail? → Fix critical issue first (see Critical Error Detection section).**

---

**This global configuration provides maximum functionality with minimum per-project setup!** ✨
