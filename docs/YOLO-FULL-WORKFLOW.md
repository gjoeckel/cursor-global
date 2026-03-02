# YOLO-FULL Workflow: Complete Autonomous Cursor Setup

**Complete documentation for setting up full autonomous operation in Cursor IDE with MCP validation**

---

## Quick navigation

- **Workflow usage** (what runs when you use `/yolo-full`): [How `/yolo-full` Command Works](#how-yolo-full-command-works), [Command Definition](#command-definition), [Workflow Integration](#workflow-integration).
- **Setup** (one-time configuration): [Cursor Settings](#cursor-settings-for-autonomous-operation), [MCP Servers Configuration](#mcp-servers-configuration), [Complete Setup Process](#complete-setup-process).

---

## Table of Contents

1. [Overview](#overview)
2. [How `/yolo-full` Command Works](#how-yolo-full-command-works)
3. [Cursor Settings for Autonomous Operation](#cursor-settings-for-autonomous-operation)
4. [MCP Servers Configuration](#mcp-servers-configuration)
5. [Complete Setup Process](#complete-setup-process)
6. [Command Definition](#command-definition)
7. [Workflow Integration](#workflow-integration)

---

## Overview

The `yolo-full` workflow initializes full autonomous mode in Cursor IDE with comprehensive MCP (Model Context Protocol) validation. It enables the AI agent to operate with zero confirmations, full system access, and automatic execution of commands.

### Key Features

- ✅ **Zero Confirmations**: AI operates without requiring approval for each action
- ✅ **Full System Access**: Complete file system, terminal, and shell access
- ✅ **MCP Integration**: 6 MCP servers (filesystem, github-minimal, shell-minimal, agent-autonomy, asana-minimal, box-minimal); tool count may vary
- ✅ **Auto-Execution**: Commands execute automatically
- ✅ **Trusted Mode**: Full trust enabled for autonomous operation

---

## How `/yolo-full` Command Works

### Command Trigger Mechanism

The `/yolo-full` command is triggered from Cursor's chat interface:

1. **Type `/yolo-`** in Cursor chat
2. **Command menu opens** showing available commands
3. **Select `⚡ yolo-full`** from the suggestions
4. **Command executes** the autonomous mode initialization

### Command Location

Cursor IDE commands are typically defined in:
- `~/.cursor/commands/` directory (if using command files)
- Or integrated into Cursor's command system

The command appears in the chat interface when you type `/yolo-` because Cursor's command system recognizes the prefix and shows matching commands.

### Command Structure

The command is defined in `.cursor/commands/yolo-full.md`. The workflow (in `config/workflows.json`) runs:

1. `validate-autonomous-mode.sh --json` — health check (MCP config, project paths, deps)
2. `display-project-paths.sh` — show development and resources folders
3. A short summary echo

After the workflow runs, the agent should verify MCP tools are connected and provide a status report. See the command file for full instructions.

---

## Cursor Settings for Autonomous Operation

All autonomous settings are configured in `config/settings.json`:

### Core Autonomy Settings

```json
{
  "YOLO": true,
  "cursor.ai.enabled": true,
  "cursor.ai.autoApprove": true,
  "cursor.ai.confirmationLevel": "none",
  "cursor.ai.autoExecute": true,
  "cursor.ai.trustedMode": true,
  "cursor.ai.fullAccess": true
}
```

### Detailed Settings Breakdown

| Setting | Value | Purpose |
|---------|-------|---------|
| `YOLO` | `true` | Enables YOLO (You Only Live Once) mode - maximum autonomy |
| `cursor.ai.enabled` | `true` | Enables AI features in Cursor |
| `cursor.ai.autoApprove` | `true` | Auto-approves all AI actions without confirmation |
| `cursor.ai.confirmationLevel` | `"none"` | No confirmation dialogs required |
| `cursor.ai.autoExecute` | `true` | Commands execute automatically |
| `cursor.ai.trustedMode` | `true` | Trusts AI agent with full system access |
| `cursor.ai.fullAccess` | `true` | Grants full system access to AI |

### Enabling YOLO auto-apply (file edits)

For the agent’s **file edits** to be applied without clicking Accept each time, enable Cursor’s YOLO / auto-apply setting. **The setting persists**—you do not need to change it or restart for each new session.

**Ways to enable (pick one):**

1. **Cursor Settings UI (simplest):** Open Cursor → **Settings** (Cmd+, / Ctrl+,), search for **“YOLO”** or **“auto-apply”** or **“agent”**, and turn on the option that auto-applies agent edits (wording may vary by Cursor version). No script or file copy; no restart required if the UI applies the change immediately.

2. **Apply cursor-ops settings (bulk):** From the cursor-ops repo root, run:
   ```bash
   bash scripts/configure-cursor-autonomy.sh
   ```
   This copies `config/settings.json` to Cursor’s User settings directory (backing up any existing file) and configures MCP. **Restart Cursor once** (Cmd+Q / Ctrl+Q then reopen) so it loads the new settings. After that, the setting persists for all future sessions—no restart per session.

3. **Manual copy:** Copy `config/settings.json` to Cursor’s User settings folder, then **restart Cursor once**:
   - **macOS:** `~/Library/Application Support/Cursor/User/settings.json`
   - **Linux:** `~/.config/Cursor/User/settings.json`
   - **Windows:** `%APPDATA%\Cursor\User\settings.json`
   Again, one restart is enough; the setting carries across all later sessions.

If edits still require Accept, check Cursor Settings for a conflicting option (e.g. “Edit & Reapply”) and ensure YOLO / auto-apply is on.

### Access Permissions

```json
{
  "cursor.ai.terminalAccess": true,
  "cursor.ai.fileSystemAccess": true,
  "cursor.ai.shellAccess": true
}
```

### MCP Configuration

```json
{
  "mcp.enabled": true,
  "mcp.autoStart": true
}
```

### Editor Settings (Optimized for AI)

```json
{
  "editor.fontSize": 14,
  "editor.lineHeight": 2,
  "editor.fontFamily": "SF Mono, Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on"
}
```

### File Management

```json
{
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true
}
```

### Git Settings

```json
{
  "git.enableSmartCommit": true,
  "git.confirmSync": false
}
```

### Privacy

```json
{
  "telemetry.telemetryLevel": "off"
}
```

---

## MCP Servers Configuration

### Overview

The setup uses **6 MCP servers** (see `config/mcp.json` for current list; tool counts may vary):

1. **filesystem** - File operations (official MCP server)
2. **github-minimal** - GitHub operations (requires `GITHUB_TOKEN`)
3. **shell-minimal** - Shell command execution (allowed commands list in config)
4. **agent-autonomy** - Workflow execution and approval checking
5. **asana-minimal** - Asana tasks (requires `ASANA_ACCESS_TOKEN`)
6. **box-minimal** - Box file/folder operations (requires Box tokens in `config/box.env` or env)

### MCP Configuration File

Location: `config/mcp.json`. The current setup includes six servers (see that file for the exact JSON):

- **filesystem** — Official MCP filesystem server; allowed directories via **args** only (Cursor does not support Roots; server ignores `ALLOWED_PATHS` env). Keep `config/mcp.json` and `~/.cursor/mcp.json` in sync; restart Cursor after changes.
- **github-minimal** — GitHub operations; requires `GITHUB_TOKEN`
- **shell-minimal** — Shell command execution; `WORKING_DIRECTORY` and `ALLOWED_COMMANDS` (includes `bash`, `zsh`)
- **agent-autonomy** — Workflow execution and approval checking
- **asana-minimal** — Asana tasks; requires `ASANA_ACCESS_TOKEN`
- **box-minimal** — Box file/folder operations; sources `config/box.env`, uses `CURSOR_OPS`

### How npx Installation Works

MCP servers are started via `npx -y <package>` (or, for box-minimal, a wrapper that sources env). Cursor reads `~/.cursor/mcp.json` (often copied from cursor-ops `config/mcp.json`) and starts each server. Tool counts and package names may vary; refer to `config/mcp.json` for the authoritative list.

### Installation Process

When Cursor IDE starts:

1. **Reads `~/.cursor/mcp.json`** configuration
2. **For each server**, executes: `npx -y <package-name>`
3. **npx automatically**:
   - Checks if package is installed locally
   - Downloads and installs if not present
   - Caches in `~/.npm/_npx/` for future use
   - Executes the server

### Environment Variables

Required environment variables:

```bash
# GitHub Token (for github-minimal)
export GITHUB_TOKEN="github_pat_..."

# Or set in shell config (~/.zshrc or ~/.bashrc)
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.zshrc
source ~/.zshrc
```

### Custom Server Repository (Optional)

For development or custom builds, servers can be installed from source:

```bash
# Clone custom MCP servers repository
git clone https://github.com/gjoeckel/my-mcp-servers.git ~/.cursor/mcp-servers

# Build all servers
cd ~/.cursor/mcp-servers
npm install
npm run build

# Set environment variable to use local builds
export MCP_SERVERS_REPO="$HOME/.cursor/mcp-servers"
```

The `setup-mcp-servers.sh` script handles this automatically if the repository is cloned.

---

## Complete Setup Process

### Step 1: Initial Setup

Run the main setup script:

```bash
cd /path/to/cursor-ops
chmod +x setup.sh
./setup.sh
```

This script:
- Auto-detects installation location (fully portable)
- Creates `~/.cursor` directory structure
- Creates symlinks for `workflows.json`
- Updates PATH in shell config
- Makes all scripts executable
- Runs `configure-cursor-autonomy.sh`
- Runs `setup-mcp-servers.sh`

### Step 2: Configure Autonomy

The `configure-cursor-autonomy.sh` script:

1. **Applies Cursor settings** from `config/settings.json` to:
   - macOS: `~/Library/Application Support/Cursor/User/settings.json`
   - Linux: `~/.config/Cursor/User/settings.json`
   - Windows: `%APPDATA%/Cursor/User/settings.json`

2. **Creates permissions file** at `~/.cursor-ai-permissions`:
   ```bash
   AUTONOMY_LEVEL=full
   TERMINAL_ACCESS=true
   FILE_SYSTEM_ACCESS=true
   PACKAGE_INSTALLATION=true
   SYSTEM_CONFIGURATION=true
   EXTENSION_MANAGEMENT=true
   SHELL_SCRIPT_EXECUTION=true
   AUTO_APPROVE_ACTIONS=true
   ```

3. **Sets up GitHub push gate** (optional security feature)

### Step 3: Setup MCP Servers

The `setup-mcp-servers.sh` script:

1. **Backs up existing** `~/.cursor/mcp.json` if present
2. **Copies** `config/mcp.json` to `~/.cursor/mcp.json`
3. **Expands** `${HOME}` variables to actual paths
4. **Optionally installs** custom servers from git repository
5. **Falls back to npx** if local builds unavailable

### Step 4: Set Environment Variables

```bash
# Add to ~/.zshrc or ~/.bashrc
export GITHUB_TOKEN="your_github_token_here"
export CURSOR_MCP_ENV=1

# Reload shell
source ~/.zshrc
```

### Step 5: Restart Cursor IDE

1. **Quit Cursor completely** (`Cmd+Q` on macOS, `Ctrl+Q` on Windows/Linux)
2. **Reopen Cursor IDE**
3. **MCP servers auto-start** on launch

### Step 6: Verify Setup

Type in Cursor chat:
```
/yolo-full
```

Or verify MCP servers:
```
mcp-health
```

---

## Command Definition

### Creating the `/yolo-full` Command

To create the command file (if using file-based commands):

**Location**: `~/.cursor/commands/yolo-full.md`

**Content**:

```markdown
---
description: Initialize full autonomous mode with MCP validation
allowed-tools: run_terminal_cmd, read_file, write, search_replace, glob_file_search, grep, web_search, browser_navigate, todo_write
---

# Autonomous Mode Initialization

Execute the following startup validation:

1. **Unified Validation**: Run `bash /Users/a00288946/Agents/cursor-ops/scripts/validate-autonomous-mode.sh --json` to perform a comprehensive health check of the environment, MCP servers, and project paths.

2. **Tools Verification**: List available MCP tools using `list_mcp_tools` (or equivalent) to ensure all configured servers (filesystem, github, shell, etc.) are actually responding.

3. **Status Report**: Based on the JSON output and tool verification, provide a brief status:
   - MCP servers: [list connected servers and tool counts]
   - Autonomous tools: enabled/disabled (check YOLO/autoApprove settings)
   - Environment: [Confirm required TOKENS/SECRETS are set]
   - Development Path: [path]
   - Resources Path: [path]
   - Ready for autonomous operation: yes/no

If all checks pass, confirm: "Autonomous mode active. Ready for tasks."

If issues found (e.g., missing environment variables, missing tools, or restricted permissions), list them and suggest fixes.
```

### Workflow Definition

In `config/workflows.json`, `yolo-full` runs (with absolute paths):

1. `validate-autonomous-mode.sh --json` — health check
2. `display-project-paths.sh` — show development and resources folders
3. A short summary echo

`auto_approve: true` aligns with the agent action policy (validation scripts run without asking).

---

## Workflow Integration

### Adding yolo-full to Workflows

The workflow is already defined in `config/workflows.json`. To make it available in Cursor, ensure your global workflows (e.g. `~/.cursor/workflows.json`) include or symlink to cursor-ops workflows. Run setup if needed: `./setup.sh` or use `scripts/setup-mcp-servers.sh` for MCP config.

### Usage

**As Command**:
```
/yolo-full
```

**As Workflow**:
```
yolo-full
```

Both trigger the same autonomous mode initialization.

---

## Summary

The `yolo-full` workflow provides:

1. **Command Trigger**: `/yolo-full` in Cursor chat
2. **Full Autonomy**: Zero confirmations, auto-execution, trusted mode
3. **MCP Integration**: 6 servers, 39 tools, automatic npx installation
4. **Complete Setup**: Automated scripts for configuration
5. **Portable**: Works from any directory location

**Result**: Fully autonomous Cursor IDE setup ready for AI-assisted development with maximum capabilities and zero friction.

---

**Last Updated**: February 4, 2026
**Maintained By**: Cursor Ops Team
**Related Documentation**:
- [MCP Servers Implementation Guide](../docs/MCP-SERVERS-IMPLEMENTATION.md)
- [Cursor Autonomous Setup Guide](../docs/CURSOR-AUTONOMOUS-SETUP.md)

