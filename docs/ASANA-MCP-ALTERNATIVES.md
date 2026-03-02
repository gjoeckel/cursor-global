# Asana MCP Integration - Alternative Methods

**⚠️ NOTE: These methods are NOT currently in use.**

This document describes alternative npm package options and the SSE method for reference purposes only. The **currently active method** uses `mcp-asana-minimal` (stdio-based with Personal Access Token).

**For the current active setup, see:** [ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md)

---

## Current Active Configuration (stdio Method)

The currently active configuration uses `mcp-asana-minimal`:

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

**This is the recommended and currently configured method.**

---

## Alternative Methods (Not Currently Used)

### SSE Method (Not Currently Configured)

The SSE (Server-Sent Events) method uses Asana's official endpoint:

```json
{
  "asana": {
    "type": "sse",
    "url": "https://mcp.asana.com/sse"
  }
}
```

**Status:** ⚠️ Documented but not currently configured

---

## Alternative npm Package Methods (Reference Only)

⚠️ **These alternative packages are documented for reference but are NOT currently in use.**

If you need to switch from the current `mcp-asana-minimal` implementation, these are alternative options:

### Option 1: @microagents/server-asana

```json
{
  "mcpServers": {
    "asana": {
      "command": "npx",
      "args": ["-y", "@microagents/server-asana"],
      "env": {
        "ASANA_ACCESS_TOKEN": "your_asana_personal_access_token"
      }
    }
  }
}
```

**Setup:**
1. Get Asana Personal Access Token from: https://app.asana.com/0/my-apps
2. Set environment variable or add to config
3. Restart Cursor

### Option 2: @cristip73/mcp-server-asana

```json
{
  "mcpServers": {
    "asana": {
      "command": "npx",
      "args": ["-y", "@cristip73/mcp-server-asana"],
      "env": {
        "ASANA_ACCESS_TOKEN": "your_asana_personal_access_token"
      }
    }
  }
}
```

### Option 3: tiny-asana-mcp-server

```json
{
  "mcpServers": {
    "asana": {
      "command": "npx",
      "args": ["-y", "tiny-asana-mcp-server"],
      "env": {
        "ASANA_ACCESS_TOKEN": "your_asana_personal_access_token"
      }
    }
  }
}
```

---

## Getting Asana Personal Access Token

1. Go to: https://app.asana.com/0/my-apps
2. Click "Create New Token" or "Personal Access Token"
3. Give it a name (e.g., "Cursor IDE Integration")
4. Copy the token
5. Add to environment variable:
   ```bash
   export ASANA_ACCESS_TOKEN="your_token_here"
   echo 'export ASANA_ACCESS_TOKEN="your_token_here"' >> ~/.zshrc
   ```

---

## Testing the Integration

After configuration:

1. **Restart Cursor completely**
2. **Check MCP Status:**
   - Cursor Settings → MCP
   - Asana server should be listed

3. **Test Commands:**
   - "List my Asana tasks"
   - "Show my Asana projects"
   - "Create a task in Asana"

---

## Troubleshooting

### Current stdio Method Issues

For issues with the current `mcp-asana-minimal` implementation, see:
- **[ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md)** - Troubleshooting section
- [ASANA-LOADING-TOOLS-TROUBLESHOOTING.md](./ASANA-LOADING-TOOLS-TROUBLESHOOTING.md)

### If Switching to Alternative Methods

If you need to switch from `mcp-asana-minimal` to one of these alternatives:

1. Remove current `asana-minimal` configuration
2. Add one of the alternative configurations above
3. Set `ASANA_ACCESS_TOKEN` environment variable (if required)
4. Follow package-specific setup instructions
5. Restart Cursor

### Token Issues

- Ensure token has necessary permissions
- Check token hasn't expired
- Verify token is set in environment or config
- For current method, see [ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md)

---

**⚠️ Reminder:** The methods described in this document are alternatives, not the currently active configuration. For current setup, see [ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md).

**Created:** 2025-12-11
**Last Updated:** 2025-12-15 (Added disclaimers about current active method)
