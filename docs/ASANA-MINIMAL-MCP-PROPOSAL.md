# Custom Minimal Asana MCP Server Proposal

**Plan to create `mcp-asana-minimal` package with only essential tools**

---

## Problem

- **Asana SSE:** Provides ~10-15 tools
- **Current setup:** 39 tools + Asana = exceeds 40-tool limit
- **Solution:** Create minimal version with only essential tools (4-6 tools)

---

## Plan

### Phase 1: Discovery

1. **Restart Cursor IDE** to activate Asana MCP
2. **Check available tools** via Cursor Settings → MCP
3. **Document all 10-15 Asana tools** available
4. **Identify essential tools** needed for workflow

### Phase 2: Design

**Target:** 4-6 tools (similar to other minimal servers)

**Likely Essential Tools:**
- `asana_create_task` - Create new task
- `asana_update_task` - Update existing task
- `asana_get_task` - Get task details
- `asana_list_tasks` - List tasks (with filters)
- `asana_search_tasks` - Search tasks (optional)

**Tools to Exclude:**
- Project management (if not essential)
- Workspace operations
- User management
- Advanced filtering
- Bulk operations

### Phase 3: Implementation

**Package Name:** `mcp-asana-minimal`

**Structure:**
```
mcp-asana-minimal/
├── src/
│   ├── index.ts          # Main server implementation
│   ├── tools/
│   │   ├── create-task.ts
│   │   ├── update-task.ts
│   │   ├── get-task.ts
│   │   └── list-tasks.ts
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

**Dependencies:**
- `@modelcontextprotocol/sdk` - MCP SDK
- `asana` - Asana API client
- `typescript` - TypeScript support

**Authentication:**
- Use Asana Personal Access Token
- Environment variable: `ASANA_ACCESS_TOKEN`

### Phase 4: Publishing

1. **Create repository** (or use existing my-mcp-servers repo)
2. **Follow existing minimal server patterns**
3. **Publish to npm** as `mcp-asana-minimal`
4. **Update documentation**

### Phase 5: Integration

**Update `~/.cursor/mcp.json`:**
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

**Remove:**
- Official Asana SSE server (too many tools)

---

## Comparison

| Server | Tools | Purpose |
|--------|-------|---------|
| Asana SSE (official) | ~10-15 | Full Asana API |
| **mcp-asana-minimal** | **4-6** | **Essential task operations only** |

---

## Next Steps

1. ✅ Restart Cursor to see actual Asana tools
2. ⏳ Document all available tools
3. ⏳ Select essential tools (4-6)
4. ⏳ Create package structure
5. ⏳ Implement minimal server
6. ⏳ Test locally
7. ⏳ Publish to npm
8. ⏳ Update MCP config

---

## Reference: Existing Minimal Servers

**Pattern to follow:**
- `mcp-github-minimal` - 4 tools
- `mcp-shell-minimal` - 4 tools
- `mcp-playwright-minimal` - 4 tools
- `mcp-agent-autonomy` - 4 tools

**Structure:**
- Simple, focused tool set
- Minimal dependencies
- Easy to install via npx
- Environment variable for auth

---

**Created:** 2025-12-11
