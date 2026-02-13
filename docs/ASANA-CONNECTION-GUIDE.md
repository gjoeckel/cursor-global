# Asana MCP Connection Guide

**Official guide for connecting Asana to Cursor IDE using the mcp-asana-minimal server**

---

## Overview

This guide covers connecting to Asana using the **local stdio-based MCP server** (`mcp-asana-minimal`). This is the **currently active and recommended** method for Asana integration with Cursor IDE.

### What This Integration Provides

- ✅ Create and manage tasks
- ✅ List and search tasks
- ✅ Update task status and details
- ✅ Add comments to tasks
- ✅ List projects and workspaces
- ✅ Full task lifecycle management

---

## Prerequisites

- **Cursor IDE** installed and running
- **Node.js** 18+ (for npx execution)
- **Asana account** with Personal Access Token

---

## Quick Setup

### Step 1: Get Your Asana Personal Access Token

1. Go to: https://app.asana.com/0/my-apps
2. Click **"Create New Token"** or **"Personal Access Token"**
3. Give it a name (e.g., "Cursor IDE Integration")
4. Copy the token immediately (you won't see it again)

### Step 2: Set Environment Variable

Add the token to your shell profile:

```bash
# For zsh (macOS default)
echo 'export ASANA_ACCESS_TOKEN="your_token_here"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export ASANA_ACCESS_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

**Important:** Replace `your_token_here` with your actual token.

### Step 3: Configure MCP Server

Edit `~/.cursor/mcp.json` and add:

```json
{
  "mcpServers": {
    "asana-minimal": {
      "command": "npx",
      "args": ["-y", "mcp-asana-minimal"],
      "env": {
        "ASANA_ACCESS_TOKEN": "${ASANA_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Alternative:** You can hardcode the token directly (less secure):

```json
{
  "mcpServers": {
    "asana-minimal": {
      "command": "npx",
      "args": ["-y", "mcp-asana-minimal"],
      "env": {
        "ASANA_ACCESS_TOKEN": "your_actual_token_here"
      }
    }
  }
}
```

### Step 4: Restart Cursor IDE

1. **Quit Cursor completely** (`Cmd+Q` on macOS, `Ctrl+Q` on Windows/Linux)
2. **Reopen Cursor IDE**
3. MCP servers will auto-start on launch

### Step 5: Verify Connection

1. Open Cursor Settings → **MCP** (or Developer → Edit Config → MCP Tools)
2. Look for `asana-minimal` in the server list
3. Verify it shows as **"Connected"** or shows tool count
4. Test with: "List my Asana tasks"

---

## Available Tools (6 total)

1. **`asana_create_task`** - Create a new task
   - Parameters: `name` (required), `notes`, `workspace`, `project`, `assignee`, `due_on`

2. **`asana_update_task`** - Update an existing task
   - Parameters: `task_id` (required), `name`, `notes`, `assignee`, `due_on`, `completed`

3. **`asana_get_task`** - Get detailed task information
   - Parameters: `task_id` (required)

4. **`asana_list_tasks`** - List tasks with filters
   - Parameters: `project`, `assignee` (use "me" for current user), `workspace`, `completed`, `limit`

5. **`asana_list_projects`** - List projects in workspace(s)
   - Parameters: `workspace`, `archived`, `limit`

6. **`asana_add_comment`** - Add a comment to a task
   - Parameters: `task_id` (required), `text` (required)

---

## Usage Examples

### Natural Language Commands

Once configured, you can use natural language in Cursor chat:

- **"List my Asana tasks"**
- **"Show me all tasks in project X"**
- **"Create a task called 'Review code' in project Y"**
- **"Update task ABC123 to completed"**
- **"Add a comment to task XYZ saying 'Work in progress'"**
- **"List all my projects"**
- **"What tasks are assigned to me that aren't completed?"**

### Example Workflow

```
1. "List my Asana projects" → Get project GID
2. "Create a task in project <gid> called 'Fix bug'" → Get task GID
3. "Add a comment to task <task_gid> saying 'Investigating issue'"
4. "Update task <task_gid> to completed"
```

---

## Architecture

### Current Implementation

```
Cursor IDE → stdio pipe → mcp-asana-minimal (local process) → Asana API
```

**Characteristics:**
- **Transport:** `StdioServerTransport()` - direct parent-child process communication
- **Authentication:** Personal Access Token (PAT) via environment variable
- **Installation:** Automatic via `npx -y mcp-asana-minimal`
- **Communication:** Standard input/output pipes (local)

### Why This Method?

- ✅ **Reliable:** Direct process communication, no network dependencies
- ✅ **Secure:** Token stored locally, no remote server involved
- ✅ **Simple:** No OAuth flow, just a static token
- ✅ **Fast:** Low latency, direct API calls
- ✅ **Compatible:** Works with Cursor's MCP implementation

---

## Troubleshooting

### Server Not Appearing After Restart

**Check Configuration:**
```bash
cat ~/.cursor/mcp.json | grep -A 5 "asana-minimal"
```

Should show the configuration with `command`, `args`, and `env` fields.

**Check Environment Variable:**
```bash
echo $ASANA_ACCESS_TOKEN
```

Should show your token. If empty, the environment variable isn't set.

**Verify File Permissions:**
```bash
ls -la ~/.cursor/mcp.json
```

Should be readable by your user.

### Authentication Errors

**Error: "ASANA_ACCESS_TOKEN environment variable is required"**

**Solution:**
1. Verify token is set: `echo $ASANA_ACCESS_TOKEN`
2. If empty, add to `~/.zshrc` or `~/.bashrc` and restart terminal
3. Or hardcode token in `~/.cursor/mcp.json` (see Step 3 above)

**Error: "Invalid token" or "Unauthorized"**

**Solution:**
1. Verify token is correct at https://app.asana.com/0/my-apps
2. Generate a new token if needed
3. Update environment variable or config file
4. Restart Cursor

### Tools Not Loading

**Symptom:** Server shows as "Loading Tools" or tools don't appear

**Solutions:**
1. **Wait 10-30 seconds** - Initial connection can take time
2. **Check Cursor Logs:** Settings → Developer → Show Logs
3. **Verify token is valid:** Try using a tool command in chat
4. **Restart Cursor completely**

### General Debugging

**Check MCP Server Status:**
```bash
claude mcp list
```

Should show `asana-minimal` in the list if connected.

**Check Process:**
```bash
ps aux | grep mcp-asana-minimal
```

Should show the server process running.

**Check Cursor Logs:**
1. Cursor Settings → Developer → Show Logs
2. Look for errors containing "asana" or "mcp"
3. Check for authentication or connection errors

---

## Configuration Details

### Environment Variables

- **`ASANA_ACCESS_TOKEN`** (required) - Your Asana Personal Access Token

### MCP Configuration Format

```json
{
  "mcpServers": {
    "asana-minimal": {
      "command": "npx",
      "args": ["-y", "mcp-asana-minimal"],
      "env": {
        "ASANA_ACCESS_TOKEN": "${ASANA_ACCESS_TOKEN}"
      }
    }
  }
}
```

### Variable Expansion

Cursor supports `${VARIABLE_NAME}` syntax to expand environment variables. If the variable isn't found, you can hardcode the value directly.

---

## Security Considerations

### Token Storage

- **Recommended:** Store token in `~/.zshrc` or `~/.bashrc` (encrypted home directory)
- **Alternative:** Hardcode in `~/.cursor/mcp.json` (less secure, but convenient)
- **Never:** Commit tokens to git repositories

### Token Permissions

Personal Access Tokens have full access to your Asana account. Keep them secure:
- Don't share tokens
- Regenerate if compromised
- Use descriptive names to identify usage

### Revoking Tokens

To revoke a token:
1. Go to https://app.asana.com/0/my-apps
2. Find the token
3. Click "Revoke" or "Delete"

---

## macOS Specific Notes

### Privacy & Security Settings

On macOS, you may need to ensure:
- **System Settings → Privacy & Security → Full Disk Access → Cursor** is enabled
- This allows Cursor to access configuration files and environment variables

### Configuration Location

- **Global Config:** `~/.cursor/mcp.json` (affects all projects)
- **Project Config:** `.cursor/mcp.json` (project-specific, optional)
- **Environment Variables:** `~/.zshrc` or `~/.bashrc`

---

## Package Information

- **Package Name:** `mcp-asana-minimal`
- **Version:** 1.1.0
- **Repository:** https://github.com/gjoeckel/my-mcp-servers
- **Installation:** Automatic via `npx -y mcp-asana-minimal`
- **Dependencies:** `@modelcontextprotocol/sdk`, `asana`, `zod`

---

## Comparison with Other Methods

### SSE Method (Not Currently Used)

The SSE (Server-Sent Events) method using `https://mcp.asana.com/sse` is documented but **not currently configured**. It uses OAuth 2.0 authentication and requires browser-based authorization.

**Why We Use stdio Instead:**
- ✅ Simpler setup (no OAuth flow)
- ✅ More reliable (no network dependency)
- ✅ Better for local development
- ✅ Full control over authentication

See [ASANA-MCP-ALTERNATIVES.md](./ASANA-MCP-ALTERNATIVES.md) for information about alternative methods.

---

## Related Documentation

- [Asana Minimal Package README](../mcp-asana-minimal/README.md)
- [Alternative Methods](./ASANA-MCP-ALTERNATIVES.md)
- [Troubleshooting Guide](./ASANA-LOADING-TOOLS-TROUBLESHOOTING.md)
- [Connection Report](./ASANA-CONNECTION-REPORT.md)

---

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review [ASANA-LOADING-TOOLS-TROUBLESHOOTING.md](./ASANA-LOADING-TOOLS-TROUBLESHOOTING.md)
3. Check Cursor logs for error messages
4. Verify configuration matches this guide

---

**Last Updated:** 2025-12-15
**Status:** Current and Active
**Version:** 1.1.0

