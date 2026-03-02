# Agent Quickstart (cursor-ops)

**Purpose:** Get an agent up-to-speed after `/yolo-full`. Keep this doc minimal; project-specific context lives in each project’s startup doc (see below).

**Scope:** Written for **Cursor IDE on macOS**. Workflow and script paths are Unix-style; on Windows/Linux use equivalent paths and shell.

## What `/yolo-full` did

- Validated MCP config (servers present) and project paths.
- Displayed development and resources folders for each project in `config/project-paths.json`.
- Optionally showed the current project’s startup doc (if `show-project-startup.sh` ran).

## Current project

- **Env:** `CURSOR_CURRENT_PROJECT` = key in `config/project-paths.json` (e.g. `canvas_reports`).
- **Default:** First project in `config/project-paths.json` when env is unset.
- **Script:** `scripts/get-current-project.sh` prints the current project key and path to that project’s `AGENT-STARTUP.md`.

## Where to get project context

| Layer | Location | Use |
|-------|----------|-----|
| **Project overview** | `<resources.folder>/AGENT-STARTUP.md` | Purpose, key paths, recent focus, links. One per project. |
| **Session history** | `changelogs/projects/<name>.md` or run `ai-start` | Recent session summaries and state. |

For the **current project**, read `AGENT-STARTUP.md` in that project’s resources folder (path printed by yolo-full or by `scripts/show-project-startup.sh`).

## Next steps

1. If yolo-full showed a startup doc snippet, read the full file at the path given.
2. Otherwise run `scripts/get-current-project.sh` to get the current project and path to its `AGENT-STARTUP.md`, then read that file.
3. For recent session context, run **ai-start** or read `changelogs/projects/<project>.md`.

## Workflows and Commands

- **Workflow list:** `config/workflows.json` - Available workflow commands
- **Command definitions:** `.cursor/commands/` - Cursor command definitions (e.g., `/yolo-full`)

## Session Context

- **Recent sessions:** `changelogs/projects/<name>.md` or run `ai-start` workflow
- **Measure logs:** `changelogs/yolo-full-measure-*.txt` (for yolo-full validation history)

**Note:** Changelogs contain session history and context, not step-by-step instructions. Use them to understand recent work, not as procedures to follow.

## Boundaries (cursor-ops)

- **Always:** Use `config/project-paths.json` for dev/resources paths; run scripts from cursor-ops with full path and `CURSOR_OPS` set when cwd is elsewhere.
- **Ask first:** Token refresh, destructive ops, DB migrations (per `.cursor/rules/agent-action-policy.mdc`).
- **Never:** Commit secrets; change project-paths or MCP config without explicit request.
