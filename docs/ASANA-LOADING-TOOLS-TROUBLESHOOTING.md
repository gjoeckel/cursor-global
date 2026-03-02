# Asana MCP "Loading Tools" Troubleshooting

**If Asana MCP shows "Loading Tools" status**

**For complete troubleshooting, see:** [ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md)

---

## What "Loading Tools" Means

The Asana MCP server is connecting but hasn't finished initializing. This is common on first connection.

**Current Implementation:** This guide covers the **stdio-based `mcp-asana-minimal`** server (currently active). For SSE/OAuth troubleshooting, see notes below.

---

## Common Causes (stdio-based server)

1. **Environment Variable Missing**
   - `ASANA_ACCESS_TOKEN` not set or not loaded
   - Token not found in environment when server starts
   - Shell profile not loaded (`.zshrc` or `.bashrc`)

2. **Server Startup Delay**
   - Initial stdio connection establishing
   - Tool discovery in progress
   - Normal on first load (5-30 seconds)

3. **Authentication Issues**
   - Invalid or expired Personal Access Token
   - Token format incorrect
   - Token permissions insufficient

---

## Troubleshooting Steps

### Step 1: Wait and Check

1. **Wait 30-60 seconds** for initial connection
2. **Check if status changes** from "Loading Tools" to showing actual tools
3. **Look for authentication prompts** in Cursor or browser

### Step 2: Check Environment Variable (stdio method)

For the current stdio-based implementation, verify the token is available:

```bash
# Check if token is set
echo $ASANA_ACCESS_TOKEN

# If empty, check shell profile
grep ASANA_ACCESS_TOKEN ~/.zshrc  # or ~/.bashrc
```

**If token is missing:**
1. Add to `~/.zshrc` or `~/.bashrc`: `export ASANA_ACCESS_TOKEN="your_token"`
2. Restart terminal or run `source ~/.zshrc`
3. Or hardcode in `~/.cursor/mcp.json` (see [ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md))

**Then try using an Asana command:**
- "List my Asana tasks"
- "Show me my Asana projects"
- "What Asana tasks do I have?"

### Step 3: Check Cursor Logs

1. **Open Cursor Settings** (`Cmd+,`)
2. **Go to Developer → Show Logs**
3. **Look for:**
   - Asana-related errors
   - MCP connection errors
   - Authentication errors
   - Network errors

### Step 4: Verify Configuration (stdio method)

Check MCP config matches current implementation:
```bash
cat ~/.cursor/mcp.json | grep -A 5 "asana-minimal"
```

Should show:
```json
"asana-minimal": {
  "command": "npx",
  "args": ["-y", "mcp-asana-minimal"],
  "env": {
    "ASANA_ACCESS_TOKEN": "${ASANA_ACCESS_TOKEN}"
  }
}
```

Or with hardcoded token:
```json
"ASANA_ACCESS_TOKEN": "your_actual_token_here"
```

### Step 5: Verify Token Validity

Test if token is valid:
1. Go to https://app.asana.com/0/my-apps
2. Verify token exists and hasn't been revoked
3. Generate new token if needed
4. Update environment variable or config
5. Restart Cursor

**Note:** The `~/.mcp-auth` directory is only used for OAuth-based SSE connections, not for the current stdio method with Personal Access Tokens.

### Step 6: Check Server Process

Verify the MCP server process is running:
```bash
ps aux | grep mcp-asana-minimal
```

Should show the server process. If not, check Cursor logs for startup errors.

### Step 7: Check MCP Server Status

Verify server connection:
```bash
claude mcp list
```

Should show `asana-minimal` in the connected servers list.

---

## Expected Behavior (stdio method)

### First Time Setup

1. **"Loading Tools"** appears (5-30 seconds)
2. **Server initializes** with Personal Access Token from environment/config
3. **Tools appear** in MCP panel (6 tools total)
4. **Status changes** to "Connected" or shows tool count
5. **No OAuth prompt** (uses static PAT token)

### Subsequent Connections

1. **"Loading Tools"** (5-10 seconds, faster after first load)
2. **Tools appear** automatically
3. **Ready to use**

**Note:** No OAuth flow is involved - authentication is handled via the Personal Access Token in the environment variable or config file.

---

## Alternative: Check Tool Count Script

If tools are loading but you want to verify:
```bash
# Check MCP tool count
cd /Users/a00288946/Agents/cursor-ops
./scripts/check-mcp-tool-count.sh
```

---

## Still Stuck?

If "Loading Tools" persists after 2-3 minutes:

1. **Restart Cursor** completely (`Cmd+Q`, then reopen)
2. **Check Cursor Logs:** Settings → Developer → Show Logs
3. **Verify token:** Check https://app.asana.com/0/my-apps
4. **Check configuration:** See [ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md)
5. **Try hardcoding token** in `~/.cursor/mcp.json` instead of using environment variable

## SSE/OAuth Method (Not Currently Used)

⚠️ **The following applies to the SSE/OAuth method, which is NOT currently configured.**

If you're using the SSE method (which you shouldn't be, but for reference):

- Network connection to `mcp.asana.com` is required
- OAuth flow must complete (browser-based)
- `~/.mcp-auth` cache directory is used
- See [ASANA-MCP-ALTERNATIVES.md](./ASANA-MCP-ALTERNATIVES.md) for SSE method details

---

## Next Steps After Tools Load

Once tools are visible:

1. **Document all tools** (names and descriptions)
2. **Count total number**
3. **Share list** to proceed with minimal package creation

---

## Related Documentation

- **[ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md)** ⭐ **Primary Guide** - Complete setup and troubleshooting
- [ASANA-MCP-SETUP.md](./ASANA-MCP-SETUP.md) - Setup documentation (legacy)
- [ASANA-MCP-ALTERNATIVES.md](./ASANA-MCP-ALTERNATIVES.md) - Alternative methods

---

**Created:** 2025-12-11
**Last Updated:** 2025-12-15 (Updated for stdio-based implementation)
