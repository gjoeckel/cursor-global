#!/usr/bin/env node
/**
 * Box OAuth 2.0 Token Generator
 *
 * This script helps you get a Box OAuth access token by:
 * 1. Generating an authorization URL
 * 2. Opening it in your browser
 * 3. Capturing the authorization code from the redirect
 * 4. Exchanging it for an access token
 * 5. Adding it to ~/.zshrc and to cursor-ops config/box.env (for MCP when Cursor is launched from Dock)
 * 6. Loading the new token
 * 7. Prompting to restart Cursor
 */

import { BoxOAuth, OAuthConfig } from 'box-node-sdk';
import { createServer } from 'http';
import { parse } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

const CLIENT_ID = process.env.BOX_CLIENT_ID;
const CLIENT_SECRET = process.env.BOX_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:5000/callback';
const PORT = 5000;
const ZSHRC_PATH = join(homedir(), '.zshrc');
// cursor-ops config/box.env (script lives in mcp-box-minimal/scripts/ → ../../config/box.env)
const CURSOR_OPS_BOX_ENV = join(__dirname, '..', '..', 'config', 'box.env');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: BOX_CLIENT_ID and BOX_CLIENT_SECRET must be set');
  console.error('   Set them in your environment or ~/.zshrc');
  process.exit(1);
}

console.log('🔐 Box OAuth 2.0 Token Generator\n');
console.log('Client ID:', CLIENT_ID.substring(0, 8) + '...');
console.log('Redirect URI:', REDIRECT_URI);
console.log('');

// Initialize Box OAuth
const config = new OAuthConfig({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});
const oauth = new BoxOAuth({ config });

// Step 1: Generate authorization URL
// ai.readwrite is required for Box AI (e.g. earned-date script); enable "Manage AI" in Developer Console.
const authUrl = oauth.getAuthorizeUrl({
  redirectUri: REDIRECT_URI,
  responseType: 'code',
  scope: 'root_readwrite ai.readwrite',
});

console.log('📋 Step 1: Authorize the application');
console.log('Opening browser...\n');
console.log('👉 IMPORTANT: Click "Authorize" in the browser window that opens\n');
console.log('If browser doesn\'t open, visit this URL:');
console.log(authUrl);
console.log('');

// Open browser
const platform = process.platform;
let openCmd;
if (platform === 'darwin') {
  openCmd = 'open';
} else if (platform === 'win32') {
  openCmd = 'start';
} else {
  openCmd = 'xdg-open';
}

execAsync(`${openCmd} "${authUrl}"`).catch(() => {
  // Ignore errors - user can open manually
});

