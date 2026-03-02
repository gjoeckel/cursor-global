# Cursor-Ops Cleanup Analysis

**Date:** December 23, 2025
**Location:** `/Users/a00288946/Agents/cursor-ops`
**Status:** ⏳ AWAITING AUTHORIZATION

---

## 1. CURSOR_GLOBAL_DIR Alignment

### Current Status
✅ **`/Users/a00288946/Agents/cursor-ops` IS the CURSOR_GLOBAL_DIR**

All scripts use self-location detection:
```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_GLOBAL_DIR="$(dirname "$SCRIPT_DIR")"
```

This means:
- `cursor-ops/` = CURSOR_GLOBAL_DIR (the root)
- `cursor-ops/config/` = Global Cursor configuration
- `cursor-ops/scripts/` = Global automation scripts
- `cursor-ops/changelogs/` = Global session history
- `cursor-ops/docs/` = Global documentation

### Is It Still Needed?
✅ **YES - This directory IS the global configuration directory**

**However**, there are issues:
1. **Hardcoded paths** in `config/workflows.json` - All workflows use absolute paths instead of relative/portable paths
2. **Project-specific resources** mixed with global resources
3. **Legacy project references** (canvas_2875, canvas_reports) in config files

---

## 2. Project-Specific Resources Identified

### Resources to Move/Remove

#### A. Canvas Courses Project (`canvas-courses/`)
**Location:** `/Users/a00288946/Agents/cursor-ops/canvas-courses/`
**Type:** Complete project (Node.js package with scripts)
**Should Move To:** `/Users/a00288946/Projects/canvas-courses/` or `/Users/a00288946/Agents/resources/canvas-courses/`

**Contents:**
- `package.json`, `package-lock.json`, `node_modules/`
- `scripts/` (12 JavaScript files for course mapping)
- `courses/` (sample course data)
- `schema/` (course-map schema)
- Documentation files (ARCHITECTURE.md, WORKFLOW.md, etc.)

**Action:** Move entire directory to project location

---

#### B. MCP Server Packages

##### B1. `mcp-asana-minimal/`
**Location:** `/Users/a00288946/Agents/cursor-ops/mcp-asana-minimal/`
**Type:** Custom MCP server package (TypeScript, npm package)
**Decision Needed:**
- **Option 1:** Keep in global (if used across multiple projects)
- **Option 2:** Move to project resources (if canvas_reports specific)
- **Option 3:** Move to separate MCP servers repository

**Recommendation:** Keep in global if published to npm, otherwise move to resources

---

##### B2. `mcp-box-minimal/`
**Location:** `/Users/a00288946/Agents/cursor-ops/mcp-box-minimal/`
**Type:** Custom MCP server package (TypeScript, npm package)
**Decision Needed:** Same as mcp-asana-minimal

**Recommendation:** Keep in global if published to npm, otherwise move to resources

---

#### C. Project-Specific Config Files

##### C1. `config/project-paths.json`
**Location:** `/Users/a00288946/Agents/cursor-ops/config/project-paths.json`
**Type:** Project-specific path configuration
**Current Content:** References `canvas_reports` project
**Should Move To:**
- Option 1: Keep in global (if managing multiple projects)
- Option 2: Move to `/Users/a00288946/Agents/resources/canvas-reports/config/`

**Recommendation:** Keep in global - this is a multi-project manager

---

##### C2. `config/paths.json`
**Location:** `/Users/a00288946/Agents/cursor-ops/config/paths.json`
**Type:** Legacy project path config
**Current Content:** References `canvas_2875` project (legacy)
**Action:** **DELETE** - Superseded by `project-paths.json`

---

##### C3. `config/project-paths.json.test_backup`
**Location:** `/Users/a00288946/Agents/cursor-ops/config/project-paths.json.test_backup`
**Type:** Test backup file
**Action:** **DELETE** - Temporary test file

---

#### D. Project-Specific Documentation

##### D1. Canvas-Specific Docs in `docs/`
**Location:** `/Users/a00288946/Agents/cursor-ops/docs/`
**Files to Move:**
- `CLASP-APPS-SCRIPT-SETUP.md` - Canvas Apps Script setup
- `CANVAS-TOKEN-SETUP.md` - Canvas API token setup
- `canvas-course-map-structure.md` - Canvas course mapping
- `MODULE-2-TASKS-GUIDE.md` - Canvas module tasks

**Should Move To:** `/Users/a00288946/Agents/resources/canvas-reports/docs/`

---

