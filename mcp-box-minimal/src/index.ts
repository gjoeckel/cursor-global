#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { listFolderItems, listFolderItemsSchema } from './tools/list-folder-items.js';
import { getFileContent, getFileContentSchema } from './tools/get-file-content.js';
import { getFileDetails, getFileDetailsSchema } from './tools/get-file-details.js';
import { searchFiles, searchFilesSchema } from './tools/search-files.js';
import { uploadFile, uploadFileSchema } from './tools/upload-file.js';
import { aiQaSingleFile, aiQaSingleFileSchema } from './tools/ai-qa-single-file.js';

const server = new Server(
  {
    name: 'box-minimal',
    version: '1.0.2',
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
    listFolderItemsSchema,
    getFileContentSchema,
    getFileDetailsSchema,
    searchFilesSchema,
    uploadFileSchema,
    aiQaSingleFileSchema,
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'box_list_folder_items':
        const listResult = await listFolderItems(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(listResult, null, 2),
            },
          ],
        };

      case 'box_get_file_content':
        const contentResult = await getFileContent(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(contentResult, null, 2),
            },
          ],
        };

      case 'box_get_file_details':
        const detailsResult = await getFileDetails(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(detailsResult, null, 2),
            },
          ],
        };

      case 'box_search_files':
        const searchResult = await searchFiles(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(searchResult, null, 2),
            },
          ],
        };

      case 'box_upload_file':
        const uploadResult = await uploadFile(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(uploadResult, null, 2),
            },
          ],
        };

      case 'box_ai_qa_single_file':
        const aiResult = await aiQaSingleFile(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(aiResult, null, 2),
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
  console.error('Box Minimal MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
