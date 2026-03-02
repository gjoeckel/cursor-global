# Branch Cleanup Plan

**Remove IDE-agnostic files from IDE branches to protect shared information**

---

## Problem Identified

**Current State**: IDE branches contain copies of IDE-agnostic files:
- `OPTIMIZED-CONFIG.md` (should be main only)
- `README.md` (main branch version, should be IDE-specific)
- `docs/IDE-BRANCHES.md` (should be main only)
- `docs/MCP-SERVERS-IMPLEMENTATION.md` (should be main only)

**Risk**: Agents working on IDE branches could accidentally edit these files, causing:
- Divergence from main branch
- Inconsistent IDE-agnostic information
- Confusion about authoritative source

---

## Solution: Clean Separation

### New Structure

**Main Branch** (source of truth for IDE-agnostic info):
- `README.md` - Repository overview
- `OPTIMIZED-CONFIG.md` - 39-tool configuration
- `docs/IDE-BRANCHES.md` - Branch guide
- `docs/MCP-SERVERS-IMPLEMENTATION.md` - Implementation guide
- `my-mcp-servers/` - Package code

**IDE Branches** (IDE-specific only):
- `README.md` - IDE-specific overview (links to main for shared info)
- IDE-specific setup guides
- IDE-specific config files
- NO copies of IDE-agnostic files

---

## Implementation Steps

### Step 1: Update IDE Branch READMEs

Each IDE branch README should:
1. Start with IDE-specific overview
2. Link to main branch for shared information
3. Include clear editing guidelines

### Step 2: Remove IDE-Agnostic Files from IDE Branches

```bash
# For cursor branch
git checkout cursor
git rm OPTIMIZED-CONFIG.md
git rm docs/IDE-BRANCHES.md
git rm docs/MCP-SERVERS-IMPLEMENTATION.md
# Update README.md to be Cursor-specific and link to main
git commit -m "Remove IDE-agnostic files, keep only Cursor-specific docs"

# Repeat for antigravity branch
```

### Step 3: Update IDE Branch READMEs

Template for IDE branch README:

```markdown
# [IDE Name] Setup Guide

**IDE-specific documentation for [IDE Name]**

---

## Overview

This branch contains **[IDE Name]-specific documentation** for setting up MCP servers.

**For IDE-agnostic information**, see the [main branch](https://github.com/gjoeckel/my-mcp-servers):
- [Repository Overview](https://github.com/gjoeckel/my-mcp-servers)
- [OPTIMIZED-CONFIG.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/OPTIMIZED-CONFIG.md) - 39-tool configuration
- [MCP-SERVERS-IMPLEMENTATION.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/docs/MCP-SERVERS-IMPLEMENTATION.md) - Implementation guide

---

## ⚠️ Editing Guidelines

**DO EDIT in this branch**:
- IDE-specific setup guides
- IDE-specific configuration examples
- IDE-specific workflows

**DO NOT EDIT in this branch** (edit in `main` branch instead):
- IDE-agnostic configuration files
- Shared documentation
- Package information

---

## [IDE Name]-Specific Documentation

[IDE-specific content here]
```

---

## Benefits

1. **Protection**: IDE-agnostic files can only be edited in main branch
2. **Clarity**: Clear separation between shared and IDE-specific info
3. **Safety**: No risk of accidental edits to shared files
4. **Maintainability**: Single source of truth for IDE-agnostic info

---

## Verification Checklist

After cleanup:
- [ ] `OPTIMIZED-CONFIG.md` exists ONLY in main branch
- [ ] `docs/IDE-BRANCHES.md` exists ONLY in main branch
- [ ] `docs/MCP-SERVERS-IMPLEMENTATION.md` exists ONLY in main branch
- [ ] IDE branch READMEs link to main branch for shared info
- [ ] IDE branches contain only IDE-specific files
- [ ] No duplicate copies of shared files

---

**Ready to implement?** This will make the repository structure safer and prevent accidental edits to IDE-agnostic information.

