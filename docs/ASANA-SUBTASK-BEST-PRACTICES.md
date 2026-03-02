# Asana Subtask Creation Best Practices

## Critical Rule: Subtasks Should NOT Be Project Members

**🚨 IMPORTANT: When creating subtasks in Asana, DO NOT add them to the project. Subtasks should only exist as children of their parent task.**

---

## The Problem: Duplicate Tasks in Section View

When subtasks are incorrectly added to a project, they appear **twice** in List view:

### ❌ Incorrect Behavior (Subtasks Added to Project)

```
Section: Module 2

├─ Parent Task
│  ├─ Subtask 1 (nested)
│  ├─ Subtask 2 (nested)
│  └─ Subtask 3 (nested)
├─ Subtask 1 (appears separately - DUPLICATE!)
├─ Subtask 2 (appears separately - DUPLICATE!)
└─ Subtask 3 (appears separately - DUPLICATE!)
```

This creates confusion, duplicates, and makes the section view cluttered.

### ✅ Correct Behavior (Subtasks NOT in Project)

```
Section: Module 2

└─ Parent Task (only task visible in section)
   ├─ Subtask 1 (nested - visible when expanded)
   ├─ Subtask 2 (nested - visible when expanded)
   └─ Subtask 3 (nested - visible when expanded)
```

Subtasks only appear when you expand the parent task using the triangle/arrow icon.

---

## Implementation Pattern

### ✅ CORRECT: Creating Subtasks

```typescript
/**
 * Create a subtask (DO NOT add to project)
 */
async function createSubtask(parentTaskId, subtaskData) {
  const body = { data: subtaskData };

  const response = await fetch(
    `https://app.asana.com/api/1.0/tasks/${parentTaskId}/subtasks`,
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

  const result = await response.json();
  return result.data;
}

// Usage: Create section subtask
const sectionTaskData = await createSubtask(
  moduleTaskId,
  {
    name: sectionTask.name,
    notes: sectionTask.notes || '',
    // DO NOT include: projects, memberships, or workspace
  }
);

// Usage: Create LA subtask
const laTaskData = await createSubtask(
  sectionTaskId,
  {
    name: laTask.name,
    notes: laTask.notes || '',
    // DO NOT include: projects, memberships, or workspace
  }
);
```

### ❌ WRONG: Adding Subtasks to Project

```typescript
// DO NOT DO THIS
const subtaskData = {
  name: args.name,
  projects: ["project_gid"],  // ❌ DON'T ADD PROJECTS
  memberships: [{              // ❌ DON'T ADD MEMBERSHIPS
    project: "project_gid",
    section: "section_gid"
  }]
};
```

**Why this is wrong:**
- Makes subtasks appear separately in section view
- Creates duplicate entries
- Clutters the project view
- Subtasks should inherit context from their parent

---

## What Fields to Include in Subtask Creation

### ✅ Include:
- `name` (required)
- `notes` (optional)
- `assignee` (optional, if needed)
- `due_on` (optional, if needed)
- `completed` (optional)

### ❌ Do NOT Include:
- `projects` - Subtasks should NOT be project members
- `memberships` - Subtasks should NOT be in sections
- `workspace` - Subtasks inherit from parent

---

## Fixing Existing Subtasks

If subtasks were incorrectly added to a project, remove them:

### Via API

```typescript
/**
 * Remove task from project
 */
