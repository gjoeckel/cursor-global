export const createSubtaskSchema = {
  name: 'asana_create_subtask',
  description: 'Create a new subtask within an existing task',
  inputSchema: {
    type: 'object',
    properties: {
      parent_task_id: {
        type: 'string',
        description: 'The GID of the parent task',
      },
      name: {
        type: 'string',
        description: 'Name of the subtask',
      },
      notes: {
        type: 'string',
        description: 'Subtask description/notes',
      },
      assignee: {
        type: 'string',
        description: 'User GID or "me" to assign the subtask',
      },
      due_on: {
        type: 'string',
        description: 'Due date in YYYY-MM-DD format',
      },
    },
    required: ['parent_task_id', 'name'],
  },
};

export async function createSubtask(args: {
  parent_task_id: string;
  name: string;
  notes?: string;
  assignee?: string;
  due_on?: string;
}) {
  const token = process.env.ASANA_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'ASANA_ACCESS_TOKEN environment variable is required. ' +
      'Get your token from: https://app.asana.com/0/my-apps'
    );
  }

  const subtaskData: any = {
    name: args.name,
  };

  if (args.notes) {
    subtaskData.notes = args.notes;
  }

  if (args.assignee) {
    subtaskData.assignee = args.assignee;
  }

  if (args.due_on) {
    subtaskData.due_on = args.due_on;
  }

  // IMPORTANT: DO NOT include projects, memberships, or workspace fields.
  // Subtasks should NOT be project members - they exist only as children of their parent.
  // Adding projects/memberships causes subtasks to appear as duplicates in section views.
  // See: docs/ASANA-SUBTASK-BEST-PRACTICES.md

  // CRITICAL: Wrap in { data: {...} }
  const body = { data: subtaskData };

  try {
    // Use fetch for reliable promise-based HTTP requests
    // API endpoint: POST /tasks/{task_gid}/subtasks
    const response = await fetch(
      `https://app.asana.com/api/1.0/tasks/${args.parent_task_id}/subtasks`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json() as { data: any };
    const subtask = result.data;

    return {
      subtask_id: subtask.gid,
      name: subtask.name,
      notes: subtask.notes || '',
      created_at: subtask.created_at,
      parent_task_id: args.parent_task_id,
    };
  } catch (error: any) {
    throw new Error(`Failed to create subtask: ${error.message}`);
  }
}

