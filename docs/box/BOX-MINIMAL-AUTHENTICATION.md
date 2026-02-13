# box-minimal MCP: Authentication and Token Management

## Token Requirements

### Does box-minimal need a user token?

**YES** - box-minimal requires one of the following tokens:

1. **`BOX_ACCESS_TOKEN`** (OAuth Access Token) - **Recommended for production**
2. **`BOX_DEV_TOKEN`** (Developer Token) - For testing only (expires in 60 minutes)

Both tokens must be provided as environment variables.

### Can it use OAuth Token?

**YES** - box-minimal is designed to use OAuth tokens via `BOX_ACCESS_TOKEN`. This is the primary and recommended authentication method.

The OAuth flow is handled by the script:
```bash
node mcp-box-minimal/scripts/get-oauth-token.js
```

This script:
1. Uses `BOX_CLIENT_ID` and `BOX_CLIENT_SECRET` from environment
2. Opens browser for user authorization
3. Captures the authorization code
4. Exchanges it for an access token
5. Automatically adds `BOX_ACCESS_TOKEN` to `~/.zshrc`

### Can it refresh tokens automatically?

**NO** - Automatic token refresh was **removed in version 1.0.5**.

**Current Behavior:**
- When `BOX_ACCESS_TOKEN` expires, API calls will fail
- Users must manually run the OAuth script to get a new token
- No automatic refresh happens in the background

**Historical Context:**
- Version 1.0.4 had automatic refresh functionality
- Version 1.0.5 removed it (per CHANGELOG.md)
- Refresh tokens are no longer stored or used

**Why was it removed?**
Likely due to complexity or reliability issues. The current approach is:
- Simpler implementation
- More predictable behavior
- Users have explicit control over token lifecycle

## Token Lifecycle

### Getting a Token

```bash
# 1. Ensure credentials are set
export BOX_CLIENT_ID="your_client_id"
export BOX_CLIENT_SECRET="your_client_secret"

# 2. Run OAuth flow
node mcp-box-minimal/scripts/get-oauth-token.js

# 3. Follow browser prompts to authorize
# 4. Token is automatically added to ~/.zshrc
# 5. Restart Cursor to pick up new token
```

### Token Expiration

**OAuth Access Tokens:**
- Typically expire after 1 hour (3600 seconds)
- When expired, API calls return authentication errors
- Solution: Run `get-oauth-token.js` again to get a new token

**Developer Tokens:**
- Always expire after 60 minutes
- Must be regenerated from Box Developer Console
- Not recommended for production use

### Handling Token Expiration

When a token expires, you'll see errors like:
```
Error: Box authentication required. Your token has expired or is missing.
```

**To resolve:**
1. Run: `node mcp-box-minimal/scripts/get-oauth-token.js`
2. Click "Authorize" in the browser window
3. The script updates `~/.zshrc` with the new token
4. Restart Cursor (MCP server needs restart to pick up new env var)

## Configuration

### Environment Variables

Add to `~/.zshrc` or `~/.bashrc`:
```bash
export BOX_CLIENT_ID="your_client_id"
export BOX_CLIENT_SECRET="your_client_secret"
export BOX_ACCESS_TOKEN="your_access_token"  # From OAuth flow
```

Or use Developer Token for quick testing:
```bash
export BOX_DEV_TOKEN="your_dev_token"  # Expires in 60 min
```

### MCP Server Configuration

In `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "box-minimal": {
      "command": "node",
      "args": ["/path/to/mcp-box-minimal/dist/index.js"],
      "env": {
        "BOX_CLIENT_ID": "${BOX_CLIENT_ID}",
        "BOX_CLIENT_SECRET": "${BOX_CLIENT_SECRET}",
        "BOX_ACCESS_TOKEN": "${BOX_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Note:** Environment variables are passed from your shell to the MCP server. The server reads `process.env.BOX_ACCESS_TOKEN` or `process.env.BOX_DEV_TOKEN`.

## Implementation Details

### Client Initialization

The Box client uses `BoxDeveloperTokenAuth` which accepts a token string directly:

```typescript
// From box-client.ts
if (accessToken) {
  const auth = new BoxDeveloperTokenAuth({ token: accessToken });
  client = new BoxClient({ auth });
  clientInitialized = true;
  return client;
}
```

**Note:** Despite the name `BoxDeveloperTokenAuth`, it works with both:
- OAuth access tokens (`BOX_ACCESS_TOKEN`)
- Developer tokens (`BOX_DEV_TOKEN`)

### Token Priority

1. **First**: Checks for `BOX_ACCESS_TOKEN` (OAuth token)
2. **Second**: Checks for `BOX_DEV_TOKEN` (Developer token)
3. **Neither**: Throws error with instructions

## Recommendations

### For Production Use

1. **Use OAuth Access Tokens** (`BOX_ACCESS_TOKEN`)
   - More secure
   - Proper user context
   - Can be scoped to specific permissions

2. **Set up token refresh reminder**
   - OAuth tokens expire after ~1 hour
   - Consider a script to check token validity
   - Or set calendar reminder to refresh daily

3. **Monitor for expiration**
   - Watch for authentication errors
   - Have OAuth script ready to run quickly

### For Development/Testing

1. **Developer Tokens** are fine for quick tests
   - Expire in 60 minutes
   - Easy to regenerate from console
   - Don't require OAuth flow

## Future Improvements (Potential)

If automatic token refresh were to be re-added:

1. **Store refresh token** (currently removed)
2. **Implement refresh logic** before API calls
3. **Update environment variables** with new access token
4. **Handle refresh failures** gracefully

However, the current manual approach is:
- ✅ Simpler
- ✅ More predictable
- ✅ Gives users explicit control
- ✅ Avoids complex token management

## References

- Current version: 1.0.5 (no automatic refresh)
- Previous version with refresh: 1.0.4 (removed)
- OAuth script: `mcp-box-minimal/scripts/get-oauth-token.js`
- Client code: `mcp-box-minimal/src/box-client.ts`
- CHANGELOG: `mcp-box-minimal/CHANGELOG.md`
