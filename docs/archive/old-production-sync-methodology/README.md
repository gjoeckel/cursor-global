# Archived: Old production sync methodology

**Superseded:** 2026-02-26. Replaced by **Production main and services plan** (see `docs/PRODUCTION-MAIN-AND-SERVICES-PLAN.md`).

---

## What was archived

This folder preserves the previous approach to keeping a local copy of production and syncing with the server. That approach is no longer the active methodology.

### Summary of old approach

- **Local copy:** `Projects/onlinecourses` held the "generic latest" server snapshot. Optional preserved baselines: `Projects/onlinecourses-feb-10`, `Projects/onlinecourses-{suffix}`.
- **Sync server → local:** Run **production-new-local** (rename current to preserve path, mkdir new, rsync from server) or **copy-server-to-local.sh** (overwrite in place). Dry-run via **production-sync-check**.
- **Sync to GitHub main:** Script **mirror-server-to-main.sh** (in Agents archive) pulled from server into a repo and pushed to main; used wrong repo path and renamed `otter/` → `clients/`. Main branch of gjoeckel/otter was not the canonical production mirror.

### Archived / referenced artifacts

| Item | Location | Note |
|------|----------|------|
| **Procedure: Production baseline** | `PROCEDURE-PRODUCTION-BASELINE-archived.md` (this folder) | Full procedure for server→local sync, preserved baselines, dry-run. |
| **production-sync-check** | cursor-ops `.cursor/commands/production-sync-check.md`, `scripts/production-sync-check.sh` | Dry-run compare server vs local; still usable for comparison only. |
| **production-new-local** | cursor-ops `.cursor/commands/production-new-local.md`, `scripts/production-new-local.sh` | Rename, mkdir, rsync server→local, update state; superseded by new plan. |
| **copy-server-to-local.sh** | `Agents/archive/otter-resources/scripts/copy-server-to-local.sh` | In-place overwrite of `Projects/onlinecourses` from server. |
| **mirror-server-to-main.sh** | `Agents/archive/otter-resources/scripts/mirror-server-to-main.sh` | Mirrored server to main; used wrong REPO_PATH and otter→clients rename. |
| **production-sync-state.json** | `Agents/resources/otter/production-sync-state.json` | State file for preserve suffix / last sync; used by old workflows. |
| **PRODUCTION-SYNC-DELTA-*** | `Agents/resources/otter/archive/` | Dated delta reports (e.g. 2026-02-23) server vs baseline. |
| **PROCEDURE-PRODUCTION-BASELINE.md** (original) | `Agents/resources/otter/PROCEDURE-PRODUCTION-BASELINE.md` | Original procedure; superseded by new plan. |

---

## Current methodology

See **`docs/PRODUCTION-MAIN-AND-SERVICES-PLAN.md`** for:

- Production server → local `onlinecourses-production` → main on GitHub (read-only from server).
- Single repo (gjoeckel/otter): main = production mirror; services branch = production + aligned otter code.
- No renames; no changes to production server.
