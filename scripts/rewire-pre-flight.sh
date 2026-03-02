#!/usr/bin/env bash
# rewire-pre-flight.sh — Run pre-flight checks before starting a rewire phase.
# Usage: bash scripts/rewire-pre-flight.sh [1|2|3]
# From cursor-ops: CURSOR_OPS not required. From elsewhere: set CURSOR_OPS to cursor-ops root.
# Version: 1.0.0

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_OPS="${CURSOR_OPS:-$(dirname "$SCRIPT_DIR")}"
CONFIG_DIR="$CURSOR_OPS/config"
PROJECT_PATHS="$CONFIG_DIR/project-paths.json"

# Resolve otter paths from project-paths (canvas_reports = otter)
get_otter_paths() {
    if [[ ! -f "$PROJECT_PATHS" ]]; then
        echo "ERROR: project-paths.json not found at $PROJECT_PATHS" >&2
        return 1
    fi
    if ! command -v jq &>/dev/null; then
        echo "ERROR: jq required to read project-paths.json" >&2
        return 1
    fi
    OTTER_DEV=$(jq -r '.canvas_reports.development.folder // empty' "$PROJECT_PATHS" 2>/dev/null || true)
    OTTER_RES=$(jq -r '.canvas_reports.resources.folder // empty' "$PROJECT_PATHS" 2>/dev/null || true)
    if [[ -z "$OTTER_DEV" || "$OTTER_DEV" == "null" ]]; then
        OTTER_DEV=""
        OTTER_RES=""
    fi
}

PASS=0
FAIL=0
phase="${1:-}"

report() {
    local status="$1"
    local msg="$2"
    if [[ "$status" == "ok" ]]; then
        echo "  ✅ $msg"
        ((PASS++)) || true
    else
        echo "  ❌ $msg"
        ((FAIL++)) || true
    fi
}

report_skip() {
    echo "  ⏭️  $1 (manual)"
}

get_otter_paths
if [[ -z "$OTTER_DEV" ]]; then
    echo "ERROR: Could not resolve otter development path from $PROJECT_PATHS" >&2
    exit 1
fi

RES_OVERVIEW="$OTTER_RES/REWIRE-OVERVIEW.md"
RES_SCHEMA="$OTTER_RES/production_database_schema.md"
PROD_REF="$OTTER_DEV/../onlinecourses"
PROD_MAP="$PROD_REF/scripts/map_quizzes_to_database.php"
PROD_FETCH="$PROD_REF/scripts/fetch_course_quizzes_assignments.php"

echo "=============================================="
echo " Rewire Pre-Flight Check"
echo " Otter dev:  $OTTER_DEV"
echo " Otter res:  $OTTER_RES"
echo " Phase:      ${phase:-all}"
echo "=============================================="

# --- Phase 1 checks (always run if phase is 1 or empty) ---
run_phase1() {
    echo ""
    echo "--- Phase 1 pre-flight ---"
    [[ -d "$OTTER_DEV" ]] && report ok "Otter dev directory exists" || report fail "Otter dev directory missing: $OTTER_DEV"
    [[ -f "$RES_OVERVIEW" ]] && report ok "REWIRE-OVERVIEW.md exists" || report fail "REWIRE-OVERVIEW.md missing"
    [[ -f "$RES_SCHEMA" ]] && report ok "production_database_schema.md exists" || report fail "production_database_schema.md missing"
    if [[ -d "$OTTER_DEV/.git" ]]; then
        report ok "Git repo present"
        branch=$(git -C "$OTTER_DEV" branch --show-current 2>/dev/null || true)
        if [[ -n "$branch" ]]; then
            report ok "Current branch: $branch"
        fi
        if git -C "$OTTER_DEV" diff --quiet 2>/dev/null && git -C "$OTTER_DEV" diff --cached --quiet 2>/dev/null; then
            report ok "Working tree clean (no uncommitted changes)"
        else
            report fail "Working tree has uncommitted changes (commit or stash before starting)"
        fi
    else
        report fail "Not a git repo: $OTTER_DEV"
    fi
    report_skip "Read REWIRE-OVERVIEW Section 0 and production_database_schema"
    report_skip "Authorization: no login/home/settings/reports/dashboard changes without explicit OK"
}

