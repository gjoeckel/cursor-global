export const addTaskToSectionSchema = {
  name: 'asana_add_task_to_section',
  description: 'Move an existing task to a different section/column',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'The GID of the task to move',
      },
      section_id: {
        type: 'string',
        description: 'The GID of the section to move the task to',
      },
    },
    required: ['task_id', 'section_id'],
  },
};

export async function addTaskToSection(args: {
  task_id: string;
  section_id: string;
}) {
  const token = process.env.ASANA_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'ASANA_ACCESS_TOKEN environment variable is required. ' +
      'Get your token from: https://app.asana.com/0/my-apps'
    );
  }

  // CRITICAL: Wrap in { data: {...} }
  const body = {
    data: {
      task: args.task_id,
    },
  };

  try {
    // Use fetch for reliable promise-based HTTP requests
    // API endpoint: POST /sections/{section_gid}/addTask
    const response = await fetch(
      `https://app.asana.com/api/1.0/sections/${args.section_id}/addTask`,
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

    return {
      success: true,
      task_id: args.task_id,
      section_id: args.section_id,
      message: `Task ${args.task_id} added to section ${args.section_id}`,
    };
  } catch (error: any) {
    throw new Error(`Failed to add task to section: ${error.message}`);
  }
}

