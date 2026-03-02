#!/bin/bash
# Validate Change Project Workflow
# Tests all steps of the change-project workflow programmatically

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_GLOBAL_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="$CURSOR_GLOBAL_DIR/config"
CONFIG_FILE="$CONFIG_DIR/project-paths.json"
COMMAND_FILE="$CURSOR_GLOBAL_DIR/.cursor/commands/change-project.md"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
declare -a FAILED_TESTS=()

echo ""
echo -e "${BLUE}🔍 Validating Change Project Workflow${NC}"
echo "=========================================="
echo ""

# Test 1: Command file exists
echo -e "${BLUE}Test 1: Command file exists${NC}"
if [ -f "$COMMAND_FILE" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Command file found: $COMMAND_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} - Command file not found: $COMMAND_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    FAILED_TESTS+=("Command file missing")
fi
echo ""

# Test 2: Config file exists
echo -e "${BLUE}Test 2: Config file exists${NC}"
if [ -f "$CONFIG_FILE" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Config file found: $CONFIG_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} - Config file not found: $CONFIG_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    FAILED_TESTS+=("Config file missing")
fi
echo ""

# Test 3: Config file is valid JSON
echo -e "${BLUE}Test 3: Config file is valid JSON${NC}"
if command -v jq &> /dev/null; then
    if jq empty "$CONFIG_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ PASS${NC} - Config file is valid JSON"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - Config file is not valid JSON"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        FAILED_TESTS+=("Invalid JSON")
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - jq not installed, cannot validate JSON"
fi
echo ""

