# Production main and services plan

**Status:** Active. Replaces the previous production-baseline / production-sync methodology (see `docs/archive/old-production-sync-methodology/README.md`).

**Last updated:** 2026-02-27.

---

## 1. Goals

- **Production code is read-only on the server.** No changes are made to `/var/websites/webaim/htdocs/onlinecourses` by this process; we only pull from it.
- **Main branch on GitHub** = exact copy of production. Anyone who clones https://github.com/gjoeckel/otter and checks out `main` gets the current production code with no modifications.
- **Services branch** = production (main) + aligned “otter” refactor (services layout, PDO, etc.). Alignment is done in a dedicated local folder so that shared files match production and only the new/additive code differs.
- **Single repo, clear path:** Production on server → local copy → main on GitHub. Then a `services` branch is added in the same repo, using code from `Projects/otter` as the starting point and aligning it to the exact production copy.

---

## 2. Repo and paths

| Item | Value |
|------|--------|
| **GitHub repo** | https://github.com/gjoeckel/otter |
| **Production server (read-only source)** | `webaim-deploy:/var/websites/webaim/htdocs/onlinecourses` |
| **Local “production” workspace** | `/Users/a00288946/Projects/onlinecourses-production` (folder already exists) |
| **Existing otter dev (source for services code)** | `/Users/a00288946/Projects/otter` |

---

## 3. Data flow

```
Production (server)  →  Local onlinecourses-production  →  main on GitHub
        (read-only pull)        (git init, add, commit)      (push)
```

- No renames (e.g. no `otter/` → `clients/`). The tree pushed to `main` is exactly what we pull from the server.
- Later: a **services** branch is created in the same repo (in `onlinecourses-production`), based on `main`. Code from `Projects/otter` is brought in and aligned so that shared paths match production and only the new services layer differs.

---

## 4. Step-by-step: Initial setup (one-time)

### 4.1 Pull production from server into local folder

Production server is read-only; we only copy from it.

**Option A — rsync (recommended if you have SSH):**

```bash
cd /Users/a00288946/Projects/onlinecourses-production
rsync -avz --delete \
  --exclude='.git' --exclude='.DS_Store' --exclude='*.swp' --exclude='*~' \
  webaim-deploy:/var/websites/webaim/htdocs/onlinecourses/ .
```

**Option B — tar over SSH:**

```bash
cd /Users/a00288946/Projects/onlinecourses-production
ssh webaim-deploy "cd /var/websites/webaim/htdocs/onlinecourses && tar -czf - --exclude='.git' --exclude='*.swp' --exclude='*~' --exclude='.DS_Store' ." | tar -xzf -
```

Result: `onlinecourses-production` contains the exact production tree (no git yet).

### 4.2 Create git repo and push to main

```bash
cd /Users/a00288946/Projects/onlinecourses-production
git init
git remote add origin https://github.com/gjoeckel/otter.git
git add -A
git commit -m "Sync main with production (exact server snapshot YYYY-MM-DD)"
git branch -M main
git push -f origin main
```

- **Note:** `git push -f` replaces the current `main` on GitHub with this snapshot. Ensure you have authorization to force-push to `main` (see `.cursor/rules/agent-action-policy.mdc`).
- After this, **main** on GitHub = exact copy of production at the time of the pull.

---

## 5. Step-by-step: Adding the services branch

After `main` is the production snapshot:

1. **Create services branch from main** (in `onlinecourses-production`):

   ```bash
   cd /Users/a00288946/Projects/onlinecourses-production
   git checkout -b services
   ```

2. **Use `Projects/otter` as the source** for the refactored code (services layout, PDO, etc.). Bring that code into this branch—e.g. copy or merge from `Projects/otter` (e.g. from its `services` branch or current state) into `onlinecourses-production`.

3. **Align to production:** For any file that exists in both production (main) and the otter code, ensure the production version is the baseline. Keep otter-only overrides only where intentional (e.g. `includes/db.php` for the PDO `db` class). Resolve conflicts by preferring production for shared paths and keeping the new services/additive code.

4. **Commit and push** when aligned:

   ```bash
   git add -A
   git commit -m "Add services branch aligned to production"
   git push -u origin services
   ```

Going forward, **main** stays the production mirror; **services** is production + aligned otter refactor.

---

