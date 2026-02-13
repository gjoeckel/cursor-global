import * as Asana from 'asana';

let client: any = null;
let clientInitialized = false;

/**
 * Get or create Asana API client
 * Uses Personal Access Token from ASANA_ACCESS_TOKEN environment variable
 */
export function getAsanaClient(): any {
  if (!clientInitialized) {
    const token = process.env.ASANA_ACCESS_TOKEN;
    if (!token) {
      throw new Error(
        'ASANA_ACCESS_TOKEN environment variable is required. ' +
        'Get your token from: https://app.asana.com/0/my-apps'
      );
    }

    // Initialize the ApiClient instance (using any to bypass type issues)
    const AsanaAny = Asana as any;
    const apiClient = AsanaAny.ApiClient.instance;

    // Configure authentication with Personal Access Token
    // For PAT, we use the 'oauth2' authentication method
    const auth = apiClient.authentications['oauth2'];
    auth.accessToken = token;

    // Create a client object with API instances
    client = {
      apiClient,
      tasks: new AsanaAny.TasksApi(),
      projects: new AsanaAny.ProjectsApi(),
      users: new AsanaAny.UsersApi(),
      workspaces: new AsanaAny.WorkspacesApi(),
      stories: new AsanaAny.StoriesApi(),
      sections: new AsanaAny.SectionsApi(),
    };

    clientInitialized = true;
  }
  return client;
}
