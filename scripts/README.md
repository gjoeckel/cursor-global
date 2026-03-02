# Scripts Directory (cursor-ops)

**Automation scripts for Cursor IDE and agent workflows.**

## Workflow wrapper

| Script | Purpose |
|--------|---------|
| `run-workflow.sh` | Sets `CURSOR_OPS` and runs a script by name (e.g. `run-workflow.sh session-start`). Used by `config/workflows.json` so all workflow commands have a single path to rewrite; run `./setup.sh` after clone to update paths. |

## Core Agent Bootstrap Scripts

These scripts are part of the standard agent bootstrap flow and are called by `/yolo-full`:

| Script | Purpose | Used By |
|--------|---------|---------|
| `validate-autonomous-mode.sh` | MCP and environment validation | yolo-full |
| `display-project-paths.sh` | Show project path mappings | yolo-full |
| `show-project-startup.sh` | Display current project startup doc | yolo-full |
| `get-current-project.sh` | Resolve current project key | show-project-startup.sh |
| `measure-yolo-full.sh` | Measure yolo-full completeness/efficiency | CI, manual validation |

## Session Management Scripts

| Script | Purpose |
|--------|---------|
| `session-start.sh` | Initialize AI session context |
| `session-end.sh` | Save session and create changelog |
| `session-update.sh` | Mid-session checkpoint |

## MCP Management Scripts

| Script | Purpose |
|--------|---------|
| `check-mcp-health.sh` | Check MCP server health |
| `check-mcp-tool-count.sh` | Count available MCP tools |
| `start-mcp-servers.sh` | Start MCP servers |
| `restart-mcp-servers.sh` | Restart MCP servers |
| `setup-mcp-servers.sh` | Setup MCP server configuration |

## Setup and Configuration Scripts

| Script | Purpose |
|--------|---------|
| `setup-cursor-environment.sh` | Setup Cursor environment |
| `configure-cursor-autonomy.sh` | Configure Cursor autonomy settings |
| `validate-change-project-workflow.sh` | Validate change-project workflow |

## Git Automation Scripts

| Script | Purpose |
|--------|---------|
| `git-local-commit.sh` | Local git commit |
| `git-local-merge.sh` | Local git merge |
| `github-push-gate.sh` | GitHub push with token gate |

## Rewire (Otter) Scripts

| Script | Purpose |
|--------|---------|
| `rewire-pre-flight.sh` | Pre-flight checks before starting a rewire phase (1, 2, or 3). Verifies otter paths, docs, git branch/tree, phase tags, production refs. Run: `bash scripts/rewire-pre-flight.sh [1\|2\|3]`. |

## Utility Scripts

| Script | Purpose |
|--------|---------|
| `compress-context.sh` | Compress context for size reduction |
| `check-agent-comms.sh` | Check agent communication |
| `generate-workflows-doc.sh` | Generate workflows documentation |

## Project/Task-Specific Scripts

Other scripts in this directory are project-specific or task-specific (e.g., `otter-*`, `fill-proxy-*`, `merge-*`, `find-*`). These are not part of the core agent bootstrap flow.

## Usage

**From cursor-ops directory:**
```bash
bash scripts/script-name.sh
```

**From another directory:**
```bash
CURSOR_OPS=/path/to/cursor-ops bash /path/to/cursor-ops/scripts/script-name.sh
```

Set `CURSOR_OPS` so scripts can find `config/` and other resources.