# --- Phase 2 checks ---
run_phase2() {
    echo ""
    echo "--- Phase 2 pre-flight ---"
    [[ -d "$OTTER_DEV" ]] && report ok "Otter dev directory exists" || report fail "Otter dev directory missing"
    [[ -f "$RES_OVERVIEW" ]] && report ok "REWIRE-OVERVIEW.md exists" || report fail "REWIRE-OVERVIEW.md missing"
    [[ -f "$OTTER_RES/REWIRE-PHASE-2-QUIZ-MAPPING.md" ]] && report ok "REWIRE-PHASE-2-QUIZ-MAPPING.md exists" || report fail "Phase 2 doc missing"
    if git -C "$OTTER_DEV" rev-parse "rewire-phase-1-done" &>/dev/null; then
        report ok "Tag rewire-phase-1-done exists (Phase 1 complete)"
    else
        report fail "Tag rewire-phase-1-done not found (complete and tag Phase 1 first)"
    fi
    [[ -f "$PROD_MAP" ]] && report ok "Production map_quizzes_to_database.php found" || report fail "Production script missing: $PROD_MAP"
    [[ -f "$PROD_FETCH" ]] && report ok "Production fetch_course_quizzes_assignments.php found" || report fail "Production fetcher missing: $PROD_FETCH"
    if git -C "$OTTER_DEV" diff --quiet 2>/dev/null && git -C "$OTTER_DEV" diff --cached --quiet 2>/dev/null; then
        report ok "Working tree clean"
    else
        report fail "Working tree has uncommitted changes"
    fi
    report_skip "Read REWIRE-OVERVIEW Section 0 and Phase 2 doc"
}

# --- Phase 3 checks ---
run_phase3() {
    echo ""
    echo "--- Phase 3 pre-flight ---"
    [[ -d "$OTTER_DEV" ]] && report ok "Otter dev directory exists" || report fail "Otter dev directory missing"
    [[ -f "$RES_OVERVIEW" ]] && report ok "REWIRE-OVERVIEW.md exists" || report fail "REWIRE-OVERVIEW.md missing"
    if git -C "$OTTER_DEV" rev-parse "rewire-phase-1-done" &>/dev/null; then
        report ok "Tag rewire-phase-1-done exists"
    else
        report fail "Tag rewire-phase-1-done not found"
    fi
    if git -C "$OTTER_DEV" rev-parse "rewire-phase-2-quiz-mapping-done" &>/dev/null; then
        report ok "Tag rewire-phase-2-quiz-mapping-done exists"
    else
        report fail "Tag rewire-phase-2-quiz-mapping-done not found (complete and tag Phase 2 first)"
    fi
    if git -C "$OTTER_DEV" diff --quiet 2>/dev/null && git -C "$OTTER_DEV" diff --cached --quiet 2>/dev/null; then
        report ok "Working tree clean"
    else
        report fail "Working tree has uncommitted changes"
    fi
    report_skip "Read REWIRE-OVERVIEW and Phase 3 doc"
}

case "$phase" in
    1) run_phase1 ;;
    2) run_phase2 ;;
    3) run_phase3 ;;
    *)
        run_phase1
        echo ""
        echo "--- Phase 2/3 (tags and production refs) ---"
        git -C "$OTTER_DEV" rev-parse "rewire-phase-1-done" &>/dev/null && report ok "Tag rewire-phase-1-done exists" || report fail "Tag rewire-phase-1-done not found"
        git -C "$OTTER_DEV" rev-parse "rewire-phase-2-quiz-mapping-done" &>/dev/null && report ok "Tag rewire-phase-2-quiz-mapping-done exists" || report_skip "Tag rewire-phase-2-quiz-mapping-done (Phase 2 not done)"
        [[ -f "$PROD_MAP" ]] && report ok "Production map script found" || report fail "Production map script missing"
        [[ -f "$PROD_FETCH" ]] && report ok "Production fetch script found" || report fail "Production fetch script missing"
        ;;
esac

echo ""
echo "=============================================="
echo " Result: $PASS passed, $FAIL failed"
echo "=============================================="
if [[ $FAIL -gt 0 ]]; then
    echo "Fix failures above before starting the phase. For manual items, complete them and re-run."
    exit 1
fi
echo "Pre-flight OK. Proceed to phase doc verification steps and then implement."
exit 0