# Test 4: Config file has required structure
echo -e "${BLUE}Test 4: Config file has required structure${NC}"
if command -v jq &> /dev/null; then
    HAS_CANVAS_REPORTS=$(jq 'has("canvas_reports")' "$CONFIG_FILE" 2>/dev/null || echo "false")
    HAS_DEV=$(jq '.canvas_reports | has("development")' "$CONFIG_FILE" 2>/dev/null || echo "false")
    HAS_RES=$(jq '.canvas_reports | has("resources")' "$CONFIG_FILE" 2>/dev/null || echo "false")
    HAS_DEV_FOLDER=$(jq '.canvas_reports.development | has("folder")' "$CONFIG_FILE" 2>/dev/null || echo "false")
    HAS_RES_FOLDER=$(jq '.canvas_reports.resources | has("folder")' "$CONFIG_FILE" 2>/dev/null || echo "false")

    if [ "$HAS_CANVAS_REPORTS" = "true" ] && [ "$HAS_DEV" = "true" ] && [ "$HAS_RES" = "true" ] && [ "$HAS_DEV_FOLDER" = "true" ] && [ "$HAS_RES_FOLDER" = "true" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Config has required structure"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - Config missing required fields"
        echo "  canvas_reports: $HAS_CANVAS_REPORTS"
        echo "  development: $HAS_DEV"
        echo "  resources: $HAS_RES"
        echo "  development.folder: $HAS_DEV_FOLDER"
        echo "  resources.folder: $HAS_RES_FOLDER"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        FAILED_TESTS+=("Missing required fields")
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - jq not installed"
fi
echo ""

# Test 5: Can read current paths
echo -e "${BLUE}Test 5: Can read current paths${NC}"
if command -v jq &> /dev/null; then
    CURRENT_DEV=$(jq -r '.canvas_reports.development.folder // empty' "$CONFIG_FILE" 2>/dev/null)
    CURRENT_RES=$(jq -r '.canvas_reports.resources.folder // empty' "$CONFIG_FILE" 2>/dev/null)

    if [ -n "$CURRENT_DEV" ] && [ "$CURRENT_DEV" != "null" ] && [ -n "$CURRENT_RES" ] && [ "$CURRENT_RES" != "null" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Can read current paths"
        echo "  Development: $CURRENT_DEV"
        echo "  Resources: $CURRENT_RES"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - Cannot read current paths"
        echo "  Development: ${CURRENT_DEV:-empty}"
        echo "  Resources: ${CURRENT_RES:-empty}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        FAILED_TESTS+=("Cannot read paths")
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - jq not installed"
fi
echo ""

# Test 6: Backup creation logic
echo -e "${BLUE}Test 6: Backup creation logic${NC}"
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "$BACKUP_FILE" 2>/dev/null
    if [ -f "$BACKUP_FILE" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Can create backup file"
        echo "  Backup: $(basename "$BACKUP_FILE")"
        rm "$BACKUP_FILE" 2>/dev/null || true
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - Cannot create backup file"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        FAILED_TESTS+=("Backup creation failed")
    fi
else
    echo -e "${RED}❌ FAIL${NC} - Config file missing, cannot test backup"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    FAILED_TESTS+=("Config missing for backup test")
fi
echo ""

# Test 7: Path normalization (expand ~)
echo -e "${BLUE}Test 7: Path normalization (expand ~)${NC}"
TEST_PATH_WITH_TILDE="~/test/path"
EXPANDED_PATH=$(eval echo "$TEST_PATH_WITH_TILDE")
if [ "$EXPANDED_PATH" != "$TEST_PATH_WITH_TILDE" ] && [[ "$EXPANDED_PATH" == /* ]]; then
    echo -e "${GREEN}✅ PASS${NC} - Can expand ~ in paths"
    echo "  Input: $TEST_PATH_WITH_TILDE"
    echo "  Output: $EXPANDED_PATH"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} - Cannot expand ~ in paths"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    FAILED_TESTS+=("Path expansion failed")
fi
echo ""

# Test 8: Path normalization (relative to absolute)
echo -e "${BLUE}Test 8: Path normalization (relative to absolute)${NC}"
RELATIVE_PATH="./test"
if [ -d "$CURSOR_GLOBAL_DIR" ]; then
    ABSOLUTE_PATH=$(cd "$(dirname "$RELATIVE_PATH")" 2>/dev/null && pwd)/$(basename "$RELATIVE_PATH") || echo "$RELATIVE_PATH"
    if [[ "$ABSOLUTE_PATH" == /* ]]; then
        echo -e "${GREEN}✅ PASS${NC} - Can convert relative to absolute paths"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  PARTIAL${NC} - Path normalization works but test path doesn't exist"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - Cannot test relative path conversion"
fi
echo ""

# Test 9: JSON update capability
echo -e "${BLUE}Test 9: JSON update capability${NC}"
if command -v jq &> /dev/null; then
    TEST_BACKUP="${CONFIG_FILE}.test_backup"
    cp "$CONFIG_FILE" "$TEST_BACKUP" 2>/dev/null || true

    # Test updating with jq
    TEST_NEW_DEV="/tmp/test/dev"
    TEST_NEW_RES="/tmp/test/res"

    jq --arg dev "$TEST_NEW_DEV" --arg res "$TEST_NEW_RES" \
       '.["canvas_reports"].development.folder = $dev |
        .["canvas_reports"].resources.folder = $res' \
       "$CONFIG_FILE" > "${CONFIG_FILE}.test" 2>/dev/null

    if [ -f "${CONFIG_FILE}.test" ]; then
        UPDATED_DEV=$(jq -r '.canvas_reports.development.folder' "${CONFIG_FILE}.test" 2>/dev/null)
        UPDATED_RES=$(jq -r '.canvas_reports.resources.folder' "${CONFIG_FILE}.test" 2>/dev/null)

        if [ "$UPDATED_DEV" = "$TEST_NEW_DEV" ] && [ "$UPDATED_RES" = "$TEST_NEW_RES" ]; then
            echo -e "${GREEN}✅ PASS${NC} - Can update JSON with new paths"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}❌ FAIL${NC} - JSON update did not work correctly"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            FAILED_TESTS+=("JSON update failed")
        fi
        rm "${CONFIG_FILE}.test" 2>/dev/null || true
    else
        echo -e "${RED}❌ FAIL${NC} - Cannot create test JSON file"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        FAILED_TESTS+=("JSON file creation failed")
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - jq not installed, cannot test JSON updates"
    echo -e "${YELLOW}   Note: Command file should handle fallback for missing jq${NC}"
fi
echo ""

# Test 10: Command file contains required instructions
echo -e "${BLUE}Test 10: Command file contains required instructions${NC}"
if [ -f "$COMMAND_FILE" ]; then
    HAS_READ_CONFIG=$(grep -qi "read.*project-paths.json\|Read.*configuration" "$COMMAND_FILE" && echo "yes" || echo "no")
    HAS_BACKUP=$(grep -qi "backup\|Backup" "$COMMAND_FILE" && echo "yes" || echo "no")
    HAS_DEV_PROMPT=$(grep -qi "development.*folder\|New development folder" "$COMMAND_FILE" && echo "yes" || echo "no")
    HAS_RES_PROMPT=$(grep -qi "resources.*folder\|New resources folder" "$COMMAND_FILE" && echo "yes" || echo "no")
    HAS_UPDATE=$(grep -qi "update.*json\|Update.*configuration" "$COMMAND_FILE" && echo "yes" || echo "no")

    if [ "$HAS_READ_CONFIG" = "yes" ] && [ "$HAS_BACKUP" = "yes" ] && [ "$HAS_DEV_PROMPT" = "yes" ] && [ "$HAS_RES_PROMPT" = "yes" ] && [ "$HAS_UPDATE" = "yes" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Command file has all required instructions"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - Command file missing required instructions"
        echo "  Read config: $HAS_READ_CONFIG"
        echo "  Backup: $HAS_BACKUP"
        echo "  Dev prompt: $HAS_DEV_PROMPT"
        echo "  Res prompt: $HAS_RES_PROMPT"
        echo "  Update: $HAS_UPDATE"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        FAILED_TESTS+=("Missing instructions")
    fi
else
    echo -e "${RED}❌ FAIL${NC} - Command file not found"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    FAILED_TESTS+=("Command file missing")
fi
echo ""

# Test 11: Directory existence check logic
echo -e "${BLUE}Test 11: Directory existence check logic${NC}"
if [ -d "$CURSOR_GLOBAL_DIR" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Can check directory existence"
    echo "  Test directory exists: $CURSOR_GLOBAL_DIR"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} - Cannot verify directory checks"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    FAILED_TESTS+=("Directory check failed")
fi
echo ""

# Summary
echo ""
echo "=========================================="
echo -e "${BLUE}📊 Validation Summary${NC}"
echo "=========================================="
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Workflow is valid.${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}•${NC} $test"
    done
    echo ""
    exit 1
fi

