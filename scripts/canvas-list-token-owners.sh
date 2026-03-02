#!/usr/bin/env bash
# List Canvas API token owners via GET /api/v1/users/:user_id/user_generated_tokens.
# Requires: CANVAS_API_URL (e.g. https://webaim.instructure.com), CANVAS_API_TOKEN.
# Usage:
#   ACCOUNT_ID=123 bash scripts/canvas-list-token-owners.sh   # list users in account, then each user's tokens
#   USER_ID=456 bash scripts/canvas-list-token-owners.sh     # single user's tokens only
# Version: 1.0.0

set -euo pipefail
CURL="${CURL:-curl -sS}"
BASE="${CANVAS_API_URL%/}"
TOKEN="${CANVAS_API_TOKEN:-}"

if [[ -z "$BASE" || -z "$TOKEN" ]]; then
  echo "Usage: Set CANVAS_API_URL and CANVAS_API_TOKEN, then run with ACCOUNT_ID and/or USER_ID."
  echo "  CANVAS_API_URL   - Canvas base URL (e.g. https://webaim.instructure.com)"
  echo "  CANVAS_API_TOKEN - Admin or user token with permission to view user-generated tokens"
  echo "  ACCOUNT_ID       - Optional. List users in this account, then each user's tokens."
  echo "  USER_ID          - Optional. Only list tokens for this user (overrides ACCOUNT_ID for a single run)."
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"

# Single user: list tokens for that user
if [[ -n "${USER_ID:-}" ]]; then
  echo "User ID: $USER_ID"
  RESP="$($CURL -H "$AUTH_HEADER" "$BASE/api/v1/users/${USER_ID}/user_generated_tokens" 2>/dev/null)" || true
  if [[ -z "$RESP" ]]; then
    echo "No response (check URL and token)."
    exit 2
  fi
  if echo "$RESP" | head -1 | grep -q '"errors"'; then
    echo "API error: $RESP"
    exit 2
  fi
  echo "$RESP" | jq -r 'if type == "array" then .[] | "  \(.purpose // .id): id=\(.id) last_used=\(.last_used_at // "never")" else . end' 2>/dev/null || echo "$RESP"
  exit 0
fi

# Account: list users (paginated), then for each user list tokens
ACCOUNT_ID="${ACCOUNT_ID:-}"
if [[ -z "$ACCOUNT_ID" ]]; then
  echo "Set ACCOUNT_ID (e.g. 1) or USER_ID to run."
  exit 1
fi

PAGE=1
PER_PAGE=50
echo "Account $ACCOUNT_ID — token owners (user_id, name, token count)"
echo "------------------------------------------------------------"

while true; do
  USERS="$($CURL -H "$AUTH_HEADER" "$BASE/api/v1/accounts/$ACCOUNT_ID/users?per_page=$PER_PAGE&page=$PAGE" 2>/dev/null)" || break
  if echo "$USERS" | head -1 | grep -q '"errors"'; then
    echo "API error (users): $USERS"
    exit 2
  fi
  COUNT=$(echo "$USERS" | jq 'length' 2>/dev/null || echo 0)
  [[ "$COUNT" -eq 0 ]] && break

  while read -r uid name; do
    [[ -z "$uid" ]] && continue
    TOKENS="$($CURL -H "$AUTH_HEADER" "$BASE/api/v1/users/${uid}/user_generated_tokens" 2>/dev/null)" || TOKENS="[]"
    if echo "$TOKENS" | head -1 | grep -q '"errors"'; then
      N="(error)"
    else
      N=$(echo "$TOKENS" | jq 'if type == "array" then length else 0 end' 2>/dev/null || echo "?")
    fi
    echo "  $uid | $name | tokens: $N"
  done < <(echo "$USERS" | jq -r '.[] | "\(.id) \(.name // .sortable_name // "n/a")"')

  [[ "$COUNT" -lt "$PER_PAGE" ]] && break
  ((PAGE++)) || true
done

echo "Done."
