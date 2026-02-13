# Asana Minimal MCP Tool Recommendation

**Recommended minimal tool set for `mcp-asana-minimal` based on comprehensive tool analysis**

---

## Current Implementation Status

**Existing Tools (4):**
1. ✅ `asana_create_task` - Create new tasks
2. ✅ `asana_update_task` - Update existing tasks
3. ✅ `asana_get_task` - Get task details
4. ✅ `asana_list_tasks` - List/search tasks with filters

---

## Recommended Enhanced Minimal Set

### **Core Recommendation: 6-7 Tools**

Based on analysis of all 30+ available Asana tools, here's the recommended minimal set that covers 80% of common use cases:

#### **Essential Tools (6):**

1. **`asana_create_task`** ✅ *Already implemented*
   - **Purpose**: Create new tasks
   - **Use Cases**: Task creation, quick capture, task generation from AI
   - **Priority**: Critical

2. **`asana_update_task`** ✅ *Already implemented*
   - **Purpose**: Update task properties (status, assignee, due date, notes)
   - **Use Cases**: Mark complete, reassign, update details, change dates
   - **Priority**: Critical

3. **`asana_get_task`** ✅ *Already implemented*
   - **Purpose**: Retrieve detailed task information
   - **Use Cases**: Task lookup, status checks, detail retrieval
   - **Priority**: Critical

4. **`asana_list_tasks`** ✅ *Already implemented*
   - **Purpose**: List/search tasks with filters
   - **Use Cases**: View assigned tasks, project task lists, filtered searches
   - **Priority**: Critical

