import { getBoxClient } from '../box-client.js';

export const aiQaSingleFileSchema = {
  name: 'box_ai_qa_single_file',
  description: 'Ask questions to a single file using Box AI. Extracts insights and answers questions about file content.',
  inputSchema: {
    type: 'object',
    properties: {
      file_id: {
        type: 'string',
        description: 'File ID to query (required)',
      },
      question: {
        type: 'string',
        description: 'Question to ask about the file content (required)',
      },
    },
    required: ['file_id', 'question'],
  },
};

export async function aiQaSingleFile(args: {
  file_id: string;
  question: string;
}) {
  const client = getBoxClient();

  try {
    // Box AI API endpoint for single file queries
    // Note: This uses Box's AI API which may require specific permissions
    const response = await client.ai.createAiAsk({
      items: [
        {
          type: 'file',
          id: args.file_id,
        },
      ],
      prompt: args.question,
    });

    return {
      file_id: args.file_id,
      question: args.question,
      answer: response.answer || response.message || 'No answer provided',
      citations: response.citations || [],
    };
  } catch (error: any) {
    // If Box AI API is not available, provide helpful error
    if (error.statusCode === 403 || error.statusCode === 404) {
      throw new Error(
        'Box AI is not available for this file or account. ' +
        'Ensure Box AI is enabled and you have proper permissions.'
      );
    }
    throw new Error(`Box AI query failed: ${error.message || String(error)}`);
  }
}
