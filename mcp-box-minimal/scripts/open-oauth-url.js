#!/usr/bin/env node
/**
 * Box OAuth URL Opener
 *
 * This script opens the Box OAuth authorization URL in the browser.
 * Used when token expires to prompt user to re-authorize.
 *
 * Usage:
 *   node mcp-box-minimal/scripts/open-oauth-url.js
 *
 * Or call from error handlers when token expiration is detected.
 */

import { BoxOAuth, OAuthConfig } from 'box-node-sdk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CLIENT_ID = process.env.BOX_CLIENT_ID;
const CLIENT_SECRET = process.env.BOX_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:5000/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: BOX_CLIENT_ID and BOX_CLIENT_SECRET must be set');
  console.error('   Set them in your environment or ~/.zshrc');
  process.exit(1);
}

// Initialize Box OAuth
const config = new OAuthConfig({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});
const oauth = new BoxOAuth({ config });

// Generate authorization URL
const authUrl = oauth.getAuthorizeUrl({
  redirectUri: REDIRECT_URI,
  responseType: 'code',
  scope: 'root_readwrite',
});

console.log('🔐 Box OAuth Token Expired\n');
console.log('Opening browser to re-authorize...\n');
console.log('👉 IMPORTANT: Click "Authorize" in the browser window\n');
console.log('After authorization, run: node mcp-box-minimal/scripts/get-oauth-token.js');
console.log('to complete the token exchange.\n');

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
  console.log('⚠️  Could not open browser automatically.');
  console.log('\nPlease open this URL manually:');
  console.log(authUrl);
  console.log('\nAfter authorizing, run:');
  console.log('  node mcp-box-minimal/scripts/get-oauth-token.js');
});
