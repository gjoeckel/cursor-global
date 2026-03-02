---
description: Dry-run only — compare server onlinecourses with local, otter alignment, preservation recommendation
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# production-sync-check

Run **production-sync-check** for a dry-run comparison and recommendations only. No renames, syncs, or state updates.

## What the workflow does

1. **Dry-run comparison** — Compares production at `webaim-deploy:/var/websites/webaim/htdocs/onlinecourses` with local `Projects/onlinecourses`. Uses `rsync -avzn --delete`; no files are changed.
2. **Otter alignment** — Notes key production files that may need alignment with otter (`Projects/otter`); reminds that `includes/db.php` must not be ported.
3. **Preservation recommendation** — Reads `production-sync-state.json` for `preserved_suffix`. If the preserve path already exists, recommends `-v2`, `-v3`, etc.
4. **Summary** — Tells you to run **production-new-local** when you want to create the new local production copy (rename, mkdir, sync, state update).

Optional: **production-sync-check --update-state=*suffix*** manually updates the state file after an external sync.

## How to trigger

- **In chat:** Type **production-sync-check**. To perform the refresh, type **production-new-local**.

## Reference

- **Current plan:** `docs/PRODUCTION-MAIN-AND-SERVICES-PLAN.md` (production → onlinecourses-production → main on GitHub).
- **Archived procedure:** `docs/archive/old-production-sync-methodology/README.md` (previous server→local sync methodology).
- **Execute actions:** Run workflow **production-new-local** only if still using the old methodology; otherwise use the new plan.
