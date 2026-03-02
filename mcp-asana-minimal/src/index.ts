#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createTask, createTaskSchema } from './tools/create-task.js';
import { updateTask, updateTaskSchema } from './tools/update-task.js';
import { getTask, getTaskSchema } from './tools/get-task.js';
import { listTasks, listTasksSchema } from './tools/list-tasks.js';
import { listProjects, listProjectsSchema } from './tools/list-projects.js';
import { addComment, addCommentSchema } from './tools/add-comment.js';
import { createSection, createSectionSchema } from './tools/create-section.js';
import { listSections, listSectionsSchema } from './tools/list-sections.js';
import { addTaskToSection, addTaskToSectionSchema } from './tools/add-task-to-section.js';
import { createSubtask, createSubtaskSchema } from './tools/create-subtask.js';
import { listSubtasks, listSubtasksSchema } from './tools/list-subtasks.js';

const server = new Server(
  {
    name: 'asana-minimal',
    version: '1.3.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    createTaskSchema,
    updateTaskSchema,
    getTaskSchema,
    listTasksSchema,
    listProjectsSchema,
    addCommentSchema,
    createSectionSchema,
    listSectionsSchema,
    addTaskToSectionSchema,
    createSubtaskSchema,
    listSubtasksSchema,
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'asana_create_task':
        const createResult = await createTask(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(createResult, null, 2),
            },
          ],
        };

      case 'asana_update_task':
        const updateResult = await updateTask(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(updateResult, null, 2),
            },
          ],
        };

      case 'asana_get_task':
        const getResult = await getTask(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(getResult, null, 2),
            },
          ],
        };

      case 'asana_list_tasks':
        const listResult = await listTasks(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(listResult, null, 2),
            },
          ],
        };

      case 'asana_list_projects':
        const listProjectsResult = await listProjects(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(listProjectsResult, null, 2),
            },
          ],
        };

      case 'asana_add_comment':
        const addCommentResult = await addComment(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(addCommentResult, null, 2),
            },
          ],
        };

      case 'asana_create_section':
        const createSectionResult = await createSection(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(createSectionResult, null, 2),
            },
          ],
        };

      case 'asana_list_sections':
        const listSectionsResult = await listSections(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(listSectionsResult, null, 2),
            },
          ],
        };

      case 'asana_add_task_to_section':
        const addTaskToSectionResult = await addTaskToSection(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(addTaskToSectionResult, null, 2),
            },
          ],
        };

      case 'asana_create_subtask':
        const createSubtaskResult = await createSubtask(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(createSubtaskResult, null, 2),
            },
          ],
        };

      case 'asana_list_subtasks':
        const listSubtasksResult = await listSubtasks(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(listSubtasksResult, null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message || String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Asana Minimal MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
