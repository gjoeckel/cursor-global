import { getAsanaClient } from '../asana-client.js';

export const getTaskSchema = {
  name: 'asana_get_task',
  description: 'Get details of a specific task in Asana',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task GID (required)',
      },
    },
    required: ['task_id'],
  },
};

export async function getTask(args: { task_id: string }) {
  const client = getAsanaClient();

  const task = await new Promise((resolve, reject) => {
    client.tasks.getTask(args.task_id, {
      opt_fields: ['name', 'notes', 'completed', 'due_on', 'created_at', 'modified_at', 'assignee', 'projects', 'workspace'],
    }, (error: any, data: any) => {
      if (error) reject(error);
      else resolve(data);
    });
  });

  const taskData = (task as any).data;

  return {
    task_id: taskData.gid,
    name: taskData.name,
    notes: taskData.notes || '',
    completed: taskData.completed || false,
    due_on: taskData.due_on || null,
    created_at: taskData.created_at,
    modified_at: taskData.modified_at,
    assignee: taskData.assignee ? {
      gid: taskData.assignee.gid,
      name: taskData.assignee.name,
    } : null,
    projects: taskData.projects?.map((p: any) => ({
      gid: p.gid,
      name: p.name,
    })) || [],
    workspace: taskData.workspace ? {
      gid: taskData.workspace.gid,
      name: taskData.workspace.name,
    } : null,
  };
}
