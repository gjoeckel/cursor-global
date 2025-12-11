import { getBoxClient } from '../box-client.js';

export const listFolderItemsSchema = {
  name: 'box_list_folder_items',
  description: 'List files, folders, and web links in a Box folder',
  inputSchema: {
    type: 'object',
    properties: {
      folder_id: {
        type: 'string',
        description: 'Folder ID to list contents (required)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of items to return (default: 100, max: 1000)',
      },
      offset: {
        type: 'number',
        description: 'Offset for pagination (default: 0)',
      },
    },
    required: ['folder_id'],
  },
};

export async function listFolderItems(args: {
  folder_id: string;
  limit?: number;
  offset?: number;
}) {
  const client = getBoxClient();

  const limit = Math.min(args.limit || 100, 1000);
  const offset = args.offset || 0;

  const folder = await client.folders.getFolderItems(args.folder_id, {
    queryParams: {
      limit,
      offset,
      fields: ['id', 'name', 'type', 'size', 'modified_at', 'created_at', 'parent'],
    },
  });

  return {
    items: folder.entries.map((item: any) => ({
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
    total_count: folder.total_count || folder.entries.length,
    limit,
    offset,
  };
}
