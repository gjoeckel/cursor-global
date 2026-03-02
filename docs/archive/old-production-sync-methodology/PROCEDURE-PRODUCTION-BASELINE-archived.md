# Procedure: Production baseline and comparing to server (ARCHIVED)

**Archived:** 2026-02-26. Superseded by **docs/PRODUCTION-MAIN-AND-SERVICES-PLAN.md**. Preserved for reference only.

---

# Procedure: Production baseline and comparing to server

**Structure established:** 2026-02-23. On that date the former `Projects/onlinecourses` was renamed to `Projects/onlinecourses-feb-10` (preserved baseline), a new empty `Projects/onlinecourses` was created, and it was populated from the server as the generic latest snapshot.

---

**When you need to sync from the production server to local (refresh the latest snapshot):**

1. **Refresh generic latest** — Run:  
   `bash /Users/a00288946/Agents/archive/otter-resources/scripts/copy-server-to-local.sh`  
   This overwrites `Projects/onlinecourses` with the current server tree. Requires SSH access to `webaim-deploy`.
2. **Optional:** To see what changed since the Feb 10 baseline, run the dry-run in section 3 and optionally save output to a new `PRODUCTION-SYNC-DELTA-YYYY-MM-DD.md`.

Do **not** run that script (or any full sync) against `Projects/onlinecourses-feb-10`; that path is the preserved baseline.

---

## 1. Preserved baseline (Feb 10)

- **Path:** `/Users/a00288946/Projects/onlinecourses-feb-10`
- **Purpose:** Snapshot of production as of Feb 10, 2026 — the code the current "services" and admin UI were built against. **Do not overwrite** this directory.

## 2. Generic latest server snapshot

- **Path:** `/Users/a00288946/Projects/onlinecourses`
- **Purpose:** Always holds the latest copy of production (server → local sync). Use for current server state and porting (e.g. `scripts/map_quizzes_to_database.php`). All server→local syncs should target this directory. Script: `Agents/archive/otter-resources/scripts/copy-server-to-local.sh`.

## 3. List all server changes since Feb 10 (dry-run, no local changes)

Run this to compare **server** to **Feb 10 baseline**. **No files are modified** (`-n` = dry-run). Destination is the baseline path so the report shows drift from Feb 10.

```bash
rsync -avzn --delete \
  --exclude='.git' --exclude='.DS_Store' --exclude='*.swp' --exclude='*~' \
  webaim-deploy:/var/websites/webaim/htdocs/onlinecourses/ \
  /Users/a00288946/Projects/onlinecourses-feb-10/
```

- **--delete** — also report files that exist in the Feb 10 baseline but no longer on the server.
- **Output:** Lists "deleting …" (only in baseline), and "file list" of what would be transferred (current server state).

To refresh the **generic latest** snapshot instead: run `copy-server-to-local.sh` (syncs server → `Projects/onlinecourses`).

## 4. Detailed delta report

After running the dry-run, a full change list can be documented in **`PRODUCTION-SYNC-DELTA-2026-02-23.md`** (or a new dated file for later runs). See that file for the 2026-02-23 delta and implications for the services port.

**Current production structure and external paths:** For a single mapping of the full production app tree and all external files production touches (e.g. `master_includes/`, logs), see **PRODUCTION-SERVER-MAPPING.md** in this folder.

---

## 5. When to create a new dated baseline and a fresh generic folder

When the current `Projects/onlinecourses` (generic latest) should be preserved as a dated snapshot and a new generic folder is needed (e.g. before a major port or at a release point), follow this process. **Date used below: YYYY-MM-DD (e.g. 2026-02-23). Replace with the actual date.**

1. **Rename current generic to dated snapshot**  
   `mv /Users/a00288946/Projects/onlinecourses /Users/a00288946/Projects/onlinecourses-YYYY-MM-DD`

2. **Create new empty generic folder**  
   `mkdir -p /Users/a00288946/Projects/onlinecourses`

3. **Populate from server** (Agent does the copy):  
   `ssh webaim-deploy "cd /var/websites/webaim/htdocs/onlinecourses && tar -czf - --exclude='.git' --exclude='*.swp' --exclude='*~' --exclude='.DS_Store' ." | tar -xzf - -C /Users/a00288946/Projects/onlinecourses`

4. **Update references** (so docs and config point to the new dated path and keep generic as `Projects/onlinecourses`):
   - **cursor-ops** `config/mcp.json`: add `.../Projects/onlinecourses-YYYY-MM-DD` to `ALLOWED_PATHS` (keep `.../Projects/onlinecourses`).
   - **resources/otter** `AGENT-STARTUP.md`: if this new dated folder becomes a referenced baseline, add or update the "Production baseline" path; "Latest server snapshot" stays `Projects/onlinecourses`.
   - **resources/otter** `PROCEDURE-PRODUCTION-BASELINE.md`: update "Structure established" to this date; in section 5, the existing preserved baseline(s) (e.g. `onlinecourses-feb-10`) remain; add the new `onlinecourses-YYYY-MM-DD` to any list of preserved snapshots if needed.
   - **resources/otter** `README.md` quick reference: add the new dated path if you want it in the table.
   - **Archive scripts** (`Agents/archive/otter-resources/scripts/copy-server-to-local.sh`, `validate-directory-match.sh`, `setup-onlinecourses-repo.sh`): ensure comments still state that the generic latest is `Projects/onlinecourses` and list preserved baselines (e.g. `onlinecourses-feb-10`, `onlinecourses-YYYY-MM-DD`).

5. **Optional:** Run the dry-run (section 3) comparing server to the **new** dated folder, and save output to `PRODUCTION-SYNC-DELTA-YYYY-MM-DD.md`.

**Note:** The **Feb 10** baseline (`Projects/onlinecourses-feb-10`) is kept as the code the current services and admin UI were built against; do not rename or overwrite it. New dated folders are additional snapshots when you rotate the generic folder.
