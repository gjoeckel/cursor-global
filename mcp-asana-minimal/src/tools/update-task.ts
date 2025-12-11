import { getAsanaClient } from '../asana-client.js';

export const updateTaskSchema = {
  name: 'asana_update_task',
  description: 'Update an existing task in Asana',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task GID (required)',
      },
      name: {
        type: 'string',
        description: 'New task name (optional)',
      },
      notes: {
        type: 'string',
        description: 'New task description/notes (optional)',
      },
      assignee: {
        type: 'string',
        description: 'Assignee GID (optional, use "none" to unassign)',
      },
      due_on: {
        type: 'string',
        description: 'Due date in YYYY-MM-DD format (optional, use "none" to remove)',
      },
      completed: {
        type: 'boolean',
        description: 'Mark task as completed (optional)',
      },
    },
    required: ['task_id'],
  },
};

export async function updateTask(args: {
  task_id: string;
  name?: string;
  notes?: string;
  assignee?: string;
  due_on?: string;
  completed?: boolean;
}) {
  const client = getAsanaClient();

  const updateData: any = {};

  if (args.name !== undefined) {
    updateData.name = args.name;
  }

  if (args.notes !== undefined) {
    updateData.notes = args.notes;
  }

  if (args.assignee !== undefined) {
    updateData.assignee = args.assignee === 'none' ? null : args.assignee;
  }

  if (args.due_on !== undefined) {
    updateData.due_on = args.due_on === 'none' ? null : args.due_on;
  }

  if (args.completed !== undefined) {
    updateData.completed = args.completed;
  }

  const task = await new Promise((resolve, reject) => {
    client.tasks.updateTask(updateData, args.task_id, {}, (error: any, data: any) => {
      if (error) reject(error);
      else resolve(data);
    });
  });

  const taskData = (task as any).data;

  return {
    task_id: taskData.gid,
    name: taskData.name,
    notes: taskData.notes || '',
    completed: taskData.completed,
    due_on: taskData.due_on || null,
    updated_at: taskData.modified_at,
  };
}
