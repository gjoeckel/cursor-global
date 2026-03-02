# Audit: /yolo-full legacy and conflicting files

**Script:** `scripts/audit-yolo-full-legacy.sh`  
**Purpose:** Find legacy or conflicting definitions and references for the `/yolo-full` workflow and its supporting changes (AGENT-QUICKSTART, show-project-startup, get-current-project, etc.).

## How to run

From cursor-ops root:

```bash
bash scripts/audit-yolo-full-legacy.sh
```

Machine-readable report:

```bash
bash scripts/audit-yolo-full-legacy.sh --json
```

## What the audit checks

1. **Canonical workflow** (`config/workflows.json`) — Ensures `yolo-full` includes: `validate-autonomous-mode.sh --json`, `display-project-paths.sh`, `show-project-startup.sh`, and the AGENT-QUICKSTART echo.
2. **Project command file** (`.cursor/commands/yolo-full.md`) — Looks for legacy patterns: Claude Code, `/mcp`, `claude mcp list`, `.cursor-workspaces`, `csp`, and tool names like `Bash, Read, Write` (Claude) instead of `run_terminal_cmd, read_file` (Cursor).
3. **Global commands override** — If `~/.cursor/commands/yolo-full.md` exists, reports it. Cursor may load global commands and override or conflict with the project command; align or remove the global file if you want project-only behavior.
4. **Docs** — Lists docs that mention `validate-autonomous-mode.sh` without `--json` (may describe an old workflow).
5. **Other workflow files** — Lists other JSON configs that reference `yolo-full` (e.g. `docs/cursor-branch-workflows-FIXED.json`).
6. **Supporting scripts** — Confirms presence of: `validate-autonomous-mode.sh`, `display-project-paths.sh`, `show-project-startup.sh`, `get-current-project.sh`.
7. **Supporting docs** — Confirms presence of: `docs/AGENT-QUICKSTART.md`, `docs/AGENT-STARTUP-TEMPLATE.md`.

## Resolving findings

| Finding | Action |
|--------|--------|
| **Global override** (`~/.cursor/commands/yolo-full.md`) | Copy project `.cursor/commands/yolo-full.md` to `~/.cursor/commands/yolo-full.md` to align global with project, or remove the global file to rely on the project command only. |
| **Legacy patterns in project command** | Edit `.cursor/commands/yolo-full.md`: remove Claude Code refs, use Cursor tool names (see `.cursor/commands/yolo-full.md` in repo). |
| **Missing workflow steps** | Edit `config/workflows.json`: add the missing step(s) to `yolo-full.commands` (see current list in that file). |
| **Docs may be outdated** | Open the listed doc and update any workflow description to include `--json` and `show-project-startup.sh` where accurate. |
| **Other workflow files** | Review; update or archive if they are old copies (e.g. branch-specific). |

## Canonical sources of truth

- **Workflow definition:** `config/workflows.json` → `yolo-full`
- **Command instructions (Cursor IDE):** `.cursor/commands/yolo-full.md`
- **User-facing quickstart:** `docs/AGENT-QUICKSTART.md`