5. **`asana_list_projects`** ⚠️ *Needs implementation*
   - **Purpose**: List projects in workspace(s)
   - **Use Cases**: Project discovery, finding project GIDs, context setting
   - **Priority**: **High** - Essential for workflow (can't create tasks in projects without finding them first)
   - **Why Critical**: Users need to discover projects before creating tasks in them

6. **`asana_add_comment`** ⚠️ *Needs implementation*
   - **Purpose**: Add comments/stories to tasks
   - **Use Cases**: Task updates, communication, progress notes, status updates
   - **Priority**: **High** - Essential for task communication
   - **Why Critical**: Comments are the primary way to communicate about tasks

#### **Optional Addition (7th tool):**

7. **`asana_list_workspaces`** ⚠️ *Optional*
   - **Purpose**: List available workspaces
   - **Use Cases**: Workspace discovery, multi-workspace context
   - **Priority**: Medium - Can be inferred from projects, but helpful for clarity
   - **Decision**: Include if staying under tool limit, otherwise can be omitted

---

## What You Can Do With This Minimal Set

### **Core Task Management Workflows**

#### ✅ **Task Lifecycle Management**
- **Create tasks** with name, description, assignee, due date, project
- **Update tasks** - change status, reassign, update dates, modify descriptions
- **View tasks** - get detailed information about any task
- **List tasks** - filter by project, assignee, workspace, completion status
- **Track progress** - mark tasks complete, update status

#### ✅ **Project-Based Workflows**
- **Discover projects** - list all projects in workspace(s)
- **Create tasks in projects** - add tasks to specific projects
- **View project tasks** - list all tasks within a project
- **Project context** - understand which projects exist before task creation

#### ✅ **Communication & Updates**
- **Add comments** - post updates, notes, or questions on tasks
- **Task discussions** - communicate about task progress
- **Status updates** - document progress via comments

#### ✅ **Filtering & Search**
- **Filter by assignee** - find tasks assigned to specific users or "me"
- **Filter by project** - view all tasks in a project
- **Filter by workspace** - scope to specific workspace
- **Filter by completion** - view completed or incomplete tasks
- **Limit results** - control result set size (up to 100)

---

## What's Intentionally Excluded

### **Advanced Features (Not in Minimal Set)**

These are excluded to keep the tool count low (6-7 tools vs 30+):

#### **Project Management**
- ❌ `asana_create_project` - Project creation (can be done manually or via API)
- ❌ `asana_update_project` - Project updates (rarely needed)
- ❌ `asana_delete_project` - Project deletion (administrative)
- ❌ `asana_get_project_sections` - Section management (nice-to-have)
- ❌ `asana_get_project_hierarchy` - Complex hierarchies (advanced)

#### **Task Organization**
- ❌ `asana_add_task_to_section` - Section organization (can use projects)
- ❌ Subtask management - Multi-level hierarchies (advanced)
- ❌ Task dependencies - Dependency tracking (advanced)

#### **Customization**
- ❌ `asana_create_custom_field` - Custom fields (advanced feature)
- ❌ `asana_create_enum_option` - Custom field options (advanced)
- ❌ Custom field updates - Advanced tracking

#### **Administrative**
- ❌ `asana_create_team` - Team management (administrative)
- ❌ `asana_create_tag` - Tag management (can use projects)
- ❌ `asana_delete_tag` - Tag cleanup (administrative)

#### **Advanced Features**
- ❌ `asana_create_status_update` - Project status updates (can use comments)
- ❌ `asana_upload_attachment` - File attachments (advanced)
- ❌ `asana_delete_attachment` - Attachment management (advanced)
- ❌ `asana_create_allocation` - Resource allocation (advanced)
- ❌ `asana_add_supporting_goal` - Goal linking (advanced)
- ❌ `asana_delete_task` - Task deletion (rare, can be done manually)

---

## Tool Count Impact

### **Current State**
- Existing: **4 tools**
- Recommended: **6-7 tools**
- Official Asana MCP: **30+ tools**

### **Total MCP Tool Count**
With recommended minimal set:
- filesystem: 15 tools
- memory: 8 tools
- github-minimal: 4 tools
- shell-minimal: 4 tools
- agent-autonomy: 4 tools
- **asana-minimal: 6-7 tools** (recommended)
- **Total: 41-42 tools** ✅ (within 40-50 tool range)

---

## Implementation Priority

### **Phase 1: Essential Additions (High Priority)**
1. ✅ Keep existing 4 tools
2. ⚠️ **Add `asana_list_projects`** - Critical for workflow
3. ⚠️ **Add `asana_add_comment`** - Essential for communication

### **Phase 2: Optional Enhancement (If Tool Count Allows)**
4. ⚠️ **Add `asana_list_workspaces`** - Helpful for multi-workspace users

---

## Use Case Examples

### **Example 1: Create Task in Project**
```
1. asana_list_projects → Find project GID
2. asana_create_task → Create task with project GID
3. asana_add_comment → Add initial context comment
```

### **Example 2: Daily Task Review**
```
1. asana_list_tasks(assignee="me", completed=false) → Get my tasks
2. asana_get_task → Get details for each task
3. asana_update_task → Mark completed tasks
4. asana_add_comment → Add progress updates
```

### **Example 3: Project Task Management**
```
1. asana_list_projects → Find project
2. asana_list_tasks(project="<gid>") → Get all project tasks
3. asana_create_task → Add new tasks to project
4. asana_update_task → Update task statuses
```

---

## Recommendation Summary

### **Recommended Minimal Set: 6 Tools**

1. ✅ `asana_create_task` (existing)
2. ✅ `asana_update_task` (existing)
3. ✅ `asana_get_task` (existing)
4. ✅ `asana_list_tasks` (existing)
5. ⚠️ **`asana_list_projects`** (ADD THIS)
6. ⚠️ **`asana_add_comment`** (ADD THIS)

### **Optional 7th Tool**
7. ⚠️ `asana_list_workspaces` (if tool count allows)

### **Capabilities with This Set**
- ✅ Complete task CRUD operations
- ✅ Project discovery and context
- ✅ Task communication via comments
- ✅ Flexible filtering and search
- ✅ Project-based task organization
- ✅ Status tracking and updates

### **What's Missing (Intentionally)**
- Project creation/management (administrative)
- Advanced hierarchies (subtasks, dependencies)
- Custom fields (advanced feature)
- File attachments (advanced)
- Tags (can use projects instead)
- Resource allocation (advanced)

---

## Next Steps

1. **Review recommendation** - Confirm 6-7 tool set
2. **Implement additions** - Add `list_projects` and `add_comment`
3. **Test workflows** - Verify all use cases work
4. **Update documentation** - Reflect new capabilities
5. **Publish to npm** - Make available for use

---

**Created:** 2025-12-11
**Status:** Recommendation for review
