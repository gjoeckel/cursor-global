# Complete Cursor Autonomous Setup Guide

**Step-by-step guide for setting up a Cursor IDE instance with full autonomous capabilities**

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Setup](#quick-setup)
4. [Detailed Setup](#detailed-setup)
5. [Configuration Files](#configuration-files)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides complete instructions for setting up Cursor IDE with:

- ✅ **Full Autonomous Operation** (YOLO mode)
- ✅ **Zero Confirmations** (auto-approve enabled)
- ✅ **MCP Integration** (6 servers, 39 tools)
- ✅ **Auto-Execution** (commands run automatically)
- ✅ **Complete System Access** (terminal, filesystem, shell)

### What You'll Get

- AI agent operates without confirmations
- Automatic command execution
- Full file system access
- Terminal and shell access
- MCP tools for enhanced capabilities
- GitHub integration
- Browser automation
- Workflow management

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should show v18+ or v20+
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **Cursor IDE** (latest version)
   - Download from: https://cursor.sh

### Required Accounts

1. **GitHub Account** (for GitHub MCP server)
   - Create Personal Access Token: https://github.com/settings/tokens
   - Required permissions: `repo`, `read`, `write`

---

## Quick Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/cursor-ops.git
cd cursor-ops
```

### 2. Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

This automatically:
- Detects installation location
- Creates `~/.cursor` directory
- Sets up symlinks
- Configures PATH
- Applies Cursor settings
- Sets up MCP servers

### 3. Set Environment Variables

```bash
# Add to ~/.zshrc or ~/.bashrc
export GITHUB_TOKEN="github_pat_..."

# Reload shell
source ~/.zshrc
```

### 4. Restart Cursor IDE

1. Quit Cursor completely (`Cmd+Q` / `Ctrl+Q`)
2. Reopen Cursor IDE
3. MCP servers auto-start

### 5. Verify Setup

Type in Cursor chat:
```
/yolo-full
```

Or verify MCP servers:
```
mcp-health
```

**Done!** ✅

---

## Detailed Setup

### Step 1: Directory Structure

The setup creates this structure:

```
~/.cursor/
├── workflows.json          # → Symlink to config/workflows.json
├── mcp.json                # MCP server configuration
└── commands/               # (Optional) Command definitions

~/Library/Application Support/Cursor/User/
└── settings.json           # Cursor IDE settings (autonomous mode)

~/.cursor-ai-permissions    # AI permissions file
```

### Step 2: Configuration Files

#### A. Cursor Settings (`config/settings.json`)

Applied to: `~/Library/Application Support/Cursor/User/settings.json` (macOS)

Key settings:
```json
{
  "YOLO": true,
  "cursor.ai.autoApprove": true,
  "cursor.ai.confirmationLevel": "none",
  "cursor.ai.autoExecute": true,
  "cursor.ai.trustedMode": true,
  "cursor.ai.fullAccess": true,
  "mcp.enabled": true,
  "mcp.autoStart": true
}
```

#### B. MCP Configuration (`config/mcp.json`)

Applied to: `~/.cursor/mcp.json`

Contains 6 MCP servers:
- filesystem (15 tools)
- memory (8 tools)
- github-minimal (4 tools)
- shell-minimal (4 tools)
- playwright-minimal (4 tools)
- agent-autonomy (4 tools)

#### C. Workflows (`config/workflows.json`)

Applied to: `~/.cursor/workflows.json` (symlink)

Global workflows:
- `ai-start` - Load session context
- `ai-end` - Save session & changelog
- `ai-update` - Record progress
- `mcp-health` - Check MCP servers
- `mcp-restart` - Restart MCP servers
- And more...

### Step 3: Script Execution

The setup runs these scripts in order:

1. **`setup.sh`** - Main setup orchestrator
2. **`configure-cursor-autonomy.sh`** - Applies autonomous settings
3. **`setup-mcp-servers.sh`** - Configures MCP servers

### Step 4: PATH Configuration

Adds scripts directory to PATH:

```bash
# Added to ~/.zshrc or ~/.bashrc
export PATH="/path/to/cursor-ops/scripts:$PATH"
```

This makes scripts available from any directory:
```bash
session-start.sh
mcp-health
git-local-commit.sh
```

---

## Configuration Files

### 1. Cursor Settings (`config/settings.json`)

Complete autonomous settings:

```json
{
  "YOLO": true,
  "mcp.enabled": true,
  "mcp.autoStart": true,
  "cursor.ai.enabled": true,
  "cursor.ai.autoComplete": true,
  "cursor.ai.chat.enabled": true,
  "cursor.ai.codeGeneration": true,
  "cursor.ai.terminalAccess": true,
  "cursor.ai.fileSystemAccess": true,
  "cursor.ai.shellAccess": true,
  "cursor.ai.autoExecute": true,
  "cursor.ai.confirmationLevel": "none",
  "cursor.ai.autoApprove": true,
  "cursor.ai.trustedMode": true,
  "cursor.ai.fullAccess": true,
  "editor.fontSize": 14,
  "editor.lineHeight": 2,
  "editor.fontFamily": "SF Mono, Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "telemetry.telemetryLevel": "off"
}
```

### 2. MCP Configuration (`config/mcp.json`)

See [MCP Servers Implementation Guide](./MCP-SERVERS-IMPLEMENTATION.md) for complete details.

### 3. Workflows (`config/workflows.json`)

Example workflow:
```json
{
  "ai-start": {
    "description": "Load AI session context and initialize environment",
    "commands": [
      "bash /path/to/cursor-ops/scripts/session-start.sh"
    ],
    "auto_approve": true,
    "timeout": 30000,
    "on_error": "continue"
  }
}
```

### 4. AI Permissions (`~/.cursor-ai-permissions`)

Created by `configure-cursor-autonomy.sh`:

```bash
AUTONOMY_LEVEL=full
TERMINAL_ACCESS=true
FILE_SYSTEM_ACCESS=true
PACKAGE_INSTALLATION=true
SYSTEM_CONFIGURATION=true
EXTENSION_MANAGEMENT=true
SHELL_SCRIPT_EXECUTION=true
AUTO_APPROVE_ACTIONS=true

# GitHub Push Security Gate
GITHUB_PUSH_GATE=true
GITHUB_PUSH_TOKEN="push to github"
REQUIRE_PUSH_TOKEN=true
```

---

## Verification

### Test 1: Check Cursor Settings

1. Open Cursor IDE
2. Go to Settings (`Cmd+,` / `Ctrl+,`)
3. Search for "YOLO"
4. Verify `YOLO: true` is set

### Test 2: Verify MCP Servers

Type in Cursor chat:
```
mcp-health
```

Should show:
- ✅ All 6 servers connected
- ✅ 39 tools available
- ✅ No errors

### Test 3: Test Autonomous Mode

Type in Cursor chat:
```
/yolo-full
```

Should return:
- ✅ MCP servers: connected
- ✅ Autonomous tools: enabled
- ✅ Ready for autonomous operation: yes

### Test 4: Test Workflows

Type in Cursor chat:
```
ai-start
```

Should:
- Load session context
- Show project information
- Display git status

### Test 5: Test MCP Tools

Ask AI to:
- Read a file (tests filesystem MCP)
- Create a memory entity (tests memory MCP)
- Execute a shell command (tests shell-minimal MCP)

---

## Troubleshooting

### Setup Script Fails

**Problem**: `./setup.sh` errors

**Solutions**:
1. Check file permissions: `chmod +x setup.sh`
2. Verify bash is available: `which bash`
3. Check script syntax: `bash -n setup.sh`
4. Review error messages for specific issues

### Cursor Settings Not Applied

**Problem**: Settings don't take effect

**Solutions**:
1. Verify settings file location:
   - macOS: `~/Library/Application Support/Cursor/User/settings.json`
   - Linux: `~/.config/Cursor/User/settings.json`
   - Windows: `%APPDATA%\Cursor\User\settings.json`
2. Check file permissions
3. Restart Cursor IDE completely
4. Manually copy settings if needed

### MCP Servers Not Starting

**Problem**: Servers don't connect

**Solutions**:
1. Verify `~/.cursor/mcp.json` exists
2. Check JSON syntax is valid
3. Verify Node.js is installed
4. Check Cursor IDE logs
5. Run `mcp-health` for diagnostics

### Environment Variables Not Working

**Problem**: `GITHUB_TOKEN` not recognized

**Solutions**:
1. Verify variable is exported: `echo $GITHUB_TOKEN`
2. Check shell config file: `cat ~/.zshrc | grep GITHUB`
3. Reload shell: `source ~/.zshrc`
4. Restart Cursor IDE
5. Verify in mcp.json: `${GITHUB_TOKEN}` is used

### Workflows Not Available

**Problem**: Can't use workflows in chat

**Solutions**:
1. Verify symlink: `ls -la ~/.cursor/workflows.json`
2. Check file exists: `test -f ~/.cursor/workflows.json`
3. Verify JSON syntax: `jq . ~/.cursor/workflows.json`
4. Restart Cursor IDE
5. Check workflows are in PATH

### Scripts Not Found

**Problem**: Scripts not in PATH

**Solutions**:
1. Check PATH: `echo $PATH | grep cursor-ops`
2. Verify scripts directory: `ls /path/to/cursor-ops/scripts/`
3. Re-run setup: `./setup.sh`
4. Manually add to PATH if needed

---

## Manual Setup (Alternative)

If automated setup fails, follow these manual steps:

### 1. Copy Configuration Files

```bash
# Cursor settings
cp config/settings.json ~/Library/Application\ Support/Cursor/User/settings.json

# MCP configuration
cp config/mcp.json ~/.cursor/mcp.json

# Workflows
cp config/workflows.json ~/.cursor/workflows.json
```

### 2. Expand Variables

Edit `~/.cursor/mcp.json` and replace `${HOME}` with actual path:
```bash
sed -i '' "s|\${HOME}|$HOME|g" ~/.cursor/mcp.json
```

### 3. Set Environment Variables

```bash
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.zshrc
source ~/.zshrc
```

### 4. Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

### 5. Add to PATH

```bash
echo 'export PATH="/path/to/cursor-ops/scripts:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 6. Restart Cursor IDE

Quit and reopen Cursor completely.

---

## Summary

### Setup Checklist

- [ ] Node.js installed and working
- [ ] Repository cloned
- [ ] Setup script executed successfully
- [ ] Environment variables set
- [ ] Cursor IDE restarted
- [ ] MCP servers verified (`mcp-health`)
- [ ] Autonomous mode tested (`/yolo-full`)
- [ ] Workflows tested (`ai-start`)

### What's Configured

✅ **Cursor Settings**: Full autonomy enabled
✅ **MCP Servers**: 6 servers, 39 tools
✅ **Workflows**: 12+ global workflows
✅ **Scripts**: All in PATH
✅ **Permissions**: Full system access
✅ **Environment**: All variables set

### Next Steps

1. Start using autonomous features
2. Explore MCP tools
3. Create custom workflows if needed
4. Customize settings for your workflow

---

**Last Updated**: November 26, 2025
**Related Documentation**:
- [YOLO-FULL Workflow Guide](./YOLO-FULL-WORKFLOW.md)
- [MCP Servers Implementation Guide](./MCP-SERVERS-IMPLEMENTATION.md)