##### D2. Project-Specific Setup Docs
**Files to Review:**
- `docs/CLASP-SETUP-ACTION-PLAN.md` - Canvas Apps Script specific
- `docs/CLASP-APPS-SCRIPT-SETUP.md` - Canvas Apps Script specific

**Should Move To:** `/Users/a00288946/Agents/resources/canvas-reports/docs/`

---

#### E. Changelogs Context

##### E1. `changelogs/context-summary.md`
**Location:** `/Users/a00288946/Agents/cursor-ops/changelogs/context-summary.md`
**Content:** References `canvas_2875` project (legacy)
**Action:** **UPDATE** - Remove legacy project references or move to project-specific changelog

---

#### F. Hardcoded Paths in Config

##### F1. `config/workflows.json`
**Location:** `/Users/a00288946/Agents/cursor-ops/config/workflows.json`
**Issue:** All 14 workflows use hardcoded absolute paths:
```json
"bash /Users/a00288946/Agents/cursor-ops/scripts/session-start.sh"
```

**Should Be:** Relative paths or use `setup.sh` to generate absolute paths dynamically

**Action:** **UPDATE** - Replace with relative paths or use setup script to inject paths

---

##### F2. `config/settings.json`
**Location:** `/Users/a00288946/Agents/cursor-ops/config/settings.json`
**Issue:** Contains project-specific paths:
```json
"paths.development": "/Users/a00288946/Projects/canvas_2875",
"paths.resources": "/Users/a00288946/Agents/resources/canvas_2875"
```

**Action:** **REMOVE** - These should be in `project-paths.json` only

---

## 3. Recommended Actions

### Phase 1: Clean Up Config Files (Safe)
1. ✅ Delete `config/paths.json` (legacy, superseded)
2. ✅ Delete `config/project-paths.json.test_backup` (test file)
3. ✅ Remove project-specific paths from `config/settings.json`
4. ✅ Update `config/workflows.json` to use relative paths or dynamic path injection

### Phase 2: Move Project Resources (Requires Authorization)
1. ⏳ Move `canvas-courses/` → `/Users/a00288946/Projects/canvas-courses/` or resources folder
2. ⏳ Move canvas-specific docs → `/Users/a00288946/Agents/resources/canvas-reports/docs/`
3. ⏳ Decide on MCP packages (keep global or move to resources)

### Phase 3: Update References (After Moves)
1. ⏳ Update any hardcoded references to moved files
2. ⏳ Update documentation that references moved locations
3. ⏳ Verify all scripts still work after moves

---

## 4. File Movement Plan

### Files to DELETE (Safe - No Project Data)
```
config/paths.json                                    # Legacy config
config/project-paths.json.test_backup               # Test backup
config/settings.json (paths.development/resources)  # Remove project paths
```

### Files to MOVE (Requires Authorization)
```
canvas-courses/ → /Users/a00288946/Projects/canvas-courses/
  OR
canvas-courses/ → /Users/a00288946/Agents/resources/canvas-courses/

docs/CLASP-*.md → /Users/a00288946/Agents/resources/canvas-reports/docs/
docs/CANVAS-*.md → /Users/a00288946/Agents/resources/canvas-reports/docs/
docs/canvas-course-map-structure.md → /Users/a00288946/Agents/resources/canvas-reports/docs/
docs/MODULE-2-TASKS-GUIDE.md → /Users/a00288946/Agents/resources/canvas-reports/docs/
```

### Files to REVIEW (Decision Needed)
```
mcp-asana-minimal/  # Keep global or move?
mcp-box-minimal/    # Keep global or move?
```

---

## 5. Summary

### Current State
- ✅ Directory structure is correct (cursor-ops = CURSOR_GLOBAL_DIR)
- ⚠️ Hardcoded absolute paths in workflows.json
- ⚠️ Project-specific resources mixed with global resources
- ⚠️ Legacy project references (canvas_2875) in config files

### After Cleanup
- ✅ Clean global configuration directory
- ✅ Project resources in appropriate project locations
- ✅ Portable workflows (relative paths or dynamic injection)
- ✅ No legacy project references

---

## 6. Authorization Required

**Before proceeding with Phase 2 (file moves), please confirm:**

1. ✅ **Phase 1 (Config Cleanup)** - Safe to proceed?
2. ⏳ **Phase 2 (File Moves)** - Authorize moving project resources?
3. ⏳ **MCP Packages** - Keep in global or move to resources?

**Status:** ⏳ **WAITING FOR AUTHORIZATION**

---

**Next Steps:**
1. Review this analysis
2. Authorize Phase 1 (safe config cleanup)
3. Authorize Phase 2 (file moves)
4. Provide decision on MCP packages

