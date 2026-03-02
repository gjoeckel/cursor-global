# Agent Startup: Recommendations for /yolo-full and Project “Up-to-Speed” Docs

**Goal:** Add process to `/yolo-full` and/or targeted startup documentation so an agent can quickly get up-to-speed on the **current project**.

---

## Research summary (best practices applied)

- **Minimal, focused docs:** Industry guidance (e.g. GitHub’s analysis of 2,500+ repos, AGENTS.md best practices) stresses keeping agent docs small; ~150–200 instructions equivalent; avoid bloat. README holds most context; agent docs add operational guidance (commands, paths, boundaries).
- **Six areas that work:** Commands, testing, project structure, code style, git workflow, boundaries. We adapt for “startup”: purpose, key paths, recent focus, links, boundaries (always / ask first / never).
- **Hierarchical context:** Global (quickstart) → project (AGENT-STARTUP in resources) → session (changelogs). Layered context improves consistency.
- **Put commands early:** In quickstart, “what to run” and “where to read” appear early so the agent can act without scanning the whole doc.
- **Clear boundaries:** Three-tier “Always / Ask first / Never” pattern reduces mistakes; we use it in AGENT-QUICKSTART and in the per-project startup template.
- **Current project resolution:** Env override (`CURSOR_CURRENT_PROJECT`) plus default (first project in config) gives predictable behavior without relying on cwd.

**Implemented (see below):** AGENT-QUICKSTART.md, get-current-project.sh, show-project-startup.sh, yolo-full steps, AGENT-STARTUP-TEMPLATE.md, and a sample AGENT-STARTUP.md for canvas_media_manager.

---

## Scope: Cursor IDE on macOS (research confirmation)

Web research confirms the following alignment when recommendations are used with **Cursor IDE on macOS**:

- **Rules and docs:** Cursor uses `.cursor/rules/` (`.mdc`) and supports `AGENTS.md` at project root; rule precedence is Team → Project rules → User → `.cursorrules` → AGENTS.md. Our use of `.cursor/rules/agent-action-policy.mdc` and of markdown docs (AGENT-QUICKSTART, AGENT-STARTUP) in `docs/` and in resources folders is consistent with Cursor’s model. No macOS-specific caveats for rules or doc location.
- **Workflows and scripts:** Cursor runs terminal commands (including bash) as part of agent workflows; on macOS the environment typically provides `bash` and `zsh`. Our workflow steps invoke `bash /path/to/script.sh` with absolute paths, which matches Cursor’s current behavior (and the common need for absolute paths in config/workflows when variable substitution like `${workspaceFolder}` is not yet supported in MCP/workflow config).
- **Paths:** Cursor on Mac uses Unix-style paths (e.g. `/Users/...`). Our `config/workflows.json` and `config/project-paths.json` use absolute paths appropriate for macOS. On Windows or Linux, the same structure applies but paths would differ; the *recommendations* (quickstart, startup doc, current-project resolution) are platform-agnostic; only the concrete path values are macOS/user-specific unless parameterized.
- **Auto-run / YOLO:** Enabling auto-run (e.g. for yolo-full) is done in Cursor Settings; on macOS this is often configured via `Cmd+Shift+J` or the settings UI. Our “run without asking” policy for validation and startup scripts aligns with using auto-run for these steps on Cursor on Mac.

Where applicable, the implemented recommendations are therefore **scoped to and aligned with Cursor IDE on macOS**; the same patterns can be used on Windows/Linux with path and shell adjustments.

---

## 1. Add a single “Agent Quickstart” doc and point to it from yolo-full

**What:** Create `docs/AGENT-QUICKSTART.md` in cursor-ops that explains, in one place:
- What `/yolo-full` just did (validation + project paths).
- How to determine the **current project** (see recommendation 4).
- Where to find project-specific startup docs (per-project startup file in resources or changelogs).
- Suggested next step: e.g. “Run `ai-start` or read the current project’s startup doc.”

**yolo-full change:** Add a final step that prints the path to this doc, e.g.  
`echo "Next: read docs/AGENT-QUICKSTART.md for current-project context."`

**Why:** One predictable entry point; agent always has a “read this first” path after validation.

---

## 2. Per-project startup doc in the resources folder

**What:** For each project in `config/project-paths.json`, maintain a standard startup file in that project’s **resources** folder, e.g.  
`<resources.folder>/AGENT-STARTUP.md`.

**Suggested template:**
- **Purpose** — One paragraph: what this project is and what the agent is helping with.
- **Key paths** — Dev folder, resources folder, and any important subpaths (e.g. Box mapping output).
- **Recent focus / decisions** — Last 1–2 weeks: what changed, key decisions, open questions.
- **Links** — Pointers to deep docs (architecture, APIs, runbooks) in the same resources folder or cursor-ops.

**yolo-full / tooling:** Either (a) add a step or script that, given “current project,” prints the path to that project’s `AGENT-STARTUP.md` (and optionally the first N lines), or (b) document in AGENT-QUICKSTART that the agent should open `<resources>/AGENT-STARTUP.md` for the current project.

