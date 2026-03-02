export const createSectionSchema = {
  name: 'asana_create_section',
  description: 'Create a new section in an Asana project',
  inputSchema: {
    type: 'object',
    properties: {
      project: {
        type: 'string',
        description: 'Project GID (required)',
      },
      name: {
        type: 'string',
        description: 'Section name (required)',
      },
    },
    required: ['project', 'name'],
  },
};

export async function createSection(args: {
  project: string;
  name: string;
}) {
  const token = process.env.ASANA_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'ASANA_ACCESS_TOKEN environment variable is required. ' +
      'Get your token from: https://app.asana.com/0/my-apps'
    );
  }

  const sectionData = {
    name: args.name,
  };

  // CRITICAL: Wrap in { data: {...} }
  const body = { data: sectionData };

  try {
    // Use fetch for reliable promise-based HTTP requests
    const response = await fetch(
      `https://app.asana.com/api/1.0/projects/${args.project}/sections`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json() as { data: any };
    const sectionDataResult = result.data;

    return {
      section_id: sectionDataResult.gid,
      name: sectionDataResult.name,
      project: args.project,
      created_at: sectionDataResult.created_at,
    };
  } catch (error: any) {
    throw new Error(`Failed to create section: ${error.message}`);
  }
}

