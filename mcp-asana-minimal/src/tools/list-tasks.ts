import { getAsanaClient } from '../asana-client.js';

export const listTasksSchema = {
  name: 'asana_list_tasks',
  description: 'List tasks in Asana, optionally filtered by project, assignee, or workspace',
  inputSchema: {
    type: 'object',
    properties: {
      project: {
        type: 'string',
        description: 'Project GID to filter tasks (optional)',
      },
      assignee: {
        type: 'string',
        description: 'Assignee GID to filter tasks, or "me" for current user (optional)',
      },
      workspace: {
        type: 'string',
        description: 'Workspace GID to filter tasks (optional)',
      },
      completed: {
        type: 'boolean',
        description: 'Filter by completion status (optional)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of tasks to return (default: 50, max: 100)',
      },
    },
  },
};

export async function listTasks(args: {
  project?: string;
  assignee?: string;
  workspace?: string;
  completed?: boolean;
  limit?: number;
}) {
  const client = getAsanaClient();

  const limit = Math.min(args.limit || 50, 100);

  let tasks: any[] = [];

  if (args.project) {
    // List tasks in a specific project
    const projectTasks = await new Promise((resolve, reject) => {
      client.tasks.getTasksForProject(args.project, {
        opt_fields: ['name', 'notes', 'completed', 'due_on', 'assignee'],
        limit,
      }, (error: any, data: any) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
    tasks = (projectTasks as any).data || [];
  } else if (args.assignee) {
    // List tasks assigned to a user
    let assigneeGid = args.assignee;
    if (args.assignee === 'me') {
      const user = await new Promise((resolve, reject) => {
        client.users.getUser('me', {}, (error: any, data: any) => {
          if (error) reject(error);
          else resolve(data);
        });
      });
      assigneeGid = (user as any).data.gid;
    }

    const userTasks = await new Promise((resolve, reject) => {
      client.tasks.getTasks({
        assignee: assigneeGid,
        opt_fields: ['name', 'notes', 'completed', 'due_on', 'assignee'],
        limit,
      }, (error: any, data: any) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
    tasks = (userTasks as any).data || [];
  } else if (args.workspace) {
    // List tasks in a workspace
    const workspaceTasks = await new Promise((resolve, reject) => {
      client.tasks.getTasks({
        workspace: args.workspace,
        opt_fields: ['name', 'notes', 'completed', 'due_on', 'assignee'],
        limit,
      }, (error: any, data: any) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
    tasks = (workspaceTasks as any).data || [];
  } else {
    // List all tasks for the authenticated user
    const user = await new Promise((resolve, reject) => {
      client.users.getUser('me', {}, (error: any, data: any) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
    const userTasks = await new Promise((resolve, reject) => {
      client.tasks.getTasks({
        assignee: (user as any).data.gid,
        opt_fields: ['name', 'notes', 'completed', 'due_on', 'assignee'],
        limit,
      }, (error: any, data: any) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
    tasks = (userTasks as any).data || [];
  }

  // Filter by completion status if specified
  if (args.completed !== undefined) {
    tasks = tasks.filter(task => task.completed === args.completed);
  }

  return {
    tasks: tasks.map(task => ({
      task_id: task.gid,
      name: task.name,
      notes: task.notes || '',
      completed: task.completed || false,
      due_on: task.due_on || null,
      assignee: task.assignee ? {
        gid: task.assignee.gid,
        name: task.assignee.name,
      } : null,
    })),
    count: tasks.length,
  };
}