// Function to update .zshrc with new token(s)
function updateZshrc(newToken, newRefreshToken) {
  try {
    // Read current .zshrc
    let zshrcContent = '';
    try {
      zshrcContent = readFileSync(ZSHRC_PATH, 'utf-8');
    } catch (err) {
      // File doesn't exist, that's okay
      console.log('📝 Creating new ~/.zshrc file...');
    }

    // Update BOX_ACCESS_TOKEN and optionally BOX_REFRESH_TOKEN
    const tokenRegex = /^export BOX_ACCESS_TOKEN=.*$/m;
    const refreshTokenRegex = /^export BOX_REFRESH_TOKEN=.*$/m;

    if (tokenRegex.test(zshrcContent)) {
      zshrcContent = zshrcContent.replace(tokenRegex, `export BOX_ACCESS_TOKEN="${newToken}"`);
      console.log('✅ Updated existing BOX_ACCESS_TOKEN in ~/.zshrc');
    } else {
      if (zshrcContent && !zshrcContent.endsWith('\n')) {
        zshrcContent += '\n';
      }
      zshrcContent += `\n# Box OAuth (updated by get-oauth-token.js)\nexport BOX_ACCESS_TOKEN="${newToken}"\n`;
      console.log('✅ Added BOX_ACCESS_TOKEN to ~/.zshrc');
    }

    if (newRefreshToken) {
      if (refreshTokenRegex.test(zshrcContent)) {
        zshrcContent = zshrcContent.replace(refreshTokenRegex, `export BOX_REFRESH_TOKEN="${newRefreshToken}"`);
        console.log('✅ Updated BOX_REFRESH_TOKEN in ~/.zshrc');
      } else {
        zshrcContent += `export BOX_REFRESH_TOKEN="${newRefreshToken}"\n`;
        console.log('✅ Added BOX_REFRESH_TOKEN to ~/.zshrc');
      }
    } else if (refreshTokenRegex.test(zshrcContent)) {
      zshrcContent = zshrcContent.replace(refreshTokenRegex, '');
    }

    // Write updated content
    writeFileSync(ZSHRC_PATH, zshrcContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('❌ Error updating ~/.zshrc:', error.message);
    return false;
  }
}

// Write tokens to cursor-ops config/box.env so Box MCP gets them when Cursor is launched from Dock (no .zshrc sourced)
// Saves both access and refresh token so the MCP can refresh automatically when the access token expires.
function updateBoxEnv(accessToken, refreshToken) {
  try {
    const dir = join(CURSOR_OPS_BOX_ENV, '..');
    try {
      mkdirSync(dir, { recursive: true });
    } catch (e) {
      /* dir exists */
    }
    let content = `# Box OAuth tokens (updated by get-oauth-token.js)\nexport BOX_ACCESS_TOKEN="${accessToken}"\n`;
    if (refreshToken) {
      content += `export BOX_REFRESH_TOKEN="${refreshToken}"\n`;
    }
    writeFileSync(CURSOR_OPS_BOX_ENV, content, 'utf-8');
    console.log('✅ Wrote BOX_ACCESS_TOKEN' + (refreshToken ? ' and BOX_REFRESH_TOKEN' : '') + ' to cursor-ops config/box.env');
    return true;
  } catch (error) {
    console.error('❌ Error writing config/box.env:', error.message);
    return false;
  }
}

// Step 2: Create temporary server to capture callback
const server = createServer(async (req, res) => {
  const { query } = parse(req.url, true);

  if (req.url.startsWith('/callback')) {
    const code = query.code;
    const error = query.error;

    if (error) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1 style="color: red;">❌ Authorization Failed</h1>
            <p>Error: ${error}</p>
            <p>${query.error_description || ''}</p>
          </body>
        </html>
      `);
      server.close();
      process.exit(1);
      return;
    }

    if (!code) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1 style="color: red;">❌ No Authorization Code</h1>
            <p>No authorization code received. Please try again.</p>
          </body>
        </html>
      `);
      server.close();
      process.exit(1);
      return;
    }

    try {
      console.log('📥 Step 2: Received authorization code');
      console.log('🔄 Step 3: Exchanging code for access token...\n');

      // Exchange authorization code for tokens
      const tokenInfo = await oauth.getTokensAuthorizationCodeGrant(code);

      const accessToken = tokenInfo.accessToken;
      const refreshToken = tokenInfo.refreshToken || null;

      console.log('✅ Success! Access token obtained' + (refreshToken ? ' (with refresh token for auto-renewal)' : '') + '\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 Step 4: Adding tokens to ~/.zshrc and cursor-ops config/box.env...\n');

      updateZshrc(accessToken, refreshToken);
      updateBoxEnv(accessToken, refreshToken);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔄 Step 5: Loading new token...\n');

      // Run source ~/.zshrc to load the new token in current shell
      try {
        await execAsync('source ~/.zshrc', { shell: '/bin/zsh' });
        console.log('✅ Token loaded into current shell session\n');
      } catch (err) {
        console.log('⚠️  Note: Could not automatically load token in current shell');
        console.log('   Run manually: source ~/.zshrc\n');
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 Token setup complete!\n');
      if (refreshToken) {
        console.log('   The MCP will auto-refresh the access token when it expires (no need to re-run this script every hour).');
        console.log('   Restart Cursor once (Cmd+Q then reopen) so the MCP loads the new tokens.\n');
      } else {
        console.log('⚠️  Restart Cursor (Cmd+Q then reopen) so the Box MCP loads the new token.\n');
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1 style="color: green;">✅ Authorization Successful!</h1>
            <p>Access token has been obtained and added to ~/.zshrc and cursor-ops config/box.env</p>
            <p>Check your terminal for next steps.</p>
            <p style="margin-top: 30px; color: #666;">You can close this window.</p>
          </body>
        </html>
      `);

      server.close();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error exchanging code for token:', err.message);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1 style="color: red;">❌ Token Exchange Failed</h1>
            <p>${err.message}</p>
          </body>
        </html>
      `);
      server.close();
      process.exit(1);
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Listening on http://localhost:${PORT}/callback`);
  console.log('Waiting for authorization...\n');
});

// Timeout after 5 minutes
setTimeout(() => {
  console.error('\n❌ Timeout: No authorization received after 5 minutes');
  server.close();
  process.exit(1);
}, 5 * 60 * 1000);
