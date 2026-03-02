# Cursor IDE Practices Validation (macOS)

**Date:** February 2026  
**Scope:** cursor-ops practices for Cursor IDE on macOS  
**Purpose:** Validate against current Cursor docs and community best practices; identify improvements.

---

## 1. Research Sources

- Cursor official docs: [Rules](https://cursor.com/docs/context/rules), [MCP](https://cursor.com/docs/context/mcp), [Agent Security](https://cursor.com/docs/account/agent-security)
- Community: Cursor Forum (autonomous workflows, auto-run, rules), Developer Toolkit, MCP Playground
- Security: MintMCP Blog (Cursor security), Cursor agent security docs

---

## 2. Validation Summary by Area

### 2.1 Rules and Agent Entry Points

| Practice in cursor-ops | Official / community guidance | Status |
|------------------------|------------------------------|--------|
| **AGENTS.md** at repo root as agent entry | AGENTS.md is a supported, simple alternative to `.cursor/rules`; Cursor reads it automatically. | **Validated** |
| **.cursor/rules/*.mdc** with `alwaysApply: true` for script policy | Modern format is `.cursor/rules/` with `.mdc` files and YAML frontmatter. `alwaysApply: true` makes rule always included. | **Validated** |
| **.cursorrules** for project/stack rules (PHP, Otter, Asana, etc.) | Legacy `.cursorrules` is **deprecated** but still supported. Precedence: Team > Project rules > User > .cursorrules > AGENTS.md. | **Validated** (legacy supported) |
| **Layered context**: AGENT-QUICKSTART → project AGENT-STARTUP | Context hierarchy and “minimal quickstart + project startup” align with “let agent find context” and avoid bloating single doc. | **Validated** |

**Improvement (non-urgent):** Prefer migrating project-specific rules from `.cursorrules` into `.cursor/rules/*.mdc` over time (e.g. one file per domain). Keep AGENTS.md as the main agent entry; use `.mdc` for scoped/always-applied policy.

---

### 2.2 MCP Configuration (macOS)

| Practice in cursor-ops | Official / community guidance | Status |
|------------------------|------------------------------|--------|
| **MCP config in repo** (`config/mcp.json`) with copy/symlink to `~/.cursor/mcp.json` | Global MCP config lives at `~/.cursor/mcp.json`; project-level at `.cursor/mcp.json`. Storing canonical config in repo and deploying to `~/.cursor/` is a valid pattern. | **Validated** |
| **Box MCP wrapper** that sources `config/box.env` and `~/.zshrc` before `npx mcp-box-minimal` | On macOS, apps launched from Dock do **not** source shell profile; PATH and env vars can be missing. Sourcing env in the MCP command wrapper is the correct way to provide tokens. | **Validated** |
| **CURSOR_OPS** (or `$HOME/Agents/cursor-ops`) to locate `config/box.env` | Documented pattern; allows one config to work from different install paths. | **Validated** |
| **Restart Cursor** after MCP/config changes | Cursor docs and community state that MCP server config is read at startup; full restart required for changes to take effect. | **Validated** (already in config/README Box section) |

**Improvement:** Explicitly document in `config/README.md` or MCP setup docs: “After changing `mcp.json` or `box.env`, fully quit and reopen Cursor (not just Reload Window).” This is already implied for Box; generalize for all MCP changes.

---

### 2.3 Workflows and Auto-Approve

| Practice in cursor-ops | Official / community guidance | Status |
|------------------------|------------------------------|--------|
| **Workflows** in `config/workflows.json` (symlinked/copied to `~/.cursor/workflows.json`) | Global workflows can live in `~/.cursor/workflows.json`; keeping source in repo is valid. | **Validated** |
| **auto_approve: true** for validation, session, and read-only scripts | Auto-run with an **allow list** of safe commands (tests, lint, validation, read-only) is recommended. Naming exact scripts (e.g. `validate-autonomous-mode.sh`, `check-mcp-health.sh`) is stricter and safe. | **Validated** |
| **Ask before** token refresh, destructive ops, DB migrations | Community and security guidance: require approval for credentials, destructive commands, and production/deploy actions. | **Validated** |
| **agent-action-policy.mdc** enumerates “run without asking” vs “ask first” | Clear, pre-declared policy reduces ad hoc decisions and aligns with “configure allow/deny for auto-run.” | **Validated** |

**Improvement:** None required for safety. Optional: in docs, mention that Cursor’s Agent settings (e.g. Cmd+Shift+J) allow configuring auto-run and that cursor-ops relies on a script-level allow list in rules.

---

### 2.4 Security and Credentials

| Practice in cursor-ops | Official / community guidance | Status |
|------------------------|------------------------------|--------|
| **Never commit secrets** in boundaries and .gitignore for `config/box.env` | Never commit API keys, tokens, or passwords; use .gitignore for credential files. | **Validated** |
| **Ask before** any script that obtains/refreshes credentials | Aligns with “disable auto-run for highest risk” in spirit while keeping allow list for safe commands. | **Validated** |
| **Token in repo-only file** (`config/box.env`) not in repo history | Tokens in a gitignored file under cursor-ops, loaded by wrapper only, is acceptable; ensure box.env is never committed. | **Validated** |

**Improvement:** Add one sentence to `AGENTS.md` or agent-action-policy: “Never output or log tokens or secrets.” Optional: note Cursor’s Privacy Mode for teams with strict zero-retention requirements (reference only).

---

### 2.5 Project Paths and Script Execution (macOS)

| Practice in cursor-ops | Official / community guidance | Status |
|------------------------|------------------------------|--------|
| **CURSOR_OPS** set when running cursor-ops scripts from another project | Scripts need a stable way to find config and project paths; env var is standard. | **Validated** |
| **config/project-paths.json** as single source of truth for dev/resources paths | Centralized path config avoids scattered paths and supports multiple projects. | **Validated** |
| **Unix-style paths** in docs and scripts | Correct for macOS. | **Validated** |
| **Absolute paths** in `config/workflows.json` (e.g. `/Users/.../scripts/...`) | Works but reduces portability; documented in CLEANUP-ANALYSIS and E2E-REVIEW-REPORT as a known issue. | **Validated** with caveat |

**Improvement:** Prefer workflows that resolve paths via `CURSOR_OPS` (or similar) so the same repo works on other machines without editing JSON. `measure-yolo-full.sh` already uses `CURSOR_OPS` for steps; consider applying the same pattern to `workflows.json` (e.g. script wrapper that injects paths, or Cursor’s env for workflow commands if supported).

---

### 2.6 Session and Changelog Context

| Practice in cursor-ops | Official / community guidance | Status |
|------------------------|------------------------------|--------|
| **Session scripts** (session-start, session-end, session-update) and **changelogs/projects/** | Session and history context is recommended; storing in changelogs and separating from “instructions” avoids confusion. | **Validated** |
| **Clarification** that changelogs are context/history, not step-by-step procedures | Aligns with “let agent find context” and avoids treating every doc as an imperative. | **Validated** |

**Improvement:** None required.

---

### 2.7 Commands and yolo-full

| Practice in cursor-ops | Official / community guidance | Status |
|------------------------|------------------------------|--------|
| **.cursor/commands/** for `/yolo-full` and other commands | Cursor supports custom commands; command definitions plus workflow that runs scripts is valid. | **Validated** |
| **yolo-full** runs validation, project paths, startup doc, then points to AGENT-QUICKSTART | Bootstrap → quickstart → project startup matches recommended flow. | **Validated** |
| **measure-yolo-full.sh** for completeness/efficiency | No direct Cursor-docs equivalent; good operational practice. | **Validated** |

**Improvement:** None required.

---

## 3. Areas for Improvement (Detailed)

### 3.1 Rules: Migrate from .cursorrules to .cursor/rules (Optional, Longer-Term)

- **Current:** Project/stack rules live in `.cursorrules`; script policy in `.cursor/rules/agent-action-policy.mdc`.
- **Guidance:** Cursor’s modern approach is `.cursor/rules/*.mdc` with frontmatter; `.cursorrules` is deprecated but supported.
- **Suggestion:** Over time, add `.cursor/rules/` files (e.g. `php-otter-stack.mdc`, `asana-subtasks.mdc`) with appropriate `globs` or `alwaysApply`, and trim `.cursorrules` to a short pointer or remove. Keeps AGENTS.md as the primary agent entry.

### 3.2 Workflows: Reduce Hardcoded Paths in config/workflows.json

- **Current:** `config/workflows.json` uses absolute paths (e.g. `/Users/a00288946/Agents/cursor-ops/scripts/...`).
- **Risk:** Repo is not portable; other users or CI must edit paths.
- **Suggestion:** (1) Use a wrapper script that sets `CURSOR_OPS` and runs the real script, and point workflows at that wrapper with a single fixed path or `$CURSOR_OPS` if Cursor expands env in workflow commands; or (2) Document that after clone/setup, run a one-time script that rewrites paths in `workflows.json` from `CURSOR_OPS` (setup.sh already does path updates for some paths). Ensure `measure-yolo-full.sh` and any CI use `CURSOR_OPS`-relative invocation (already done for measure script).

### 3.3 MCP: Document “Full Restart” for Any MCP Config Change

- **Current:** config/README (Box section) explains full quit and reopen for Box token changes.
- **Gap:** No single sentence that applies to **any** change to `mcp.json` or MCP-related env.
- **Suggestion:** In `config/README.md` (cursor-ops context section) or in `docs/MCP-SERVERS-IMPLEMENTATION.md`, add: “After changing `config/mcp.json` or copying it to `~/.cursor/mcp.json`, fully quit Cursor (Cmd+Q) and reopen; Reload Window is not sufficient for MCP servers to pick up changes.”

### 3.4 Security: Explicit “No Logging of Secrets” in Policy

- **Current:** Boundaries say “Never: Commit secrets” and policy says ask before credential scripts.
- **Gap:** No explicit “do not echo or log tokens/secrets” in agent-facing docs.
- **Suggestion:** In `.cursor/rules/agent-action-policy.mdc` or AGENTS.md, add one line: “Never output, log, or include tokens, API keys, or passwords in responses or logs.”

### 3.5 macOS: Shell/Env When Launching from Dock

- **Current:** Box MCP wrapper sources `config/box.env` and `~/.zshrc` so token is available when Cursor is launched from Dock.
- **Guidance:** Cursor on macOS can run without sourcing the user’s shell profile when started from Dock; MCP servers inherit the process env. Sourcing in the command is the right fix.
- **Suggestion:** In `config/README.md` (Box section), add one sentence: “This is necessary because Cursor started from the Dock does not source your shell profile, so env vars from `~/.zshrc` are not available to MCP processes unless loaded in the command.” (Already implied; making it explicit helps future maintainers.)

### 3.6 Docs: Link to Official Cursor Docs

- **Current:** Docs reference Cursor behavior but rarely link to cursor.com/docs.
- **Suggestion:** In `docs/INDEX.md` or `docs/README.md`, add a “Cursor official docs” subsection with links to [Rules](https://cursor.com/docs/context/rules), [MCP](https://cursor.com/docs/context/mcp), and [Agent security](https://cursor.com/docs/account/agent-security) so maintainers can quickly check current behavior.

---

## 4. Summary Table

| Area | Validated | Improvement priority |
|------|-----------|------------------------|
| AGENTS.md + quickstart + startup | Yes | None |
| .cursor/rules (agent-action-policy.mdc) | Yes | Optional: migrate more from .cursorrules to .mdc |
| .cursorrules (legacy) | Supported | Optional: gradual migration to .mdc |
| MCP config location and Box wrapper | Yes | Document “full restart” for any MCP change; optional sentence on Dock/env |
| Workflows and auto_approve | Yes | Reduce hardcoded paths in workflows.json |
| Security (no commit, ask for credentials) | Yes | Add “no logging of secrets” |
| CURSOR_OPS and project-paths.json | Yes | None |
| Session/changelog context | Yes | None |
| Commands and yolo-full | Yes | None |

---

## 5. Conclusion

cursor-ops practices for Cursor IDE on macOS are **aligned** with current Cursor documentation and common best practices: agent entry (AGENTS.md), rules (`.cursor/rules` + legacy `.cursorrules`), MCP (global config + Box env wrapper), workflows (auto-approve for safe scripts, ask for credentials/destructive), and security (no commit of secrets, ask before credential use).

**Recommended next steps (in order of impact):**

1. **High:** Document “full restart Cursor after any MCP config change” in one place. ✅ **Done:** `config/README.md` (cursor-ops context section).
2. **High:** Add “never log or output secrets” to agent policy or AGENTS.md. ✅ **Done:** `.cursor/rules/agent-action-policy.mdc` (Secrets and logging section) and AGENTS.md (Never list).
3. **Medium:** Plan for reducing hardcoded paths in `workflows.json` (wrapper or setup-time path injection). ✅ **Done:** `scripts/run-workflow.sh` added; all workflow commands use it; `config/README.md` and `scripts/README.md` document running `./setup.sh` after clone to rewrite paths.
4. **Low:** Add “Cursor official docs” links to docs index/README. ✅ **Done:** `docs/README.md` and `docs/INDEX.md`.
5. **Low:** Optional: migrate remaining `.cursorrules` content into `.cursor/rules/*.mdc` over time. (Deferred.)
6. **Low:** macOS Dock sentence in Box section. ✅ **Done:** `config/README.md` (How the Box MCP gets the token).
