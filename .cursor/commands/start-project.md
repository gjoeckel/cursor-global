---
description: Pick development/resources folders and update project paths
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Start Project

Use macOS folder pickers to set development and resources folders for the active project (`config/project-paths.json`) and save the paths.

## Execution Steps

Execute these steps in order. Keep all processing silent; only print the final success message.

1. Read `config/project-paths.json` to get current dev/resources paths (no output).
2. Open development folder picker (macOS Finder):
   - Default location: /Users/a00288946/Projects
   - Command: `osascript -e "POSIX path of (choose folder with prompt \"Select development folder:\" default location (POSIX file \"/Users/a00288946/Projects\"))" 2>/dev/null`
   - If cancelled/empty, keep current dev path.
3. Open resources folder picker (macOS Finder):
   - Default location: /Users/a00288946/Agents/resources
   - Command: `osascript -e "POSIX path of (choose folder with prompt \"Select resources folder:\" default location (POSIX file \"/Users/a00288946/Agents/resources\"))" 2>/dev/null`
   - If cancelled/empty, keep current resources path.
4. Normalize to absolute paths, strip trailing slashes, update only changed paths, preserve descriptions.
5. Write updates back to `config/project-paths.json` if paths changed.
6. Output only:
   ```
   ✅ Project paths updated
   Development: [path]
   Resources: [path]
   ```

## Command

```bash
bash /Users/a00288946/Agents/cursor-ops/scripts/start-project.sh
```

