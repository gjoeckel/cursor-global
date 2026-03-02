---
description: Create new local production copy — rename current to preserve path, mkdir new, sync from server, update state
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# production-new-local

Run **production-new-local** when **production-sync-check** recommended creating a new local production copy and you have approved. This workflow performs the actions.

## What the workflow does

1. **Rename current** — `mv /Users/a00288946/Projects/onlinecourses` to `.../onlinecourses-{suffix}` (uses `-v2`, `-v3` if path exists).
2. **Create new** — `mkdir /Users/a00288946/Projects/onlinecourses`.
3. **Sync from server** — `rsync` from `webaim-deploy:/var/websites/webaim/htdocs/onlinecourses/` to the new folder.
4. **Update state** — Writes `last_sync_date` and `preserved_suffix` to `resources/otter/production-sync-state.json`.

Requires SSH access to `webaim-deploy`. **auto_approve: false** — confirm before running.

## How to trigger

- **In chat:** Type **production-new-local** after running **production-sync-check** and deciding to create the new local copy.

## Reference

- **Current plan:** `docs/PRODUCTION-MAIN-AND-SERVICES-PLAN.md` (production → onlinecourses-production → main on GitHub).
- **Archived:** `docs/archive/old-production-sync-methodology/README.md`
- **Check first:** `production-sync-check` (recommendations only) if still using old methodology.
