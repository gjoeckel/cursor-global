# Asana MCP Tools Discovery

**After restarting Cursor, document all available Asana tools here**

---

## How to Check Asana Tools

### Method 1: Cursor Settings UI

1. Open Cursor Settings (`Cmd+,`)
2. Search for "MCP" or navigate to **Developer → MCP Tools**
3. Find **"asana"** in the server list
4. Expand it to see all available tools
5. Copy the tool names and descriptions

### Method 2: Ask Cursor AI

In Cursor's chat, try:
- "List all available Asana MCP tools"
- "What tools does the Asana MCP server provide?"
- "Show me the Asana MCP tool list"

### Method 3: MCP Panel

1. Open Cursor's MCP panel (if available)
2. Look for Asana server
3. View tool list

---

## Tool Documentation Template

**Total Tools Found: ___**

### Tool 1
- **Name:** `_________________`
- **Description:** _________________
- **Parameters:** _________________
- **Essential?** [ ] Yes  [ ] No

### Tool 2
- **Name:** `_________________`
- **Description:** _________________
- **Parameters:** _________________
- **Essential?** [ ] Yes  [ ] No

### Tool 3
- **Name:** `_________________`
- **Description:** _________________
- **Parameters:** _________________
- **Essential?** [ ] Yes  [ ] No

... (continue for all tools)

---

## Expected Tools (Based on Research)

You might see tools like:

- Task operations:
  - `asana_create_task` / `create_task`
  - `asana_update_task` / `update_task`
  - `asana_get_task` / `get_task`
  - `asana_list_tasks` / `list_tasks`
  - `asana_search_tasks` / `search_tasks`

- Project operations:
  - `asana_create_project` / `create_project`
  - `asana_update_project` / `update_project`
  - `asana_get_project` / `get_project`
  - `asana_list_projects` / `list_projects`

- Other operations:
  - `asana_add_comment` / `add_comment`
  - `asana_get_user` / `get_user`
  - Workspace operations
  - Section operations
  - Tag operations

---

## After Documenting

Once you have the complete list:

1. **Share it here** (paste the tool list)
2. I'll **identify essential tools** (target: 4-6 tools)
3. I'll **create the minimal package** structure
4. I'll **implement the minimal server**
5. I'll **publish to npm** as `mcp-asana-minimal`

---

**Target:** Select 4-6 essential tools for minimal version to stay under 40-tool limit.
