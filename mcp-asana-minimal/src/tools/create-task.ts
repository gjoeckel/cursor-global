import { z } from 'zod';
import { getAsanaClient } from '../asana-client.js';

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