## 6. Refreshing main from production (ongoing)

Whenever production on the server has changed and you want to update GitHub `main`:

1. **Pull production into the local folder** (read-only from server), overwriting current content:

   ```bash
   cd /Users/a00288946/Projects/onlinecourses-production
   git checkout main
   git pull origin main   # optional: get latest main first
   rsync -avz --delete \
     --exclude='.git' --exclude='.DS_Store' --exclude='*.swp' --exclude='*~' \
     webaim-deploy:/var/websites/webaim/htdocs/onlinecourses/ .
   ```

2. **Commit and push:**

   ```bash
   git add -A
   git commit -m "Sync main with production YYYY-MM-DD"
   git push origin main
   ```

Optional: add a cursor-ops workflow or script that does step 1–2 (with approval for push); or a GitHub Action if a runner can SSH to the server (see section 7).

---

## 7. Optional: GitHub Action to sync main from production

If a GitHub Actions runner can reach the production server (e.g. self-hosted runner with SSH to `webaim-deploy`):

- A workflow can run on a schedule or `workflow_dispatch` to: pull production from the server (read-only), update the repo’s working tree, commit to `main` if changed, and push. That keeps **main** “connected” to production and makes it easy to check for and apply updates.
- Store SSH key (or host/key) in repo secrets; do not modify production—only read from it.

Details (workflow file, secrets, branch protection) can be added in a follow-up.

---

## 8. Summary

| Branch | Content | Location |
|--------|---------|----------|
| **main** | Exact production (server snapshot) | GitHub + local `onlinecourses-production` when on main |
| **services** | Production + aligned otter refactor | GitHub + local `onlinecourses-production` when on services |

| Path | Role |
|------|------|
| **Server** `/var/websites/webaim/htdocs/onlinecourses` | Read-only source; never modified by this process |
| **Local** `Projects/onlinecourses-production` | Git repo; main = production, services = production + otter |
| **Local** `Projects/otter` | Source of otter/services code for alignment into `services` branch |

---

## 10. Comprehensive plan: Creating the services branch

This section details how to create a **services** branch in `onlinecourses-production` so that: (1) all current production code is preserved, (2) the new services layer and otter updates work, and (3) the production developer can pull the branch into a new directory on the server and have everything function.

### 10.1 Structure comparison

