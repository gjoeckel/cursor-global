# DB PDO Migration: Otter → Production-Style API

**Purpose:** Multi-phase plan to migrate onlinecourses-otter from mysqli (`db` / `DbMysqliWrapper`) to a single PDO wrapper that matches production’s high-level API (`select`, `insert`, `update`, `delete`).

**Related:** [FINDINGS-DB-PHP-PRODUCTION-VS-TEST.md](../../resources/otter/FINDINGS-DB-PHP-PRODUCTION-VS-TEST.md) (production vs test differences; why otter keeps its own `db.php` today).

---

## 1. Scope and goals

- **Unify** otter’s two DB layers (`includes/db.php` + `DbMysqliWrapper`) into one PDO-based implementation.
- **Align API** with production: high-level methods `select()`, `insert()`, `update()`, `delete()` and optional low-level `query()`.
- **Preserve behavior:** sessions, reports, API endpoints, and admin clients must keep working at each phase.

---

## 0. Before Phase 0: Prerequisites and actions

Complete these **before** running the mapping (Phase 0) or starting Phase 1. They reduce risk and give a clear rollback path.

| Action | Purpose |
|--------|---------|
| **Version control** | Ensure otter (and cursor-ops if you change scripts) is on a branch with no uncommitted critical changes. Tag or note the commit so you can revert. |
| **Backup / restore verification** | If otter uses a shared or local DB, take a backup (or snapshot) and confirm you can restore it. Ensures a rollback path if a phase breaks data or schema. |
| **Test baseline** | Document or run whatever tests already exist (manual login, API smoke tests, admin pages). Re-run after each phase to confirm no regressions. If no tests exist, define a short manual checklist (e.g. “log in, open reports, open registrations”) and run it before Phase 1. |
| **Environment and config** | Confirm the environment where you will run the migration (local otter, staging, etc.) has correct DB credentials and that `DatabaseConfig` / `MASTER_INCLUDES_PATH` (or equivalent) point to the right config. Session handler and `NewDatabaseService` both need a working DB. |
| **Stakeholder / rollback criteria** | Decide who needs to know if the migration is paused or rolled back, and what “success” and “rollback” mean (e.g. “revert to previous commit and redeploy”). |
| **Production read-only** | Keep production `onlinecourses` and its `includes/db.php` unchanged; all changes are in otter (test) only, per FINDINGS-DB-PHP-PRODUCTION-VS-TEST.md. |

No code changes are required in this step—only checks and preparation so Phase 0 and Phase 1 start from a known, safe state.

---

## 2. Should we rerun the mapping process?

**Yes.** Rerunning the production/test DB usage mapping before and during the migration is recommended so that:

1. **Phase 0** produces a **current-state map** of every file and method call (query, fetchArray, fetchAll, affectedRows, lastInsertID).
2. **Phases 2–3** are guided by that map: migrate call sites in a defined order (e.g. session handler → NewDatabaseService → API → clients) and tick off each file.
3. **Regression checks** can use the same map to ensure no call site is missed and no legacy method remains in use after Phase 3.

Use the **mapping script** (see Phase 0) to regenerate the map whenever the codebase changes or before starting a new phase.

---

## 3. Phase 0: (Re)run DB usage mapping

**Objective:** Produce up-to-date maps of production and otter DB usage so later phases can be planned and verified.

**Steps:**

1. **Otter map**  
   From the cursor-ops repo (or with `CURSOR_OPS` set), run:
   ```bash
   bash scripts/map-otter-db-usage.sh [path/to/otter]
   ```
   If no path is given, the script uses `OTTER_ROOT` or the development folder from `config/project-paths.json` (e.g. `canvas_reports.development.folder`).

2. **What the map contains**
   - **By file:** each PHP file that uses the DB layer, with counts or list of methods used (`query`, `fetchArray`, `fetchAll`, `affectedRows`, `lastInsertID`).
   - **By source of `$db`:**
     - **Session handler:** `new db(...)` from `includes/db.php`.
     - **Everything else:** `getDbConnection()` from `NewDatabaseService` (currently returns `DbMysqliWrapper`).

3. **Save the map**
   - Copy the script output into a dated file under `docs/` or `changelogs/`, e.g. `docs/status/otter-db-usage-map-YYYY-MM-DD.txt`, or append to a single `docs/status/otter-db-usage-map.txt` and note the date at the top.

4. **Production map (optional but useful)**
   - Grep production `onlinecourses` for `Database`, `->query(`, `->select(`, `->insert(`, `->update(`, `->delete(` to see how the production-style API is used. This guides the target shape of the otter API in Phase 2.

**Note:** `CanvasDataSync` uses `MySQLConnection` (raw mysqli), not `getDbConnection()`, so it may appear in the map only with `query` usage; Phase 4 covers that path.

