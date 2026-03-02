import { executeWithRefresh, getBoxClient } from '../box-client.js';
import { toISOString } from '../utils/box-date.js';
import { withAuthErrorHandling } from '../utils/error-handler.js';

export const getFileDetailsSchema = {
  name: 'box_get_file_details',
  description: 'Get detailed information about a file in Box (metadata, permissions, versions, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      file_id: {
        type: 'string',
        description: 'File ID to get details for (required)',
      },
    },
    required: ['file_id'],
  },
};

export async function getFileDetails(args: {
  file_id: string;
}) {
  return executeWithRefresh(() => withAuthErrorHandling(async () => {
    const client = getBoxClient();
    const file = await client.files.getFileById(args.file_id, {
      queryParams: {
        fields: ['id', 'name', 'type', 'size', 'modified_at', 'created_at', 'description', 'parent', 'shared_link', 'permissions', 'version_number', 'sha1'],
      },
    });

    // Construct standard URLs
    const urls = {
      view: `https://app.box.com/file/${file.id}`,
      word_online: `https://app.box.com/integrations/officeonline/openOfficeOnline?fileId=${file.id}`,
      parent_folder: file.parent ? `https://app.box.com/folder/${file.parent.id}` : null,
    };

    return {
      file_id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      description: file.description || null,
      modified_at: toISOString((file as any).modified_at ?? (file as any).modifiedAt),
      created_at: toISOString((file as any).created_at ?? (file as any).createdAt),
      version_number: file.version_number || null,
      sha1: file.sha1 || null,
      parent: file.parent ? {
        id: file.parent.id,
        name: file.parent.name,
      } : null,
      urls, // Constructed standard URLs
      shared_link: file.shared_link ? {
        url: file.shared_link.url,
        download_url: file.shared_link.download_url,
        vanity_url: file.shared_link.vanity_url || null,
      } : null,
      permissions: {
        can_download: file.permissions?.can_download || false,
        can_preview: file.permissions?.can_preview || false,
        can_edit: file.permissions?.can_edit || false,
        can_delete: file.permissions?.can_delete || false,
      },
    };
  }));
}
