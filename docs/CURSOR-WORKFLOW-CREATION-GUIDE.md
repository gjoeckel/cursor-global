# Cursor Workflow Creation Guide

**Complete process for creating workflows in Cursor IDE, including JSON definition and command file documentation**

---

## Overview

Cursor workflows can be created in two ways:
1. **Project-specific workflows** - Defined in `<project>/.cursor/workflows.json`
2. **Command files** - Documentation in `.cursor/commands/*.md` files

---

## Step-by-Step Process

### Step 1: Create the Script File

Create the executable script that performs the workflow action:

```bash
# Location: Agents/project-resources/scripts/workflow-name.sh
#!/bin/bash
# Workflow Name - Description
set -e

# Script implementation here
```

**Make it executable:**
```bash
chmod +x /path/to/script.sh
```

---

### Step 2: Create/Update workflows.json

**Location:** `<project>/.cursor/workflows.json`

**Format:**
```json
{
  "workflow-name": {
    "description": "Brief description of what the workflow does",
    "commands": [
      "bash /path/to/script.sh"
    ],
    "auto_approve": false,
    "timeout": 30000,
    "on_error": "stop"
  }
}
```

**Parameters:**
- `description`: Human-readable description
- `commands`: Array of commands to execute sequentially
- `auto_approve`: `false` = requires confirmation, `true` = auto-execute
- `timeout`: Timeout in milliseconds (e.g., 30000 = 30 seconds)
- `on_error`: `"stop"` = halt on error, `"continue"` = ignore errors

**Example:**
```json
{
  "commit-branch-local": {
    "description": "Commit all changes to current branch in local git repository",
    "commands": [
      "bash /Users/a00288946/Agents/otter-resources/scripts/commit-branch-local.sh"
    ],
    "auto_approve": false,
    "timeout": 30000,
    "on_error": "stop"
  }
}
```

---

### Step 3: Create Command Documentation File

**Location:** `.cursor/commands/workflow-name.md`

**Structure:**
```markdown
---
description: Brief description for Cursor command system
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Workflow Name

Brief description of the workflow.

## What This Does

1. **Action 1** - Description
2. **Action 2** - Description
3. **Action 3** - Description

## Execution

Execute the workflow:

```bash
bash /path/to/script.sh
```

Or with parameters:

```bash
bash /path/to/script.sh "parameter"
```

## Configuration

- Setting 1: Description
- Setting 2: Description

## Requirements

- Requirement 1
- Requirement 2

## Post-Execution

After workflow completes:
1. Result 1
2. Result 2

---

**Note**: Additional notes or warnings.
```

**Example:**
```markdown
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
bash /Users/a00288946/Agents/otter-resources/scripts/commit-branch-local.sh
```

## Configuration

The commit script:
- Works in: `/Users/a00288946/Projects/onlinecourses-services`
- Commits to: Current git branch
- Auto-generates messages based on changed files and timestamp

## Requirements

- Git repository initialized
- Changes to commit (will exit gracefully if no changes)

---

**Note**: This command only commits locally. To push changes, use `git push` separately.
```

---

### Step 4: Validate JSON Syntax

```bash
cd /path/to/project
python3 -m json.tool .cursor/workflows.json > /dev/null && echo "✅ Valid JSON"
```

---

### Step 5: Test Workflow

**Option 1: Invoke via Cursor chat**
- Type: `workflow-name` or `/workflow-name`
- Workflow should appear in suggestions

**Option 2: Run script directly**
```bash
bash /path/to/script.sh
```

---

### Step 6: Troubleshooting

**Workflow doesn't appear in Cursor:**
1. **Restart Cursor IDE** - Workflows are loaded on startup
2. **Verify file locations:**
   - Check `.cursor/workflows.json` exists in project root
   - Check `.cursor/commands/workflow-name.md` exists
3. **Verify JSON syntax:**
   ```bash
   python3 -m json.tool .cursor/workflows.json
   ```
4. **Check script permissions:**
   ```bash
   ls -l /path/to/script.sh
   # Should show: -rwxr-xr-x (executable)
   ```

---

## File Locations Summary

### Project-Specific Workflows
- **Workflow definition:** `<project>/.cursor/workflows.json`
- **Command documentation:** `<project>/.cursor/commands/workflow-name.md` (optional)
- **Script file:** `Agents/project-resources/scripts/workflow-name.sh`

### Global Workflows
- **Workflow definition:** `~/.cursor/workflows.json`
- **Command documentation:** `~/.cursor/commands/workflow-name.md` (optional)
- **Script file:** `~/.local/bin/cursor-tools/workflow-name.sh` (or symlinked)

---

## Complete Example: commit-branch-local

### 1. Script File
**Location:** `/Users/a00288946/Agents/otter-resources/scripts/commit-branch-local.sh`

```bash
#!/bin/bash
# Commit Branch Local - Commit changes to current branch
set -e

PROJECT_DIR="/Users/a00288946/Projects/onlinecourses-services"
cd "$PROJECT_DIR" || exit 1

# Check if git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not a git repository"
    exit 1
fi

# Stage and commit
git add -A
git commit -m "Update: $(date +'%Y-%m-%d %H:%M:%S')"
```

### 2. Workflow JSON
**Location:** `/Users/a00288946/Projects/onlinecourses-services/.cursor/workflows.json`

```json
{
  "commit-branch-local": {
    "description": "Commit all changes to current branch in local git repository",
    "commands": [
      "bash /Users/a00288946/Agents/otter-resources/scripts/commit-branch-local.sh"
    ],
    "auto_approve": false,
    "timeout": 30000,
    "on_error": "stop"
  }
}
```

### 3. Command File
**Location:** `.cursor/commands/commit-branch-local.md` (or `~/.cursor/commands/commit-branch-local.md`)

```markdown
---
description: Commit all changes to current branch in local git repository
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Commit Branch Local

[Documentation content as shown in Step 3]
```

---

## Best Practices

1. **Script Location:**
   - Project-specific: `Agents/project-resources/scripts/`
   - Global: `~/.local/bin/cursor-tools/`

2. **Naming Conventions:**
   - Use kebab-case: `workflow-name`
   - Be descriptive: `commit-branch-local` not `commit`

3. **Error Handling:**
   - Use `set -e` in bash scripts
   - Set `on_error: "stop"` for critical workflows
   - Set `on_error: "continue"` for non-critical workflows

4. **User Confirmation:**
   - Use `auto_approve: false` for destructive operations
   - Use `auto_approve: true` for safe, read-only operations

5. **Timeouts:**
   - Short operations: 15000-30000ms
   - Medium operations: 60000-120000ms
   - Long operations: 300000ms+

6. **Documentation:**
   - Always include "What This Does" section
   - Document all requirements
   - Include post-execution steps

---

## Verification Checklist

- [ ] Script file created and executable
- [ ] Script tested independently
- [ ] workflows.json created/updated with valid JSON
- [ ] Command .md file created with proper frontmatter
- [ ] JSON syntax validated
- [ ] Workflow appears in Cursor (may require restart)
- [ ] Workflow executes successfully
- [ ] Error handling works correctly

---

## Related Documentation

- **Example workflow:** `commit-branch-local` in `Projects/onlinecourses-services/.cursor/workflows.json`
- **Example script:** `Agents/otter-resources/scripts/commit-branch-local.sh`
- **Example command file:** `.cursor/commands/commit-branch-local.md`

---

**Last Updated:** December 3, 2025

