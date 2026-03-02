# Production registration handoff (backend dev)

**Date:** 2026-02-26  
**Issue:** Registration broken in production backend; new Canvas token did not fix it.

---

## Confirmed server state

- **`register.php`** — **Missing** on production. Only `DELETEregister.php` exists at `/var/websites/webaim/htdocs/onlinecourses/`. Any request to `register.php` will 404.
- **`includes/registrationform.php`** — Present on server but **content differs** from local `Projects/onlinecourses` (checksum). Token path or logic may differ.
- **canvas_api.log** — Empty (no recent Canvas API entries). Failure may be 404 before Canvas is called.

---

## Diagnosis (concise)

1. **Missing entry point:** Production has no active `register.php`; it was renamed to `DELETEregister.php`. Registration flow cannot run.
2. **Diverged include:** Server `includes/registrationform.php` is not the same as local; may read token from wrong place or use different logic.
3. **User-facing URLs:** Users hit per-enterprise pages (e.g. `.../training/online/ccc/course/registration.php`); those rely on the onlinecourses backend. If `register.php` is missing, registration breaks regardless of token.

---

## Questions for backend developer

1. Was `register.php` intentionally disabled by renaming to `DELETEregister.php`? If yes, what is the intended registration entry point on production?
2. Where does production code read the Canvas API token (only `master_includes/onlinecourses_common.php`, or another file/env)?
3. Do the per-enterprise pages under `training/online/<enterprise>/course/` POST to `.../onlinecourses/register.php` or a different endpoint?
4. After adding the new token to `onlinecourses_common.php`, did you confirm that path is the one loaded by the script that runs on registration?

---

## Restore option (when developer approves)

Restore from local `Projects/onlinecourses` to production:

```bash
# From your machine (local register.php and includes/registrationform.php)
scp /Users/a00288946/Projects/onlinecourses/register.php webaim-deploy:/var/websites/webaim/htdocs/onlinecourses/
scp /Users/a00288946/Projects/onlinecourses/includes/registrationform.php webaim-deploy:/var/websites/webaim/htdocs/onlinecourses/includes/
```

Or rename back on server (keeps server version; only fixes missing entry point):

```bash
ssh webaim-deploy
cd /var/websites/webaim/htdocs/onlinecourses
cp DELETEregister.php register.php   # or mv if DELETE copy is redundant
```

Ensure the new Canvas token is in the config actually loaded by `register.php` / `registrationform.php` (e.g. `master_includes/onlinecourses_common.php`).

---

## References

- Full tree diff report: `cursor-ops/docs/status/production-tree-diff-2026-02-26-111732.txt`
- Production mapping: `resources/otter/PRODUCTION-SERVER-MAPPING.md` (user-facing vs backend paths)
