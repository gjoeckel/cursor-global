import { getBoxClient } from '../box-client.js';
import { Readable } from 'stream';

export const uploadFileSchema = {
  name: 'box_upload_file',
  description: 'Upload a file to Box folder',
  inputSchema: {
    type: 'object',
    properties: {
      folder_id: {
        type: 'string',
        description: 'Folder ID to upload file to (required)',
      },
      file_name: {
        type: 'string',
        description: 'Name for the uploaded file (required)',
      },
      content: {
        type: 'string',
        description: 'File content as text or base64 encoded string (required)',
      },
      content_encoding: {
        type: 'string',
        description: 'Encoding of content: "text" or "base64" (default: "text")',
      },
    },
    required: ['folder_id', 'file_name', 'content'],
  },
};

export async function uploadFile(args: {
  folder_id: string;
  file_name: string;
  content: string;
  content_encoding?: string;
}) {
  const client = getBoxClient();

  // Convert content to buffer
  let fileBuffer: Buffer;
  if (args.content_encoding === 'base64') {
    fileBuffer = Buffer.from(args.content, 'base64');
  } else {
    fileBuffer = Buffer.from(args.content, 'utf-8');
  }

  // Create readable stream from buffer
  const fileStream = Readable.from(fileBuffer);

  // Upload file
  const uploadedFile = await client.files.uploadFile(
    args.folder_id,
    args.file_name,
    fileStream
  );

  return {
    file_id: uploadedFile.entries[0].id,
    file_name: uploadedFile.entries[0].name,
    size: uploadedFile.entries[0].size,
    created_at: uploadedFile.entries[0].created_at,
    parent: uploadedFile.entries[0].parent ? {
      id: uploadedFile.entries[0].parent.id,
      name: uploadedFile.entries[0].parent.name,
    } : null,
  };
}
