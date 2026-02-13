# Research Prompt: Asana MCP create-task Error

## Context
We are working with a custom MCP (Model Context Protocol) server for Asana called `mcp-asana-minimal`. The `create-task` functionality is failing with an error, preventing us from creating tasks in Asana via the MCP server.

## Problem Statement

The `asana_create_task` MCP tool is throwing the following error:
```
Error: Cannot read properties of undefined (reading 'hasOwnProperty')
```

This error occurs regardless of whether we include notes, URLs, or any optional parameters. Even creating a task with just a name and project ID fails with the same error.

## Current Implementation

### File: `mcp-asana-minimal/src/tools/create-task.ts`

The create-task implementation:

```typescript
export async function createTask(args: {
  name: string;
  notes?: string;
  workspace?: string;
  project?: string;
  assignee?: string;
  due_on?: string;
}) {
  const client = getAsanaClient();

  const taskData: any = {
    name: args.name,
  };

  if (args.notes) {
    taskData.notes = args.notes;
  }

  if (args.workspace) {
    taskData.workspace = args.workspace;
  }

  if (args.project) {
    taskData.projects = [args.project];
  }

  if (args.assignee) {
    taskData.assignee = args.assignee;
  }

  if (args.due_on) {
    taskData.due_on = args.due_on;
  }

  const task = await new Promise((resolve, reject) => {
    client.tasks.createTask(taskData, {}, (error: any, data: any) => {
      if (error) reject(error);
      else resolve(data);
    });
  });

  const taskDataResult = (task as any).data;

  return {
    task_id: taskDataResult.gid,
    name: taskDataResult.name,
    notes: taskDataResult.notes || '',
    created_at: taskDataResult.created_at,
  };
}
```

### File: `mcp-asana-minimal/src/asana-client.ts`

The Asana client initialization:

```typescript
import * as Asana from 'asana';

let client: any = null;
let clientInitialized = false;

export function getAsanaClient(): any {
  if (!clientInitialized) {
    const token = process.env.ASANA_ACCESS_TOKEN;
    if (!token) {
      throw new Error(
        'ASANA_ACCESS_TOKEN environment variable is required. ' +
        'Get your token from: https://app.asana.com/0/my-apps'
      );
    }

    // Initialize the ApiClient instance (using any to bypass type issues)
    const AsanaAny = Asana as any;
    const apiClient = AsanaAny.ApiClient.instance;

    // Configure authentication with Personal Access Token
    // For PAT, we use the 'oauth2' authentication method
    const auth = apiClient.authentications['oauth2'];
    auth.accessToken = token;

    // Create a client object with API instances
    client = {
      apiClient,
      tasks: new AsanaAny.TasksApi(),
      projects: new AsanaAny.ProjectsApi(),
      users: new AsanaAny.UsersApi(),
      workspaces: new AsanaAny.WorkspacesApi(),
      stories: new AsanaAny.StoriesApi(),
    };

    clientInitialized = true;
  }
  return client;
}
```

### Working Examples

For comparison, here are other tools that ARE working:

**get-task.ts** (working):
```typescript
const task = await new Promise((resolve, reject) => {
  client.tasks.getTask(args.task_id, {
    opt_fields: ['name', 'notes', 'completed', 'due_on', 'created_at', 'modified_at', 'assignee', 'projects', 'workspace'],
  }, (error: any, data: any) => {
    if (error) reject(error);
    else resolve(data);
  });
});
```

**update-task.ts** (working):
```typescript
const task = await new Promise((resolve, reject) => {
  client.tasks.updateTask(updateData, args.task_id, {}, (error: any, data: any) => {
    if (error) reject(error);
    else resolve(data);
  });
});
```

**add-comment.ts** (working):
```typescript
const story = await new Promise((resolve, reject) => {
  client.stories.createStoryForTask({
    text: args.text,
  }, args.task_id, {
    opt_fields: ['gid', 'text', 'created_at', 'created_by'],
  }, (error: any, data: any) => {
    if (error) reject(error);
    else resolve(data);
  });
});
```

## What We've Tried

1. **Initial approach**: Passed `taskData` directly as first parameter
   - Result: Error persisted

2. **Wrapped data**: Changed to `client.tasks.createTask({ data: taskData }, {}, callback)`
   - Result: Error persisted

3. **Removed wrapper**: Changed back to `client.tasks.createTask(taskData, {}, callback)`
   - Result: Error persisted

4. **Simplified test**: Tried creating task with only `name` and `project` (no notes, no optional fields)
   - Result: Same error

5. **Verified MCP connectivity**: Tested `list-tasks` and `get-task` - both work fine
   - Result: Confirms MCP server is running and authenticated correctly

## Environment Details

- **Package**: `asana` npm package (version unknown, need to check)
- **Authentication**: Personal Access Token (PAT) via `ASANA_ACCESS_TOKEN` environment variable
- **API Pattern**: Using OpenAPI-generated client (Asana.ApiClient.instance)
- **Transport**: Callback-based API calls (not Promise-based)
- **Node.js**: v24.9.0
- **MCP Server**: stdio-based server using @modelcontextprotocol/sdk

## Research Questions

1. **What is the correct signature for `TasksApi.createTask()` in the Asana OpenAPI-generated client?**
   - What parameters does it expect?
   - What is the correct order and format of parameters?
   - Does it use callbacks or Promises?

2. **Why does `updateTask(updateData, taskId, {}, callback)` work but `createTask(taskData, {}, callback)` fail?**
   - What's the difference in how these methods are called?
   - Are the parameter signatures different?

3. **What does the "Cannot read properties of undefined (reading 'hasOwnProperty')" error indicate?**
   - Where in the Asana client code might this check occur?
   - What object is undefined that should be defined?

4. **Is there a different Asana npm package or client library that should be used?**
   - Are we using the correct package?
   - Is there an official Asana Node.js SDK that would be better?

5. **What is the correct way to create a task using the Asana OpenAPI client?**
   - Are there examples in the Asana documentation?
   - What does the actual API endpoint expect?

6. **How do other successful MCP servers implement Asana task creation?**
   - Are there working examples we can reference?
   - What patterns do they use?

## Expected Outcome

Please provide:
1. **Root cause analysis** of why `createTask` is failing
2. **Corrected implementation** that matches the working patterns of `updateTask` and `getTask`
3. **Explanation** of the correct Asana API client usage pattern
4. **Verification steps** to confirm the fix works
5. **Any alternative approaches** if the current client library is problematic

## Additional Context

- The error occurs before the callback is invoked, suggesting it's happening during the API call setup, not in the response handling
- All other MCP tools (list-tasks, get-task, update-task, add-comment, list-projects) work correctly
- Authentication is working (verified via successful list-tasks calls)
- The project ID format is correct (verified via list-tasks showing tasks in the project)

## Priority

**HIGH** - This is blocking task creation functionality in the MCP server, which is a core feature needed for the project.

