# Agent Resource Folders

## Overview

This document describes the organizational structure for Agent resource folders, which separate agent-related resources (documentation, testing, scripts, analysis) from working project code.

---

## Directory Structure

### Global Agent Resources

**Location:** `/Users/a00288946/Agents/cursor-ops/`

This is the **GLOBAL** agent resources folder that contains:
- Shared agent tools and configurations
- Global documentation (including this file)
- MCP servers and configurations
- Cross-project agent utilities

### Working Project Folders

**Location:** `/Users/a00288946/Projects/`

Working project folders contain **only production application code**:
- Source code
- Configuration files needed for runtime
- Application-specific assets
- Build artifacts

**Example:** `/Users/a00288946/Projects/canvas_2879/` (Canvas course management project)

### Agent Resource Folders

**Location:** `/Users/a00288946/Agents/`

Each project has a corresponding agent resource folder following this naming pattern:
- Project: `/Users/a00288946/Projects/{project-name}/`
- Resources: `/Users/a00288946/Agents/{project-name}_resources/`

**Examples:**
- `/Users/a00288946/Projects/onlinecourses-services/` → `/Users/a00288946/Agents/onlinecourses-services-resources/` (see archived example)
- `/Users/a00288946/Projects/canvas_2879/` → `/Users/a00288946/Agents/resources/canvas_2879/`
- `/Users/a00288946/Projects/canvas_2813/` → `/Users/a00288946/Agents/resources/astho_2813/`

---

## Agent Resource Folder Structure

The structure is modeled after `/Users/a00288946/Agents/archive/otter-resources/` (formerly `onlinecourses-services-resources`).

### Standard Directory Structure

```
{project-name}_resources/
├── README.md                    # Overview and purpose of this resources folder
├── ORGANIZATION-PLAN.md         # Organization plan and structure (optional)
│
├── documentation/               # Reference documentation
│   ├── analysis/                # Code/issue analysis reports
│   ├── architecture/            # System architecture docs
│   ├── guides/                  # How-to guides and best practices
│   ├── migration/               # Migration and conversion docs
│   ├── legacy/                  # Legacy and deprecated docs
│   ├── verification/            # Verification and validation docs
│   └── one-pagers/              # Quick reference documents
│
├── reports/                     # Investigation and analysis reports
│   ├── investigations/          # Root cause and issue analysis
│   ├── summaries/               # Summary reports
│   └── test-results/            # Test result reports
│
├── plans/                       # Planning documents
├── status/                      # Completion and status reports
├── data/                        # Data files, schemas, test data
│
├── scripts/                     # Deployment, sync, and utility scripts
├── testing/                     # Test files and diagnostic scripts
├── test-results/                # Test output and results
│
└── git-repo/                    # Git repository clone (optional, for reference)
```

---

## Directory Purposes

### `documentation/`

Reference documentation organized by type:

- **`analysis/`** - Code/issue analysis reports
  - Code duplication analysis
  - Issue root cause analysis
  - Refactoring recommendations
  - Bug fix documentation

- **`architecture/`** - System structure documentation
  - Directory structure analysis
  - Repository structure docs
  - System design documents

- **`guides/`** - How-to guides and best practices
  - Setup guides
  - Workflow guides
  - Best practices
  - API integration guides

- **`migration/`** - Migration and conversion documentation
  - Migration plans
  - Conversion guides
  - Data migration docs

- **`legacy/`** - Legacy and deprecated documentation
  - Deprecated features
  - Historical documentation
  - Migration notes

- **`verification/`** - Verification and validation documentation
  - Database verification
  - Feature verification
  - Testing verification

- **`one-pagers/`** - Quick reference documents
  - Feature summaries
  - Quick start guides
  - Cheat sheets

### `reports/`

Investigation and analysis reports:

- **`investigations/`** - Detailed issue investigation reports
- **`summaries/`** - High-level summary reports
- **`test-results/`** - Test execution results

### `plans/`

Planning documents:
- Implementation plans
- Strategy documents
- Roadmaps

### `status/`

Completion and status reports:
- Task completion status
- Project status updates
- Milestone reports

### `data/`

Data files and schemas:
- Database schemas
- Test data files
- Configuration templates
- Reference data

### `scripts/`

