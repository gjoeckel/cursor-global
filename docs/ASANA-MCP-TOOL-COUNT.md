# Asana MCP Tool Count Analysis

**Critical: Tool limit consideration for Asana MCP integration**

---

## Current Tool Count

**Status:** 39/40 tools configured (1 remaining)

| Server | Tools |
|--------|-------|
| filesystem | 15 |
| memory | 8 |
| github-minimal | 4 |
| shell-minimal | 4 |
| playwright-minimal | 4 |
| agent-autonomy | 4 |
| **Total** | **39** |

---

## Asana MCP Tool Estimates

### Official Asana SSE (mcp.asana.com/sse)

**Estimated: 10-15+ tools**

Typical capabilities:
- Create task
- Update task
- Get task
- List tasks
- Search tasks
- Create project
- Update project
- Get project
- List projects
- Add comment to task
- Get user information
- Workspace operations
- Section operations
- Tag operations
- Custom field operations

### Alternative npm Packages

| Package | Estimated Tools |
|---------|----------------|
| `tiny-asana-mcp-server` | ~6 tools |
| `@microagents/server-asana` | ~15+ tools |
| `@cristip73/mcp-server-asana` | ~10-15 tools |
| Zapier Asana MCP | ~10+ tools |
| CData Asana MCP | ~20+ tools |

---

## Problem: Tool Limit Exceeded

**Current:** 39 tools
**Asana SSE:** ~10-15 tools
**Total:** ~49-54 tools
**Limit:** 40 tools

**Result:** ❌ Would exceed limit by 9-14 tools

---

## Solutions

### Option 1: Remove Servers to Make Room

**Remove playwright-minimal (4 tools):**
- Remaining: 35 tools
- Add Tiny Asana (6 tools): 41 tools ❌ (still exceeds)
- Add Asana SSE (10 tools): 45 tools ❌ (still exceeds)

**Remove playwright-minimal + agent-autonomy (8 tools):**
- Remaining: 31 tools
- Add Tiny Asana (6 tools): 37 tools ✅
- Add Asana SSE (10 tools): 41 tools ❌ (still exceeds)

**Remove playwright-minimal + agent-autonomy + shell-minimal (12 tools):**
- Remaining: 27 tools
- Add Tiny Asana (6 tools): 33 tools ✅
- Add Asana SSE (10 tools): 37 tools ✅

### Option 2: Use Minimal Asana Package

Use `tiny-asana-mcp-server` instead of official SSE:
- Only 6 tools (vs 10-15)
- Requires removing 2 servers (8 tools) to fit
- More limited functionality

### Option 3: Don't Use Asana MCP

- Use Asana web UI directly
- Use Asana API scripts outside of MCP
- Keep current 39-tool setup intact

---

## Recommendation

**Best approach:** Remove 3 servers to make room for Asana SSE

**Remove:**
1. `playwright-minimal` (4 tools) - Browser automation, less critical
2. `agent-autonomy` (4 tools) - Workflow automation, less critical
3. `shell-minimal` (4 tools) - Shell commands, less critical

**Result:**
- Remaining: 27 tools
- Add Asana SSE: 37 tools ✅
- Under 40-tool limit with room to spare

**Keep:**
- `filesystem` (15 tools) - Essential
- `memory` (8 tools) - Essential
- `github-minimal` (4 tools) - Essential for this project

---

## Implementation

If you want to proceed with Asana integration:

1. **Backup current config:**
   ```bash
   cp ~/.cursor/mcp.json ~/.cursor/mcp.json.backup
   ```

2. **Remove servers:**
   - Edit `~/.cursor/mcp.json`
   - Remove `playwright-minimal`, `agent-autonomy`, and `shell-minimal`

3. **Keep Asana SSE configuration:**
   ```json
   {
     "asana": {
       "type": "sse",
       "url": "https://mcp.asana.com/sse"
     }
   }
   ```

4. **Restart Cursor**

5. **Verify tool count:**
   - Should be ~37 tools (under limit)

---

**Created:** 2025-12-11
