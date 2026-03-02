# Asana Subtask Pattern - Quick Reference

## One Rule: Subtasks Don't Go in Projects

**🚨 Critical Rule:** When creating subtasks via the Asana API, **DO NOT** include `projects` or `memberships` fields.

## Quick Pattern

```typescript
// ✅ Parent Task: Include project/section
createTask({
  name: "Parent",
  projects: [PROJECT_ID],
  memberships: [{ project: PROJECT_ID, section: SECTION_ID }],
});

// ✅ Subtask: NO project/section
createSubtask(parentId, {
  name: "Subtask",
  // NO projects, memberships, or workspace
});
```

## Why?

- Prevents duplicate tasks in section views
- Keeps subtasks nested under parent
- Cleaner project organization

## Full Documentation

See: **[ASANA-SUBTASK-BEST-PRACTICES.md](./ASANA-SUBTASK-BEST-PRACTICES.md)**

## Implementation Status

- ✅ MCP Tool (`mcp-asana-minimal/src/tools/create-subtask.ts`) - Correctly implemented
- ✅ Module 2 Script (`clean-and-create-module-2-tasks.js`) - Updated to follow pattern
- ✅ Documentation created
- ✅ README updated with warnings

