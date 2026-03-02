# Production files not utilized by services or admin UI

**Purpose:** Identify production paths that are **not** in the dependency graph of the services layer or the admin UI (reports, dashboards, login, settings). These can be **ignored** for services-branch behavior: keep them so the production developer has the full tree and legacy/cron still work, but they are not required for services or admin UI to function.

**Scope:** App root at `/var/websites/webaim/htdocs/onlinecourses` (or local `onlinecourses-production` main). External files (`master_includes/`) are unchanged and used by both production and services.

---

## What services and admin UI use from the app tree

From code analysis of `Projects/otter` (services/, clients/, api/, login.php):

| Path | Used by | Note |
|------|---------|------|
| **includes/db.php** | services (NewDatabaseService, session_handler) | Replaced with otter’s PDO `db` class on services branch. |
| **includes/paths.php** | services, clients | Not in production tree; **added** from otter. |
| **includes/version.php** | services, clients | Not in production tree; **added** from otter. |

Everything else in the services/admin flow loads only: `includes/db.php`, `includes/paths.php`, `includes/version.php`, and **external** `master_includes/` (onlinecourses_common.php, passwords.json, etc.). No production root PHP, cron, phpfunctions, or scripts are required by services or admin UI.

---

## Production paths NOT utilized by services or admin UI

These can be **ignored** for the purposes of services and admin UI. Preserve them on the services branch for the production developer and for legacy/cron use.

### Root PHP (legacy entry points)

| File | Purpose |
|------|---------|
| certificates.php | Legacy certificates UI (replaced by clients/admin/certificates.php) |
| course_builder.php | Legacy course builder |
| registrations.php | Legacy registrations list (replaced by clients/admin/registrations.php) |
| delete.php | Legacy delete |
| edit.php | Legacy edit |
| get_courses.php | Legacy get courses |
| get_organizations.php | Legacy get organizations |
| canvas_id_search.php | Legacy Canvas ID search |
| course_access.php | Legacy course access |
| DELETEalumni_re_enroll.php | Deleted/renamed legacy |
| DELETEauto_find_tou_assignments.php | Deleted/renamed legacy |
| DELETEregister.php | Deleted/renamed legacy |

### includes/ (not used by services or admin UI)

| File | Purpose |
|------|---------|
| includes/config.php | Legacy config (master_includes + email, roles); used by legacy registration/cron, not by services/clients |
| includes/registrationform.php | Legacy registration form |
| includes/registrationform copy.php | Legacy copy |

### cron/

| Path | Purpose |
|------|---------|
| cron/cron_daily.php | Server cron |
| cron/cron_fetch_new_courses.php | Server cron |
| cron/cron_trigger.php | Server cron |
| cron/cron_weekly.php | Server cron |

### phpfunctions/

All files — used by legacy registration and production scripts; not called by services or clients.

| Path |
|------|
| phpfunctions/import_canvas_users_to_new_table.php |
| phpfunctions/import_canvas_users_to_new_table2.php |
| phpfunctions/phpcreateuser.php |
| phpfunctions/phpenrolluser.php |
| phpfunctions/phpfixemails.php |
| phpfunctions/phpfixnames.php |
| phpfunctions/phpgetassignment.php |
| phpfunctions/phpgetexistinguser.php |
| phpfunctions/phpgetquizzes.php |
| phpfunctions/phpimportcourseusers.php |
| phpfunctions/setCustomFields.php |

### scripts/

All files — used by manual runs or cron; not called by services or admin UI. Canvas sync in services is self-contained (services/api/canvas_data_sync.php).

| Path |
|------|
| scripts/fetch_course_quizzes_assignments.php |
| scripts/map_quizzes_to_database.php |
| scripts/quiz_score_tracker.php |
| scripts/quiz_score_trackerOLD.php |
| scripts/report_grade_change_status_dry_run.php |
| scripts/logs/* |

### safety measure/

Entire directory — backup/legacy copies; not used by services or admin UI.

### logs/

Log files — output only; not required by services or admin UI for execution.

### Data files (root)

| File | Purpose |
|------|---------|
| registration_backup_CCC.csv | Backup data |
| registration_backup_CSU.csv | Backup data |
| registration_backup_DEMO.csv | Backup data |

### .htaccess (production)

Production’s .htaccess is replaced by otter’s on the services branch (RewriteBase and routes for /clients, /services, /api). So production .htaccess is “not utilized” by the services/admin stack.

---

## Summary

- **Utilized by services or admin UI:** Only **includes/db.php** (and we replace it with otter’s). **includes/paths.php** and **includes/version.php** are added from otter, not taken from production.
- **Not utilized (can be ignored):** All root legacy PHP, includes/config.php, includes/registrationform*.php, cron/, phpfunctions/, scripts/, safety measure/, logs/, root CSV backups, and production .htaccess.

**Use:** When building or documenting the services branch, treat the “not utilized” list as **preserve but ignore**: keep these paths so the tree is complete and legacy/cron keep working, but no need to change them for services or admin UI to function. Optional: add a `.cursorignore` or deploy note so tooling doesn’t treat them as part of the active services graph.

---

## Related

- **PRODUCTION-MAIN-AND-SERVICES-PLAN.md** (§10) — services branch build plan
- **SERVICES-BRANCH-DOCS-INDEX.md** (resources/otter) — doc index for services branch
