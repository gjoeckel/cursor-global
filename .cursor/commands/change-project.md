---
description: Update project development and resources folder paths
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Change Project Paths

Update project development and resources folder paths in the project configuration through native macOS folder picker dialogs.

## Execution Steps

Execute the following steps in sequence. **IMPORTANT: Keep all output to chat VERY CONCISE. Only display prompts and final success message. All processing should be done silently.**

1. **Read current configuration**: Read `config/project-paths.json` to get current paths (silently, no output)

2. **Open Development folder picker**: Automatically open macOS Finder folder picker (silently, no output):
   - Get parent directory: `PARENT_PATH=$(dirname "$CURRENT_DEV_PATH")`
   - Execute: `osascript -e "POSIX path of (choose folder with prompt \"Select development folder:\" default location (POSIX file \"$PARENT_PATH\"))" 2>/dev/null`
   - If picker is cancelled or returns empty, use current path from config
   - If folder is selected, use the selected path
   - Wait for picker to close before proceeding

3. **Open Resources folder picker**: After development folder picker closes, automatically open macOS Finder folder picker (silently, no output):
   - Get parent directory: `PARENT_PATH=$(dirname "$CURRENT_RES_PATH")`
   - Execute: `osascript -e "POSIX path of (choose folder with prompt \"Select resources folder:\" default location (POSIX file \"$PARENT_PATH\"))" 2>/dev/null`
   - If picker is cancelled or returns empty, use current path from config
   - If folder is selected, use the selected path
   - Wait for picker to close before proceeding

4. **Process selected paths** (silently, no output):
   - Normalize all paths to absolute format
   - Remove trailing slashes if present
   - Only update paths that changed (skip if same as current)

5. **Update configuration** (silently, no output): Update `config/project-paths.json` only if paths changed, preserving existing descriptions.

6. **Success message**: Display ONLY this confirmation with current paths:
   ```
   ✅ Project paths updated
   Development: [final development path]
   Resources: [final resources path]
   ```

## Output Rules

- **ONLY display**: The final success message with paths
- **DO NOT display**: Folder picker dialogs opening, path validation, directory checks, file updates, or any intermediate steps
- **All processing**: Must be done silently in memory/background
- **Pickers open automatically**: No chat prompts needed, pickers appear one after another

## Picker Behavior

- **Development folder picker**: Opens automatically at parent folder of current development path
- **Resources folder picker**: Opens automatically at parent folder of current resources path
- **Cancellation handling**: If user cancels picker (clicks Cancel or closes dialog), use current path and continue
- **Empty result handling**: If picker returns empty string or error, use current path and continue
- **Automatic progression**: After each picker closes, automatically proceed to next picker or completion

## Configuration File

- **Location**: `config/project-paths.json`
- **Project key**: `canvas_reports` (maintain this structure)

## Path Handling

- Normalize all paths to absolute format before saving
- Remove trailing slashes from picker results
- macOS folder picker returns absolute POSIX paths automatically

---

**Note**: This command automatically opens native macOS Finder folder pickers one at a time. If you cancel a picker, the current path is kept and the workflow continues. All processing is done silently with minimal output.
