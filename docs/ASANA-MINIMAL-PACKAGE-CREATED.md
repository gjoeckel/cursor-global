# Asana Minimal MCP Package Created

**✅ `mcp-asana-minimal` package structure created**

---

## Package Location

`/Users/a00288946/Agents/cursor-ops/mcp-asana-minimal/`

---

## Package Structure

```
mcp-asana-minimal/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── asana-client.ts        # Asana API client wrapper
│   └── tools/
│       ├── create-task.ts     # Create task tool
│       ├── update-task.ts     # Update task tool
│       ├── get-task.ts        # Get task tool
│       └── list-tasks.ts      # List tasks tool
├── package.json
├── tsconfig.json
├── README.md
└── .npmignore
```

---

## Tools Implemented

**4 Essential Tools:**

1. **`asana_create_task`**
   - Create new tasks
   - Supports: name, notes, project, assignee, due date

2. **`asana_update_task`**
   - Update existing tasks
   - Supports: name, notes, assignee, due date, completion status

3. **`asana_get_task`**
   - Get task details
   - Returns: full task information

4. **`asana_list_tasks`**
   - List tasks with filters
   - Supports: project, assignee, workspace, completion status

---

## Authentication

Uses **Personal Access Token** (simpler than OAuth):
- Environment variable: `ASANA_ACCESS_TOKEN`
- Get token from: https://app.asana.com/0/my-apps

---

## Next Steps

### 1. Get Asana Personal Access Token

```bash
# Visit: https://app.asana.com/0/my-apps
# Create new token
# Copy token
```

### 2. Set Environment Variable

```bash
export ASANA_ACCESS_TOKEN="your_token_here"
echo 'export ASANA_ACCESS_TOKEN="your_token_here"' >> ~/.zshrc
```

### 3. Test Locally (Optional)

```bash
cd /Users/a00288946/Agents/cursor-ops/mcp-asana-minimal
npm install
npm run build
npm start
```

### 4. Publish to npm

```bash
cd /Users/a00288946/Agents/cursor-ops/mcp-asana-minimal
npm publish --access public
```

### 5. Update MCP Config

Replace Asana SSE with minimal version in `~/.cursor/mcp.json`:

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

Remove the SSE version:
```json
// Remove this:
"asana": {
  "type": "sse",
  "url": "https://mcp.asana.com/sse"
}
```

### 6. Restart Cursor

After updating config, restart Cursor to load the new server.

---

## Tool Count

- **Current setup:** 39 tools (without Asana)
- **Asana minimal:** 4 tools
- **Total:** 43 tools ❌ (exceeds 40-tool limit)

**Solution:** Need to remove 3 more tools. Options:
- Remove `playwright-minimal` (already commented out, 4 tools)
- Remove `agent-autonomy` (4 tools)
- Remove `shell-minimal` (4 tools)

**Recommended:** Remove `playwright-minimal` + `agent-autonomy` = 8 tools freed
- **New total:** 35 + 4 (Asana) = 39 tools ✅

---

## Benefits

✅ **Simpler Authentication** - Personal Access Token vs OAuth
✅ **Essential Tools Only** - 4 tools vs 10-15
✅ **Stays Under Limit** - With proper server removal
✅ **Type-Safe** - Full TypeScript implementation
✅ **Easy to Use** - Follows minimal server patterns

---

**Created:** 2025-12-11
