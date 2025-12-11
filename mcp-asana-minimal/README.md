# mcp-asana-minimal

**Minimal Asana MCP server with essential task operations (6 tools)**

A lightweight Model Context Protocol (MCP) server for Asana that provides only the essential task management tools, designed to stay under Cursor's 40-tool limit.

---

## Features

- ✅ **6 Essential Tools** - Only what you need
- ✅ **Personal Access Token Auth** - Simple authentication
- ✅ **TypeScript** - Type-safe implementation
- ✅ **Lightweight** - Minimal dependencies

---

## Tools

1. **`asana_create_task`** - Create a new task
2. **`asana_update_task`** - Update an existing task
3. **`asana_get_task`** - Get task details
4. **`asana_list_tasks`** - List tasks with filters
5. **`asana_list_projects`** - List projects in workspace(s)
6. **`asana_add_comment`** - Add comments to tasks

---

## Installation

### Get Asana Personal Access Token

1. Go to: https://app.asana.com/0/my-apps
2. Click "Create New Token" or "Personal Access Token"
3. Give it a name (e.g., "Cursor IDE Integration")
4. Copy the token

### Set Environment Variable

```bash
export ASANA_ACCESS_TOKEN="your_token_here"
```

Or add to your shell profile (`~/.zshrc` or `~/.bashrc`):
```bash
echo 'export ASANA_ACCESS_TOKEN="your_token_here"' >> ~/.zshrc
source ~/.zshrc
```

---

## Configuration

Add to your `~/.cursor/mcp.json`:

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

---

## Usage

After configuration, restart Cursor and use natural language commands:

- "Create a task in Asana called 'Review code'"
- "List my Asana tasks"
- "Update task ABC123 with status completed"
- "Get details for task XYZ789"
- "List all projects in my workspace"
- "Add a comment to task ABC123"

---

## Development

### Build

```bash
npm install
npm run build
```

### Run Locally

```bash
npm start
```

### Publish to npm

```bash
npm publish --access public
```

---

## Tool Details

### asana_create_task

Create a new task in Asana.

**Parameters:**
- `name` (required) - Task name
- `notes` (optional) - Task description
- `workspace` (optional) - Workspace GID
- `project` (optional) - Project GID
- `assignee` (optional) - Assignee GID
- `due_on` (optional) - Due date (YYYY-MM-DD)

### asana_update_task

Update an existing task.

**Parameters:**
- `task_id` (required) - Task GID
- `name` (optional) - New task name
- `notes` (optional) - New description
- `assignee` (optional) - Assignee GID (use "none" to unassign)
- `due_on` (optional) - Due date (use "none" to remove)
- `completed` (optional) - Mark as completed

### asana_get_task

Get details of a specific task.

**Parameters:**
- `task_id` (required) - Task GID

### asana_list_tasks

List tasks with optional filters.

**Parameters:**
- `project` (optional) - Filter by project GID
- `assignee` (optional) - Filter by assignee GID (use "me" for current user)
- `workspace` (optional) - Filter by workspace GID
- `completed` (optional) - Filter by completion status
- `limit` (optional) - Max results (default: 50, max: 100)

### asana_list_projects

List projects in workspace(s).

**Parameters:**
- `workspace` (optional) - Filter by workspace GID (lists all accessible projects if not provided)
- `archived` (optional) - Include archived projects (default: false)
- `limit` (optional) - Max results (default: 50, max: 100)

### asana_add_comment

Add a comment (story) to an existing task.

**Parameters:**
- `task_id` (required) - Task GID
- `text` (required) - Comment text

---

## License

MIT

---

**Created:** 2025-12-11