**Why:** Gives the agent a consistent, project-specific “start here” that’s close to the code and docs.

---

## 3. Optional yolo-full step: surface project context (session-start or startup doc)

**What:** Add an optional step to the yolo-full workflow that loads or surfaces project context so one command can do “validate + get project context.”

**Options:**
- **A.** Run `session-start.sh` after validation.  
  - **Caveat:** session-start uses `basename $(pwd)` as project name and looks for `changelogs/projects/<name>.md`; that may not match project-paths keys (e.g. `canvas_media_manager` vs `canvas_reports`). Best if cwd is the dev folder and changelog names align.
- **B.** Add a small script `scripts/show-project-startup.sh` that: reads project-paths.json; resolves “current project” (env, first project, or from cwd); prints path to that project’s `AGENT-STARTUP.md` (if it exists) and optionally cats the first 20–30 lines.  
  - yolo-full then runs this script after `display-project-paths.sh`.

**Recommendation:** Prefer B (explicit startup doc in resources) so behavior doesn’t depend on cwd and aligns with project-paths. Option A can remain the “session” flow when the user is in a specific repo.

**Why:** Reduces steps for the agent and ties “up-to-speed” directly into the same command they already run.

---

## 4. Define and document “current project” resolution

**What:** Define how “current project” is determined and document it in AGENT-QUICKSTART (and, if needed, in a short config or script).

**Suggested order of precedence:**
1. **Env:** `CURSOR_CURRENT_PROJECT` (or similar) set to a key in `project-paths.json` (e.g. `canvas_reports`).
2. **Workspace / path:** If the workspace is a multi-root with a known project folder, or cwd is under a known `development.folder`, map that to a project key.
3. **Default:** First project in `project-paths.json` when no env or path match.

**Optional:** Add `scripts/get-current-project.sh` that outputs the current project key and the path to its startup doc (if any). yolo-full or other workflows can call it and echo the result.

**Why:** Consistent behavior and docs so both humans and agents know which project “current” refers to.

---

## 5. Align session-start with project-paths and startup docs

**What:** Reduce duplication and confusion between (a) session-start’s `changelogs/projects/<name>.md` and (b) per-project `AGENT-STARTUP.md` in resources.

**Options:**
- **A.** Treat them as two layers: **AGENT-STARTUP.md** = “what is this project and where to look” (in resources); **changelogs/projects/*.md** = “what happened in recent sessions” (in cursor-ops). Document in AGENT-QUICKSTART: “For project overview, read resources’ AGENT-STARTUP.md; for recent session context, run ai-start or read changelogs/projects.”
- **B.** Have session-start, when loading project context, prefer the project’s resources folder: if `AGENT-STARTUP.md` exists for the resolved project, print or reference it; otherwise fall back to changelogs/projects/<name>.md.

**Recommendation:** A plus B: define both roles clearly and, in session-start, prefer resources’ AGENT-STARTUP.md when the project can be resolved from project-paths.

**Why:** One coherent story: “startup doc” in resources for project overview; changelogs for session history; both discoverable from the same docs and scripts.

---

## Summary table

| # | Recommendation | Adds to yolo-full? | Creates / uses startup docs? |
|---|----------------|--------------------|------------------------------|
| 1 | Single AGENT-QUICKSTART.md + echo in yolo-full | Yes (echo path) | Yes (one global doc) |
| 2 | Per-project AGENT-STARTUP.md in resources | Optional (pointer or script) | Yes (one per project) |
| 3 | Step to surface project context (e.g. show-project-startup.sh) | Yes (new step) | Uses startup doc from #2 |
| 4 | Define “current project” and optional get-current-project.sh | Optional (script used by #3) | Doc only |
| 5 | Align session-start with project-paths and startup docs | No | Clarifies use of both |

**Suggested implementation order:** 4 → 1 → 2 → 3 → 5 (define current project and quickstart first; then per-project startup docs; then yolo-full step and session-start alignment).

---

## Implementation status (post–research)

| # | Recommendation | Status |
|---|----------------|--------|
| 1 | AGENT-QUICKSTART.md + echo in yolo-full | Done: `docs/AGENT-QUICKSTART.md`; yolo-full echoes "Next: read docs/AGENT-QUICKSTART.md". |
| 2 | Per-project AGENT-STARTUP.md in resources | Done: template at `docs/AGENT-STARTUP-TEMPLATE.md`; sample at `resources/canvas_media_manager/AGENT-STARTUP.md`. |
| 3 | Step to surface project context | Done: `scripts/show-project-startup.sh` (calls get-current-project, prints path and first N lines of AGENT-STARTUP.md); added to yolo-full. |
| 4 | Define "current project" + get-current-project.sh | Done: `scripts/get-current-project.sh` (env `CURSOR_CURRENT_PROJECT` else first project); documented in AGENT-QUICKSTART. |
| 5 | Align session-start with project-paths and startup docs | Documented in AGENT-QUICKSTART (AGENT-STARTUP = overview; changelogs/ai-start = session history). Session-start script unchanged. |
