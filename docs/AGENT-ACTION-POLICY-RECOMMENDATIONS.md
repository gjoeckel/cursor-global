# Agent Action Policy — Recommendations & Research Validation

This doc summarizes how the tiered action policy was validated and how it is implemented in cursor-ops so Cursor agents can run scripts with predictable, safe behavior.

## 1. Review of the Proposed Design

The design you provided is sound:

- **Pre-declare interrupt conditions** — Don’t let the agent decide ad hoc when to pause; define upfront what requires confirmation.
- **Three tiers** — Run silently (low-risk) / Run and report (expected state change) / Ask first (named exceptions).
- **Named exceptions with exact phrasing** — e.g. Box token: “A new Box token is needed. Should I run the script?” so behavior is testable and consistent.
- **“Can” vs “should”** — Some actions the agent *can* run but *shouldn’t* without confirmation (e.g. token refresh that can affect sessions).

## 2. Independent Research Validation

### Autonomy vs human-in-the-loop

- **Interrupt-aware lifecycle**: Agents should pause and signal *why* (e.g. `human_approval`, `database_modification`); humans respond with approve/modify; execution resumes from the same point. This matches a pre-declared “ask first” list.
- **Confirmation placement**: Research favors intermediate confirmation over confirm-every-step or confirm-only-at-end. A tiered policy (most things auto, a few named “ask first”) fits that.
- **Agent-initiated pauses**: Agents that pause for clarification improve oversight. Having a fixed “ask first” set makes those pauses consistent and predictable.

### Approval gates and selective control

- **Tool-level approval**: Mark consequential tools/actions as “require approval”; routine ones run without asking. This is the same idea as “run silently” vs “ask first.”
- **Avoid approval fatigue**: Require approval only for genuinely consequential actions (credentials, irreversible ops, external/financial impact). Your list does that.
- **Deterministic policy**: Security-oriented work uses explicit policies (e.g. integrity/confidentiality labels) so that actions either satisfy the policy or are escalated. Named exceptions give that determinism instead of “use judgment,” which tends to be either too cautious or too loose.

### Cursor rules and AGENTS.md

- Cursor supports **project rules** in `.cursor/rules/` (versioned, codebase-scoped) and **AGENTS.md** in the project root. Rules are injected as context so behavior is consistent across sessions.
- **One concern per rule**, concise, actionable. The agent action policy is a single, always-applied rule for “when to run vs when to ask.”

**Conclusion:** The proposed approach is aligned with research and practice: pre-declared interrupts, tiered policy, named exceptions, and exact phrasing for high-consequence prompts.

## 3. Recommendations Implemented in cursor-ops

### Where the policy lives

- **`.cursor/rules/agent-action-policy.mdc`** — Single rule, `alwaysApply: true`, so every Cursor agent session gets it. This keeps the policy in one place and version-controlled.

### What’s in the policy

1. **Run without asking** — Read-only ops, tests, lint, validation scripts (e.g. `validate-autonomous-mode.sh` run with `--json` in the yolo-full workflow, plus `display-project-paths.sh`, `show-project-startup.sh`; `check-mcp-health.sh`, `check-*.sh`, `session-*.sh`), package installs, and file edits when the user requested a change.
2. **Run and report** — Git commit/branch/stash; git push via `scripts/github-push-gate.sh` when the user approves; Box scripts that use an existing token (e.g. `create-m1-folders.mjs`, `map-box-folder.mjs`, `download-box-folder.mjs`) and do not obtain/refresh tokens.
3. **Always ask first (exact phrasing)**  
   - **Box token**: On 401 or token expiry, say: *“A new Box token is needed. Should I run the script?”* and wait for confirmation before running `node mcp-box-minimal/scripts/get-oauth-token.js`.  
   - **Credentials/auth**: Any script that obtains or refreshes tokens (e.g. `get-oauth-token.js`) or lives under a future `scripts/auth/`.  
   - **Destructive**: delete/truncate/drop, `rm -rf`, or scripts that permanently remove data — describe what will be done and ask: “Should I proceed?”  
   - **Migrations**: “A migration is ready to run. Should I proceed?”

### Optional: `scripts/auth/` and `safe_` prefix

- **`scripts/auth/`** — If you add more auth/token scripts, put them in `scripts/auth/` and keep “any script in `scripts/auth/`” in the “always ask first” list. No need to create the directory until you have a second auth script.
- **`safe_` prefix** — You could adopt a convention that scripts named `safe_*` are always “run without asking.” The current rule doesn’t require it; add it only if you want that extra signal.

