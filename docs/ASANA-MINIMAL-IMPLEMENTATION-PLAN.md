# Asana Minimal MCP Implementation Plan

**Step-by-step plan to create `mcp-asana-minimal` package**

---

## Current Status

- ✅ Playwright commented out (4 tools freed)
- ✅ Asana SSE configured in `~/.cursor/mcp.json`
- ⏳ Need to restart Cursor to see actual tools
- ⏳ Need to identify essential tools
- ⏳ Need to create minimal package

---

## Phase 1: Discovery (After Cursor Restart)

### Steps

1. **Restart Cursor IDE**
   ```bash
   # Quit Cursor completely
   # Reopen Cursor
   ```

2. **Check Asana Tools**
   - Go to: Cursor Settings → MCP
   - Find Asana server
   - List all available tools
   - Count exact number

3. **Document Tools**
   Create a list of all Asana tools:
   - Tool name
   - Description
   - Parameters
   - Use case
   - Essential? (Yes/No)

### Expected Tools (Based on Research)

Likely to see:
- `asana_create_task` - Create new task
- `asana_update_task` - Update existing task
- `asana_get_task` - Get task details
- `asana_list_tasks` - List tasks
- `asana_search_tasks` - Search tasks
- `asana_create_project` - Create project
- `asana_update_project` - Update project
- `asana_get_project` - Get project
- `asana_list_projects` - List projects
- `asana_add_comment` - Add comment to task
- `asana_get_user` - Get user info
- And possibly more...

---

## Phase 2: Tool Selection

### Criteria for Essential Tools

**Must Have:**
- Core task operations (create, update, get)
- Task listing/searching

**Nice to Have:**
- Project operations (if frequently used)
- Comment operations (if needed)

**Exclude:**
- Workspace management
- User management
- Advanced filtering
- Bulk operations
- Administrative functions

### Target Selection

**Goal:** 4-6 tools (matching other minimal servers)

**Recommended Essential Set:**
1. `asana_create_task` - Create new task
2. `asana_update_task` - Update existing task
3. `asana_get_task` - Get task details
4. `asana_list_tasks` - List tasks with filters
5. `asana_search_tasks` - Search tasks (optional, if needed)

**Total: 4-5 tools** ✅

---

## Phase 3: Implementation

### Package Structure

```
mcp-asana-minimal/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── tools/
│   │   ├── create-task.ts    # Create task tool
│   │   ├── update-task.ts    # Update task tool
│   │   ├── get-task.ts       # Get task tool
│   │   └── list-tasks.ts     # List/search tasks tool
│   ├── asana-client.ts        # Asana API client wrapper
│   └── types.ts              # TypeScript types
├── package.json
├── tsconfig.json
├── README.md
└── .npmignore
```

### Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "asana": "^2.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Implementation Pattern

Follow `mcp-github-minimal` pattern:

1. **Server Setup** (`src/index.ts`)
   ```typescript
   import { Server } from '@modelcontextprotocol/sdk/server/index.js';
   import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
   import { createTaskTool } from './tools/create-task.js';
   // ... other tools

   const server = new Server({
     name: 'asana-minimal',
     version: '1.0.0',
   }, {
     capabilities: {
       tools: {},
     },
   });

   // Register tools
   server.setRequestHandler(ListToolsRequestSchema, async () => ({
     tools: [
       createTaskTool,
       updateTaskTool,
       getTaskTool,
       listTasksTool,
     ],
   }));
   ```

2. **Tool Implementation** (`src/tools/create-task.ts`)
   ```typescript
   import { z } from 'zod';
   import { asanaClient } from '../asana-client.js';

   export const createTaskTool = {
     name: 'asana_create_task',
     description: 'Create a new task in Asana',
     inputSchema: {
       type: 'object',
       properties: {
         name: { type: 'string', description: 'Task name' },
         project: { type: 'string', description: 'Project GID (optional)' },
         assignee: { type: 'string', description: 'Assignee GID (optional)' },
         due_on: { type: 'string', description: 'Due date (optional)' },
         notes: { type: 'string', description: 'Task notes (optional)' },
       },
       required: ['name'],
     },
   };

   export async function createTask(args: any) {
     const client = asanaClient();
     const task = await client.tasks.createTask({
       data: {
         name: args.name,
         projects: args.project ? [args.project] : undefined,
         assignee: args.assignee,
         due_on: args.due_on,
         notes: args.notes,
       },
     });
     return { task_id: task.gid, name: task.name };
   }
   ```

3. **Asana Client** (`src/asana-client.ts`)
   ```typescript
   import Asana from 'asana';

   let client: Asana.Client | null = null;

   export function asanaClient(): Asana.Client {
     if (!client) {
       const token = process.env.ASANA_ACCESS_TOKEN;
       if (!token) {
         throw new Error('ASANA_ACCESS_TOKEN environment variable required');
       }
       client = Asana.Client.create({ auth: token });
     }
     return client;
   }
   ```

---

## Phase 4: Publishing

### Steps

1. **Create Repository**
   - Add to `my-mcp-servers` monorepo
   - Or create separate repo

2. **Package Configuration** (`package.json`)
   ```json
   {
     "name": "mcp-asana-minimal",
     "version": "1.0.0",
     "description": "Minimal Asana MCP server with essential task operations",
     "main": "dist/index.js",
     "bin": {
       "mcp-asana-minimal": "./dist/index.js"
     },
     "scripts": {
       "build": "tsc",
       "start": "node dist/index.js"
     }
   }
   ```

3. **Publish to npm**
   ```bash
   npm publish --access public
   ```

4. **Update Documentation**
   - Add to my-mcp-servers README
   - Update tool count documentation

---

## Phase 5: Integration

### Update MCP Config

Replace Asana SSE with minimal version:

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

### Final Tool Count

- filesystem: 15 tools
- memory: 8 tools
- github-minimal: 4 tools
- shell-minimal: 4 tools
- agent-autonomy: 4 tools
- asana-minimal: 4-5 tools
- **Total: 39-40 tools** ✅

---

## Next Steps

1. **Restart Cursor** to see actual Asana tools
2. **Document tools** - List all 10+ tools
3. **Select essential** - Choose 4-6 tools
4. **Create package** - Follow github-minimal pattern
5. **Test locally** - Verify functionality
6. **Publish to npm** - Make available
7. **Update config** - Use minimal version

---

**Created:** 2025-12-11
