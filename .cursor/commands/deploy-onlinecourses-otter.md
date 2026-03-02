---
description: Deploy updated code to https://webaim.org/onlinecourses-otter — rsync from current branch, no GitHub push
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Deploy onlinecourses-otter

Deploys the **current branch** from the local project development folder directly to the test instance. No push to GitHub; no branch switch.

## What the workflow does

1. **Rsync** — Syncs `Projects/otter` (whatever branch is checked out) to the server at `/var/websites/webaim/htdocs/onlinecourses-otter/`. Excludes: `.git`, `.cursor`, `.github`, `node_modules`, `.DS_Store`, `services/auth/logs`, `services/shared/logs`, etc.
2. **Server steps (SSH)** — chmod (644/755, cache dirs 775) and clear application cache. No sudo (validated process; see resources/otter/DEPLOY-SUDO-REVIEW-2026-02-26.md).
3. **Done** — Reports: *"Updates pushed to test instance on server."*

No merge, no push to `services` or any remote. Rollback: checkout a previous commit or rollback branch locally and run this deploy again.

## How to trigger

Run **deploy-onlinecourses-otter** (or `bash scripts/deploy-onlinecourses-otter.sh` from cursor-ops). The agent runs the script; you stay on your current branch.

## Reference

- **Procedure:** `Agents/resources/otter/PROCEDURE-DEPLOY-ONLINECOURSES-OTTER.md` (Option C)
- **Live URL:** https://webaim.org/onlinecourses-otter
- **Server path:** `/var/websites/webaim/htdocs/onlinecourses-otter/`
- **Login issues:** LOGIN-TROUBLESHOOTING.md
