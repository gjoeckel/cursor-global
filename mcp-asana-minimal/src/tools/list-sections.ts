export const listSectionsSchema = {
  name: 'asana_list_sections',
  description: 'List all sections (list sections or board columns) in a project',
  inputSchema: {
    type: 'object',
    properties: {
      project: {
        type: 'string',
        description: 'Project GID (required)',
      },
    },
    required: ['project'],
  },
};

export async function listSections(args: {
  project: string;
}) {
  const token = process.env.ASANA_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'ASANA_ACCESS_TOKEN environment variable is required. ' +
      'Get your token from: https://app.asana.com/0/my-apps'
    );
  }

  try {
    // Use fetch for reliable promise-based HTTP requests
    const response = await fetch(
      `https://app.asana.com/api/1.0/projects/${args.project}/sections`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json() as { data: any[] };
    const sections = result.data.map((section: any) => ({
      section_id: section.gid,
      name: section.name,
    }));

    return {
      sections,
      count: sections.length,
      project: args.project,
    };
  } catch (error: any) {
    throw new Error(`Failed to list sections: ${error.message}`);
  }
}

