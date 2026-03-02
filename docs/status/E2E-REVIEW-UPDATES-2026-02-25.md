# E2E Review: Updates and Related Files (2026-02-25)

**Purpose:** Ensure no conflicting processes and identify legacy processes to eliminate after the PDO migration, branch-policy correction, and documentation updates.

**Scope:** Cursor-ops rules and workflows; otter code and rules; project resources (Agents/resources/otter).

---

## 1. Conflicting processes (addressed)

### 1.1 Merge to main vs “main protected”

- **Conflict:** workspace-context.mdc says no changes to local or remote **main** unless authorized, but workflows **ai-local-merge** and **ai-merge-finalize** merge to main (and README/QUICK-START describe “merge to main”).
- **Resolution:**
  - **workspace-context.mdc** — Clarified that workflows/commands that merge to main or push main (e.g. **ai-local-merge**) count as changes to main and require **explicit authorization** when the target repo is a project-development repo (e.g. otter).
  - **agent-action-policy.mdc** — Added under “Always ask before running”: *“Merge to main / push to main (project-development repos): … Do not merge to main, push to main, or reset main unless the user has specifically authorized it. This includes running workflows like **ai-local-merge** when the target repo is otter.”*
- **Result:** No conflict. For otter (and similar repos), agents must get explicit authorization before running merge-to-main or push-to-main. For cursor-ops or other repos where the user has not declared “main protected,” existing behavior can still apply.

### 1.2 Default branch and deploy

- **Conflict:** User correction: local git must be on **services**; no changes to main unless authorized. Some docs previously described “merge to main” or “reset main.”
- **Resolution:**
  - **NEXT-DEV-PHASE-EVALUATION-2026-02-25.md** — Added policy note: local stays on **services**; no changes to local or remote main unless authorized; deploy by pushing **services**. Updated “Git state” and “Deploy / server” and summary table to match.
  - **rewire_workflow_state.md** (already correct) — Next steps say “push services” and “Optional: merge… into services”; no instruction to merge to main.
  - **PROCEDURE-DEPLOY-ONLINECOURSES-OTTER.md** — Already states source branch is **services** and deploy is triggered by push to **services**; no change needed.
- **Result:** Branch policy (services default, main protected) is consistent across rules and project-resources docs.

### 1.3 DB layer description (otter)

- **Conflict:** Otter rule **port-from-production.mdc** said “Otter uses class `db` (mysqli)” and “keep its db/mysqli implementation,” but otter now uses PDO `db` in `includes/db.php`.
- **Resolution:** Updated **Projects/otter/.cursor/rules/port-from-production.mdc** to say otter uses class `db` (PDO) in `includes/db.php` and must keep its PDO `db` implementation; do not overwrite with production’s.
- **Result:** Port-from-production rule matches current PDO migration state.

---

## 2. Legacy processes to eliminate (addressed)

### 2.1 MySQLConnection (otter) — legacy, no callers

- **Finding:** **CanvasDataSync** was the only consumer of `MySQLConnection`; it now uses PDO via **NewDatabaseService**. The file `services/database/connections/mysql_connection.php` (class **MySQLConnection**, mysqli) has **no remaining callers**.
- **Action:** Added a **deprecation notice** in `mysql_connection.php`: “LEGACY — unused”; “CanvasDataSync and all other callers now use PDO via NewDatabaseService”; “retained only for reference or removal; no active callers”; reference to cursor-ops DB-PDO-MIGRATION-OTTER.md Phase 4.
- **Optional follow-up:** Remove the file (and any `require_once` if discovered elsewhere) in a later cleanup, or leave in place as deprecated until next major cleanup.

### 2.2 DbMysqliWrapper

- **Finding:** Migration doc states DbMysqliWrapper was removed in Phase 1; PDO `db` is the single wrapper. Grep shows **no references** to DbMysqliWrapper in otter.
- **Action:** None; already eliminated. No conflict.

### 2.3 Legacy query/fetchArray/fetchAll usage

- **Finding:** Per migration doc and mapping, remaining uses are **intentional**: session handler (query for write, affectedRows), certificates (query for bulk UPDATE), canvas_mapping (query for dynamic UPDATE). NewDatabaseService and reports-api use select/selectOne/select.
- **Action:** None; no further elimination required. Documented in cursor-ops docs/DB-PDO-MIGRATION-OTTER.md Phase 3.

### 2.4 Outdated notepad (cursor-ops)

- **Finding:** `.cursor/notepads/codebase-state.md` described “GitHub main Branch” and “GitHub services Branch” as outdated/incomplete and did not reflect PDO completion or branch policy.
- **Action:** Added at top: **Status: Outdated — see project resources for current state.** Added “Current state (2026-02-25)” paragraph pointing to **rewire_workflow_state.md** and **AGENT-STARTUP.md** in project resources for current phase, branch policy (default **services**; main protected), and PDO status. Marked “Relationship Matrix” as **(historical)**.
- **Result:** Notepad no longer implies current process; agents are directed to project resources.

---

## 3. No conflict / no change

- **Deploy workflow and commands** — deploy-onlinecourses-otter.md and config/workflows.json describe “push services” and server checkout of **services**; consistent with branch policy.
- **AGENTS.md** — References workspace-context and boundaries; no merge-to-main instruction; no change.
- **agent-action-policy “Git push”** — Refers to github-push-gate.sh and user approval; no mention of pushing main; no change. The new “merge to main / push to main” bullet applies only to project-development repos and requires authorization.
- **Project resources rewire_workflow_state.md** — Decision log entry “Commit/merge to main…” is historical; current “Next steps” do not instruct merge to main. No change.
- **FINDINGS-DB-PHP-PRODUCTION-VS-TEST.md** — Describes production vs test DB class; project resources AGENT-STARTUP already updated to “otter now uses PDO db”. Optional: add one line in FINDINGS that otter has migrated to PDO (low priority).

---

## 4. Summary table

| Area | Issue | Resolution |
|------|--------|------------|
| **Cursor-ops rules** | ai-local-merge merges to main; workspace-context says main protected | workspace-context: “Workflows that merge/push main require authorization for project-development repos.” agent-action-policy: “Always ask” for merge/push to main (project-development repos). |
| **Branch policy** | Docs implied or stated “merge/reset main” | NEXT-DEV-PHASE-EVALUATION: policy note and Git state/deploy/summary updated to “local on services; no changes to main unless authorized.” |
| **Otter port rule** | port-from-production said mysqli | Updated to PDO `db` and “do not overwrite otter’s PDO db implementation.” |
| **MySQLConnection** | Unused after CanvasDataSync migration | Deprecation notice added in mysql_connection.php; optional removal later. |
| **codebase-state notepad** | Outdated branch/status | Marked outdated; pointer to rewire_workflow_state and AGENT-STARTUP for current state. |

No remaining conflicting processes identified. Legacy processes addressed as above; optional follow-ups (remove mysql_connection.php, add one line to FINDINGS) can be done in a later change.
