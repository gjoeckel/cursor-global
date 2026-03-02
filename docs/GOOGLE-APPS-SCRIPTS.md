# Google Apps Script & Sheets — Agent Reference

**Audience:** AI agents working on Google Apps Script projects (e.g. `canvas_reports/reports_generator`) from cursor-ops or linked development folders.  
**Scope:** Global cursor-ops doc; project-specific details live in project resources (see [Project paths](#project-paths)).

---

## 1. Project paths

| Project key       | Development folder | Resources folder |
|-------------------|--------------------|------------------|
| `canvas_reports`  | `~/Projects/canvas_reports/reports_generator` | `~/Agents/resources/canvas-reports/reports_generator` |

- **Development:** Apps Script source (`.js`, `.html`, `appsscript.json`), `clasp` config.  
- **Resources:** Docs, testing scripts (e.g. `testing/test_daily_update_updates_sheet.js`), templates, changelogs.

Paths are defined in `config/project-paths.json`. When running cursor-ops scripts from another project, set `CURSOR_OPS` to the cursor-ops repo root.

---

## 2. Google services used in this codebase

| Service | Typical use |
|---------|-------------|
| **SpreadsheetApp** | `getActiveSpreadsheet()`, `getSheetByName(name)`, `getActiveSheet()`, `getUi()`, `flush()` |
| **Sheet** | `getRange(...)`, `getLastRow()`, `getLastColumn()`, `getDataRange()` |
| **Range** | `getValues()`, `getDisplayValues()`, `setValues()`, `setValue()`, `clearContent()`, `setNumberFormat()` |
| **CacheService** | `getDocumentCache()`, `getUserCache()` — roster cache, stop flag |
| **PropertiesService** | `getScriptProperties().getProperty/setProperty()` — e.g. `CANVAS_TOKEN`, `CURRENT_ENTERPRISE_CODE` |
| **UrlFetchApp** | `fetch(url, options)`, `fetchAll(requests)` — Canvas API and external HTTP |
| **HtmlService** | `createHtmlOutputFromFile('SidePanel')`, `createTemplateFromFile('ManageEarnersDialog')` — sidebar/dialogs |
| **Logger** | `Logger.log(msg)` — execution logs (view in Apps Script editor) |
| **Utilities** | `Utilities.sleep(ms)` — rate limiting / rest between phases |

---

## 3. Spreadsheet and range API — critical details

### 3.1 `Sheet.getRange()` signatures

- **Single cell:** `getRange(row, column)` — 1-based. Example: `sheet.getRange(2, 3)` = cell C2.
- **Rectangular range (numeric):** `getRange(row, column, numRows, numColumns)`  
  **Important:** The third and fourth arguments are **number of rows** and **number of columns**, not end row/end column.

  ```javascript
  // Correct: clear one column from row 2 for 10 rows (rows 2–11)
  var numDataRows = 10;
  sheet.getRange(2, 5, numDataRows, 1).clearContent();  // 10 rows, 1 column starting at E2

  // Wrong: getRange(2, 5, 11, 9) would mean 11 rows and 9 columns, not “to row 11, col I”
  ```

- **A1 notation:** `getRange('A1:D10')` — use when readability matters; same Sheet class.

The **Spreadsheet** class also has `getRange()`, often with A1-style string; ensure you call on the correct object (usually `Sheet` from `ss.getSheetByName(...)`).

### 3.2 Reading and writing

- **getValues()** — Returns 2D array of **stored values**. Dates are Date objects; numbers are numbers.  
- **getDisplayValues()** — Returns 2D array of **display strings** (as shown in UI). Use when you need the formatted string (e.g. date as "2/20/2026") and not the underlying value.
- **setValues(values)** — Writes a 2D array. Shape must match range exactly. Batch write is preferred over many `setValue()` calls.
- **setValue(value)** — Single cell. If you pass a date-like **string** (e.g. `"2026-02-20 14:35"`), Sheets may **parse it as a date** and display only the date part (see §3.3).
- **clearContent()** — Clears cell contents; formatting can be preserved depending on usage.

After writes, **SpreadsheetApp.flush()** applies pending changes. Use after batch writes when the script immediately reads back or when the user should see updates.

### 3.3 Storing literal date-time strings (no date parsing)

Sheets **auto-parses** date-like strings when you use `setValue("2026-02-20 14:35")`. The value is stored as a date/time and may display as date only. To store **plain text** (e.g. `YYYY-MM-DD HH:MM`):

1. **Leading apostrophe (recommended in this project):**  
   `range.setValue("'" + "2026-02-20 14:35")`  
   The apostrophe forces text; it is not shown in the cell. When you `getValue()`, the returned string does not include the apostrophe.

2. **Set format then value:**  
   `range.setNumberFormat('@');` then `range.setValue("2026-02-20 14:35");`  
   Plain-text format is `'@'` or `'@STRING@'`. Set format **before** setting the value for reliable behavior.

---

## 4. Naming and structural conventions

- **Version in file header:** `// Version: X.Y.Z` at top of each script file. Bump after every authorized change (see §7).
- **Menu entry point:** A single top-level function is listed in the menu (e.g. `runDailyUpdate()`), which calls the real implementation (`dailyUpdate()`). Keeps the Run menu simple.
- **Private helpers:** Prefix with `_` (e.g. `_dailyUpdateDateStr()`, `_parseVarCell()`) to indicate internal use. They still run in Apps Script; the underscore is convention only.
- **Constants:** `DATA_START_ROW`, `GRADES_TS_COL`, etc. at top of file for column/row layout.

---

## 5. Best practices (codebase + web research)

- **Batch read/write:** Read a range once with `getValues()`, process in memory, write once with `setValues()`. Avoid alternating read/write in loops (large performance gain).
- **Minimize service calls:** In-memory JS is much faster than SpreadsheetApp or UrlFetchApp calls. Cache when appropriate (e.g. roster in document cache).
- **CacheService:** Use for expensive or repeated data. Document cache: `CacheService.getDocumentCache()` (key `roster_<courseId>`, TTL 10 min in this project). Limits: key length ≤ 250 chars; value ≤ 100 KB per entry; default expiration 600 s; max 6 hours. Prefer setting format before value when forcing text.
- **429 rate limiting:** This codebase retries with exponential backoff (e.g. 2s, 4s, 8s, 16s, 32s), max 5 retries. Use `Utilities.sleep(ms)` between retries.
- **Triggers:** Time-driven triggers have a 6-minute max runtime per execution. Design long jobs for resumability or chunking.

---

## 6. Quotas and limits (Apps Script)

- **Execution time:** 6 minutes per execution (30 s for custom functions).
- **URL Fetch:** e.g. 20,000–100,000 calls/day (varies by account).
- **Cache:** 100 KB per cache entry; key length 250 characters; consider 1,000-entry cap per cache.
- **Quotas reset** 24 hours after first use; apply per user.

See [Quotas for Google Services](https://developers.google.com/apps-script/guides/services/quotas) and [Best practices](https://developers.google.com/apps-script/guides/support/best-practices) for current numbers.

---

## 7. Deployment and versioning

- **Deploy:** From the Apps Script project directory run `clasp push`. Requires `clasp` and login.
- **Version bump:** After any authorized script change, update the `// Version: X.Y.Z` header in the modified file(s) and run `clasp push` (per .cursorrules). Do not commit secrets; store tokens in Script Properties.

### 7.1 Agent workflow (avoid lost edits before push)

1. **Save changes** — Ensure edits are written to disk (e.g. Cursor applies edits; confirm file is saved if working across tools).
2. **Validate local file** — Before bumping version or running `clasp push`, confirm the intended change is present in the local file (e.g. grep for the new function name, or read the modified section). If the change is missing, re-apply it and save again.
3. **Iterate version** — Update `// Version: X.Y.Z` in each changed file.
4. **Push** — Run `clasp push` from the Apps Script project directory.

Skipping step 2 can result in pushing a version that doesn’t include the change (e.g. if the editor buffer wasn’t persisted or was reverted), leaving Apps Script and local out of sync.

---

## 8. Project-specific documentation (resources)

| Doc | Location | Purpose |
|-----|----------|---------|
| Technical spec | `resources/.../documentation/architecture/TECHNICAL-SPECIFICATION.md` | Architecture, CCC flow, Master/Grades layout |
| Daily Update (v12) | `docs/resources/documentation/architecture/REPORTS-GENERATOR-V12-DAILY-UPDATE.md` | Updates sheet, flow, modules |
| Cohort 00-00 | `resources/.../documentation/COHORT-00-00-REVIEW-COHORTS.md` | Review cohorts excluded from Master |
| Apps Script snapshot | `resources/.../documentation/legacy/apps-script-snapshot-02-13-26.md` | File/function inventory (legacy) |
| Local test (Updates sheet) | `resources/.../testing/test_daily_update_updates_sheet.js` | Node script to validate parsing and timestamp format |

---

## 9. Web research summary (relevant to current context)

- **getRange(row, column, numRows, numColumns):** Third and fourth parameters are **count** of rows and columns, not end indices. Common source of bugs when clearing or writing ranges.
- **setValue with date strings:** Strings like `"2026-02-20 14:35"` are parsed as dates; display may show only the date. Use a leading apostrophe or `setNumberFormat('@')` then set value to keep literal text.
- **getDisplayValues() vs getValues():** Use `getDisplayValues()` when you need the formatted display string; use `getValues()` for typed values (Date, number).
- **Cache:** Document cache is tied to the spreadsheet; user cache is per user. Cache-aside pattern: check cache first, then fetch and put.
- **Batch operations:** Single bulk read and single bulk write can reduce runtimes from tens of seconds to about a second compared to many small read/writes.

---

*Last updated: 2026-02-19. For cursor-ops agent use at the global level.*
