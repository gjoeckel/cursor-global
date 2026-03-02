#!/bin/bash
# Version: 1.0.0
# Audit legacy or conflicting scripts/files for the /yolo-full workflow and supporting changes.
# Run from cursor-ops root: bash scripts/audit-yolo-full-legacy.sh [--json]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_OPS="${CURSOR_OPS:-$(dirname "$SCRIPT_DIR")}"
cd "$CURSOR_OPS"

JSON_OUTPUT=false
[[ "${1:-}" == "--json" ]] && JSON_OUTPUT=true

# Canonical workflow steps (what we expect in config/workflows.json for yolo-full)
CANONICAL_STEPS=(
  "validate-autonomous-mode.sh --json"
  "display-project-paths.sh"
  "show-project-startup.sh"
  "AGENT-QUICKSTART.md"
)

# Legacy / conflicting patterns (Claude Code, wrong tool names, old workflow)
LEGACY_PATTERNS=(
  "Bash, Read, Write"
  "WebSearch, WebFetch, Task"
  "Run \`/mcp\`"
  "/mcp"
  "claude mcp list"
  "Claude Code"
  "\.cursor-workspaces"
  "switch-cursor-project"
  "csp "
  "csp<"
)

# Files and locations to check
WORKFLOW_FILE="config/workflows.json"
COMMANDS_DIR=".cursor/commands"
GLOBAL_COMMANDS_DIR="${HOME:-/tmp}/.cursor/commands"

report() {
  if [[ "$JSON_OUTPUT" == "true" ]]; then
    return
  fi
  echo "$@"
}

# --- Collect findings ---
LEGACY_FILES=()
CONFLICTING_FILES=()
MISSING_STEPS=()
CANONICAL_OK=true
GLOBAL_OVERRIDE=""

# 1. Check config/workflows.json for yolo-full steps
if [[ -f "$WORKFLOW_FILE" ]]; then
  if command -v jq &>/dev/null; then
    COMMANDS=$(jq -r '.["yolo-full"].commands[]? // empty' "$WORKFLOW_FILE" 2>/dev/null || true)
    for step in "${CANONICAL_STEPS[@]}"; do
      if echo "$COMMANDS" | grep -qF "$step"; then
        : # found
      else
        MISSING_STEPS+=("$step")
        CANONICAL_OK=false
      fi
    done
  fi
else
  report "⚠️  $WORKFLOW_FILE not found"
  CANONICAL_OK=false
fi

# 2. Check project .cursor/commands/yolo-full.md for legacy patterns
PROJECT_CMD="$COMMANDS_DIR/yolo-full.md"
if [[ -f "$PROJECT_CMD" ]]; then
  CONTENT=$(cat "$PROJECT_CMD")
  for pat in "${LEGACY_PATTERNS[@]}"; do
    if echo "$CONTENT" | grep -qE "$pat"; then
      LEGACY_FILES+=("$PROJECT_CMD (legacy pattern: $pat)")
      CANONICAL_OK=false
    fi
  done
  # Cursor IDE tool names expected
  if echo "$CONTENT" | grep -qE "run_terminal_cmd|read_file"; then
    : # has Cursor tool names
  else
    if echo "$CONTENT" | grep -q "allowed-tools:"; then
      LEGACY_FILES+=("$PROJECT_CMD (allowed-tools may be Claude-style; expected run_terminal_cmd, read_file, etc.)")
    fi
  fi
else
  report "⚠️  Project command file not found: $PROJECT_CMD"
fi

# 3. Check global commands dir (may override project)
if [[ -d "$GLOBAL_COMMANDS_DIR" ]] && [[ -f "$GLOBAL_COMMANDS_DIR/yolo-full.md" ]]; then
  GLOBAL_CMD="$GLOBAL_COMMANDS_DIR/yolo-full.md"
  CONTENT=$(cat "$GLOBAL_CMD")
  for pat in "${LEGACY_PATTERNS[@]}"; do
    if echo "$CONTENT" | grep -qE "$pat"; then
      GLOBAL_OVERRIDE="$GLOBAL_CMD"
      LEGACY_FILES+=("$GLOBAL_CMD (global override; legacy pattern: $pat)")
      CANONICAL_OK=false
      break
    fi
  done
  if [[ -z "$GLOBAL_OVERRIDE" ]]; then
    GLOBAL_OVERRIDE="$GLOBAL_CMD (exists; review for conflict with project command)"
  fi
fi

# 4. Scan docs for outdated workflow description (missing --json or show-project-startup)
DOCS_REFERENCE_YOLO=()
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  if grep -qE "validate-autonomous-mode\.sh\"?\s*\)?\]?" "$f" 2>/dev/null; then
    if grep -q "validate-autonomous-mode.sh --json" "$f" 2>/dev/null; then
      : # has --json
    else
      if grep -q "validate-autonomous-mode.sh" "$f" 2>/dev/null; then
        DOCS_REFERENCE_YOLO+=("$f (may describe old step without --json)")
      fi
    fi
  fi
