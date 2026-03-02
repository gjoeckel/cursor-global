import { executeWithRefresh, getBoxClient } from '../box-client.js';
import { isBoxAuthError, withAuthErrorHandling } from '../utils/error-handler.js';

export const getFileContentSchema = {
  name: 'box_get_file_content',
  description: 'Get the content of a file from Box (supports text, PDF, Word, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      file_id: {
        type: 'string',
        description: 'File ID to read (required)',
      },
      as_text: {
        type: 'boolean',
        description: 'Return as plain text (default: true). If false, returns base64 encoded content',
      },
    },
    required: ['file_id'],
  },
};

export async function getFileContent(args: {
  file_id: string;
  as_text?: boolean;
}) {
  return executeWithRefresh(() => withAuthErrorHandling(async () => {
  try {
  const asText = args.as_text !== false; // Default to true

  const client = getBoxClient();

    // First, get file info to check type
    const fileInfo = await client.files.getFileById(args.file_id);

    // For text files, get content directly using downloads manager
    if (fileInfo.name.endsWith('.txt') || fileInfo.name.endsWith('.md') ||
        fileInfo.name.endsWith('.json') || fileInfo.name.endsWith('.csv')) {
      const stream = await client.downloads.downloadFile(args.file_id);

      if (stream) {
        const chunks: Buffer[] = [];

        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        const content = Buffer.concat(chunks).toString('utf-8');

        return {
          file_id: fileInfo.id,
          file_name: fileInfo.name,
          content: asText ? content : Buffer.from(content).toString('base64'),
          content_type: 'text',
          size: fileInfo.size,
        };
      }
    }

    // For other files, get download URL
    // Note: Full text extraction for PDF/Word requires Box AI or additional processing
    const downloadUrl = await client.downloads.getDownloadFileUrl(args.file_id);

    return {
      file_id: fileInfo.id,
      file_name: fileInfo.name,
      download_url: downloadUrl,
      content_type: fileInfo.type || 'unknown',
      size: fileInfo.size,
      message: 'For PDF/Word files, use box_ai_qa_single_file to extract text content',
    };
  } catch (error: any) {
    if (isBoxAuthError(error)) throw error;
    throw new Error(`Failed to get file content: ${error.message || String(error)}`);
  }
  }
  ));
}
