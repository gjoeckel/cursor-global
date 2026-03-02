# AI Agent Entry Point (cursor-ops)

**For AI agents working in this repository.**

## Quick Start

1. **Run `/yolo-full`** (or `bash scripts/measure-yolo-full.sh`) to validate environment and get current project context.
2. **Read `docs/AGENT-QUICKSTART.md`** for current-project context and next steps.

## Agent Flow

```
/yolo-full → docs/AGENT-QUICKSTART.md → <project>/resources/AGENT-STARTUP.md
```

## Key Resources

| Resource | Location | Purpose |
|----------|----------|---------|
| **Agent quickstart** | `docs/AGENT-QUICKSTART.md` | Post-yolo-full context and next steps |
| **Project startup** | `<resources>/AGENT-STARTUP.md` | Per-project overview and operational context |
| **Workflows** | `config/workflows.json` | Available workflow commands |
| **Commands** | `.cursor/commands/` | Cursor command definitions |
| **Script policy** | `.cursor/rules/agent-action-policy.mdc` | Run without asking vs ask first |
| **Workspace context** | `.cursor/rules/workspace-context.mdc` | Cursor-ops read-only default; "resources" / "development" = project paths from project-paths.json |
| **Project paths** | `config/project-paths.json` | Development and resources folder mappings |
| **Task index** | `docs/INDEX.md` | Find docs by task (Asana, Box, MCP, etc.) |

## Session Context

- **Recent sessions:** `changelogs/projects/<name>.md` or run `ai-start` workflow
- **Measure logs:** `changelogs/yolo-full-measure-*.txt` (for yolo-full validation history)

**Note:** Changelogs contain session history and context, not step-by-step instructions.

## Core Agent Scripts

These scripts are part of the standard agent bootstrap flow:
- `scripts/validate-autonomous-mode.sh` - MCP and environment validation
- `scripts/display-project-paths.sh` - Show project path mappings
- `scripts/show-project-startup.sh` - Display current project startup doc
- `scripts/get-current-project.sh` - Resolve current project key
- `scripts/measure-yolo-full.sh` - Measure yolo-full completeness/efficiency

Other scripts in `scripts/` are project or task-specific.

## Boundaries

- **Always:** Use `config/project-paths.json` for paths; set `CURSOR_OPS` when running scripts from other directories. Treat cursor-ops as read-only unless the task or user authorizes edits (see `.cursor/rules/workspace-context.mdc`).
- **Ask first:** Token refresh, destructive ops, DB migrations (see `.cursor/rules/agent-action-policy.mdc`).
- **Never:** Commit secrets; change project-paths or MCP config without explicit request; output or log tokens, API keys, or passwords.
