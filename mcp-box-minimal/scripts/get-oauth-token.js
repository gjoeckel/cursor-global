#!/usr/bin/env node
/**
 * Box OAuth 2.0 Token Generator
 *
 * This script helps you get a Box OAuth access token by:
 * 1. Generating an authorization URL
 * 2. Opening it in your browser
 * 3. Capturing the authorization code from the redirect
 * 4. Exchanging it for an access token
 */

import { BoxOAuth, OAuthConfig } from 'box-node-sdk';
import { createServer } from 'http';
import { parse } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CLIENT_ID = process.env.BOX_CLIENT_ID;
const CLIENT_SECRET = process.env.BOX_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:5000/callback';
const PORT = 5000;

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
const authUrl = oauth.getAuthorizeUrl({
  redirectUri: REDIRECT_URI,
  responseType: 'code',
  scope: 'root_readwrite',
});

console.log('📋 Step 1: Authorize the application');
console.log('Opening browser...\n');
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
      const refreshToken = tokenInfo.refreshToken;

      console.log('✅ Success! Access token obtained\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 Add this to your ~/.zshrc:\n');
      console.log(`export BOX_ACCESS_TOKEN="${accessToken}"`);
      if (refreshToken) {
        console.log(`export BOX_REFRESH_TOKEN="${refreshToken}"`);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Then run: source ~/.zshrc');
      console.log('And restart Cursor to use the new token.\n');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1 style="color: green;">✅ Authorization Successful!</h1>
            <p>Access token has been obtained.</p>
            <p>Check your terminal for instructions.</p>
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
