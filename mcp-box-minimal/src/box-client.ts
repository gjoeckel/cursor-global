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

    // Use developer token if available (simpler for testing)
    if (devToken) {
      const auth = new BoxDeveloperTokenAuth({ token: devToken });
      client = new BoxClient({ auth });
      clientInitialized = true;
      return client;
    }

    // Otherwise, use OAuth access token
    if (!clientId || !clientSecret) {
      throw new Error(
        'BOX_CLIENT_ID and BOX_CLIENT_SECRET environment variables are required. ' +
        'Get your credentials from: https://app.box.com/developers/console'
      );
    }

    if (!accessToken) {
      throw new Error(
        'Either BOX_ACCESS_TOKEN or BOX_DEV_TOKEN is required. ' +
        'Get developer token from Box Developer Console for testing, ' +
        'or complete OAuth flow to get access token.'
      );
    }

    // For OAuth, we'd typically use BoxOAuth, but for MCP we'll use the access token directly
    // This is a simplified approach - full OAuth flow would require callback handling
    const auth = new BoxDeveloperTokenAuth({ token: accessToken });
    client = new BoxClient({ auth });
    clientInitialized = true;
  }
  return client;
}
