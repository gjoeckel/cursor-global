# Asana Minimal MCP - Tool Set Recommendation

## Recommended Minimal Set: **6 Tools**

### Current Implementation (4 tools)
1. ✅ `asana_create_task` - Create new tasks
2. ✅ `asana_update_task` - Update existing tasks
3. ✅ `asana_get_task` - Get task details
4. ✅ `asana_list_tasks` - List/search tasks with filters

### Recommended Additions (2 tools)
5. ⚠️ **`asana_list_projects`** - **CRITICAL** - List projects in workspace
   - **Why Essential**: Users need to discover projects before creating tasks in them
   - **Use Case**: Find project GIDs for task creation

6. ⚠️ **`asana_add_comment`** - **CRITICAL** - Add comments to tasks
   - **Why Essential**: Primary method for task communication and updates
   - **Use Case**: Post progress updates, questions, notes on tasks

### Optional Addition (7th tool)
7. ⚠️ `asana_list_workspaces` - List available workspaces
   - **Priority**: Medium (can be inferred from projects)
   - **Decision**: Include if staying under tool limit

---

## What You Can Do With 6 Tools

### ✅ Complete Task Management
- **Create tasks** with name, description, assignee, due date, project
- **Update tasks** - change status, reassign, update dates, modify details
- **View tasks** - get detailed information
- **List tasks** - filter by project, assignee, workspace, completion status
- **Track progress** - mark complete, update status

### ✅ Project-Based Workflows
- **Discover projects** - list all projects in workspace(s)
- **Create tasks in projects** - add tasks to specific projects
- **View project tasks** - list all tasks within a project
- **Project context** - understand project structure

### ✅ Communication
- **Add comments** - post updates, notes, questions on tasks
- **Task discussions** - communicate about progress
- **Status updates** - document progress via comments

### ✅ Filtering & Search
- Filter by assignee (specific user or "me")
- Filter by project
- Filter by workspace
- Filter by completion status
- Limit results (up to 100)

---

## Example Workflows

### Create Task in Project
```
1. asana_list_projects → Find project GID
2. asana_create_task(project="<gid>") → Create task
3. asana_add_comment(task="<gid>") → Add context
```

### Daily Task Review
```
1. asana_list_tasks(assignee="me", completed=false) → My tasks
2. asana_get_task → Get details
3. asana_update_task → Mark completed
4. asana_add_comment → Add progress notes
```

### Project Management
```
1. asana_list_projects → Find project
2. asana_list_tasks(project="<gid>") → Project tasks
3. asana_create_task → Add new tasks
4. asana_update_task → Update statuses
```

---

## Tool Count Impact

**With 6 tools:**
- filesystem: 15
- memory: 8
- github-minimal: 4
- shell-minimal: 4
- agent-autonomy: 4
- **asana-minimal: 6**
- **Total: 41 tools** ✅

**With 7 tools (if adding workspaces):**
- **Total: 42 tools** ✅

---

## What's Intentionally Excluded

To keep tool count minimal, these are excluded:
- ❌ Project creation/updates (administrative, can be done manually)
- ❌ Task deletion (rare, can be done manually)
- ❌ Subtasks/dependencies (advanced hierarchies)
- ❌ Custom fields (advanced feature)
- ❌ File attachments (advanced)
- ❌ Tags (can use projects instead)
- ❌ Resource allocation (advanced)
- ❌ Status updates (can use comments)

---

## Recommendation

**Implement 6 tools total:**
- Keep existing 4 tools ✅
- Add `asana_list_projects` ⚠️
- Add `asana_add_comment` ⚠️

This provides **80% of functionality** with **20% of the tools** (6 vs 30+).

---

**Status:** Ready for implementation
**Priority:** High - Add 2 tools to complete minimal set
