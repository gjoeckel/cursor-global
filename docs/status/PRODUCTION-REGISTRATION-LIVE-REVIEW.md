# Production registration — live code review (post token validation)

**Date:** 2026-02-26  
**Context:** Token validated via test script (create user + enroll in course 2912). Review of live production code on server to identify all potential issues.

---

## 1. Entry point: `register.php` missing (low impact for current user flow)

- **State:** `/var/websites/webaim/htdocs/onlinecourses/register.php` does **not** exist. Only `DELETEregister.php` exists.
- **Impact:** Any request or POST to `.../onlinecourses/register.php` returns 404. The **per-enterprise user flow** does **not** use this file: `training/online/ccc/course/registration.php` includes **registrationform.php** directly (`include("/var/websites/webaim/htdocs/onlinecourses/includes/registrationform.php")`). So the broken registration was not caused by the missing register.php; it was caused by the invalid token used inside registrationform.php.
- **Recommendation:** Restore or repurpose as needed. If nothing should hit `register.php`, leave as-is; otherwise restore from local or rename `DELETEregister.php` → `register.php`.

---

## 2. Token source: two variables in `registrationform.php`

- **Live code** (`includes/registrationform.php`) uses:
  - `$CANVAS_API_TOKEN` → `$accessToken` (used for **account 240** user lookup, and for **create user**, **enroll**, unenroll, grades).
  - `$CANVAS_API_ADMIN_TOKEN` → `$accessAdminToken` (used only for **account 1** user lookup in `getCanvasUserIdByEmail`).
- **Create/enroll** (same as test script): both use **`$accessToken`** (`$CANVAS_API_TOKEN`). The token you validated (create user in account 1 + enroll in 2912) must be set as **`$CANVAS_API_TOKEN`** in `master_includes/onlinecourses_common.php`.
- **Risk:** If the new token was set only as `$CANVAS_API_ADMIN_TOKEN`, create/enroll would still use the old/empty `$CANVAS_API_TOKEN` and would get 401. Ensure the working token is in **`$CANVAS_API_TOKEN`** in `onlinecourses_common.php`.

---

## 3. Config chain

- **Live:** `includes/config.php` → `require_once('/var/websites/webaim/master_includes/onlinecourses_common.php')` → then `db.php`. No local override; token/URL come only from `onlinecourses_common.php`.
- **File exists:** `onlinecourses_common.php` is present (733 bytes, modified Feb 26 18:53). So credentials are loaded from that file; confirm it defines both `$CANVAS_API_URL` and `$CANVAS_API_TOKEN` (and `$CANVAS_API_ADMIN_TOKEN` if account 1 lookup is used).

---

## 4. Log evidence

- **canvas_registration.log:** Earlier on 2026-02-26: 401 "Invalid access token" on create user; later entries (18:53:54–57): "Successfully created Canvas user" and "Successfully enrolled user in Canvas" (user 167976, course 2915). So after the token was updated in `onlinecourses_common.php`, registrationform.php succeeded. That implies the **new token is in the right variable** (`$CANVAS_API_TOKEN`) for the live path.

---

## 5. Divergence: server vs local `registrationform.php`

- **Local** `Projects/onlinecourses/includes/registrationform.php`: same two tokens (`$CANVAS_API_TOKEN`, `$CANVAS_API_ADMIN_TOKEN`) and same pattern (account 240 vs 1). Content differs from server (checksum); server file is newer (Feb 26 16:44) and may have fixes or different logic.
- **Recommendation:** Before overwriting server with local, diff the two files. If server has the correct token usage and fixes, keep server version and only ensure `onlinecourses_common.php` has the correct token values.

---

## 6. Summary: potential issues

| # | Issue | Severity | Action |
|---|--------|----------|--------|
| 1 | `register.php` missing (only `DELETEregister.php` exists) | Low for current flow (per-enterprise uses registrationform.php) | Restore or rename if anything should call `register.php`. |
| 2 | New token must be in `$CANVAS_API_TOKEN` in `onlinecourses_common.php` (create/enroll use this) | High if wrong | Confirm in `onlinecourses_common.php`: working token = `$CANVAS_API_TOKEN`. |
| 3 | `$CANVAS_API_ADMIN_TOKEN` used only for account 1 user lookup | Medium | If lookups in account 1 fail, set or rotate this token; create/enroll do not use it. |
| 4 | Server `registrationform.php` differs from local | Low | Diff before replacing; keep server version if it has correct logic and token usage. |
| 5 | `canvas_api.log` empty; `canvas_registration.log` has the registration errors | Info | Use `canvas_registration.log` for registration/Canvas errors from registrationform.php. |

---

## 7. Validation

- Test script (create user + enroll in 2912) with the new token → **success**.
- Live `canvas_registration.log` (18:53) → **success** for create + enroll (user 167976, course 2915) after token update.

**Conclusion:** With the token set correctly as `$CANVAS_API_TOKEN` in `onlinecourses_common.php`, the live registration path (per-enterprise page → registrationform.php) can work. Remaining risks: wrong variable in common.php, or missing/expired `$CANVAS_API_ADMIN_TOKEN` if account 1 user lookup is required.