### Relation to existing setup

- **GitHub push**: The existing `github-push-gate.sh` and token (“push to github”) remain the gate; the policy says to run that script when the user approves a push, and to run and report the result.
- **`.cursor-ai-permissions` / `configure-cursor-autonomy.sh`**: They grant broad autonomy (terminal, file system, scripts). The new rule refines *which* scripts and commands require a human checkpoint; it doesn’t conflict with those.

## 4. Summary

- **Validated**: Pre-declared interrupts, tiered policy, and named exceptions with exact phrasing are supported by literature and practice.
- **Implemented**: `.cursor/rules/agent-action-policy.mdc` with three tiers and the Box token phrase so you and other Cursor agents can run all scripts in a predictable way: most run automatically or with a short report, and only the listed exceptions (token refresh, auth scripts, destructive ops, migrations) require an explicit “should I run?” step.

## 5. Other autonomy-related changes to explore

These are optional improvements that could make agent behavior more consistent or easier to operate; none are required for the current policy to work.

### 5.1 Shell MCP `ALLOWED_COMMANDS`

- **Current:** `config/mcp.json` for `shell-minimal` allows `npm,git,node,php,composer,...` but not `bash` or `zsh`.
- **Effect:** If an agent uses the **shell MCP** (not Cursor’s built-in terminal) to run a script, e.g. `bash /path/to/scripts/validate-autonomous-mode.sh --json`, that call can be rejected.
- **Recommendation:** Add `bash` and `zsh` to `ALLOWED_COMMANDS` so script execution works when the shell MCP is used. Cursor’s native terminal is unaffected; this only aligns MCP behavior with script-running expectations.

### 5.2 Running cursor-ops scripts from another project

- **Scenario:** Agent is working in e.g. `canvas_media_manager` but needs to run a cursor-ops script (e.g. Box folder creation or mapping).
- **Recommendation:** In the rule, state that when invoking cursor-ops scripts from outside the repo, use the full path to the script and set `CURSOR_OPS` to the cursor-ops root (so scripts that load `config/box.env` or project paths can find them). This has been added to the action policy rule.

### 5.3 Workflow registration and auto-approve

- **Current:** `config/workflows.json` defines ai-start, ai-end, mcp-health, yolo-full, etc. The **agent-autonomy** MCP may load workflows from a different path (e.g. `~/.cursor` or project); listing showed only an “example” workflow.
- **Recommendation:** If you use the agent-autonomy MCP to trigger workflows by name, ensure cursor-ops workflows (e.g. validate-autonomous-mode, session-start) are registered where that MCP reads from, with `auto_approve: true` for the same “run without asking” set as in the action policy. No code change in cursor-ops is strictly required unless you rely on that MCP for these workflows.

### 5.4 Transient failures (retry vs ask)

- **Recommendation:** Keep current behavior: on **401 / token expiry**, do not retry; ask to run the token script. For **429 (rate limit)** or transient network errors, scripts that already retry (e.g. create-m1-folders.mjs) are fine; no extra policy needed. If you add more API scripts, a one-line guideline in the rule (“On 401, ask; on 429/5xx, retry once then report”) would keep behavior consistent.

### 5.5 Audit trail for approvals (future)

- Research and approval-gate practice stress **audit trails**: what was proposed, who approved, when.
- **Recommendation:** For now, rely on chat history as the record. If you later want a durable log (e.g. “user approved Box token refresh at &lt;time&gt;”), add a small step in the rule: when the user confirms “run the script” for an “ask first” action, append a one-liner to a log file in cursor-ops (e.g. `changelogs/agent-approvals.log`). Optional and not implemented.

### 5.6 MCP tools vs scripts

- The action policy applies to **scripts** and **terminal commands**. **MCP tools** (e.g. Asana create task, Box upload, Git push) are a separate layer; Cursor may or may not show a confirmation UI per tool.
- **Recommendation:** No change unless you want an explicit rule for high-impact MCP tools (e.g. “Before the first Asana task create in a session, say ‘I can create an Asana task for this. Should I?’”). The script-level policy already covers the main credential and destructive cases.

---

## 6. How the “documented for later” items align with cursor-ops layout

cursor-ops uses a **global hub + per-project development/resources** layout. This section explains how the optional recommendations in §5 fit that layout.

### 6.1 Layout in short

