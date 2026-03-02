# Optimized MCP Configuration (39 Tools)

**Complete configuration for 39-tool setup optimized for Cursor IDE's 40-tool limit**

---

## Overview

This configuration provides **39 tools total** across **6 MCP servers**, staying just under Cursor IDE's 40-tool limit. All servers use `npx -y` for automatic installation.

### Tool Breakdown

| Server | Type | Tools | Package |
|--------|------|-------|---------|
| filesystem | Official | 15 | `@modelcontextprotocol/server-filesystem` |
| memory | Official | 8 | `@modelcontextprotocol/server-memory` |
| github-minimal | Custom | 4 | `mcp-github-minimal` |
| shell-minimal | Custom | 4 | `mcp-shell-minimal` |
| playwright-minimal | Custom | 4 | `mcp-playwright-minimal` |
| agent-autonomy | Custom | 4 | `mcp-agent-autonomy` |
| **Total** | | **39** | |

---

## Complete Configuration

### `~/.cursor/mcp.json`

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

---

## Environment Variables

### Required

#### GITHUB_TOKEN

Required for `github-minimal` server:

```bash
# Get token from: https://github.com/settings/tokens
export GITHUB_TOKEN="github_pat_..."

# Add to shell config (~/.zshrc or ~/.bashrc)
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.zshrc
source ~/.zshrc
```

### Optional

#### MCP_SERVERS_REPO

For using local builds instead of npx:

```bash
export MCP_SERVERS_REPO="$HOME/.cursor/mcp-servers"
```

---

## Installation

### Automatic (Recommended)

1. Copy the configuration above to `~/.cursor/mcp.json`
2. Replace `${HOME}` with your actual home directory path
3. Set `GITHUB_TOKEN` environment variable
4. Restart Cursor IDE

### Path Resolution

The `${HOME}` variable needs to be expanded. For example:

**Before:**
```json
"args": ["-y", "@modelcontextprotocol/server-filesystem", "${HOME}"]
```

**After (macOS):**
```json
"args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/username"]
```

**After (Linux):**
```json
"args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/username"]
```

---

## Server Details

### 1. Filesystem Server (15 tools)

**Official MCP server** for file operations:
- File reading/writing
- Directory listing
- File search
- Directory tree navigation
- File metadata
- Path operations

### 2. Memory Server (8 tools)

**Official MCP server** for knowledge storage:
- Create entities
- Create relations
- Search nodes
- Read knowledge graph
- Add observations
- Delete entities/relations

### 3. GitHub Minimal Server (4 tools)

**Custom server** for GitHub operations:
- `get_file_contents` - Read repository files
- `create_or_update_file` - Create or update files
- `push_files` - Push files to repository
- `search_repositories` - Search GitHub repositories

**Requires**: `GITHUB_TOKEN` environment variable

### 4. Shell Minimal Server (4 tools)

**Custom server** for shell command execution:
- `execute_command` - Execute shell commands
- `list_processes` - List running processes
- `kill_process` - Kill process by PID
- `get_environment` - Get environment variables

**Configurable**: `WORKING_DIRECTORY` and `ALLOWED_COMMANDS`

### 5. Playwright Minimal Server (4 tools)

**Custom server** for browser automation:
- `navigate` - Navigate to URL
- `take_screenshot` - Capture page screenshot
- `extract_text` - Extract text from page
- `click_element` - Click page elements

### 6. Agent Autonomy Server (4 tools)

**Custom server** for workflow automation:
- `execute_workflow` - Execute predefined workflow
- `list_workflows` - List available workflows
- `register_workflow` - Register new workflow
- `check_approval` - Check if command is auto-approved

---

## Verification

### Check Tool Count

After setup, verify you have exactly 39 tools:

1. Open Cursor IDE
2. Check MCP server status in settings
3. Count available tools (should be 39)

### Test Servers

Test each server:

```bash
# Test filesystem (should work immediately)
# Test memory (should work immediately)
# Test GitHub (requires GITHUB_TOKEN)
# Test shell (should work immediately)
# Test Playwright (should work immediately)
# Test agent-autonomy (should work immediately)
```

---

## Troubleshooting

### Tool Count Exceeds 40

**Problem**: More than 40 tools detected

**Solutions**:
1. Verify you're using the exact configuration above
2. Check for duplicate server entries
3. Remove any additional servers not in this config
4. Restart Cursor IDE

### GitHub Server Not Working

**Problem**: GitHub operations fail

**Solutions**:
1. Verify `GITHUB_TOKEN` is set: `echo $GITHUB_TOKEN`
2. Check token has required permissions (repo, read, write)
3. Restart Cursor IDE after setting token
4. Test token: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user`

### Servers Not Starting

**Problem**: MCP servers fail to start

**Solutions**:
1. Check Node.js is installed: `node --version`
2. Check npm is installed: `npm --version`
3. Verify npx works: `npx --version`
4. Check `~/.cursor/mcp.json` syntax is valid JSON
5. Review Cursor IDE logs for errors

---

## Alternative Configurations

### Minimal Setup (27 tools)

Remove optional servers:

```json
{
  "mcpServers": {
    "filesystem": { ... },
    "memory": { ... },
    "github-minimal": { ... },
    "shell-minimal": { ... }
  }
}
```

**Total: 27 tools** (filesystem: 15 + memory: 8 + github: 4)

### Extended Setup (with optional servers)

Add optional servers (may exceed 40-tool limit):

```json
{
  "mcpServers": {
    // ... all 6 from optimized config ...
    "sequential-thinking-minimal": {
      "command": "npx",
      "args": ["-y", "mcp-sequential-thinking-minimal"]
    }
  }
}
```

**Warning**: This may exceed the 40-tool limit depending on server versions.

---

## Summary

### Key Points

1. **39 tools total** - Optimized to stay under 40-tool limit
2. **All servers use npx** - Automatic installation, no manual setup
3. **Environment variables** - Required for GitHub, optional for others
4. **Automatic startup** - Servers start when Cursor launches
5. **Portable** - Works on any machine with Node.js

### Installation Checklist

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] `~/.cursor/mcp.json` configured with above config
- [ ] `${HOME}` expanded to actual path
- [ ] `GITHUB_TOKEN` set (for GitHub server)
- [ ] Cursor IDE restarted
- [ ] Servers verified (check MCP status in Cursor)

---

**Last Updated**: November 26, 2025
**Related Documentation**:
- [MCP-SERVERS-IMPLEMENTATION.md](./docs/MCP-SERVERS-IMPLEMENTATION.md)
- [IDE-SETUP-GUIDE.md](./IDE-SETUP-GUIDE.md)

