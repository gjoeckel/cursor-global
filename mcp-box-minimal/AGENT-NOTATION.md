# Agent Notation: Box Token Expiration Handling

## Overview

When the Box OAuth access token expires, agents should detect this and prompt the developer to refresh the token by opening the OAuth authorization URL in a browser.

## Token Expiration Detection

Box API calls may return authentication errors when the token expires:
- HTTP 401 (Unauthorized)
- HTTP 403 (Forbidden)
- Error messages containing: "invalid_token", "expired_token", "authentication", "invalid access token"

## Agent Action Flow

### When Token Expiration is Detected:

1. **Detect the error** from Box API calls
2. **Run the OAuth URL opener script:**
   ```bash
   node mcp-box-minimal/scripts/open-oauth-url.js
   ```
   This will:
   - Open the Box OAuth authorization URL in the user's browser
   - Display instructions to the developer

3. **Prompt the developer:**
   - Inform them that the token has expired
   - Instruct them to click "Authorize" in the browser window that opened
   - After authorization, they should run the full OAuth script to complete the flow

4. **After user authorizes:**
   - Developer runs: `node mcp-box-minimal/scripts/get-oauth-token.js`
   - This completes the OAuth flow and updates `~/.zshrc` with the new token
   - Developer restarts Cursor to load the new token

## Implementation Pattern

### For AI Agents:

When a Box API call fails, check if it's an authentication error:

```typescript
try {
  // Make Box API call
  const result = await boxGetFileDetails({ file_id: '...' });
} catch (error) {
  if (isBoxAuthError(error)) {
    // Open OAuth URL in browser
    await runCommand('node mcp-box-minimal/scripts/open-oauth-url.js');

    // Prompt user
    console.log('🔐 Box token expired. Browser opened for authorization.');
    console.log('Please click "Authorize" in the browser window.');
    console.log('After authorizing, run: node mcp-box-minimal/scripts/get-oauth-token.js');
    console.log('Then restart Cursor to load the new token.');

    throw new Error('Box token expired. Please re-authorize.');
  }
  throw error;
}
```

### Error Handler Utility

The `mcp-box-minimal` package includes an error handler utility:

```typescript
import { withAuthErrorHandling, isBoxAuthError } from '../utils/error-handler.js';

// Wrap API calls
const result = await withAuthErrorHandling(async () => {
  return await boxApiCall();
});

// Or check errors manually
try {
  await boxApiCall();
} catch (error) {
  if (isBoxAuthError(error)) {
    // Handle auth error
  }
}
```

## Scripts

### `open-oauth-url.js`

Opens the Box OAuth authorization URL in the browser.

**Usage:**
```bash
node mcp-box-minimal/scripts/open-oauth-url.js
```

**What it does:**
- Generates Box OAuth authorization URL
- Opens URL in default browser
- Displays instructions to user

**When to use:**
- When token expiration is detected
- When user needs to re-authorize
- As a quick way to start the OAuth flow

### `get-oauth-token.js`

Complete OAuth flow to get a new access token.

**Usage:**
```bash
node mcp-box-minimal/scripts/get-oauth-token.js
```

**What it does:**
- Opens browser for authorization
- Captures authorization code
- Exchanges code for access token
- Automatically updates `~/.zshrc` with new token
- Instructs user to restart Cursor

**When to use:**
- Initial setup
- After authorization URL is opened and user has clicked "Authorize"
- When token needs to be refreshed

## Error Messages

The error handler provides helpful error messages:

```
🔐 Box authentication token has expired or is invalid.

To fix this:
  1. Open OAuth URL in browser:
     node mcp-box-minimal/scripts/open-oauth-url.js

  2. Click "Authorize" in the browser window

  3. Complete the OAuth flow:
     node mcp-box-minimal/scripts/get-oauth-token.js

  4. Restart Cursor to load the new token

Or use Developer Token for quick testing:
  Get from: https://app.box.com/developers/console
  Set: export BOX_DEV_TOKEN="your_token"
```

## Agent Workflow Example

```
1. User requests: "Get file details for Box file 123456789"
2. Agent calls: box_get_file_details({ file_id: '123456789' })
3. API returns: 401 Unauthorized (token expired)
4. Agent detects: Authentication error
5. Agent runs: node mcp-box-minimal/scripts/open-oauth-url.js
6. Browser opens: Box OAuth authorization page
7. Agent prompts: "Token expired. Please click 'Authorize' in the browser window, then run: node mcp-box-minimal/scripts/get-oauth-token.js"
8. User: Clicks "Authorize" in browser
9. User: Runs get-oauth-token.js script
10. User: Restarts Cursor
11. Agent: Retries the original request (now with new token)
```

## Best Practices

1. **Always check for auth errors** before assuming other failures
2. **Open the OAuth URL** automatically when expiration is detected
3. **Provide clear instructions** to the developer about next steps
4. **Don't retry immediately** - wait for user to complete authorization
5. **Remember the original request** so it can be retried after token refresh

## Environment Variables

Required for OAuth scripts:
- `BOX_CLIENT_ID` - From Box Developer Console
- `BOX_CLIENT_SECRET` - From Box Developer Console

Optional (for custom paths):
- `BOX_OAUTH_SCRIPT_PATH` - Custom path to get-oauth-token.js
- `BOX_OPEN_URL_SCRIPT_PATH` - Custom path to open-oauth-url.js
