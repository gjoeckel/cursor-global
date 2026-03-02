# Repository Migration Guide

**Guide for creating new main branch and overwriting remote main for my-mcp-servers repository**

---

## Overview

This guide provides step-by-step instructions for creating a new main branch from scratch and overwriting the remote main branch with comprehensive documentation.

---

## New Repository Structure

```
my-mcp-servers/
├── README.md                              # Main repository README
├── OPTIMIZED-CONFIG.md                    # 39-tool configuration guide
├── IDE-SETUP-GUIDE.md                     # IDE setup instructions
├── docs/
│   └── MCP-SERVERS-IMPLEMENTATION.md     # Complete implementation guide
├── my-mcp-servers/                        # Existing package directory (keep as-is)
│   └── packages/
│       ├── agent-autonomy/
│       ├── github-minimal/
│       ├── shell-minimal/
│       ├── playwright-minimal/
│       ├── sequential-thinking-minimal/
│       └── everything-minimal/
└── .gitignore                             # Existing (keep as-is)
```

---

## Files to Create/Update

### 1. Root README.md

**Location**: `/Users/a00288946/Agents/cursor-ops/docs/my-mcp-servers-README.md`

**Action**: Copy to repository root as `README.md`

### 2. OPTIMIZED-CONFIG.md

**Location**: `/Users/a00288946/Agents/cursor-ops/docs/OPTIMIZED-CONFIG.md`

**Action**: Copy to repository root

### 3. IDE-SETUP-GUIDE.md

**Location**: `/Users/a00288946/Agents/cursor-ops/docs/IDE-SETUP-GUIDE.md`

**Action**: Copy to repository root

### 4. docs/MCP-SERVERS-IMPLEMENTATION.md

**Location**: `/Users/a00288946/Agents/cursor-ops/docs/my-mcp-servers-MCP-IMPLEMENTATION.md`

**Action**: Copy to `docs/MCP-SERVERS-IMPLEMENTATION.md` in repository

---

## Migration Steps

### Step 1: Clone Repository

```bash
cd /tmp
git clone https://github.com/gjoeckel/my-mcp-servers.git my-mcp-servers-new
cd my-mcp-servers-new
```

### Step 2: Create New Branch

```bash
# Create new branch from scratch
git checkout --orphan new-main

# Remove all existing files from staging
git rm -rf .
```

### Step 3: Copy Existing Package Code

```bash
# Keep the existing package structure
git checkout main -- my-mcp-servers/
git checkout main -- .gitignore
```

### Step 4: Add New Documentation

```bash
# Copy new documentation files
cp /Users/a00288946/Agents/cursor-ops/docs/my-mcp-servers-README.md README.md
cp /Users/a00288946/Agents/cursor-ops/docs/OPTIMIZED-CONFIG.md .
cp /Users/a00288946/Agents/cursor-ops/docs/IDE-SETUP-GUIDE.md .

# Create docs directory
mkdir -p docs
cp /Users/a00288946/Agents/cursor-ops/docs/my-mcp-servers-MCP-IMPLEMENTATION.md docs/MCP-SERVERS-IMPLEMENTATION.md
```

### Step 5: Stage and Commit

```bash
# Stage all files
git add .

# Commit new structure
git commit -m "Complete repository restructure with comprehensive documentation

- Add comprehensive README with package overview
- Add OPTIMIZED-CONFIG.md with 39-tool configuration
- Add IDE-SETUP-GUIDE.md for all supported IDEs
- Add docs/MCP-SERVERS-IMPLEMENTATION.md with complete implementation guide
- Preserve existing package code structure
- Fix playwright-minimal references (was puppeteer-minimal in some places)"
```

### Step 6: Overwrite Remote Main

```bash
# Push new branch
git push origin new-main

# Switch to main locally
git checkout main

# Reset main to new-main
git reset --hard new-main

# Force push to overwrite remote main
git push origin main --force

# Clean up
git branch -D new-main
git push origin --delete new-main
```

---

## Verification

After migration, verify:

1. **Repository Structure**
   ```bash
   ls -la
   # Should show: README.md, OPTIMIZED-CONFIG.md, IDE-SETUP-GUIDE.md, docs/, my-mcp-servers/
   ```

2. **Documentation Links**
   - README.md links to all other docs
   - OPTIMIZED-CONFIG.md exists
   - IDE-SETUP-GUIDE.md exists
   - docs/MCP-SERVERS-IMPLEMENTATION.md exists

3. **Package Code**
   - my-mcp-servers/packages/ structure preserved
   - All packages still buildable

4. **GitHub Display**
   - README.md displays correctly
   - All links work
   - Documentation is accessible

---

## Alternative: Direct File Creation

If you prefer to create files directly in the repository:

### Option A: Create Files Locally, Then Push

```bash
cd /path/to/my-mcp-servers

# Create new branch
git checkout -b new-main

# Copy files (as shown in Step 4 above)
# ... copy files ...

# Commit and push
git add .
git commit -m "Complete repository restructure"
git push origin new-main

# Then follow Step 6 to overwrite main
```

### Option B: Create Files in GitHub Web Interface

1. Create new branch via GitHub web interface
2. Add files via web interface
3. Create pull request
4. Merge to main

---

## Key Changes Summary

### Added Files

1. **README.md** - Comprehensive repository overview
2. **OPTIMIZED-CONFIG.md** - 39-tool configuration guide
3. **IDE-SETUP-GUIDE.md** - Setup instructions for all IDEs
4. **docs/MCP-SERVERS-IMPLEMENTATION.md** - Complete implementation guide

### Preserved Files

1. **my-mcp-servers/** - All package code
2. **.gitignore** - Existing ignore rules

### Fixed Issues

1. ✅ All references use `playwright-minimal` (not `puppeteer-minimal`)
2. ✅ Complete npx installation documentation
3. ✅ All environment variables documented
4. ✅ Complete troubleshooting section
5. ✅ IDE-specific setup instructions

---

## Post-Migration Tasks

After migration:

1. **Update Repository Description**
   - Add description: "Custom MCP servers optimized for 40-tool limit (39 tools)"
   - Add topics: `mcp`, `model-context-protocol`, `cursor-ide`, `claude-desktop`

2. **Verify npm Packages**
   - Confirm all packages are published
   - Verify package descriptions match documentation

3. **Test Documentation**
   - Follow IDE-SETUP-GUIDE.md for each IDE
   - Verify all links work
   - Test configuration examples

4. **Update Related Repositories**
   - Update cursor-ops repository if it references this repo
   - Update any other documentation that links to this repo

---

## Rollback Plan

If something goes wrong:

```bash
# Restore previous main from backup
git checkout main
git reset --hard origin/main@{1}
git push origin main --force
```

Or restore from a tag if you create one before migration:

```bash
# Before migration, create backup tag
git tag backup-before-migration

# If needed, restore
git checkout backup-before-migration
git checkout -b main-restored
git push origin main-restored --force
```

---

## File Locations Reference

All prepared files are in:
```
/Users/a00288946/Agents/cursor-ops/docs/
├── my-mcp-servers-README.md          → README.md
├── OPTIMIZED-CONFIG.md                → OPTIMIZED-CONFIG.md
├── IDE-SETUP-GUIDE.md                 → IDE-SETUP-GUIDE.md
└── my-mcp-servers-MCP-IMPLEMENTATION.md → docs/MCP-SERVERS-IMPLEMENTATION.md
```

---

**Ready to proceed?** Follow the steps above to create the new main branch and overwrite the remote.

