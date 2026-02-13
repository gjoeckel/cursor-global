# YOLO-FULL Workflow: Complete Autonomous Cursor Setup

**Complete documentation for setting up full autonomous operation in Cursor IDE with MCP validation**

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
- ✅ **MCP Integration**: 6 MCP servers providing 39 tools
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

Based on the working implementation, the command has this structure:

```markdown
---
description: Initialize full autonomous mode with MCP validation
allowed-tools: run_terminal_cmd, read_file, write, search_replace, glob_file_search, grep, web_search, browser_navigate, todo_write
---

# Autonomous Mode Initialization

Execute the following startup validation:

1. **Unified Validation**: Run `bash /Users/a00288946/Agents/cursor-ops/scripts/validate-autonomous-mode.sh --json` to perform a comprehensive health check.
2. **Tools Verification**: List available MCP tools to confirm all configured servers are functional.
3. **Status Report**: Provide a brief status based on the JSON output and tool verification.
```

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

The setup uses **6 MCP servers** providing **39 tools total** (optimized to stay under the 40-tool limit):

1. **filesystem** (15 tools) - Official
2. **memory** (8 tools) - Official
3. **github-minimal** (4 tools) - Custom
4. **shell-minimal** (4 tools) - Custom
5. **playwright-minimal** (4 tools) - Custom
6. **agent-autonomy** (4 tools) - Custom

### MCP Configuration File

Location: `config/mcp.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${HOME}"],
      "env": {
        "ALLOWED_PATHS": "${HOME}:${HOME}/.cursor:${HOME}/.config",
        "READ_ONLY": "false"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "github-minimal": {
      "command": "npx",
      "args": ["-y", "mcp-github-minimal"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "shell-minimal": {
      "command": "npx",
      "args": ["-y", "mcp-shell-minimal"],
      "env": {
        "WORKING_DIRECTORY": "${HOME}",
        "ALLOWED_COMMANDS": "npm,git,node,php,composer,curl,wget,ls,cat,grep,find,chmod,chown,mkdir,rm,cp,mv,pwd,echo,which"
      }
    },
    "playwright-minimal": {
      "command": "npx",
      "args": ["-y", "mcp-playwright-minimal"]
    },
    "agent-autonomy": {
      "command": "npx",
      "args": ["-y", "mcp-agent-autonomy"]
    }
  }
}
```

### How npx Installation Works

All MCP servers use `npx -y` for automatic installation:

#### Official Servers (via npm)

- **`@modelcontextprotocol/server-filesystem`**: Official filesystem MCP server
  - Installed via: `npx -y @modelcontextprotocol/server-filesystem`
  - Provides: File operations, directory navigation, content management (15 tools)

- **`@modelcontextprotocol/server-memory`**: Official memory MCP server
  - Installed via: `npx -y @modelcontextprotocol/server-memory`
  - Provides: Knowledge storage, entity management, search (8 tools)

#### Custom Servers (via npm packages)

All custom servers are published as npm packages and installed automatically:

- **`mcp-github-minimal`**: GitHub operations
  - Installed via: `npx -y mcp-github-minimal`
  - Requires: `GITHUB_TOKEN` environment variable
  - Provides: Repository operations, file management (4 tools)

- **`mcp-shell-minimal`**: Shell command execution
  - Installed via: `npx -y mcp-shell-minimal`
  - Requires: `WORKING_DIRECTORY` and `ALLOWED_COMMANDS` environment variables
  - Provides: Command execution, process management (4 tools)

- **`mcp-playwright-minimal`**: Browser automation
  - Installed via: `npx -y mcp-playwright-minimal`
  - Provides: Browser navigation, screenshot, element interaction (4 tools)

- **`mcp-agent-autonomy`**: Workflow automation
  - Installed via: `npx -y mcp-agent-autonomy`
  - Provides: Workflow execution, registration, approval checking (4 tools)

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

### Alternative: Add to Workflows

For consistency, also add to `config/workflows.json`:

```json
{
  "yolo-full": {
    "description": "Initialize full autonomous mode with MCP validation",
    "commands": [
      "bash /path/to/cursor-ops/scripts/validate-autonomous-mode.sh"
    ],
    "auto_approve": true,
    "timeout": 30000,
    "on_error": "continue"
  }
}
```

---

## Workflow Integration

### Adding yolo-full to Workflows

To make `yolo-full` available as both a command and workflow:

1. **Add to `config/workflows.json`**:

```json
{
  "yolo-full": {
    "description": "Initialize full autonomous mode with MCP validation",
    "commands": [
      "echo '🚀 Initializing autonomous mode...'",
      "echo '📊 Checking MCP servers...'",
      "bash /path/to/your/scripts/check-mcp-health.sh || true",
      "echo '✅ Autonomous mode ready'"
    ],
    "auto_approve": true,
    "timeout": 30000,
    "on_error": "continue"
  }
}
```

2. **Create validation script** (optional): `scripts/validate-autonomous-mode.sh`

3. **Run setup** to update symlinks:
```bash
./setup.sh
```

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

