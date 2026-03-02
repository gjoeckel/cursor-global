# reports_generator — Daily Update & Current Architecture (v12)

**Last updated:** 2026-02-13  
**Project:** Canvas Reports Apps Script (`reports_generator`), deployed via clasp.

---

## Overview

The **Daily Update** is the batch job that runs Grades, Master, Quarterly, and Monthly updates per enterprise from the **Updates** sheet. It can be triggered from the menu or by a time-driven trigger.

---

## Updates sheet layout

- **Rows 1–2:** Headers.
- **Data from row 3.** Columns:
  - **A:** Enterprise code.
  - **B/C:** Grades variable / timestamp.
  - **D/E:** Master variable / timestamp.
  - **F/G:** Quarterly variable / timestamp.
  - **H/I:** Monthly variable / timestamp.

**Variable cells (B, D, F, H):**

- **0** — Skip that phase.
- **"all"** (case-insensitive) — Process all cohorts, quarters, or months (same as Side Panel “Select All”).
- **Positive integer X** — Process the X newest items. If X ≥ count, process all.

At **run start**, timestamp columns **E, G, I** (Master, Quarterly, Monthly) are cleared from row 3 to last row so only the current run’s results are shown.

---

## Main modules (v12)

| File           | Role |
|----------------|------|
| **dailyUpdate.js** | Entry point for Daily Update (menu + trigger). Reads Updates sheet, resolves cohorts/quarters/months, calls GradeEngine, buildMasterFromCohorts, syncSelectedReports. Clears timestamps at start; TIMING logs when enabled. |
| **GradeEngine.js** | Cohort grade sync: roster (via CanvasAPI.getRoster), metadata, submissions (fetchAll), merge, write. Per-cohort TIMING breakdown (rosterMs, metadataMs, submissionsMs, mergeWriteMs). |
| **CanvasAPI.js**   | Canvas REST client. 429 retry with exponential backoff in fetchAll and fetchInBatches. getRoster(courseId) with document-cache (key `roster_<courseId>`, TTL 10 min, max 100KB). |
| **MenuAndTriggers.js** | Menu items and time-driven trigger wiring. |
| **Initialization.js**, **UtilityEngine.js**, **CustomFieldManager.js**, **MasterManager.js**, etc. | Supporting logic per existing codebase. |

---

## Roster cache

- **Where:** Spreadsheet **document cache** (`CacheService.getDocumentCache()`).
- **Key:** `roster_<courseId>`.
- **TTL:** 10 minutes. Cached only if JSON payload ≤ 100 KB.
- **Use:** First call for a course fetches from Canvas and caches; subsequent calls within TTL return cache (log: “Roster cache hit for course …”).

---

## 429 handling

- **fetchAll:** Responses with status 429 are retried (only failed requests) with exponential backoff (2s, 4s, 8s, 16s, 32s), max 5 retries.
- **fetchInBatches:** A 429 on a paginated request triggers the same backoff and retry for that URL before throwing.

---

## Versioning and deploy

- File headers use `// Version: X.Y.Z`. After each authorized change, version is bumped and `clasp push` is run from the project directory (per .cursorrules).

---

## Changelogs

- Session changelog for 2026-02-13: `changelogs/canvas-reports-reports-generator-2026-02-13.md` (in cursor-ops repo).
