declare module 'asana' {
  export interface Client {
    tasks: Tasks;
    users: Users;
  }

  export interface Tasks {
    createTask(options: { data: any }): Promise<any>;
    updateTask(taskGid: string, options: { data: any }): Promise<any>;
    getTask(taskGid: string, options?: { opt_fields?: string }): Promise<any>;
    getTasks(options?: { assignee?: string; workspace?: string; opt_fields?: string; limit?: number }): Promise<{ data: any[] }>;
    getTasksForProject(projectGid: string, options?: { opt_fields?: string; limit?: number }): Promise<{ data: any[] }>;
  }

  export interface Users {
    getUser(userGid: string): Promise<any>;
  }

  export namespace Client {
    function create(options: { auth: string }): Client;
  }

  export default {
    Client,
  };
}
