# Box MCP Inspector Testing Guide

**Date:** 2025-12-15
**Status:** Testing with MCP Inspector

---

## What MCP Inspector Shows

The MCP Inspector is running at `http://localhost:6274` and displays:

### 1. Initialize Handshake

Look for:
- ✅ **"initialize" request/response** - Should show successful handshake
- ✅ **Server capabilities** - Should show `{"tools": {}}`
- ✅ **Server info** - Should show `{"name": "box-minimal", "version": "1.0.4"}`

### 2. Tools Discovery

After initialization, look for:
- ✅ **"tools/list" request/response**
- ✅ **6 tools listed:**
  - `box_list_folder_items`
  - `box_get_file_content`
  - `box_get_file_details`
  - `box_search_files`
  - `box_upload_file`
  - `box_ai_qa_single_file`

### 3. Error Indicators

Watch for:
- ❌ **401/403 errors** - Authentication issues
- ❌ **Parse errors** - JSON-RPC protocol issues
- ❌ **Connection errors** - Server not starting
- ❌ **Timeout errors** - Server not responding

---

## What to Check in Inspector

### Successful Connection Should Show:

1. **Initialize Request:**
   ```json
   {
     "jsonrpc": "2.0",
     "id": 1,
     "method": "initialize",
     "params": {
       "protocolVersion": "2024-11-05",
       "capabilities": {},
       "clientInfo": {...}
     }
   }
   ```

2. **Initialize Response:**
   ```json
   {
     "jsonrpc": "2.0",
     "id": 1,
     "result": {
       "protocolVersion": "2024-11-05",
       "capabilities": {"tools": {}},
       "serverInfo": {
         "name": "box-minimal",
         "version": "1.0.4"
       }
     }
   }
   ```

3. **Tools List Response:**
   ```json
   {
     "jsonrpc": "2.0",
     "id": 2,
     "result": {
       "tools": [
         {
           "name": "box_list_folder_items",
           "description": "...",
           "inputSchema": {...}
         },
         // ... 5 more tools
       ]
     }
   }
   ```

---

## Common Issues to Look For

### Issue 1: Handshake Fails

**Symptom:** No initialize response or error response

**Possible Causes:**
- Server not starting
- Environment variables not passed correctly
- PATH not set correctly

**Check:**
- Look at stderr output in Inspector
- Verify server process started

### Issue 2: Tools Not Listed

**Symptom:** Initialize succeeds but tools/list returns empty array or error

**Possible Causes:**
- Server code error during tool registration
- JSON-RPC parsing issue

**Check:**
- Look for error messages in Inspector
- Check server logs (if visible)

### Issue 3: Authentication Errors

**Symptom:** Tools list but return auth errors when called

**Possible Causes:**
- Token invalid (but we verified it works)
- Token not passed correctly
- Box client initialization issue

**Check:**
- Token is visible in Inspector environment
- Try calling a tool directly in Inspector

---

## Testing a Tool

Once Inspector shows tools are available:

1. **Click on a tool** (e.g., `box_list_folder_items`)
2. **Enter parameters:**
   - `folder_id`: `0` (root folder)
   - `limit`: `5`
3. **Execute the tool**
4. **Check response:**
   - ✅ Should return folder items
   - ❌ Should not return authentication error

---

## Interpreting Results

### ✅ All Green = Connection Works

If Inspector shows:
- Successful initialize
- 6 tools listed
- Tools can be called successfully

**Then:** The issue is with how Cursor launches/connects to the server, not the server itself.

### ❌ Errors in Inspector = Server Issue

If Inspector shows errors:
- Handshake failures
- Tool discovery errors
- Authentication errors when calling tools

**Then:** There's an issue with the server implementation or configuration.

---

## Next Steps Based on Results

### If Inspector Shows Success:

1. **Cursor-specific issue:**
   - Check Cursor MCP logs (Cmd+Shift+U → Output → "Cursor MCP")
   - Compare how Cursor launches vs Inspector
   - Check if Cursor uses different PATH

2. **Possible fixes:**
   - Ensure PATH is set in config (already done)
   - Try absolute path to npx
   - Check Cursor's environment variable handling

### If Inspector Shows Errors:

1. **Server implementation issue:**
   - Share error details from Inspector
   - Check if Box SDK initialization fails
   - Verify environment variables are passed correctly

2. **Debug further:**
   - Check server code for issues
   - Test Box SDK directly
   - Verify token format

---

## Current Configuration (Updated)

```json
{
  "mcpServers": {
    "box-minimal": {
      "command": "npx",
      "args": ["-y", "mcp-box-minimal"],
      "env": {
        "PATH": "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin",
        "BOX_CLIENT_ID": "3xsda5fikhvgjua3s4gj7m6syr62hkty",
        "BOX_CLIENT_SECRET": "rLRTGenQG8qs60BZqC02rtD7DwwCLnzq",
        "BOX_ACCESS_TOKEN": "6hpJLIspGbp8cue0ZxVYTIcwQSjH099b"
      }
    }
  }
}
```

**Changes Made:**
- ✅ Added explicit PATH
- ✅ Removed unused BOX_DEV_TOKEN variable

---

**What to report back:**
- Does initialize handshake succeed?
- Are 6 tools discovered?
- Any errors shown?
- Can you successfully call a tool (e.g., `box_list_folder_items` with `folder_id: "0"`)?