**Deliverable:** A current list of otter files and methods to migrate, and (optionally) a short summary of production usage patterns.

---

## 4. Phase 1: PDO wrapper with compatibility API

**Objective:** Introduce a single PDO-backed class that both the session handler and `NewDatabaseService` can use, without changing any call sites yet.

**Tasks:**

1. **Implement PDO `db` class** (replaces `includes/db.php` and eventually `DbMysqliWrapper`):
   - **Constructor:** 5 args `(host, user, pass, name, charset)` for otter; optionally support no-arg constructor using globals for production alignment.
   - **Compatibility methods:**  
     `query($sql, ...$params)`, `fetchArray()`, `fetchAll()`, `affectedRows()`, `lastInsertID()`.
   - **Internal:** Use PDO; after `query()` store the `PDOStatement` so `fetchArray`/`fetchAll`/`affectedRows` work as today.
   - **Params:** Accept `query($sql, ...$params)` and pass an array to `PDOStatement::execute()`.

2. **Replace otter `includes/db.php`**  
   Swap the current mysqli `db` with this PDO implementation. Session handler continues to use `new db(host, user, pass, name, charset)` and `query`/`fetchArray`/`affectedRows` — no call-site changes.

3. **Switch `NewDatabaseService::getDbConnection()`**  
   - Require the new PDO `db` (e.g. from `includes/db.php` or a shared require).
   - Replace `new DbMysqliWrapper(...)` with `new db(...)` using the same config.
   - All call sites still use `query`/`fetchArray`/`fetchAll`/`affectedRows`/`lastInsertID` — no changes.

4. **Remove `DbMysqliWrapper`**  
   Delete the class and its require once the PDO `db` is in use everywhere.

5. **Test**  
   Run session login, reports API, database API, and admin registrations/certificates; confirm no regressions.

**Deliverable:** Otter runs on a single PDO `db` with the legacy-style API; session handler and all existing call sites unchanged.

---

## 5. Phase 2: Migrate call sites to production-style API

**Objective:** Replace `query` + `fetchArray`/`fetchAll` and ad-hoc INSERT/UPDATE/DELETE with `select()`, `insert()`, `update()`, `delete()` (and optional `query()` for one-offs).

**Use the map from Phase 0** to walk through each file and method in a fixed order (e.g. session handler → NewDatabaseService methods → API endpoints → canvas services → admin clients).

**Tasks:**

1. **Add production-style methods to the PDO `db` class** (if not already present):
   - `select($sql, $params = [])` → return all rows (assoc).
   - `insert($table, $data)` → return `lastInsertId()`.
   - `update($table, $data, $where, $whereParams = [])` → run and return statement/rowCount as needed.
   - `delete($table, $where, $params = [])` → run and return as needed.
   - Optionally keep `query($sql, $params = [])` for complex or one-off SQL.

2. **Refactor each call site (guided by map):**
   - `$db->query($sql, ...); $row = $db->fetchArray();` → `$rows = $db->select($sql, $params); $row = $rows[0] ?? null;` or add a helper `selectOne()`.
   - `$db->query($sql, ...); $rows = $db->fetchAll();` → `$rows = $db->select($sql, $params);`
   - INSERT/UPDATE/DELETE + `affectedRows`/`lastInsertID` → use `insert()`/`update()`/`delete()` and use return value / `lastInsertId()`.

3. **Suggested order (dependency-friendly):**
   - Session handler (minimal: replace read/write/destroy/gc with select/insert/update/delete or keep compatibility methods for this file only).
   - `NewDatabaseService` (all methods that use `$db`).
   - `reports-api.php`, `database-api.php`.
   - `canvas_mapping_service.php`, `canvas_course_service.php`.
   - `registrations.php`, `certificates.php` (admin clients).

4. **After each file (or batch):** Run tests and smoke checks; update the map to mark that file as migrated.

**Deliverable:** All mapped call sites use `select`/`insert`/`update`/`delete` (or documented exceptions); map fully updated.

---

## 6. Phase 3: Remove legacy compatibility methods

**Objective:** Drop `query()` / `fetchArray()` / `fetchAll()` / `affectedRows()` from the public API where no longer used, and harden the wrapper to production-style only if desired.

**Tasks:**

1. **Re-run mapping**  
   Ensure no remaining uses of `fetchArray`, `fetchAll`, or legacy `query` patterns (except any explicitly kept for session or one-offs).

2. **Intentional remaining legacy usage (as of Phase 3 complete):**
   - **Session handler** (`session_handler.php`): `query()` for the INSERT ON DUPLICATE KEY UPDATE in `write()`; `affectedRows()` where needed.
   - **Certificates** (`certificates.php`): `query()` for the bulk UPDATE with IN list.
   - **Canvas mapping** (`canvas_mapping_service.php`): `query()` for the dynamic UPDATE courses SET ... WHERE id = ?.
   - **NewDatabaseService** extends/uses `db`; the map may still show `fetchArray`/`fetchAll` in that file as internal or compatibility; all call sites use `select`/`selectOne`/`query` as appropriate.