| Layer | Purpose | Where |
|-------|---------|--------|
| **cursor-ops (working dir)** | Global agent config, shared scripts, MCP config, rules, workflows. Single source of truth for “how agents run things.” | `cursor-ops/` (this repo). |
| **Development folder** | Active application code for a project (source, build, runtime config). | Per project in `config/project-paths.json` → `development.folder` (e.g. `$HOME/Projects/canvas_media_manager`). |
| **Resources folder** | Agent-facing artifacts for that project: docs, plans, mapping output, test data. No production code. | Per project in `config/project-paths.json` → `resources.folder` (e.g. `$HOME/Agents/resources/canvas_media_manager`). |

Scripts in cursor-ops often **read** `config/project-paths.json` to resolve development and resources paths. When the agent runs from a **different** working directory (e.g. a project’s development folder), it should still invoke cursor-ops scripts by **full path** and set **`CURSOR_OPS`** to the cursor-ops root so those scripts can find `config/box.env` and `config/project-paths.json`. That’s already in the action policy rule.

### 6.2 Workflow registration (§5.3)

- **cursor-ops role:** Workflows are defined in **cursor-ops** (`config/workflows.json`). They run cursor-ops scripts by absolute path (e.g. `bash /Users/…/cursor-ops/scripts/session-start.sh`). So workflow definitions live in the **global hub**, not in each project.
- **Where workflows run:** Execution can happen no matter what the agent’s current working directory is (cursor-ops, a development folder, or a resources folder). The commands in `workflows.json` use full paths, so they don’t depend on cwd.
- **Alignment:** Registering cursor-ops workflows with the agent-autonomy MCP (wherever it loads from) keeps “run session-start,” “run validate-autonomous-mode,” etc. as **global** actions. Development vs. resources doesn’t change that: those workflows operate from cursor-ops and, if needed, use project-paths to know which development/resources folders to touch. No need to duplicate workflows per project.

### 6.3 Retries (§5.4)

- **cursor-ops role:** Retry behavior is a **policy** (when to retry vs. ask). It applies to any script or API call the agent runs, whether that script lives in cursor-ops (e.g. Box scripts) or is invoked from a project.
- **Development vs. resources:** Retries don’t care which folder is “development” vs “resources.” They care about **error type**: 401 → ask (token); 429/5xx → retry then report. Scripts that write output (e.g. Box mapping) already send output to the right place when they use `project-paths.json` (e.g. resources folder for a given project). So the retry guideline is global and path-agnostic; the existing path resolution keeps writes in the correct project resources (or development) folder.

### 6.4 Audit trail (§5.5)

- **cursor-ops role:** If you add an approval log, it should live in **cursor-ops** (e.g. `changelogs/agent-approvals.log`), because cursor-ops is the place that defines “ask first” actions and runs the token/sensitive scripts.
- **Development vs. resources:** The log is **global** to the agent setup, not per project. It records “user approved Box token refresh” or “user approved destructive op” without needing to know whether the agent was working in a development or resources folder. Project-specific context can be noted in the log line (e.g. “while working in canvas_media_manager”) but the file itself stays in cursor-ops so one audit trail covers all projects.

### 6.5 MCP tools vs scripts (§5.6)

- **cursor-ops role:** The action policy is about **scripts and terminal commands**; MCP tools (Asana, Box, Git, etc.) are a separate layer. Whether to “ask before first use” for an MCP tool is a global rule, not tied to a specific project folder.
- **Development vs. resources:** When an MCP tool writes data (e.g. Asana create task, Box upload), **what** it writes (e.g. which project/section) is determined by the tool’s parameters and your conventions. The **development** folder is where code lives; the **resources** folder is where docs/plans/artifacts live. MCP tools don’t automatically know that distinction unless you pass it (e.g. “create task in project X” or “upload to folder Y”). So any “ask before first MCP action” rule would be global; which project or folder is involved is context you’d supply in the prompt or in the rule (e.g. “when creating Asana tasks for canvas_media_manager, …”). The layout doesn’t change the recommendation; it only clarifies that project/resource context is something you’d add explicitly when you define such a rule.

### 6.6 Summary

- **cursor-ops** is the single place for agent policy, shared scripts, and (if you add it) approval logging. Development and resources are **per-project** and resolved via `config/project-paths.json`.
- The “documented for later” items are **global** (workflows, retry policy, audit log, optional MCP-ask rule). They don’t require different behavior per development vs. resources folder; they only require that scripts that need project paths use `CURSOR_OPS` and `project-paths.json`, which is already the pattern.
