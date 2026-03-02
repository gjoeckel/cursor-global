import { executeWithRefresh, getBoxClient } from '../box-client.js';
import { toISOString } from '../utils/box-date.js';
import { withAuthErrorHandling } from '../utils/error-handler.js';

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
  return executeWithRefresh(() => withAuthErrorHandling(async () => {
    const limit = Math.min(args.limit || 100, 1000);
    const offset = args.offset || 0;

    const client = getBoxClient();
    const folder = await client.folders.getFolderItems(args.folder_id, {
      queryParams: {
        limit,
        offset,
        fields: ['id', 'name', 'type', 'size', 'modified_at', 'created_at', 'parent'],
      },
    });

    return {
    items: folder.entries.map((item: any) => {
      // Construct URL based on item type
      let url: string | null = null;
      if (item.type === 'file') {
        url = `https://app.box.com/file/${item.id}`;
      } else if (item.type === 'folder') {
        url = `https://app.box.com/folder/${item.id}`;
      }
      // web_link items already have URLs, skip construction

      return {
        id: item.id,
        name: item.name,
        type: item.type, // 'file', 'folder', or 'web_link'
        size: item.size || null,
        modified_at: toISOString((item as any).modified_at ?? (item as any).modifiedAt),
        created_at: toISOString((item as any).created_at ?? (item as any).createdAt),
        url, // Constructed URL (null for web_link)
        parent: item.parent ? {
          id: item.parent.id,
          name: item.parent.name,
        } : null,
      };
    }),
      total_count: folder.total_count || folder.entries.length,
      limit,
      offset,
    };
  }));
}
