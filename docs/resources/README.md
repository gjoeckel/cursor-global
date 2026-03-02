# Canvas Reports — resources (cursor-ops)

This folder holds **documentation and reference** for the **reports_generator** (Canvas Reports Apps Script) project. It lives under the cursor-ops repo and is used by agents and developers; the actual app code is in the project path defined in `config/project-paths.json`.

---

## Structure

```
docs/resources/
├── README.md                           # This file
└── documentation/
    ├── architecture/                   # Current system design
    │   └── REPORTS-GENERATOR-V12-DAILY-UPDATE.md
    └── legacy/                         # Archived / superseded docs
        └── COHORT-STRUCTURE-REFACTOR-V7.md
```

- **architecture/** — Current behavior and layout (e.g. Daily Update, Updates sheet, roster cache, 429 handling, v12 modules).
- **legacy/** — Old design docs kept for history (e.g. v7 cohort refactor); not current behavior.

---

## Related

- **Changelogs:** `changelogs/canvas-reports-reports-generator-2026-02-13.md` (and any future date-based changelogs).
- **Project paths:** `config/project-paths.json` (dev folder and external resources folder for canvas_reports).
- **Agent resource folders:** `docs/AGENT-RESOURCE-FOLDERS.md` (global pattern for project resources).
