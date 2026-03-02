import { getAsanaClient } from '../asana-client.js';

export const listProjectsSchema = {
  name: 'asana_list_projects',
  description: 'List projects in Asana, optionally filtered by workspace',
  inputSchema: {
    type: 'object',
    properties: {
      workspace: {
        type: 'string',
        description: 'Workspace GID to filter projects (optional, lists all accessible projects if not provided)',
      },
      archived: {
        type: 'boolean',
        description: 'Include archived projects (default: false)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of projects to return (default: 50, max: 100)',
      },
    },
  },
};

export async function listProjects(args: {
  workspace?: string;
  archived?: boolean;
  limit?: number;
}) {
  const client = getAsanaClient();

  const limit = Math.min(args.limit || 50, 100);

  let projects: any[] = [];

  if (args.workspace) {
    // List projects in a specific workspace
    const workspaceProjects = await new Promise((resolve, reject) => {
      client.projects.getProjects({
      workspace: args.workspace,
      archived: args.archived || false,
        opt_fields: ['name', 'notes', 'archived', 'color', 'created_at', 'modified_at', 'public', 'workspace'],
      limit,
      }, (error: any, data: any) => {
        if (error) reject(error);
        else resolve(data);
      });
    });
    projects = (workspaceProjects as any).data || [];
  } else {
    // List all accessible projects for the authenticated user
    const workspaces = await new Promise((resolve, reject) => {
      client.workspaces.getWorkspaces({
        opt_fields: ['gid', 'name'],
      }, (error: any, data: any) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    // Get projects from all workspaces
    const allProjects: any[] = [];
    for (const workspace of (workspaces as any).data || []) {
      try {
        const workspaceProjects = await new Promise((resolve, reject) => {
          client.projects.getProjects({
          workspace: workspace.gid,
          archived: args.archived || false,
            opt_fields: ['name', 'notes', 'archived', 'color', 'created_at', 'modified_at', 'public', 'workspace'],
          limit: 100, // Get max per workspace
          }, (error: any, data: any) => {
            if (error) reject(error);
            else resolve(data);
          });
        });
        if ((workspaceProjects as any).data) {
          allProjects.push(...(workspaceProjects as any).data);
        }
      } catch (error) {
        // Skip workspaces where we don't have permission
        continue;
      }
    }

    // Limit total results
    projects = allProjects.slice(0, limit);
  }

  return {
    projects: projects.map(project => ({
      project_id: project.gid,
      name: project.name,
      notes: project.notes || '',
      archived: project.archived || false,
      color: project.color || null,
      created_at: project.created_at,
      modified_at: project.modified_at,
      public: project.public || false,
      workspace: project.workspace ? {
        gid: project.workspace.gid,
        name: project.workspace.name,
      } : null,
    })),
    count: projects.length,
  };
}
