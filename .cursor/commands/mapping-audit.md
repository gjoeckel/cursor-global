---
description: Run full mapping audit — prod vs test tree diff, optional server vs local, DB call map; report to docs/status
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Mapping audit

Run the **full mapping process** in one go: local prod vs test tree comparison, optional server vs local diff, and DB usage map. Output is written to `docs/status/mapping-audit-YYYY-MM-DD-HHMMSS.txt`.

## What the workflow does

1. **Local tree comparison** — `find` on production tree (e.g. `Projects/onlinecourses`) and test tree (`Projects/otter`); diff to list **only-in-prod** and **only-in-test** paths. Reminds you to tag only-in-test as required / legacy-deprecated / unclassified.
2. **Optional: server vs local** — SSH to server, `find` on test app root (`/var/websites/webaim/htdocs/onlinecourses-otter`), diff vs local test tree. Skipped if you run **mapping-audit-skip-ssh** or pass `--skip-ssh`.
3. **DB usage map** — Runs `map-otter-db-usage.sh` on the test (otter) tree and appends to the report.
4. **Update mapping docs** — Sets **Last updated** to the run date in `PRODUCTION-SERVER-MAPPING.md`, `TEST-SERVER-MAPPING.md`, and `DB-CALL-MAP.md` in project resources (path from `config/project-paths.json`). Adds or updates **Last audit** (Date, Source: Local, Git ref) in the two mapping docs. Writes **ONLY-IN-TEST-PATHS.md** in project resources: table of only-in-test paths with an empty **Category** column for you to fill (required | legacy-deprecated | unclassified). Skips if resources path is missing.
5. **Next steps** — Report reminds you to fill Category in ONLY-IN-TEST-PATHS.md and to refresh schema/DB-CALL-MAP content when code or schema changes.

## How to invoke

- **Full audit (with SSH):** In chat, run **mapping-audit**. Or run workflow `mapping-audit` from config/workflows.json.
- **Without SSH:** Run **mapping-audit-skip-ssh** or `bash scripts/run-workflow.sh mapping-audit --skip-ssh` to skip server comparison (faster, no SSH required).

## Paths

- Uses `config/project-paths.json`: production_current (prod tree), development (test tree). Set `CURSOR_OPS` if running from outside cursor-ops.
- Report directory: `cursor-ops/docs/status/`.

## Reference

- **Methods:** `Agents/resources/otter/MAPPING-DIVERGENCE-METHODS.md`
- **DB call map:** `Agents/resources/otter/DB-CALL-MAP.md`
- **Schema:** `production_database_schema.md`, `REWIRE-SCHEMA-COLUMN-REFERENCE.md` in project resources
