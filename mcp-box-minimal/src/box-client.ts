import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { isBoxAuthError } from './utils/error-handler.js';

let client: any = null;
let clientInitialized = false;

const BOX_TOKEN_URL = 'https://api.box.com/oauth2/token';

/**
 * Path to cursor-ops config/box.env for persisting refreshed tokens.
 * MCP wrapper should set CURSOR_OPS so we can write back; fallback to default.
 */
function getBoxEnvPath(): string | null {
  const cursorOps = process.env.CURSOR_OPS;
  const home = process.env.HOME || process.env.USERPROFILE;
  const base = cursorOps || (home ? join(home, 'Agents', 'cursor-ops') : null);
  if (!base) return null;
  return join(base, 'config', 'box.env');
}

/**
 * Re-read config/box.env from disk and update process.env.
 * Lets the MCP pick up new tokens after you run the OAuth script without restarting Cursor.
 */
function reloadBoxEnvFromFile(): boolean {
  const path = getBoxEnvPath();
  if (!path || !existsSync(path)) return false;
  try {
    const content = readFileSync(path, 'utf-8');
    let updated = false;
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*export\s+BOX_(ACCESS_TOKEN|REFRESH_TOKEN)="([^"]*)"\s*$/);
      if (m) {
        const key = `BOX_${m[1]}`;
        if (process.env[key] !== m[2]) {
          process.env[key] = m[2];
          updated = true;
        }
      }
    }
    return updated;
  } catch {
    return false;
  }
}

/**
 * Refresh OAuth access token using refresh token.
 * Updates process.env and persists to config/box.env when path is available.
 */
export async function refreshBoxTokens(): Promise<void> {
  const refreshToken = process.env.BOX_REFRESH_TOKEN;
  const clientId = process.env.BOX_CLIENT_ID;
  const clientSecret = process.env.BOX_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error(
      'Cannot refresh: BOX_REFRESH_TOKEN, BOX_CLIENT_ID, and BOX_CLIENT_SECRET must be set. ' +
      'Run the OAuth flow once: node mcp-box-minimal/scripts/get-oauth-token.js'
    );
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  const res = await fetch(BOX_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Box token refresh failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token?: string; refresh_token?: string };
  const newAccess = data.access_token;
  const newRefresh = data.refresh_token ?? refreshToken; // Box may return new refresh token

  if (!newAccess) {
    throw new Error('Box refresh response missing access_token');
  }

  process.env.BOX_ACCESS_TOKEN = newAccess;
  process.env.BOX_REFRESH_TOKEN = newRefresh;
  resetBoxClient();

  const envPath = getBoxEnvPath();
  if (envPath) {
    try {
      const dir = join(envPath, '..');
      mkdirSync(dir, { recursive: true });
      const content =
        `# Box OAuth tokens (refreshed by MCP)\nexport BOX_ACCESS_TOKEN="${newAccess}"\nexport BOX_REFRESH_TOKEN="${newRefresh}"\n`;
      writeFileSync(envPath, content, 'utf-8');
    } catch {
      // Non-fatal: in-memory and process.env are updated
    }
  }
}

/**
 * Execute a Box operation with automatic token refresh on auth errors.
 * On 401 / "Developer token has expired", refreshes tokens and retries once.
 */
export async function executeWithRefresh<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (!isBoxAuthError(error)) throw error;

    try {
      await refreshBoxTokens();
    } catch (refreshErr: any) {
      const msg = refreshErr?.message || String(refreshErr);
      throw new Error(
        `Box token expired and refresh failed: ${msg}. Run: node mcp-box-minimal/scripts/get-oauth-token.js then restart Cursor.`
      );
    }

    return await fn();
  }
}

/**
 * Get or create Box API client
 * Uses OAuth Access Token or Developer Token from environment variables.
 * Re-reads config/box.env from disk so new tokens (after running the OAuth script) are picked up without restarting Cursor.
 */
export function getBoxClient(): any {
  if (reloadBoxEnvFromFile()) {
    resetBoxClient();
  }
  if (!clientInitialized) {
    const accessToken = process.env.BOX_ACCESS_TOKEN;
    const devToken = process.env.BOX_DEV_TOKEN;

    if (accessToken) {
      const auth = new BoxDeveloperTokenAuth({ token: accessToken });
      client = new BoxClient({ auth });
      clientInitialized = true;
      return client;
    }

    if (devToken) {
      const auth = new BoxDeveloperTokenAuth({ token: devToken });
      client = new BoxClient({ auth });
      clientInitialized = true;
      return client;
    }

    const scriptPath = process.env.BOX_OAUTH_SCRIPT_PATH || 'mcp-box-minimal/scripts/get-oauth-token.js';
    const openUrlScript = process.env.BOX_OPEN_URL_SCRIPT_PATH || 'mcp-box-minimal/scripts/open-oauth-url.js';

    throw new Error(
      'Box authentication required. Your token has expired or is missing.\n\n' +
      'To get a new token:\n' +
      '  Option 1 (Recommended): Full OAuth flow\n' +
      `    1. Run: node ${scriptPath}\n` +
      '    2. Click "Authorize" in the browser window\n' +
      '    3. Restart Cursor so the MCP loads the new token.\n\n' +
      '  Option 2: Open OAuth URL manually\n' +
      `    Run: node ${openUrlScript}\n\n` +
      '  Option 3: Developer Token (testing only, expires in 60 min)\n' +
      '    Get from: https://app.box.com/developers/console\n' +
      '    Set: export BOX_DEV_TOKEN="your_token"'
    );
  }
  return client;
}

/**
 * Reset client to force re-initialization (used after refresh)
 */
export function resetBoxClient(): void {
  clientInitialized = false;
  client = null;
}
