# Cursor IDE Setup Guide

**Complete setup instructions for Cursor IDE with MCP servers**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Setup](#quick-setup)
3. [Detailed Setup](#detailed-setup)
4. [Configuration Files](#configuration-files)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

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

### 1. Set Environment Variables

```bash
# Add to ~/.zshrc or ~/.bashrc
export GITHUB_TOKEN="github_pat_..."

# Reload shell
source ~/.zshrc
```

### 2. Create MCP Configuration

Create `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/username"],
      "env": {
        "ALLOWED_PATHS": "/Users/username:/Users/username/.cursor:/Users/username/.config",
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
        "WORKING_DIRECTORY": "/Users/username",
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

**Important**: Replace `/Users/username` with your actual home directory path.

### 3. Restart Cursor IDE

1. Quit Cursor completely (`Cmd+Q` / `Ctrl+Q`)
2. Reopen Cursor IDE
3. MCP servers auto-start on launch

### 4. Verify Setup

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
├── workflows.json          # Global workflows
├── mcp.json                # MCP server configuration
└── commands/               # (Optional) Command definitions

~/Library/Application Support/Cursor/User/
└── settings.json           # Cursor IDE settings
```

### Step 2: Configuration Files

#### A. MCP Configuration (`~/.cursor/mcp.json`)

See [OPTIMIZED-CONFIG.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/OPTIMIZED-CONFIG.md) for complete configuration.

#### B. Cursor Settings

For autonomous operation, see [CURSOR-AUTONOMOUS-SETUP.md](./CURSOR-AUTONOMOUS-SETUP.md).

### Step 3: Environment Variables

```bash
# Required for GitHub MCP server
export GITHUB_TOKEN="github_pat_..."

# Add to shell config for persistence
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.zshrc
source ~/.zshrc
```

---

## Configuration Files

### MCP Configuration

Location: `~/.cursor/mcp.json`

See [OPTIMIZED-CONFIG.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/OPTIMIZED-CONFIG.md) for the complete 39-tool configuration.

### Cursor Settings

Location: `~/Library/Application Support/Cursor/User/settings.json` (macOS)

For autonomous mode settings, see [CURSOR-AUTONOMOUS-SETUP.md](./CURSOR-AUTONOMOUS-SETUP.md).

---

## Verification

### Test 1: Check MCP Servers

Type in Cursor chat:
```
mcp-health
```

Should show:
- ✅ All 6 servers connected
- ✅ 39 tools available
- ✅ No errors

### Test 2: Test Autonomous Mode

Type in Cursor chat:
```
/yolo-full
```

Should return:
- ✅ MCP servers: connected
- ✅ Autonomous tools: enabled
- ✅ Ready for autonomous operation: yes

### Test 3: Test Workflows

Type in Cursor chat:
```
ai-start
```

Should:
- Load session context
- Show project information
- Display git status

### Test 4: Test MCP Tools

Ask AI to:
- Read a file (tests filesystem MCP)
- Create a memory entity (tests memory MCP)
- Execute a shell command (tests shell-minimal MCP)

---

## Troubleshooting

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
1. Verify `~/.cursor/workflows.json` exists
2. Check file syntax: `jq . ~/.cursor/workflows.json`
3. Restart Cursor IDE
4. Check workflows are properly configured

---

## Next Steps

After basic setup:

1. **Enable Autonomous Mode**: See [CURSOR-AUTONOMOUS-SETUP.md](./CURSOR-AUTONOMOUS-SETUP.md)
2. **Configure YOLO Mode**: See [YOLO-FULL-WORKFLOW.md](./YOLO-FULL-WORKFLOW.md)
3. **Set Up Workflows**: Configure global workflows
4. **Customize Settings**: Adjust Cursor settings for your workflow

---

## Related Documentation

### Main Branch

- [OPTIMIZED-CONFIG.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/OPTIMIZED-CONFIG.md) - 39-tool configuration
- [MCP-SERVERS-IMPLEMENTATION.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/docs/MCP-SERVERS-IMPLEMENTATION.md) - Implementation guide

### Cursor Branch

- [CURSOR-AUTONOMOUS-SETUP.md](./CURSOR-AUTONOMOUS-SETUP.md) - Autonomous operation setup
- [YOLO-FULL-WORKFLOW.md](./YOLO-FULL-WORKFLOW.md) - YOLO mode workflow

---

**Last Updated**: November 26, 2025

