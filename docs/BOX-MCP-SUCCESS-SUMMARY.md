# Box MCP Connection Success - What Changed & How to Ensure Persistence

**Date:** 2025-12-15
**Status:** ✅ WORKING

---

## What Changed That Made It Work

### 1. ✅ Added Explicit PATH Environment Variable

**Before:**
```json
{
  "env": {
    "BOX_CLIENT_ID": "...",
    "BOX_CLIENT_SECRET": "...",
    "BOX_ACCESS_TOKEN": "..."
  }
}
```

**After:**
```json
{
  "env": {
    "PATH": "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin",
    "BOX_CLIENT_ID": "...",
    "BOX_CLIENT_SECRET": "...",
    "BOX_ACCESS_TOKEN": "..."
  }
}
```

**Why This Mattered:**
- Cursor launched via Spotlight/Finder doesn't inherit shell PATH
- Without explicit PATH, `npx` couldn't be found
- Adding explicit PATH ensures Cursor can locate `npx`

### 2. ✅ Removed Unused BOX_DEV_TOKEN Variable

**Before:**
```json
{
  "env": {
    "BOX_DEV_TOKEN": "${BOX_DEV_TOKEN}",
    ...
  }
}
```

**After:**
```json
{
  "env": {
    // BOX_DEV_TOKEN removed
    ...
  }
}
```

**Why This Mattered:**
- Variable expansion `${BOX_DEV_TOKEN}` could cause issues if undefined
- Not needed since we're using BOX_ACCESS_TOKEN
- Cleaner configuration

### 3. ✅ Valid OAuth Token

**Previous Issue:** Token had expired

**Solution:** Refreshed token using:
```bash
node mcp-box-minimal/scripts/get-oauth-token.js
```

**Result:** New valid token stored in `~/.cursor/mcp.json`

---

## Current Working Configuration

**File:** `~/.cursor/mcp.json`

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

**Key Elements:**
- ✅ Explicit PATH
- ✅ All required Box credentials
- ✅ Valid access token
- ✅ No unused variables

---

## How to Ensure It Stays Available

### 1. ✅ Configuration Persists Automatically

The configuration in `~/.cursor/mcp.json` **persists automatically**:
- ✅ Survives Cursor restarts
- ✅ Available in new chat sessions
- ✅ Global configuration (applies to all projects)

**No action needed** - the config file persists.

### 2. ⚠️ Token Expiration - Need to Refresh Periodically

**Issue:** Box OAuth access tokens expire

**Solution:** When token expires, refresh it:

```bash
cd /Users/a00288946/Agents/cursor-ops
node mcp-box-minimal/scripts/get-oauth-token.js
```

**Then update `~/.cursor/mcp.json`** with the new token value.

**How to Know Token Expired:**
- Tools start returning authentication errors
- Box API calls fail with 401/403
- Error messages mention "expired" or "invalid token"

### 3. ✅ PATH Persists

The explicit PATH in the config will persist - no action needed.

**However:** If you move `npx` to a different location, update PATH accordingly.

### 4. ✅ Package Availability

The `mcp-box-minimal` package is installed via `npx -y`, which:
- ✅ Auto-installs on first use
- ✅ Uses cached version if available
- ✅ Updates automatically if needed

No action needed for package persistence.

---

## Verification Checklist

After any changes, verify:

### 1. Check Configuration File
```bash
cat ~/.cursor/mcp.json | grep -A 8 "box-minimal"
```

Should show:
- ✅ PATH environment variable
- ✅ All Box credentials present
- ✅ Valid token (if recently refreshed)

### 2. Restart Cursor
1. Quit Cursor completely (`Cmd+Q`)
2. Reopen Cursor
3. Check if tools are available

### 3. Test Tool Availability
In Cursor chat, try:
- "List files in Box folder 0"
- Or use a specific folder ID you know exists

### 4. Check Cursor MCP Logs (if issues)
- `Cmd+Shift+U` → Output panel
- Select "Cursor MCP" or similar
- Look for "Found 6 tools" message

---

## Persistence Guarantees

### ✅ Will Persist After:
- ✅ Cursor restart
- ✅ New chat sessions
- ✅ System reboot
- ✅ macOS updates (unless PATH changes)

### ⚠️ Needs Action When:
- ⚠️ Token expires (refresh token, update config)
- ⚠️ Box credentials change (update config)
- ⚠️ `npx` location changes (update PATH)

---

## Backup Recommendation

Consider backing up your working configuration:

```bash
# Backup current working config
cp ~/.cursor/mcp.json ~/.cursor/mcp.json.backup
```

Or store the box-minimal section separately:

```bash
# Extract box-minimal config
grep -A 10 "box-minimal" ~/.cursor/mcp.json > ~/box-mcp-config.json
```

---

## Troubleshooting If It Stops Working

### Symptom: Tools not available after restart

1. **Check config file:**
   ```bash
   cat ~/.cursor/mcp.json | grep -A 8 "box-minimal"
   ```

2. **Check if PATH is still correct:**
   ```bash
   which npx
   # Should be /usr/local/bin/npx or /opt/homebrew/bin/npx
   # Update PATH in config if different
   ```

3. **Check token validity:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api.box.com/2.0/users/me
   # Should return HTTP 200
   ```

4. **Check Cursor logs:**
   - Look for connection errors
   - Check if tools are discovered

### Symptom: Authentication errors

1. **Refresh token:**
   ```bash
   node mcp-box-minimal/scripts/get-oauth-token.js
   ```

2. **Update config with new token**

3. **Restart Cursor**

---

## Summary

### What Made It Work:
1. ✅ Added explicit PATH environment variable
2. ✅ Removed unused BOX_DEV_TOKEN variable
3. ✅ Valid OAuth token

### Persistence:
- ✅ Config file persists automatically
- ⚠️ Token needs periodic refresh (when expired)
- ✅ PATH persists (unless system changes)

### Maintenance:
- Monitor for token expiration
- Refresh token when needed
- Update config with new token
- Restart Cursor after token updates

---

**Status:** ✅ Working and configured for persistence
**Next Token Refresh:** When current token expires (check Box API responses)