Utility and automation scripts:
- Deployment scripts
- Sync scripts
- Setup scripts
- Maintenance scripts

### `testing/`

Test files and diagnostic scripts:
- Test scripts
- Diagnostic tools
- Validation scripts
- Browser test files

### `test-results/`

Test output and results:
- Test artifacts
- Test snapshots
- Validation results

### `git-repo/` (Optional)

Git repository clone for reference:
- Clone of main/master branch
- Used for comparison
- Historical reference
- Documentation extraction

---

## What Goes Where

### Move TO Resource Folder

Move these from the working project to the resource folder:

✅ **Documentation**
- `*.md` files (except essential README.md if needed in app)
- Analysis reports
- Best practices documents
- How-to guides

✅ **Testing**
- `test-*.php`, `test-*.js`, `test-*.py`, etc.
- `check-*.php`, `check-*.js`, etc.
- `diagnose-*.php`, `diagnose-*.js`, etc.
- `debug-*.php`, `debug-*.js`, etc.
- `test-results/` directories

✅ **Scripts**
- `sync-*.sh`
- `setup-*.sh`
- Deployment scripts
- Utility scripts not needed for runtime

✅ **Analysis/Diagnostic**
- `analyze-*.php`, `analyze-*.js`, etc.
- `compare-*.php`, `compare-*.js`, etc.
- `validate-*.php`, `validate-*.js`, etc.

✅ **Data Files**
- Test data
- Schema files
- Configuration templates (if not needed for runtime)

### Keep IN Working Project

Keep these in the working project directory:

✅ **Application Code**
- Source code files
- Runtime configuration
- Application assets
- Build files

✅ **Essential Files**
- `README.md` (if needed for deployment/documentation)
- `.gitignore`
- Build configuration files
- Package files (`package.json`, `requirements.txt`, etc.)

---

## Benefits

### 1. Clean Application Directory

- Only production application code
- Easier to deploy
- Clear separation of concerns
- Reduced clutter

### 2. Organized Resources

- All agent tools in one place
- Easy to find testing/documentation
- Version control for resources separately
- Better organization

### 3. Git Repository Access (Optional)

- Reference clone always available
- Compare with working code
- Extract examples/documentation
- Historical reference

### 4. Portability

- Resources can be shared across agents
- Easy to backup independently
- Can be version controlled separately
- Agent-specific knowledge preserved

---

## Example: Otter Resources Structure

**Reference:** `/Users/a00288946/Agents/archive/otter-resources/`

This is the model structure used for all agent resource folders. Key characteristics:

- Comprehensive documentation organization
- Clear separation of analysis, guides, and architecture docs
- Dedicated testing and script directories
- Optional git-repo clone for reference
- Status and planning directories

See the README.md in that directory for detailed structure documentation.

---

## Creating a New Resource Folder

When starting work on a new project:

1. **Create the resource folder:**
   ```bash
   mkdir -p /Users/a00288946/Agents/{project-name}_resources
   ```

2. **Create standard directory structure:**
   ```bash
   cd /Users/a00288946/Agents/{project-name}_resources
   mkdir -p documentation/{analysis,architecture,guides,migration,legacy,verification,one-pagers}
   mkdir -p reports/{investigations,summaries,test-results}
   mkdir -p plans status data scripts testing test-results
   ```

3. **Create README.md:**
   - Document the project
   - Explain the resource folder purpose
   - Reference this guide

4. **Move agent resources from project folder:**
   - Follow the "What Goes Where" guidelines above
   - Move documentation, testing, scripts, etc.

---

## Quick Navigation Patterns

### For Agents

**Starting a New Task:**
1. Read `README.md` for overview
2. Check `documentation/guides/` for relevant guides
3. Review `documentation/architecture/` for system understanding
4. Check `status/` for recent completion reports

**Investigating an Issue:**
1. Check `reports/investigations/` for similar issues
2. Review `documentation/analysis/` for related analysis
3. Check `status/` for fix completion status
4. Review `reports/test-results/` for validation results

---

## Related Documentation

- **Global Agent Resources:** `/Users/a00288946/Agents/cursor-ops/README.md`
- **Example Resource Folder:** `/Users/a00288946/Agents/archive/otter-resources/README.md`

---

**Last Updated:** December 16, 2025