done < <(find docs -name "*.md" -type f 2>/dev/null || true)

# 5. Other workflow files that define yolo-full
OTHER_WORKFLOWS=()
for wf in docs/cursor-branch-workflows-FIXED.json config/global-scripts.json; do
  if [[ -f "$wf" ]] && grep -q "yolo-full" "$wf" 2>/dev/null; then
    OTHER_WORKFLOWS+=("$wf")
  fi
done

# --- Output report ---
if [[ "$JSON_OUTPUT" == "true" ]]; then
  # JSON output for programmatic use
  echo "{"
  echo "  \"canonical_workflow_ok\": $CANONICAL_OK,"
  echo "  \"missing_steps\": $(printf '%s\n' "${MISSING_STEPS[@]}" | jq -R -s -c 'split("\n") | map(select(length>0))'),"
  echo "  \"legacy_or_conflicting_files\": $(printf '%s\n' "${LEGACY_FILES[@]}" | jq -R -s -c 'split("\n") | map(select(length>0))'),"
  echo "  \"global_commands_override\": $(echo "$GLOBAL_OVERRIDE" | jq -Rs .),"
  echo "  \"docs_may_be_outdated\": $(printf '%s\n' "${DOCS_REFERENCE_YOLO[@]}" | jq -R -s -c 'split("\n") | map(select(length>0))'),"
  echo "  \"other_workflow_files_referencing_yolo_full\": $(printf '%s\n' "${OTHER_WORKFLOWS[@]}" | jq -R -s -c 'split("\n") | map(select(length>0))')"
  echo "}"
  exit 0
fi

report ""
report "=============================================="
report "  /yolo-full legacy & conflict audit"
report "=============================================="
report ""

report "1. Canonical workflow ($WORKFLOW_FILE)"
if [[ "$CANONICAL_OK" == "true" ]] && [[ ${#MISSING_STEPS[@]} -eq 0 ]]; then
  report "   ✅ Contains expected steps: validate --json, display-project-paths, show-project-startup, AGENT-QUICKSTART echo"
else
  if [[ ${#MISSING_STEPS[@]} -gt 0 ]]; then
    report "   ⚠️  Missing or different steps:"
    for s in "${MISSING_STEPS[@]}"; do report "      - $s"; done
  fi
fi
report ""

report "2. Project command file ($PROJECT_CMD)"
if [[ ${#LEGACY_FILES[@]} -eq 0 ]] || ! printf '%s\n' "${LEGACY_FILES[@]}" | grep -q "^$PROJECT_CMD"; then
  if [[ -f "$PROJECT_CMD" ]]; then
    report "   ✅ No legacy patterns detected (Cursor IDE tool names, no Claude Code refs)"
  fi
else
  report "   ⚠️  Legacy or conflicting content:"
  printf '%s\n' "${LEGACY_FILES[@]}" | grep "^$PROJECT_CMD" | while read -r line; do report "      $line"; done
fi
report ""

report "3. Global commands (override check)"
if [[ -n "$GLOBAL_OVERRIDE" ]]; then
  report "   ⚠️  Found: $GLOBAL_OVERRIDE"
  report "      If this file contains Claude Code instructions or old tool names, it may override the project command. Consider aligning or removing."
else
  if [[ -f "$GLOBAL_COMMANDS_DIR/yolo-full.md" ]]; then
    report "   📁 $GLOBAL_COMMANDS_DIR/yolo-full.md exists; review for conflict."
  else
    report "   ✅ No global yolo-full command file found (or no legacy patterns)."
  fi
fi
report ""

report "4. Docs that may describe old workflow"
if [[ ${#DOCS_REFERENCE_YOLO[@]} -eq 0 ]]; then
  report "   ✅ No obvious outdated step references in docs."
else
  for d in "${DOCS_REFERENCE_YOLO[@]}"; do
    report "   📄 $d"
  done
fi
report ""

report "5. Other workflow/config files referencing yolo-full"
if [[ ${#OTHER_WORKFLOWS[@]} -eq 0 ]]; then
  report "   (none)"
else
  for w in "${OTHER_WORKFLOWS[@]}"; do report "   📄 $w"; done
fi
report ""

report "6. Supporting scripts (expected to exist)"
for s in scripts/validate-autonomous-mode.sh scripts/display-project-paths.sh scripts/show-project-startup.sh scripts/get-current-project.sh; do
  if [[ -f "$s" ]]; then
    report "   ✅ $s"
  else
    report "   ❌ Missing: $s"
  fi
done
report ""

report "7. Supporting docs (expected)"
for d in docs/AGENT-QUICKSTART.md docs/AGENT-STARTUP-TEMPLATE.md; do
  if [[ -f "$d" ]]; then
    report "   ✅ $d"
  else
    report "   ❌ Missing: $d"
  fi
done
report ""

report "=============================================="
report "Run with --json for machine-readable output."
report "=============================================="
