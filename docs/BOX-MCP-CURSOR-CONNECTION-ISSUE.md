# Box MCP Cursor Connection Issue - Persistent Problem

**Date:** 2025-12-15
**Status:** ⚠️ Server runs but Cursor doesn't connect

---

## Current Situation

### ✅ What Works

1. **Server Process:** Running correctly
   - Process ID visible via `ps aux`
   - Server starts without errors
   - Stderr output confirms: "Box Minimal MCP server running on stdio"

2. **Programmatic Testing:** Works perfectly
   - Initialize handshake succeeds
   - Tools discovery works (6 tools)
   - Tool calls work correctly
   - Box API connection successful

3. **Configuration:** Updated correctly
   - PATH environment variable added
   - BOX_ACCESS_TOKEN present and valid
   - Token validates against Box API (HTTP 200)

### ❌ What Doesn't Work

1. **Cursor Connection:** box-minimal not showing in `claude mcp list`
   - Other servers connect fine (filesystem, memory, github-minimal, etc.)
   - box-minimal specifically fails to connect
   - Tools not available to AI agent

2. **MCP Inspector UI:** Shows "failed to fetch"
   - But programmatic test shows tool works
   - Suggests Inspector UI issue or timeout problem

---

## Diagnostic Summary

### Test Results

| Test | Result | Details |
|------|--------|---------|
| Server starts | ✅ Pass | Process visible, no errors |
| Token valid | ✅ Pass | HTTP 200 from Box API |
| Programmatic test | ✅ Pass | All operations work |
| Cursor connection | ❌ Fail | Not in connected list |
| Tools available | ❌ Fail | Not exposed to AI |

---

## Possible Causes

Since programmatic testing works but Cursor doesn't connect:

### 1. Stdio Communication Issue
**Theory:** Cursor's stdio handling differs from programmatic test

**Evidence:**
- Programmatic test uses Node.js spawn() - works
- Cursor uses internal stdio handling - fails
- Other stdio servers work (asana-minimal, etc.)

**Question:** Why would box-minimal specifically fail when others work?

### 2. Timing/Initialization Issue
**Theory:** Box SDK initialization delays or blocks stdio

**Evidence:**
- Server uses lazy initialization (only when tool called)
- Programmatic test succeeds after short delay
- Cursor may timeout during initialization

**But:** Lazy init shouldn't block server startup...

### 3. Environment Variable Issue
**Theory:** Cursor doesn't properly pass env vars to box-minimal

**Evidence:**
- Config shows env vars present
- Programmatic test passes env vars explicitly
- Token works when passed correctly

**However:** We've added explicit PATH and verified config...

### 4. Box SDK Initialization Error
**Theory:** Box SDK initialization fails silently or crashes

**Evidence:**
- Programmatic test works (so SDK can initialize)
- But maybe only when actually calling tools
- Server startup doesn't initialize SDK (lazy init)

**But:** Programmatic test shows tools work, so SDK works...

### 5. MCP Protocol Handshake Failure
**Theory:** Handshake completes but something breaks connection

**Evidence:**
- Process stays running (so doesn't crash)
- But Cursor doesn't recognize connection
- No error messages visible

**Similar to:** Box Remote MCP Proxy issue mentioned in feedback?

---

## Comparison with Working Servers

### asana-minimal (Works ✅)

**Config:**
```json
{
  "asana-minimal": {
    "command": "npx",
    "args": ["-y", "mcp-asana-minimal"],
    "env": {
      "ASANA_ACCESS_TOKEN": "2/1210006544495609/..."
    }
  }
}
```

**Differences from box-minimal:**
- ✅ Uses Personal Access Token (similar)
- ✅ Uses stdio transport (same)
- ✅ Uses environment variables (same)
- ✅ Works with Cursor

**Why does asana work but box doesn't?**

---

## Attempted Fixes

1. ✅ **Updated token** - Refreshed OAuth token, updated config
2. ✅ **Added PATH** - Explicit PATH environment variable
3. ✅ **Removed BOX_DEV_TOKEN** - Cleaned up unused variable
4. ✅ **Verified token** - Confirmed token works with Box API
5. ✅ **Programmatic testing** - Confirmed server works correctly

**Result:** Still doesn't connect to Cursor

---

## Next Steps to Investigate

### 1. Check Cursor MCP Logs
```bash
# In Cursor:
# Cmd+Shift+U → Output panel → Select "Cursor MCP"
# Look for box-minimal specific errors
```

### 2. Compare with asana-minimal
- Check if there are differences in implementation
- Compare error handling
- Compare initialization code

### 3. Try Absolute Path to npx
```json
{
  "command": "/usr/local/bin/npx",
  ...
}
```

### 4. Test with Box Remote MCP Proxy
As suggested in feedback, try the proxy approach:
- Handles OAuth refresh automatically
- May work better with Cursor's connection handling

### 5. Check for Silent Errors
- Add more logging to box-minimal server
- Check if errors occur but aren't surfaced
- Compare stderr output between working/non-working servers

---

## Key Question

**Why does programmatic testing work perfectly, but Cursor cannot connect?**

This suggests:
- Server implementation is correct ✅
- Box API connection works ✅
- Token authentication works ✅
- But something about Cursor's connection mechanism fails ❌

**Hypothesis:** There may be a subtle difference in how Cursor handles stdio for this specific server, or the Box SDK initialization interacts poorly with Cursor's MCP connection handling.

---

## Recommendation

Given that:
1. Programmatic testing proves server works
2. Configuration is correct
3. Token is valid
4. Other similar servers work

**Next priority:** Check Cursor's MCP logs for specific error messages about box-minimal. The logs may reveal why Cursor cannot establish the connection even though the server works programmatically.

---

**Status:** Waiting for Cursor MCP log investigation

