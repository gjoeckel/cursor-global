# Asana MCP Connection Documentation Review Report

**Date:** 2025-12-15
**System:** macOS 26.1, Cursor IDE
**Reviewer:** AI Assistant

---

## Executive Summary

The codebase contains **multiple, conflicting** documentation files describing different methods for connecting to Asana via MCP. The **actual implementation** uses a local stdio-based server (`mcp-asana-minimal`), but several documentation files describe **SSE (Server-Sent Events)** and **alternative npm packages** that are **not currently configured**.

### Key Finding
✅ **Current Active Configuration:** Local stdio-based `mcp-asana-minimal` server
❌ **Documentation Describes:** SSE endpoint and alternative npm packages (not in use)

---

## Current Active Configuration

### Configuration Location
**File:** `~/.cursor/mcp.json`

**Active Configuration:**
```json
{
  "mcpServers": {
    "asana-minimal": {
      "command": "npx",
      "args": ["-y", "mcp-asana-minimal"],
      "env": {
        "ASANA_ACCESS_TOKEN": "2/1210006544495609/1212398888020207:d221a1678dff1a0bd619636b49b7df93"
      }
    }
  }
}
```

### Implementation Details
- **Package:** `mcp-asana-minimal` (custom package)
- **Transport:** `StdioServerTransport()` - local stdio-based communication
- **Authentication:** Personal Access Token (PAT) via `ASANA_ACCESS_TOKEN` environment variable
- **Version:** 1.0.0 (per `mcp-asana-minimal/src/index.ts`)
- **Tools:** 6 tools implemented
- **Status:** ✅ **CONNECTED** (appears in `claude mcp list` output)

---

## Documentation Files Review

### 1. `docs/ASANA-MCP-SETUP.md` ⚠️ **OUTDATED**

**Describes:** SSE (Server-Sent Events) method using Asana's official endpoint

**Configuration Shown:**
```json
{
  "asana": {
    "type": "sse",
    "url": "https://mcp.asana.com/sse"
  }
}
```

**Issues:**
- ❌ Describes OAuth authentication flow (not used)
- ❌ References `~/.mcp-auth` directory for authentication cache
- ❌ Mentions browser-based OAuth authorization
- ❌ **NOT the current configuration**

**Status:** Documentation is outdated and does not match actual implementation

---

### 2. `docs/ASANA-MCP-ALTERNATIVES.md` ⚠️ **REFERENCE ONLY**

**Describes:** Alternative npm packages if SSE method doesn't work

**Packages Mentioned:**
1. `@microagents/server-asana`
2. `@cristip73/mcp-server-asana`
3. `tiny-asana-mcp-server`

