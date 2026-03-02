/**
 * Error handling utilities for Box API errors
 * Detects token expiration and provides helpful instructions
 */

/**
 * Check if an error is a Box authentication/authorization error
 */
export function isBoxAuthError(error: any): boolean {
  if (!error) return false;
  // Handle our wrapped auth error (has originalError from withAuthErrorHandling)
  if ((error as any).isAuthError === true) return true;
  const orig = (error as any).originalError;
  if (orig && isBoxAuthError(orig)) return true;

  const errorMessage = error.message || String(error);
  const statusCode = error.statusCode || error.status || error.response?.status;

  // Common Box API authentication error codes
  const authErrorCodes = [401, 403];
  const authErrorMessages = [
    'unauthorized',
    'forbidden',
    'invalid_token',
    'expired_token',
    'authentication',
    'invalid access token',
    'access token is invalid',
    'developer token has expired',
  ];

  if (statusCode && authErrorCodes.includes(statusCode)) {
    return true;
  }

  if (authErrorMessages.some(msg => errorMessage.toLowerCase().includes(msg))) {
    return true;
  }

  return false;
}

/**
 * Get helpful error message for authentication errors
 */
export function getAuthErrorMessage(error: any): string {
  const scriptPath = process.env.BOX_OAUTH_SCRIPT_PATH || 'mcp-box-minimal/scripts/get-oauth-token.js';
  const openUrlScript = process.env.BOX_OPEN_URL_SCRIPT_PATH || 'mcp-box-minimal/scripts/open-oauth-url.js';

  const baseMessage = '🔐 Box authentication token has expired or is invalid.\n\n';

  const instructions =
    'To fix this:\n' +
    '  1. Open OAuth URL in browser:\n' +
    `     node ${openUrlScript}\n\n` +
    '  2. Click "Authorize" in the browser window\n\n' +
    '  3. Complete the OAuth flow:\n' +
    `     node ${scriptPath}\n\n` +
    '  4. Restart Cursor to load the new token\n\n' +
    'Or use Developer Token for quick testing:\n' +
    '  Get from: https://app.box.com/developers/console\n' +
    '  Set: export BOX_DEV_TOKEN="your_token"';

  return baseMessage + instructions;
}

/**
 * Wrap an async function to detect and handle Box authentication errors
 */
export async function withAuthErrorHandling<T>(
  fn: () => Promise<T>,
  customErrorMessage?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (isBoxAuthError(error)) {
      const message = customErrorMessage || getAuthErrorMessage(error);
      const authError = new Error(message);
      (authError as any).isAuthError = true;
      (authError as any).originalError = error;
      throw authError;
    }
    throw error;
  }
}
