# Branch Structure Proposal

**Safer approach to protect IDE-agnostic information**

---

## Current Problem

**Issue**: IDE-specific branches contain copies of IDE-agnostic files:
- `OPTIMIZED-CONFIG.md`
- `README.md` (main branch version)
- `docs/IDE-BRANCHES.md`
- `docs/MCP-SERVERS-IMPLEMENTATION.md`

**Risk**: If agents edit these files in IDE branches, they can diverge from main, causing:
- Inconsistent IDE-agnostic information
- Confusion about which version is authoritative
- Merge conflicts when updating main branch

---

## Proposed Solution: Clean Separation

### Option 1: IDE Branches Only Contain IDE-Specific Files (Recommended)

**Structure**:
```
main branch:
├── README.md (IDE-agnostic overview)
├── OPTIMIZED-CONFIG.md (IDE-agnostic)
├── docs/
│   ├── IDE-BRANCHES.md
│   └── MCP-SERVERS-IMPLEMENTATION.md
└── my-mcp-servers/ (package code)

cursor branch:
├── README.md (Cursor-specific overview, links to main)
├── CURSOR-SETUP-GUIDE.md
├── CURSOR-AUTONOMOUS-SETUP.md
├── YOLO-FULL-WORKFLOW.md
└── config/
    ├── mcp.json
    ├── settings.json
    └── workflows.json

antigravity branch:
├── README.md (Antigravity-specific overview, links to main)
└── (IDE-specific docs only)
```

**Benefits**:
- ✅ IDE-agnostic files exist ONLY in main branch
- ✅ No risk of accidental edits to shared files
- ✅ Clear separation of concerns
- ✅ IDE branches link back to main for shared info

**Implementation**:
1. Remove IDE-agnostic files from IDE branches
2. Update IDE branch READMEs to link to main branch for shared info
3. Add `.gitignore` or documentation warning to prevent re-adding

---

### Option 2: Subdirectory Structure on Main Branch

**Structure**:
```
main branch:
├── README.md
├── OPTIMIZED-CONFIG.md
├── docs/
│   ├── IDE-BRANCHES.md
│   └── MCP-SERVERS-IMPLEMENTATION.md
├── ide-setups/
│   ├── cursor/
│   │   ├── README.md
│   │   ├── CURSOR-SETUP-GUIDE.md
│   │   └── config/
│   ├── antigravity/
│   │   └── README.md
└── my-mcp-servers/
```

**Benefits**:
- ✅ Everything in one branch (no branch switching)
- ✅ IDE-agnostic files clearly separated
- ✅ Easy to navigate

**Drawbacks**:
- ❌ Loses branch-based organization
- ❌ All changes go to main (more risk)

---

### Option 3: Keep Branches, Use Symlinks or References

**Structure**: Keep current structure but:
- IDE branches contain only IDE-specific files
- Use relative links to main branch files
- Add clear documentation about what can be edited

**Benefits**:
- ✅ Maintains branch organization
- ✅ Clear separation

**Drawbacks**:
- ❌ Git doesn't handle symlinks well across branches
- ❌ More complex

---

## Recommendation: Option 1

**Why**: Cleanest separation, protects IDE-agnostic files, maintains branch organization.

**Migration Steps**:
1. Remove IDE-agnostic files from IDE branches
2. Update IDE branch READMEs to reference main branch files
3. Add clear documentation about branch structure
4. Update IDE-BRANCHES.md with new structure

---

## Implementation Plan

### Step 1: Clean Up IDE Branches

```bash
# For each IDE branch (cursor, antigravity):
git checkout cursor
git rm OPTIMIZED-CONFIG.md
git rm docs/IDE-BRANCHES.md
git rm docs/MCP-SERVERS-IMPLEMENTATION.md
# Keep README.md but update it to link to main
```

### Step 2: Update IDE Branch READMEs

Each IDE branch README should:
- Start with IDE-specific overview
- Link to main branch for shared info:
  ```markdown
  ## Shared Information

  For IDE-agnostic information, see the [main branch](https://github.com/gjoeckel/my-mcp-servers):
  - [OPTIMIZED-CONFIG.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/OPTIMIZED-CONFIG.md)
  - [MCP-SERVERS-IMPLEMENTATION.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/docs/MCP-SERVERS-IMPLEMENTATION.md)
  ```

### Step 3: Add Protection Documentation

Add to each IDE branch README:
```markdown
## ⚠️ Important: Editing Guidelines

**DO NOT EDIT** these files in this branch:
- IDE-agnostic configuration files
- Shared documentation

**DO EDIT** in this branch:
- IDE-specific setup guides
- IDE-specific configuration examples
- IDE-specific workflows

For shared information, edit in the `main` branch.
```

---

## Verification

After migration, verify:
- [ ] IDE-agnostic files exist ONLY in main branch
- [ ] IDE branches contain only IDE-specific files
- [ ] IDE branch READMEs link to main branch for shared info
- [ ] No duplicate copies of shared files

---

**Status**: Proposal - Ready for review and implementation

