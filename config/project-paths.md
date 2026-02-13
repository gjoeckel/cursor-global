# Project Paths Configuration

This configuration file defines the default project directories used by Cursor workflows and scripts.

## File Location

`config/project-paths.json`

## Structure

```json
{
  "canvas_reports": {
    "development": {
      "folder": "/Users/a00288946/Projects/canvas_reports",
      "description": "Active development workspace for canvas reports projects (CCC, CSU). Contains Apps Script code, clasp configurations, and git repositories."
    },
    "resources": {
      "folder": "/Users/a00288946/Agents/resources/canvas-reports",
      "description": "Documentation, testing files, and resources for canvas reports system. Contains generic documentation, enterprise-specific docs, and testing utilities."
    }
  }
}
```

## Usage

The `/yolo-full` workflow automatically reads this configuration and displays the directory purposes as the final step.

## Adding New Projects

To add a new project, add a new key to the JSON object:

```json
{
  "canvas_reports": { ... },
  "new_project": {
    "development": {
      "folder": "/path/to/dev",
      "description": "Description here"
    },
    "resources": {
      "folder": "/path/to/resources",
      "description": "Description here"
    }
  }
}
```

## Script

The `scripts/display-project-paths.sh` script reads this configuration and displays:
- Project name
- Development folder path and purpose
- Resources folder path and purpose
- Directory existence validation

## Integration

This configuration is integrated into:
- `config/workflows.json` - `yolo-full` workflow calls `display-project-paths.sh` as the final step

