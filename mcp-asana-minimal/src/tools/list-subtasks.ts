export const listSubtasksSchema = {
  name: 'asana_list_subtasks',
  description: 'List all subtasks of a task',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'The GID of the parent task',
      },
    },
    required: ['task_id'],
  },
};

export async function listSubtasks(args: {
  task_id: string;
}) {
  const token = process.env.ASANA_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'ASANA_ACCESS_TOKEN environment variable is required. ' +
      'Get your token from: https://app.asana.com/0/my-apps'
    );
  }

  try {
    // Use fetch for reliable promise-based HTTP requests
    // API endpoint: GET /tasks/{task_gid}/subtasks
    const response = await fetch(
      `https://app.asana.com/api/1.0/tasks/${args.task_id}/subtasks?opt_fields=name,completed,due_on,assignee,assignee.name`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json() as { data: any[] };
    const subtasks = result.data.map((subtask: any) => ({
      subtask_id: subtask.gid,
      name: subtask.name,
      completed: subtask.completed || false,
      due_on: subtask.due_on || null,
      assignee: subtask.assignee ? subtask.assignee.name : null,
    }));

    return {
      subtasks,
      count: subtasks.length,
      parent_task_id: args.task_id,
    };
  } catch (error: any) {
    throw new Error(`Failed to list subtasks: ${error.message}`);
  }
}