3. **Deprecate or remove**  
   - Either remove the compatibility methods from the PDO `db` class or mark them deprecated and remove in a later release.
   - If the session handler was migrated to `select`/`insert`/`update`/`delete`, remove compatibility methods entirely.

4. **Align production and otter**  
   - Production's `Database` and otter's `db` should expose the same high-level API; document any intentional differences (e.g. constructor args for otter vs globals for production).

**Deliverable:** Single PDO wrapper with production-style API; no (or minimal) legacy method usage.

---

## 7. Phase 4 (optional): CanvasDataSync and MySQLConnection

**Objective:** Use the same PDO wrapper in CanvasDataSync instead of raw mysqli.

**Current state:** `CanvasDataSync` uses `MySQLConnection::getInstance()->getConnection()` (raw mysqli) and calls `prepare`/`execute` directly.

**Tasks:**

1. Inject or obtain the PDO `db` instance (e.g. from a shared service or config) in `CanvasDataSync`.
2. Replace mysqli `prepare`/`execute` with `$db->query($sql, $params)` (and fetch if needed) or with `select`/`insert`/`update`/`delete` where applicable.
3. Optionally retire `MySQLConnection` for this code path if no other callers remain.

**Deliverable:** CanvasDataSync uses the same PDO wrapper as the rest of otter; fewer connection paths.

---

## 8. Summary table

| Phase | Goal | Map used? |
|-------|------|-----------|
| **0** | (Re)run mapping; produce current-state file/method list | Defines map |
| **1** | Single PDO `db` with compatibility API; remove DbMysqliWrapper | Reference map to confirm no missed consumers |
| **2** | Migrate all call sites to select/insert/update/delete | Yes — guide order and track progress |
| **3** | Remove or deprecate legacy methods | Yes — verify no remaining usage |
| **4** | (Optional) CanvasDataSync + MySQLConnection | Map shows single remaining raw-mysqli user |

---

## 10. Validation: Alignment with best practices

The approach in this document aligns with widely recommended practices, as follows.

| Practice | How this migration follows it | Source / note |
|----------|------------------------------|----------------|
| **Prefer PDO over mysqli for new/migrated code** | Migration target is a single PDO-based wrapper; PDO is database-agnostic, supports prepared statements, and is the modern standard for PHP. | PHP community (e.g. Sitepoint, PHP.net); migrate to PDO rather than staying on mysqli. |
| **Use prepared statements and bound parameters** | The PDO wrapper uses `prepare` + `execute($params)`; no string concatenation of user input into SQL. | Security best practice; PDO tutorial (phpdelusions.net/pdo). |
| **Incremental / phased migration** | Phases 1 → 2 → 3 (and optional 4) keep the system working at each step; no big-bang rewrite. | Martin Fowler, “Incremental Migration”; “if it hurts, do it more often.” |
| **Map/audit before refactoring** | Phase 0 produces a current-state map; Phases 2–3 use it to order work and verify completion. | Legacy code audits (e.g. COD model, “audit before refactor” guides); avoids blind changes. |
| **Compatibility layer (adapter)** | Phase 1 introduces a PDO implementation that preserves the existing API (`query`, `fetchArray`, `fetchAll`, etc.) so call sites can be migrated gradually. | Adapter / Anti-Corruption Layer pattern; isolate change and migrate call sites in order. |
| **Pre-migration checklist** | Section 0 (Before Phase 0) covers backups, test baseline, version control, config, and rollback criteria. | General migration checklists (e.g. backup verification, test baseline, rollback criteria). |
| **Avoid full rewrites** | Single wrapper + incremental call-site migration instead of replacing the whole DB layer at once. | Legacy recovery guidance: full rewrites have high failure rates; prefer incremental recovery. |

No additional methods are required beyond what is already in the plan; the above table is for validation and reference.

---

## 11. References

- **FINDINGS-DB-PHP-PRODUCTION-VS-TEST.md** — Why otter has its own `db.php`; production vs test class/API.
- **project-paths.json** — `production_current` (onlinecourses), otter development path for mapping script.
- **Session handler:** `services/database/session_handler.php` — requires `class db`, 5-arg constructor, `query`/`fetchArray`/`affectedRows`.

**Validation (section 10):** PDO vs mysqli (Sitepoint, phpdelusions.net/pdo, PHP.net); incremental migration (Martin Fowler, Incremental Migration); audit before refactor (COD model, legacy code guides); adapter/ACL (Microsoft Azure Architecture, adapter pattern); migration checklists (backup, tests, rollback).
