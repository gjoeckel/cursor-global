# Asana Subtask Best Practices - Documentation Complete

## Summary

Documentation and implementation updates completed to ensure all Agents follow the correct pattern for creating Asana subtasks.

## Documentation Created

1. **`docs/ASANA-SUBTASK-BEST-PRACTICES.md`** - Comprehensive guide
   - Problem explanation (duplicate tasks)
   - Correct implementation pattern
   - Common mistakes
   - Code examples
   - Fixing existing issues

2. **`docs/ASANA-SUBTASK-PATTERN-SUMMARY.md`** - Quick reference
   - One-page summary
   - Quick pattern reference
   - Links to full documentation

3. **`.cursorrules`** - Cursor IDE rules
   - Automatically guides AI agents
   - Quick reference for code generation
   - Pattern enforcement

## Code Updates

1. **`mcp-asana-minimal/src/tools/create-subtask.ts`**
   - Added documentation comment explaining the pattern
   - Already correctly implemented (no projects/memberships)

2. **`mcp-asana-minimal/README.md`**
   - Added warning about subtask creation
   - Links to best practices documentation

3. **`clean-and-create-module-2-tasks.js`**
   - Updated to remove `projects` from subtask creation
   - Added comments explaining why

## Pattern Summary

### ✅ Correct Pattern

```typescript
// Parent task: Include project/section
const parent = await createTask({
  name: "Parent",
  projects: [PROJECT_ID],
  memberships: [{ project: PROJECT_ID, section: SECTION_ID }],
});

// Subtask: NO project/section
const subtask = await createSubtask(parentId, {
  name: "Subtask",
  notes: "Notes",
  // NO projects, memberships, or workspace
});
```

### ❌ Incorrect Pattern

```typescript
// WRONG: Adding projects to subtasks
const subtask = await createSubtask(parentId, {
  name: "Subtask",
  projects: [PROJECT_ID],  // ❌ Causes duplicates
  memberships: [{           // ❌ Causes duplicates
    project: PROJECT_ID,
    section: SECTION_ID,
  }],
});
```

## Implementation Status

- ✅ Documentation created and comprehensive
- ✅ MCP tool correctly implemented
- ✅ Example scripts updated
- ✅ README updated with warnings
- ✅ Cursor rules file created
- ✅ Quick reference guide created

## Files Modified

1. `/docs/ASANA-SUBTASK-BEST-PRACTICES.md` (new)
2. `/docs/ASANA-SUBTASK-PATTERN-SUMMARY.md` (new)
3. `/.cursorrules` (new)
4. `/mcp-asana-minimal/src/tools/create-subtask.ts` (updated)
5. `/mcp-asana-minimal/README.md` (updated)

## Usage

All future Agents will:
- Reference `.cursorrules` automatically
- Find documentation in `/docs/ASANA-SUBTASK-BEST-PRACTICES.md`
- Follow the pattern shown in examples
- Avoid creating duplicate subtasks

## Date

December 16, 2025
