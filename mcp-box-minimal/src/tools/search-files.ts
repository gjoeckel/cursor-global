import { getBoxClient } from '../box-client.js';

export const searchFilesSchema = {
  name: 'box_search_files',
  description: 'Search for files and folders in Box using keywords and filters',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query/keywords (required)',
      },
      file_extensions: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'Filter by file extensions (e.g., ["pdf", "docx"])',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 30, max: 200)',
      },
      offset: {
        type: 'number',
        description: 'Offset for pagination (default: 0)',
      },
    },
    required: ['query'],
  },
};

export async function searchFiles(args: {
  query: string;
  file_extensions?: string[];
  limit?: number;
  offset?: number;
}) {
  const client = getBoxClient();

  const limit = Math.min(args.limit || 30, 200);
  const offset = args.offset || 0;

  const searchParams: any = {
    query: args.query,
    limit,
    offset,
    fields: 'id,name,type,size,modified_at,created_at,parent',
  };

  if (args.file_extensions && args.file_extensions.length > 0) {
    searchParams.file_extensions = args.file_extensions.join(',');
  }

  const results = await client.search.searchForContent(searchParams);

  return {
    results: results.entries.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type, // 'file', 'folder', or 'web_link'
      size: item.size || null,
      modified_at: item.modified_at,
      created_at: item.created_at,
      parent: item.parent ? {
        id: item.parent.id,
        name: item.parent.name,
      } : null,
    })),
    total_count: results.total_count || results.entries.length,
    limit,
    offset,
  };
}
