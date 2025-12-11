import { getBoxClient } from '../box-client.js';

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
  const client = getBoxClient();

  const file = await client.files.get(args.file_id, {
    fields: 'id,name,type,size,modified_at,created_at,description,parent,shared_link,permissions,version_number,sha1',
  });

  return {
    file_id: file.id,
    name: file.name,
    type: file.type,
    size: file.size,
    description: file.description || null,
    modified_at: file.modified_at,
    created_at: file.created_at,
    version_number: file.version_number || null,
    sha1: file.sha1 || null,
    parent: file.parent ? {
      id: file.parent.id,
      name: file.parent.name,
    } : null,
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
}
