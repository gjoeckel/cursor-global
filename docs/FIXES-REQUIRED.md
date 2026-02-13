# Required Fixes for Repository

**Critical issues found during E2E review**

---

## Critical Issue #1: Hardcoded Paths in workflows.json

### Problem
**File**: `cursor/config/workflows.json`

All 15 workflows contain hardcoded paths with identifying information:
```json
"bash /Users/a00288946/Agents/cursor-ops/scripts/session-start.sh"
```

### Impact
- ❌ Contains username (a00288946)
- ❌ Location-specific (won't work for other users)
- ❌ Not portable
- ❌ Security/privacy concern

### Fix Required

Replace all instances of:
```
/Users/a00288946/Agents/cursor-ops/scripts/
```

With:
```
/path/to/cursor-ops/scripts/
```

Or use script names if scripts are in PATH:
```
session-start.sh
```

### Affected Workflows (15 total)
- ai-start
- ai-end
- ai-update
- ai-repeat
- ai-compress
- mcp-health
- mcp-restart
- ai-local-commit
- ai-local-merge
- ai-merge-finalize
- ai-docs-sync
- mcp-setup
- agent-comms-check
- yolo-full

---

## Issue #2: Package Name Clarification

### Situation
- Repository contains: `my-mcp-servers/packages/puppeteer-minimal/`
- Config uses: `mcp-playwright-minimal` (npm package)
- Both packages exist on npm:
  - `mcp-puppeteer-minimal@1.0.1` (uses Puppeteer)
  - `mcp-playwright-minimal@1.0.0` (uses Playwright)

### Analysis
These are **different packages**:
- `puppeteer-minimal` - Uses Puppeteer library
- `playwright-minimal` - Uses Playwright library

The config correctly uses `playwright-minimal` as documented.

### Required Action
**Option A**: Document that both packages exist and explain the difference

**Option B**: If only playwright-minimal should be used, update `my-mcp-servers/README.md` to reflect actual usage

**Recommendation**: Document both packages exist, but the recommended config uses `playwright-minimal`.

---

## Fix Implementation

### Step 1: Fix workflows.json

Create corrected version with placeholders:

```json
{
  "ai-start": {
    "description": "Load AI session context and initialize environment",
    "commands": [
      "bash /path/to/cursor-ops/scripts/session-start.sh"
    ],
    ...
  }
}
```

### Step 2: Update Documentation

Add note about package differences in `my-mcp-servers/README.md`:
- Explain puppeteer-minimal vs playwright-minimal
- Document that config uses playwright-minimal
- Note that puppeteer-minimal exists for compatibility

---

## Verification After Fixes

- [ ] No hardcoded paths in workflows.json
- [ ] All paths use placeholders
- [ ] Package documentation clarified
- [ ] No identifying information remains

---

**Priority**: Fix Issue #1 immediately before repository is considered complete.

