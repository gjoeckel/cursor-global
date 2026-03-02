# Feedback: Our Box MCP Solution vs External Guidance

This document reviews the external Box token authentication guidance against the solution we implemented and recommends improvements.

---

## Where Our Solution Aligns

| External guidance | Our implementation | Status |
|-------------------|---------------------|--------|
| OAuth 2.0 for user context | We use OAuth 2.0 (authorization code) via `get-oauth-token.js` | ✅ |
| Store credentials securely; don’t commit | Token in `config/box.env` (gitignored) | ✅ |
| Restart Cursor to load MCP config | We document **full quit** (Cmd+Q) so MCP process restarts and reads new env | ✅ |
| Redirect URI for OAuth | We use `http://localhost:5000/callback` (external example uses 3000; either is fine) | ✅ |
| Minimal scopes | We request `root_readwrite` | ✅ |

---

## Gaps vs External Guidance

### 1. **No automatic token refresh (largest gap)**

- **External:** “Refresh tokens handle re-authentication” and “the MCP server handles all token refresh logic automatically.”
- **Ours:** We only persist and use the **access token**. It expires in ~1 hour. We do **not**:
  - Persist the **refresh token** (Box returns it from `getTokensAuthorizationCodeGrant`).
  - Refresh the access token inside the MCP when it expires.
- **Effect:** User must re-run the OAuth script and fully quit Cursor every time the token expires, which matches the “going around and around” frustration.

**Recommendation:** Add refresh-token support:

- In `get-oauth-token.js`: persist **refresh token** (e.g. in `config/box.env` or a separate gitignored file, e.g. `config/box-refresh.env`).
- In `box-client.ts` (or a small token layer): when the API returns 401 / “Developer token has expired”, call Box’s `POST /oauth2/token` with `grant_type=refresh_token`, get new access + refresh tokens, persist them, and retry the request.
- Optionally: before each request or on first use, check access token TTL and refresh proactively so the user rarely sees expiry.

That would align with the external guidance: “Token refresh handled automatically” and “MCP server handles all token refresh logic automatically.”

### 2. **Manual OAuth flow and no in-process cache**

- **External:** “First run will open browser for user login” and “Token is cached automatically by the MCP server.”
- **Ours:** User must run a **separate** script (`get-oauth-token.js`) and we write the token to files; the MCP only reads env at **process start**. There is no OAuth flow or token cache **inside** the MCP process.
- **Effect:** Correct, but more manual and dependent on “restart Cursor” to pick up new tokens unless we add refresh inside the MCP.

**Recommendation:** Keeping the external script is fine. The main improvement is to add **refresh inside the MCP** (above) so that after the first manual OAuth, the server can refresh without user action and without requiring a Cursor restart for every expiry.

### 3. **JWT / service account not considered**

- **External:** JWT (service account) is recommended for “autonomous agents accessing app-owned content” with no user interaction and automatic token generation/refresh.
- **Ours:** We only support OAuth user tokens.
- **Effect:** For app-owned content and fully autonomous agents, JWT could remove both “token expired” and “restart Cursor” from the user’s experience.

**Recommendation:** If the use case is app-owned content (or a service account), consider adding JWT support (config path to Box JSON config, use Box SDK JWT auth). Document when to use OAuth vs JWT.

### 4. **Token storage location**

- **External:** “OAuth: `~/.cache/box-mcp/` or similar cache directory.”
- **Ours:** `config/box.env` (and optionally `~/.zshrc`) so the token is available when Cursor is launched from the Dock via our wrapper.
- **Effect:** Our choice is intentional and works; no change required unless we add an internal cache (e.g. for refreshed tokens) in addition to `box.env`.

---

## Summary

- The **operational fix** we implemented (full quit Cursor so the MCP process restarts and reads `box.env`) is **correct** and matches the external note that you must restart Cursor to load MCP configuration.
- The **design gap** is that we do **not** implement automatic token refresh. The external guidance assumes the MCP server handles refresh; ours does not, which is why a newly generated token can still appear “expired” until Cursor is restarted, and why users must repeat the OAuth flow every hour.
- **Implemented (refresh-token support):** The MCP now persists and uses the refresh token. `get-oauth-token.js` writes both `BOX_ACCESS_TOKEN` and `BOX_REFRESH_TOKEN` to `config/box.env`. The MCP calls Box's refresh endpoint on auth/expired errors, updates tokens, persists to `config/box.env` when `CURSOR_OPS` is set, and retries. After one OAuth and one Cursor restart, the MCP refreshes automatically.

- **Previous recommended next step (done):** Implement refresh-token persistence and refresh logic inside the MCP (and optionally document or add JWT for autonomous/service-account use). That would bring our solution in line with the external guidance and reduce “going around and around” to a one-time OAuth plus optional full quit only when refresh fails (e.g. after 60 days).
