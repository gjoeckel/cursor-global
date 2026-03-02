# Changelog

## [1.1.2] - 2026-02-12

### Fixed
- **Box date fields:** `created_at` and `modified_at` now returned as ISO 8601 strings. The Box SDK returns these as `DateTimeWrapper` objects; the MCP now unwraps them so consumers (e.g. certificate scrape) get plain strings and can format as YYYY-MM-DD.

---

## [1.1.1] - 2026-02-12

### Fixed
- **package.json**: Applied `npm pkg fix` — bin path and repository.url normalized for npm publish.

---

## [1.1.0] - 2026-02-12

### Added
- **Automatic OAuth token refresh**: On 401 / "Developer token has expired", the MCP calls Box's refresh endpoint and retries. No need to re-run the OAuth script every hour.
- **Refresh token persistence**: OAuth script now saves both `BOX_ACCESS_TOKEN` and `BOX_REFRESH_TOKEN` to `config/box.env` and `~/.zshrc`.
- **Reload tokens from file**: Before each Box call, the MCP re-reads `config/box.env` if present, so new tokens (after running the OAuth script) are picked up without restarting Cursor.

### Changed
- All tools use `executeWithRefresh()` so expired access tokens trigger a refresh and one retry.
- Error handler recognizes "developer token has expired" and wrapped auth errors for refresh.
- MCP wrapper can set `CURSOR_OPS` so refreshed tokens are written back to `config/box.env`.

### Migration
- Run the OAuth script once to get a refresh token: `node scripts/get-oauth-token.js`
- Restart Cursor once so the MCP loads the new tokens. After that, access tokens refresh automatically.

---

## [1.0.5] - 2025-12-12

### Removed
- **Automatic OAuth Token Refresh**: Removed all automatic token refresh functionality
- **executeWithRefresh wrapper**: All Box tools now use `getBoxClient()` directly
- **Refresh token handling**: Refresh tokens are no longer used or stored

### Changed
- **Token Management**: Users must manually run `node mcp-box-minimal/scripts/get-oauth-token.js` when tokens expire
- **Error Messages**: Updated to provide clear instructions for getting new tokens
- **OAuth Token Script**: Updated to show clear instructions to click "Authorize" button

### Migration Notes
- When your `BOX_ACCESS_TOKEN` expires, run: `node mcp-box-minimal/scripts/get-oauth-token.js`
- Click "Authorize" in the browser window
- Add the new token to your `~/.zshrc` and restart Cursor

---

## [1.0.4] - 2025-12-11

### Added
- **Automatic OAuth Token Refresh**: Box client now automatically refreshes OAuth access tokens when they expire
- **executeWithRefresh wrapper**: All Box tools now use automatic token refresh on API errors
- **Token refresh via Box OAuth API**: Direct HTTP call to Box OAuth endpoint for reliable token refresh

### Changed
- Updated all Box tools to use `executeWithRefresh` for automatic token refresh
- Box client now stores refresh tokens for automatic refresh capability

### Technical Details
- Token refresh uses direct HTTP call to `https://api.box.com/oauth2/token`
- Refreshed tokens are stored in environment variables and used for subsequent API calls
