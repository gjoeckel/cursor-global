# Asana MCP Integration Setup

**⚠️ DEPRECATED:** This document is outdated. For the current setup, see **[ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md)**.

This document describes an SSE/OAuth-based method that is **not currently in use**. The active implementation uses a local stdio-based server with Personal Access Token authentication.

---

## Current Active Method

The current active configuration uses **`mcp-asana-minimal`**, a local stdio-based MCP server:

**Configuration:**
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

**For complete setup instructions, see:** [ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md)

---

## Legacy SSE Method (Not Currently Used)

⚠️ **The following describes a method that is NOT currently configured.**

The SSE (Server-Sent Events) method was previously documented but is not the active implementation:

**Location:** `~/.cursor/mcp.json`

**Legacy Configuration (Not Active):**
```json
{
  "mcpServers": {
    "asana": {
      "type": "sse",
      "url": "https://mcp.asana.com/sse"
    }
  }
}
```

### Setup Steps (SSE Method - Not Used)

1. Restart Cursor IDE

**Important:** You must completely restart Cursor for the MCP configuration changes to take effect.

1. Quit Cursor completely (`Cmd+Q` / `Ctrl+Q`)
2. Reopen Cursor IDE
3. MCP servers auto-start on launch

### 2. Verify Connection

1. Go to **Cursor Settings → MCP** (or **Developer → Edit Config → MCP Tools**)
2. Confirm the Asana server is listed and connected
3. Verify tools are available

### 3. Authenticate with Asana (OAuth - Not Used)

⚠️ **This OAuth flow is NOT used with the current stdio-based implementation.**

The first time you use the integration, you'll be prompted to authenticate with Asana through OAuth. Follow the prompts to:
1. Authorize the application
2. Grant necessary permissions
3. Complete the OAuth flow

---

## Usage

Once configured, you can use natural language commands in Cursor to interact with Asana:

**Examples:**
- "Show me my tasks in Asana"
- "Create a new task in project X"
- "Update task Y with status Z"
- "Search for tasks containing 'bug fix'"
- "Add a comment to task ABC"

---

## Troubleshooting

### Server Not Appearing

If the Asana server doesn't appear after restart:

1. **Check Configuration File:**
   ```bash
   cat ~/.cursor/mcp.json | grep -A 3 asana
   ```

2. **Verify File Permissions:**
   ```bash
   ls -la ~/.cursor/mcp.json
   ```
   Should be readable by your user.

3. **Check Cursor Logs:**
   - Cursor Settings → Developer → Show Logs
   - Look for MCP-related errors

### Authentication Issues

If authentication fails:

1. **Clear MCP Auth Cache:**
   ```bash
   rm -rf ~/.mcp-auth
   ```
   Note: This will require re-authentication for all MCP applications.

2. **Re-authenticate:**
   - Try using an Asana command in Cursor
   - Follow the OAuth flow again

### Internal Server Error

If you encounter Internal Server Error:

1. Delete the MCP auth directory:
   ```bash
   rm -rf ~/.mcp-auth
   ```

2. Restart Cursor and re-authenticate

---

## Mac OS Specific Notes

### Privacy & Security

On macOS, you may need to ensure:
- **System Settings → Privacy & Security → Full Disk Access → Cursor** is enabled
- This allows Cursor to access necessary files for MCP operations

### Configuration Location

- **Global Config:** `~/.cursor/mcp.json` (affects all projects)
- **Project Config:** `.cursor/mcp.json` (project-specific, optional)

---

## Enterprise Considerations

If you're on Asana's Enterprise+ tier:

- Your organization can use **Asana's App Management** to allow or block the Asana MCP app
- This will apply to all MCP clients
- Contact your Asana admin if the integration is blocked

---

## Current Active Configuration Method

### stdio-based mcp-asana-minimal (Active)

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

**Pros:**
- ✅ Simple setup (Personal Access Token)
- ✅ Reliable (local process, no network dependency)
- ✅ Fast (direct API calls)
- ✅ Currently working and configured

**See [ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md) for complete setup instructions.**

### Alternative Methods (Not Currently Used)

For information about SSE and other alternative methods, see [ASANA-MCP-ALTERNATIVES.md](./ASANA-MCP-ALTERNATIVES.md).

---

## Verification

After setup, verify the integration works:

1. **Check MCP Status:**
   - Cursor Settings → MCP
   - Asana server should show as "Connected"

2. **Test Commands:**
   - Try: "List my Asana tasks"
   - Should return your actual Asana tasks

3. **Check Tools Available:**
   - MCP panel should show Asana-specific tools

---

## Related Documentation

- **[ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md)** ⭐ **START HERE** - Current active setup guide
- [ASANA-MCP-ALTERNATIVES.md](./ASANA-MCP-ALTERNATIVES.md) - Alternative methods (not currently used)
- [ASANA-LOADING-TOOLS-TROUBLESHOOTING.md](./ASANA-LOADING-TOOLS-TROUBLESHOOTING.md) - Troubleshooting guide
- [MCP Servers Implementation Guide](./MCP-SERVERS-IMPLEMENTATION.md)
- [Cursor Setup Guide](./cursor-branch-CURSOR-SETUP-GUIDE.md)

---

**⚠️ Note:** This document describes legacy SSE/OAuth methods. For current setup, see [ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md).

**Created:** 2025-12-11
**Last Updated:** 2025-12-15 (Marked as deprecated, redirected to current guide)
