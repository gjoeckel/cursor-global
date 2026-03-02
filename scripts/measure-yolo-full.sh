#!/bin/bash
# Version: 1.2.0
# Measure /yolo-full completeness and efficiency.
# Completeness: all steps run and succeed; JSON valid; expected output present.
# Efficiency: total time under threshold (default 20s). Times are whole seconds (subsecond runs show as 0).
# Usage: bash scripts/measure-yolo-full.sh [--json] [--threshold-sec N]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_OPS="${CURSOR_OPS:-$(dirname "$SCRIPT_DIR")}"
cd "$CURSOR_OPS"

JSON_OUTPUT=false
THRESHOLD_SEC=20
[[ "${1:-}" == "--json" ]] && JSON_OUTPUT=true && shift
[[ "${1:-}" == "--threshold-sec" ]] && THRESHOLD_SEC="${2:-20}" && shift 2

RESULTS_DIR="${CURSOR_OPS}/changelogs"
mkdir -p "$RESULTS_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTFILE="${RESULTS_DIR}/yolo-full-measure-${TIMESTAMP}.txt"

# Steps (same order as config/workflows.json); use CURSOR_OPS for portability (CI/local)
STEPS=(
  "bash ${CURSOR_OPS}/scripts/validate-autonomous-mode.sh --json"
  "bash ${CURSOR_OPS}/scripts/display-project-paths.sh"
  "bash ${CURSOR_OPS}/scripts/show-project-startup.sh"
  "echo 'Next: read docs/AGENT-QUICKSTART.md for current-project context.'"
  "echo '✅ yolo-full complete. Verify MCP tools connected if needed.'"
)

declare -a STEP_TIMES
TOTAL_START=$(date +%s)
ALL_OK=true
STEP_OUTPUTS=()

for i in "${!STEPS[@]}"; do
  step="${STEPS[$i]}"
  start=$(date +%s)
  if out=$(eval "$step" 2>&1); then
    step_end=$(date +%s)
    elapsed=$((step_end - start))
    STEP_TIMES+=("$elapsed")
    STEP_OUTPUTS+=("$out")
  else
    STEP_TIMES+=("-1")
    STEP_OUTPUTS+=("$out")
    ALL_OK=false
  fi
done

TOTAL_END=$(date +%s)
TOTAL_ELAPSED=$((TOTAL_END - TOTAL_START))

# Completeness checks
VALID_JSON=false
HAS_PROJECT_PATHS=false
HAS_STARTUP_REF=false
HAS_QUICKSTART_REF=false

[[ -n "${STEP_OUTPUTS[0]:-}" ]] && echo "${STEP_OUTPUTS[0]}" | jq -e . >/dev/null 2>&1 && VALID_JSON=true
[[ -n "${STEP_OUTPUTS[1]:-}" ]] && echo "${STEP_OUTPUTS[1]}" | grep -q "Project Directory\|Development Folder\|Resources Folder" && HAS_PROJECT_PATHS=true
[[ -n "${STEP_OUTPUTS[2]:-}" ]] && echo "${STEP_OUTPUTS[2]}" | grep -q "Current project startup\|AGENT-STARTUP\|Project:" && HAS_STARTUP_REF=true
[[ -n "${STEP_OUTPUTS[3]:-}" ]] && echo "${STEP_OUTPUTS[3]}" | grep -q "AGENT-QUICKSTART" && HAS_QUICKSTART_REF=true

COMPLETE=false
if [[ "$ALL_OK" == "true" ]] && [[ "$VALID_JSON" == "true" ]] && [[ "$HAS_PROJECT_PATHS" == "true" ]] && [[ "$HAS_STARTUP_REF" == "true" ]] && [[ "$HAS_QUICKSTART_REF" == "true" ]]; then
  COMPLETE=true
fi

EFFICIENT=false
if [[ "$TOTAL_ELAPSED" -le "$THRESHOLD_SEC" ]]; then
  EFFICIENT=true
fi

# Report
if [[ "$JSON_OUTPUT" == "true" ]]; then
  echo "{"
  echo "  \"timestamp\": \"$TIMESTAMP\","
  echo "  \"complete\": $COMPLETE,"
  echo "  \"efficient\": $EFFICIENT,"
  echo "  \"total_elapsed_sec\": $TOTAL_ELAPSED,"
  echo "  \"threshold_sec\": $THRESHOLD_SEC,"
  echo "  \"all_steps_ok\": $ALL_OK,"
  echo "  \"valid_json\": $VALID_JSON,"
  echo "  \"has_project_paths\": $HAS_PROJECT_PATHS,"
  echo "  \"has_startup_ref\": $HAS_STARTUP_REF,"
  echo "  \"has_quickstart_ref\": $HAS_QUICKSTART_REF,"
  echo "  \"step_times\": [$(IFS=,; echo "${STEP_TIMES[*]}")]"
  echo "}"
  exit 0
fi

{
  echo "=============================================="
  echo "  /yolo-full measurement report"
  echo "  $TIMESTAMP"
  echo "=============================================="
  echo ""
  echo "COMPLETENESS: $COMPLETE"
  echo "  - All steps exit 0: $ALL_OK"
  echo "  - Step 1 valid JSON: $VALID_JSON"
  echo "  - Step 2 project paths output: $HAS_PROJECT_PATHS"
  echo "  - Step 3 startup ref: $HAS_STARTUP_REF"
  echo "  - Step 4/5 quickstart ref: $HAS_QUICKSTART_REF"
  echo ""
  echo "EFFICIENCY: $EFFICIENT (total ${TOTAL_ELAPSED}s, threshold ${THRESHOLD_SEC}s)"
  for i in "${!STEPS[@]}"; do
    echo "  Step $((i+1)): ${STEP_TIMES[$i]:-?}s"
  done
  echo ""
  echo "=============================================="
} | tee "$OUTFILE"

if [[ "$COMPLETE" != "true" ]] || [[ "$EFFICIENT" != "true" ]]; then
  echo "Issues detected. See output above and $OUTFILE"
  exit 1
fi
echo "PASS: Complete and efficient."
exit 0
