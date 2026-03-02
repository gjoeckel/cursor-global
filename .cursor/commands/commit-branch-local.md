---
description: Commit all changes to current branch in local git repository
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Commit Branch Local

Commit all changes in the onlinecourses-services project to the current git branch.

## What This Does

1. **Stages all changes** - Adds all modified, new, and deleted files to git staging
2. **Generates commit message** - Auto-generates a commit message based on changes
3. **Commits to current branch** - Commits changes to the current git branch (does not push)

## Execution

Execute the commit script:

```bash
bash /Users/a00288946/Agents/onlinecourses-services-resources/scripts/commit-branch-local.sh
```

Or with a custom message:

```bash
bash /Users/a00288946/Agents/onlinecourses-services-resources/scripts/commit-branch-local.sh "Your custom commit message here"
```

## Configuration

The commit script:
- Works in: `/Users/a00288946/Projects/onlinecourses-services`
- Commits to: Current git branch
- Auto-generates messages based on changed files and timestamp
- Shows commit hash after successful commit

## Requirements

- Git repository initialized
- Changes to commit (will exit gracefully if no changes)

## Commit Message Format

**Auto-generated:**
- Single file: `Update: filename.php (2025-12-03 13:32:15)`
- Multiple files: `Update: 5 files (2025-12-03 13:32:15)`

**Custom:**
- Provide message as first argument to script

## Post-Commit

After commit completes:
1. Changes are committed to local branch
2. Commit hash is displayed
3. No push is performed (local commit only)

---

**Note**: This command only commits locally. To push changes, use `git push` separately.