| Production (main) | Otter (source for services) |
|------------------|-----------------------------|
| Flat: root PHP (certificates.php, registrations.php, course_builder.php, etc.), includes/, cron/, phpfunctions/, scripts/, safety measure/, logs/ | Adds: **api/**, **clients/** (admin, reports, settings, home), **services/** (auth, api, canvas, database, shared), **config/**, **shared/**, **login.php**, **router.php**, **otter/** (cache); different **includes/** (db.php = PDO `db` class, paths.php, canvas.php, mailgun.php, version.php) |
| includes/config.php → master_includes/onlinecourses_common.php, db.php (class Database) | includes/db.php = PDO `db` with compatibility API; no includes/config.php in same form; uses master_includes in services layer |
| No .htaccess URL rewriting for /clients, /services | .htaccess RewriteBase /onlinecourses-otter/; routes /clients/*, /services/*, /api/* |

**Principle:** Services branch = **main (production tree) unchanged** + **add** otter-only paths and **replace only** includes/db.php (and add includes/paths.php, etc.) so the new entry points (login, router, clients/, services/) work while legacy production entry points (certificates.php, registrations.php, etc.) remain usable.

### 10.2 What to add from otter (no conflict with production)

Copy these **entire directories and files** from `Projects/otter` into `onlinecourses-production` (on branch `services`). Do not remove any production file that exists only in main.

| Add from otter | Purpose |
|----------------|---------|
| **api/** | API endpoints (e.g. refresh_canvas_data.php) |
| **clients/** | Admin UI (certificates, registrations), reports, settings, home; CSS/JS |
| **services/** | Auth (login), API endpoints, Canvas integration, database (PDO, repositories, session), shared utils |
| **config/** | database_local.php (and any other local config) |
| **shared/** | shared/utils |
| **login.php** | Root entry point → services/auth/login.php |
| **router.php** | Local dev router (optional on server if vhost handles routing) |
| **otter/** | Cache directory (empty or with .gitkeep) |
| **.htaccess** (otter version) | RewriteBase and rules for /clients, /services, /api. **Important:** Use a single deploy path (e.g. `/onlinecourses-otter` or the actual server path). See §10.5. |
| **.gitignore** | Ignore vendor/, .env, cache, etc. |
| **composer.json**, **package.json** | If used by services/clients |
| **.github/** | Optional: deploy workflow for services branch |

### 10.3 What to replace or merge

| Path | Action |
|------|--------|
| **includes/db.php** | **Replace** with otter’s version (PDO `db` class). Production uses class `Database`; services layer and clients need the `db` class. Keep production’s **includes/config.php** and **includes/registrationform.php** (and copy) so legacy registration and cron still work. |
| **includes/** | **Add** from otter: paths.php, canvas.php, mailgun.php, version.php. **Keep** production: config.php, registrationform.php, registrationform copy.php. |
| **scripts/** | **Merge:** Keep all production scripts. **Add** any otter-only scripts (e.g. validate-*.php, diagnose-*.php, export-tables-to-csv.php) that are not in production. Resolve name collisions if any (production wins for same name). |

### 10.4 What to leave as production (do not overwrite)

Keep these exactly as on **main** (production). Do not replace with otter versions.

- All root production PHP: certificates.php, course_builder.php, registrations.php, delete.php, edit.php, get_courses.php, get_organizations.php, canvas_id_search.php, course_access.php, and any DELETE* / safety measure files.
- **cron/** — entire directory (production).
- **phpfunctions/** — entire directory (production).
- **safety measure/** — entire directory (production).
- **logs/** — keep; services may add logs under services/auth/logs etc.
- **includes/config.php**, **includes/registrationform.php** (and registrationform copy.php) — production versions so that legacy registration and any includes that pull config/db continue to work. Only **includes/db.php** is replaced so that both legacy code (if it uses `Database`) and new code (using `db`) can coexist; if production only uses `Database`, ensure the new db.php does not break includes/config.php (config may require `db.php` to define a class — verify and document).  
  **Note:** Production includes/config.php does `require_once 'db.php'`; production db.php defines class `Database`. Otter’s db.php defines class `db`. So any production file that instantiates `Database` would break if we only have `db`. Options: (a) keep both classes in includes/db.php (define `Database` as alias or extend `db`), or (b) replace with otter db.php and update production includes/config.php to use `db` with the same constructor pattern (globals). See FINDINGS-DB-PHP-PRODUCTION-VS-TEST.md. Prefer (a) or a thin wrapper so production code paths remain unchanged.

### 10.5 Deploy path and base URL

- Otter’s **includes/paths.php** sets `APP_BASE_PATH` (fallback `/onlinecourses-otter`). **.htaccess** uses `RewriteBase /onlinecourses-otter/`; **clients/.htaccess** and **services/.htaccess** may use `/onlinecourses-services/` — standardize to one base (e.g. `/onlinecourses-otter` or the directory name on server).
- When the **production developer** pulls the services branch into a **new directory** on the server (e.g. `/var/websites/webaim/htdocs/onlinecourses-otter` or another name), they must:
  1. Set the vhost or document root to that directory.
  2. Use the same **RewriteBase** (and APP_BASE_PATH fallback) as the directory path (e.g. `/onlinecourses-otter/`).
  3. Ensure **master_includes** paths are unchanged (`/var/websites/webaim/master_includes/...`) so DB and Canvas config load.

Document the chosen deploy path in the repo (e.g. README or DEPLOY.md for services branch) so the production developer knows which path to use.

### 10.6 External files (no code changes on server)

- Test instance must use the **same** external files as production: `master_includes/onlinecourses_common.php`, `master_includes/passwords.json`, etc. (see EXTERNAL-FILES-POLICY.md in resources/otter). No changes to those files; services branch code already points to these paths.

### 10.7 Step-by-step execution checklist

1. **Create branch:** In `onlinecourses-production`, `git checkout main`, then `git checkout -b services`.
2. **Add otter-only paths:** Copy from `Projects/otter` into `onlinecourses-production`: `api/`, `clients/`, `services/`, `config/`, `shared/`, `login.php`, `router.php`, `otter/` (with .gitkeep if needed), `.gitignore`, `composer.json`, `package.json`, `.github/` (optional).
3. **Replace includes/db.php** with otter’s; add **includes/paths.php**, **includes/canvas.php**, **includes/mailgun.php**, **includes/version.php**. If production code requires class `Database`, add a thin wrapper or alias in db.php so both `Database` and `db` exist.
4. **Merge scripts:** Add otter-only scripts into `scripts/`; do not remove production scripts.
5. **.htaccess:** Use otter’s root .htaccess; set RewriteBase to the agreed deploy path (e.g. `/onlinecourses-otter/`). Align clients/.htaccess and services/.htaccess to the same base if needed.
6. **Paths and config:** Ensure includes/paths.php fallback and any hardcoded base paths use the same deploy path. Document in README or DEPLOY.md.
7. **Smoke test locally** (if possible): Run PHP built-in server with router.php or point a local vhost at the services branch; test login, one report, one legacy page (e.g. certificates.php).
8. **Commit and push:** `git add -A`, `git commit -m "Add services branch: production + otter refactor"`, `git push -u origin services`.

### 10.8 Production developer: pull services branch on server

1. Create a new directory (e.g. `onlinecourses-otter` or the name that will be the URL path).
2. Clone the repo and checkout **services**:  
   `git clone -b services https://github.com/gjoeckel/otter.git <dirname>`, or clone then `git fetch origin services && git checkout services`.
3. Configure the web server so the chosen base path (e.g. `/onlinecourses-otter`) serves this directory.
4. Ensure RewriteBase and APP_BASE_PATH match that path (edit .htaccess and/or includes/paths.php if the directory name differs).
5. Run `composer install` (and `npm install` if needed) if the branch uses them.
6. Set permissions (e.g. cache, logs) as in PROCEDURE-DEPLOY-ONLINECOURSES-OTTER.md. Do **not** overwrite or change `master_includes/`; they remain shared with production.
7. Verify: open base URL, login, and test reports and at least one legacy production page (e.g. certificates.php) to confirm both new and preserved code work.

### 10.9 Summary

- **Base:** services branch starts from **main** (full production tree).
- **Add:** api/, clients/, services/, config/, shared/, login.php, router.php, otter/, .htaccess (otter), .gitignore, composer.json, package.json, optional .github/.
- **Replace/add in includes/:** db.php (otter PDO `db`; preserve or alias `Database` if needed), paths.php, canvas.php, mailgun.php, version.php; keep config.php and registrationform*.php from production.
- **Merge scripts/:** production scripts + otter-only scripts.
- **Deploy path:** One consistent RewriteBase/APP_BASE_PATH; document for production developer.
- **Result:** One branch the production developer can pull into a new server directory; all current code preserved; new services and otter updates function.

**Reference:** `Agents/resources/otter/SERVICES-BRANCH-DOCS-INDEX.md` for schema, mapping, deploy, and FINDINGS-DB-PHP-PRODUCTION-VS-TEST (Database vs `db`). **Production files not used by services or admin UI:** `docs/PRODUCTION-FILES-NOT-USED-BY-SERVICES.md` — those paths can be ignored (preserved but not in the services dependency graph).

---

## 11. One-shot services branch (2026-02-26)

**Done:** Branch **services** was created from **main** in `onlinecourses-production`, aligned with otter (api/, clients/, services/, config/, shared/, login.php, router.php, includes/db.php + Database compat, paths.php, canvas.php, mailgun.php, version.php, merged scripts), committed and force-pushed to origin.

| Item | Value |
|------|--------|
| **Commit** | `34b0aa7` — "Add services branch: production + otter refactor (one-shot)" |
| **Branch** | `services` (tracking `origin/services`) |
| **Repo** | https://github.com/gjoeckel/otter |

**Remaining (per §10.7–10.8):** Smoke test (login, one report, one legacy page); document deploy path (RewriteBase / APP_BASE_PATH) in README or DEPLOY.md for the production developer; optionally add missing otter script `scripts/diagnose-reports-db.php` if needed.

---

## 12. Related docs

- **Archived old methodology:** `docs/archive/old-production-sync-methodology/README.md`
- **Deploy otter (test instance):** `scripts/deploy-onlinecourses-otter.sh`, `.cursor/commands/deploy-onlinecourses-otter.md` (deploys from `Projects/otter` to onlinecourses-otter; separate from this plan).
