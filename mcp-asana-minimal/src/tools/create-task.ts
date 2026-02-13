import { z } from 'zod';

export const createTaskSchema = {
  name: 'asana_create_task',
  description: 'Create a new task in Asana',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Task name (required)',
      },
      notes: {
        type: 'string',
        description: 'Task description/notes (optional)',
      },
      workspace: {
        type: 'string',
        description: 'Workspace GID (optional, uses default if not provided)',
      },
      project: {
        type: 'string',
        description: 'Project GID to add task to (optional)',
      },
      assignee: {
        type: 'string',
        description: 'Assignee GID (optional)',
      },
      due_on: {
        type: 'string',
        description: 'Due date in YYYY-MM-DD format (optional)',
      },
      section: {
        type: 'string',
        description: 'Section GID to add task to (optional, requires project)',
      },
    },
    required: ['name'],
  },
};

export async function createTask(args: {
  name: string;
  notes?: string;
  workspace?: string;
  project?: string;
  assignee?: string;
  due_on?: string;
  section?: string;
}) {
  const token = process.env.ASANA_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'ASANA_ACCESS_TOKEN environment variable is required. ' +
      'Get your token from: https://app.asana.com/0/my-apps'
    );
  }

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

    // If section is specified, use memberships to add task to specific section
    if (args.section) {
      taskData.memberships = [
        {
          project: args.project,
          section: args.section,
        },
      ];
    }
  }

  if (args.assignee) {
    taskData.assignee = args.assignee;
  }

  if (args.due_on) {
    taskData.due_on = args.due_on;
  }

  // CRITICAL: Wrap in { data: {...} }
  const body = { data: taskData };

  try {
    // Use fetch for reliable promise-based HTTP requests
    const response = await fetch('https://app.asana.com/api/1.0/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json() as { data: any };
    const taskDataResult = result.data;

    return {
      task_id: taskDataResult.gid,
      name: taskDataResult.name,
      notes: taskDataResult.notes || '',
      created_at: taskDataResult.created_at,
      section: args.section || null,
    };
  } catch (error: any) {
    throw new Error(`Failed to create task: ${error.message}`);
  }
}