**Issues:**
- ❌ None of these are currently configured
- ❌ Documentation assumes SSE method as primary (which isn't used)
- ⚠️ May be useful as fallback options

**Status:** Reference documentation for alternatives, not current setup

---

### 3. `docs/ASANA-LOADING-TOOLS-TROUBLESHOOTING.md` ⚠️ **PARTIALLY OUTDATED**

**Describes:** Troubleshooting for "Loading Tools" status

**Issues:**
- ⚠️ References SSE connection to `mcp.asana.com`
- ⚠️ Mentions OAuth flow and browser authorization
- ⚠️ References `~/.mcp-auth` cache directory
- ✅ Some troubleshooting steps are still applicable (checking config, logs, etc.)

**Status:** Partially outdated but contains some useful troubleshooting steps

---

### 4. `mcp-asana-minimal/README.md` ✅ **ACCURATE**

**Describes:** The actual `mcp-asana-minimal` package implementation

**Key Information:**
- ✅ Correctly describes stdio-based transport
- ✅ Correctly describes Personal Access Token authentication
- ✅ Lists all 6 tools accurately
- ✅ Provides correct setup instructions
- ✅ Token acquisition URL: https://app.asana.com/0/my-apps

**Status:** ✅ **ACCURATE** - Matches actual implementation

---

### 5. `docs/ASANA-MINIMAL-IMPLEMENTATION-COMPLETE.md` ✅ **ACCURATE**

**Describes:** Implementation status of the minimal package

**Key Information:**
- ✅ Confirms 6 tools implemented
- ✅ Lists all tools correctly
- ✅ Describes capabilities accurately
- ✅ Version 1.1.0 mentioned (but code shows 1.0.0)

**Status:** ✅ **ACCURATE** (minor version discrepancy)

---

### 6. `docs/ASANA-MINIMAL-SUMMARY.md` ✅ **ACCURATE**

**Describes:** Tool set recommendation and rationale

**Status:** ✅ **ACCURATE** - Good reference for design decisions

---

## Authentication Method Comparison

### Current Implementation (Active)
- **Method:** Personal Access Token (PAT)
- **Location:** `ASANA_ACCESS_TOKEN` environment variable
- **Acquisition:** https://app.asana.com/0/my-apps
- **Storage:** Hardcoded in `~/.cursor/mcp.json` (also in `~/.zshrc`)
- **Type:** Static token (no refresh mechanism)
- **Status:** ✅ Working

### Documentation Describes (Not Used)
- **Method:** OAuth 2.0 flow
- **Location:** `~/.mcp-auth` cache directory
- **Acquisition:** Browser-based OAuth flow
- **Type:** OAuth tokens with refresh capability
- **Status:** ❌ Not implemented

---

## Connection Architecture Comparison

### Current Implementation (Active)
```
Cursor IDE → stdio pipe → mcp-asana-minimal (local process) → Asana API
```

**Characteristics:**
- Local stdio-based MCP server
- Direct parent-child process communication
- Uses `StdioServerTransport()`
- Environment variables passed directly
- ✅ **Currently working**

### Documentation Describes (Not Used)
```
Cursor IDE → HTTP/SSE → mcp.asana.com (remote server) → Asana API
```

**Characteristics:**
- Remote SSE-based server
- Network-based communication
- Uses Server-Sent Events protocol
- OAuth authentication flow
- ❌ **Not configured**

---

## Tools Available

### Current Implementation: 6 Tools ✅

1. `asana_create_task` - Create new tasks
2. `asana_update_task` - Update existing tasks
3. `asana_get_task` - Get task details
4. `asana_list_tasks` - List/search tasks with filters
5. `asana_list_projects` - List projects in workspace(s)
6. `asana_add_comment` - Add comments to tasks

**Status:** ✅ All 6 tools implemented and available

---

## Configuration Inconsistencies

### Issue 1: Multiple Configuration Methods Documented

**Problem:** Documentation describes 3+ different connection methods:
1. SSE endpoint (`mcp.asana.com`) - Not used
2. Alternative npm packages - Not used
3. Local `mcp-asana-minimal` - **Actually used**

**Impact:** Confusion about which method is active

### Issue 2: Authentication Method Mismatch

**Problem:** Documentation describes OAuth flow, but implementation uses PAT

**Impact:** Users following documentation would set up wrong authentication

### Issue 3: Version Discrepancy

**Problem:**
- `ASANA-MINIMAL-IMPLEMENTATION-COMPLETE.md` mentions version 1.1.0
- `mcp-asana-minimal/src/index.ts` shows version 1.0.0

**Impact:** Minor, but indicates documentation may be ahead of code

---

## Recommendations

### 1. Update Primary Documentation ✅ HIGH PRIORITY

**Action:** Update `docs/ASANA-MCP-SETUP.md` to reflect actual implementation:
- Remove SSE configuration examples
- Add stdio-based configuration
- Update authentication to PAT method
- Remove OAuth flow references
- Update troubleshooting for stdio-based issues

### 2. Clarify Alternative Documentation ⚠️ MEDIUM PRIORITY

**Action:** Update `docs/ASANA-MCP-ALTERNATIVES.md`:
- Add header: "Alternative Methods (Not Currently Used)"
- Explain when to use alternatives
- Keep as reference for troubleshooting

### 3. Update Troubleshooting Guide ⚠️ MEDIUM PRIORITY

**Action:** Update `docs/ASANA-LOADING-TOOLS-TROUBLESHOOTING.md`:
- Remove SSE-specific troubleshooting
- Add stdio-specific troubleshooting
- Keep general troubleshooting steps
- Update authentication cache references

### 4. Verify Version Consistency ⚠️ LOW PRIORITY

**Action:** Check if version should be 1.0.0 or 1.1.0:
- Review `mcp-asana-minimal/package.json`
- Update documentation or code to match
- Consider semantic versioning for future changes

### 5. Create Single Source of Truth ✅ HIGH PRIORITY

**Action:** Create `docs/ASANA-CONNECTION-GUIDE.md`:
- Single authoritative guide
- Link from other docs
- Keep updated with actual implementation
- Include troubleshooting

---

## Current Status Summary

### ✅ What's Working

1. **Connection:** Asana-minimal MCP server is connected and working
2. **Authentication:** Personal Access Token is configured correctly
3. **Tools:** All 6 tools are available and functional
4. **Implementation:** Local stdio-based server is properly configured

### ⚠️ What Needs Attention

1. **Documentation:** Multiple outdated docs describing unused methods
2. **Consistency:** Documentation doesn't match actual implementation
3. **Clarity:** Unclear which method is the "official" or "current" approach

### ❌ What's Not Configured

1. **SSE Method:** Not configured (but documented)
2. **Alternative Packages:** Not configured (but documented)
3. **OAuth Flow:** Not implemented (but documented)

---

## Comparison with Box Implementation

### Similarities
- Both use local stdio-based MCP servers
- Both use environment variables for authentication
- Both use `StdioServerTransport()`
- Both are custom minimal implementations

### Differences
- **Asana:** ✅ **Working** - Connected and tools available
- **Box:** ❌ **Not Working** - Process runs but doesn't connect
- **Asana:** Uses Personal Access Token (static)
- **Box:** Uses OAuth Access Token (expires, needs refresh)
- **Asana:** Token hardcoded in config
- **Box:** Token hardcoded in config (after refresh)

### Key Insight
Since Asana-minimal works with the same architecture (stdio-based), the Box issue is likely **not** an architecture problem, but something specific to:
- Box SDK initialization
- Token validation
- Error handling
- MCP handshake

---

## Conclusion

The Asana MCP connection is **working correctly** using a local stdio-based server with Personal Access Token authentication. However, **documentation is inconsistent** and describes methods that are not currently in use.

**Primary Recommendation:** Update all Asana documentation to reflect the actual stdio-based implementation and remove or clearly mark SSE/OAuth documentation as "alternative" or "not currently used."

---

**Report Generated:** 2025-12-15
**Files Reviewed:** 12 documentation files + implementation code
**Status:** Documentation needs updates to match implementation