async function removeTaskFromProject(taskId, projectId) {
  const response = await fetch(
    `https://app.asana.com/api/1.0/tasks/${taskId}/removeProject`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          project: projectId,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    // Ignore if task is not in project
    if (!errorText.includes('not in project') && response.status !== 404) {
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return false;
  }

  return true;
}

// Remove all subtasks from project
for (const subtask of subtasks) {
  await removeTaskFromProject(subtask.id, PROJECT_ID);
}
```

### Via Asana UI

1. Go to List view
2. Click on the subtask (the one showing separately, not the nested one)
3. In the right panel, look for the project name
4. Click the **X** next to the project name to remove it from the project
5. Repeat for each subtask

**Or use Multi-Select:**
1. Expand all parent tasks to see nested subtasks
2. Select multiple subtasks (Shift+click)
3. Click on the Project field in the right panel
4. Click the **X** to remove them all from the project at once

---

## Hierarchy Pattern

### Correct Task Hierarchy

```
Project
└─ Section (e.g., "Module 2: Document Structure")
   └─ Module Task (added to section with memberships)
      ├─ Section Subtask 1 (NOT in project)
      │   ├─ LA Subtask 1.1 (NOT in project)
      │   └─ LA Subtask 1.2 (NOT in project)
      ├─ Section Subtask 2 (NOT in project)
      │   └─ LA Subtask 2.1 (NOT in project)
      └─ Section Subtask 3 (NOT in project)
```

### Only Parent Tasks Go in Sections

```typescript
// STEP 1: Create parent task IN the section
const moduleTaskData = await createTask({
  name: moduleTask.name,
  notes: moduleTask.notes || '',
  projects: [PROJECT_ID],  // ✅ Parent IS in project
  memberships: [            // ✅ Parent IS in section
    {
      project: PROJECT_ID,
      section: SECTION_ID,
    },
  ],
});

// STEP 2: Create subtasks WITHOUT project/section
const sectionTaskData = await createSubtask(
  moduleTaskData.gid,
  {
    name: sectionTask.name,
    notes: sectionTask.notes || '',
    // ✅ NO projects or memberships
  }
);

// STEP 3: Create nested subtasks WITHOUT project/section
const laTaskData = await createSubtask(
  sectionTaskData.gid,
  {
    name: laTask.name,
    notes: laTask.notes || '',
    // ✅ NO projects or memberships
  }
);
```

---

## Key Concepts

1. **Subtasks inherit context from parent**: They don't need explicit project/section membership
2. **Only top-level tasks go in sections**: Parent tasks that represent major groupings
3. **Subtasks are not project members by default**: This is by design and correct behavior
4. **Section view shows parent tasks only**: Subtasks appear when parent is expanded

---

## When to Add Subtasks to Projects

**Only if you have a specific requirement** such as:
- Need subtasks to appear on Timeline view
- Need subtasks in a separate "Details" section
- Complex workflow requirements

If you do add subtasks to projects:
- Create a separate section like "Subtasks" or "Details" at the bottom
- Move all subtasks to that section
- Collapse that section when not needed
- This way they appear on Timeline but are organized in List view

---

## Code Review Checklist

When reviewing code that creates Asana tasks, check:

- [ ] Parent tasks include `projects` and `memberships`
- [ ] Subtasks do NOT include `projects`
- [ ] Subtasks do NOT include `memberships`
- [ ] Subtasks do NOT include `workspace`
- [ ] Only parent tasks are added to sections
- [ ] Subtask creation functions don't accept project/section parameters

---

## Examples

### ✅ Good Example: Complete Module Creation

```typescript
// 1. Create module parent in section
const moduleTask = await createTask({
  name: "Module 2: Document Structure",
  projects: [PROJECT_ID],
  memberships: [{ project: PROJECT_ID, section: SECTION_ID }],
});

// 2. Create section subtasks (NO projects)
const sectionTasks = [];
for (const sectionDef of sections) {
  const sectionTask = await createSubtask(moduleTask.gid, {
    name: sectionDef.name,
    notes: sectionDef.notes,
    // NO projects or memberships
  });
  sectionTasks.push(sectionTask);
}

// 3. Create LA subtasks (NO projects)
for (const laDef of laTasks) {
  await createSubtask(sectionTasks[laDef.sectionOrder].gid, {
    name: laDef.name,
    notes: laDef.notes,
    // NO projects or memberships
  });
}
```

### ❌ Bad Example: Incorrect Subtask Creation

```typescript
// WRONG: Adding projects to subtasks
const sectionTask = await createSubtask(moduleTask.gid, {
  name: sectionDef.name,
  projects: [PROJECT_ID],  // ❌ WRONG
  memberships: [{           // ❌ WRONG
    project: PROJECT_ID,
    section: SECTION_ID,
  }],
});
```

---

## Related Documentation

- [Asana API Documentation: Create Subtask](https://developers.asana.com/reference/createsubtaskfortask)
- [Asana API Documentation: Remove from Project](https://developers.asana.com/reference/removeprojectfortask)

---

## Last Updated

December 16, 2025

## Related Files

- `/Users/a00288946/Projects/canvas_2879/data/current/WINTER-25-26-UPDATES/clean-and-create-module-2-tasks.js` - Example implementation
- `/Users/a00288946/Projects/canvas_2879/data/current/WINTER-25-26-UPDATES/remove-subtasks-from-project.js` - Cleanup script

