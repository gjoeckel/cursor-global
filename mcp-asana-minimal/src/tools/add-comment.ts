import { getAsanaClient } from '../asana-client.js';

export const addCommentSchema = {
  name: 'asana_add_comment',
  description: 'Add a comment (story) to an existing task in Asana',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task GID (required)',
      },
      text: {
        type: 'string',
        description: 'Comment text (required)',
      },
    },
    required: ['task_id', 'text'],
  },
};

export async function addComment(args: {
  task_id: string;
  text: string;
}) {
  const client = getAsanaClient();

  // Create a story (comment) on the task
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

  const storyData = (story as any).data;

  return {
    comment_id: storyData.gid,
    text: storyData.text,
    created_at: storyData.created_at,
    created_by: storyData.created_by ? {
      gid: storyData.created_by.gid,
      name: storyData.created_by.name,
    } : null,
    task_id: args.task_id,
  };
}
