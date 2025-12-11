import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';

let client: any = null;
let clientInitialized = false;

/**
 * Get or create Box API client
 * Uses OAuth Client ID, Secret, and Access Token from environment variables
 *
 * Note: For initial setup, you need to:
 * 1. Get BOX_CLIENT_ID and BOX_CLIENT_SECRET from Box Developer Console
 * 2. Complete OAuth flow to get BOX_ACCESS_TOKEN
 * 3. Or use BOX_DEV_TOKEN for testing (expires in 60 minutes)
 */
export function getBoxClient(): any {
  if (!clientInitialized) {
    const clientId = process.env.BOX_CLIENT_ID;
    const clientSecret = process.env.BOX_CLIENT_SECRET;
    const accessToken = process.env.BOX_ACCESS_TOKEN;
    const devToken = process.env.BOX_DEV_TOKEN;

    // Priority 1: Use OAuth access token if available (from stored OAuth flow)
    if (accessToken) {
      const auth = new BoxDeveloperTokenAuth({ token: accessToken });
      client = new BoxClient({ auth });
      clientInitialized = true;
      return client;
    }

    // Priority 2: Use developer token for quick testing (expires in 60 minutes)
    if (devToken) {
      const auth = new BoxDeveloperTokenAuth({ token: devToken });
      client = new BoxClient({ auth });
      clientInitialized = true;
      return client;
    }

    // If neither token is available, provide helpful error
    if (clientId && clientSecret) {
      throw new Error(
        'BOX_ACCESS_TOKEN or BOX_DEV_TOKEN is required. ' +
        'You have BOX_CLIENT_ID and BOX_CLIENT_SECRET configured. ' +
        'Complete OAuth flow to get BOX_ACCESS_TOKEN, or use BOX_DEV_TOKEN for testing. ' +
        'Get developer token from: https://app.box.com/developers/console'
      );
    }

    throw new Error(
      'Box authentication required. Provide either:\n' +
      '  - BOX_ACCESS_TOKEN (from OAuth flow) - recommended for production\n' +
      '  - BOX_DEV_TOKEN (for testing, expires in 60 min)\n' +
      'Get credentials from: https://app.box.com/developers/console'
    );
  }
  return client;
}
