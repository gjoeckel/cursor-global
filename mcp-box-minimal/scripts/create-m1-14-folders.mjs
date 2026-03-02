#!/usr/bin/env node
// Version: 1.0.0
/**
 * Create M1 folder structure for section 1.4 only: 1-4-1, 1-4-2, 1-4-3.
 * Under M1 folder: one folder per activity ID; under each, Au, Ai, Ae, Pr.
 *
 * Run: CURSOR_OPS=/path/to/cursor-ops node mcp-box-minimal/scripts/create-m1-14-folders.mjs
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_OPS = process.env.CURSOR_OPS || join(__dirname, '..', '..');

const M1_FOLDER_ID = '366834357370';
const ACTIVITY_IDS = ['1-4-1', '1-4-2', '1-4-3'];
const ASSET_SUBFOLDERS = ['Au', 'Ai', 'Ae', 'Pr'];

const THROTTLE_MS = 400;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadBoxEnv() {
  const boxEnvPath = join(CURSOR_OPS, 'config', 'box.env');
  if (existsSync(boxEnvPath)) {
    const content = readFileSync(boxEnvPath, 'utf-8');
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*export\s+BOX_(ACCESS_TOKEN|REFRESH_TOKEN|CLIENT_ID|CLIENT_SECRET|DEV_TOKEN)="([^"]*)"\s*$/);
      if (m) process.env[`BOX_${m[1]}`] = m[2];
    }
  }
}

function getClient() {
  loadBoxEnv();
  const token = process.env.BOX_ACCESS_TOKEN || process.env.BOX_DEV_TOKEN;
  if (!token) {
    console.error('❌ BOX_ACCESS_TOKEN or BOX_DEV_TOKEN must be set. Run: source config/box.env');
    process.exit(1);
  }
  const auth = new BoxDeveloperTokenAuth({ token });
  return new BoxClient({ auth });
}

async function createFolder(client, parentId, name) {
  await sleep(THROTTLE_MS);
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const folder = await client.folders.createFolder({
        name,
        parent: { id: parentId },
      });
      return folder;
    } catch (err) {
      if (err?.statusCode === 409 && err?.contextInfo?.conflicts?.[0]?.type === 'folder') {
        const existing = err.contextInfo.conflicts[0];
        return { id: existing.id, name: existing.name };
      }
      if (err?.statusCode === 429 && attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
}

async function main() {
  const client = getClient();
  console.log('M1 folder ID:', M1_FOLDER_ID);
  console.log('Creating', ACTIVITY_IDS.length, 'activity folders (1-4-x), each with Au, Ai, Ae, Pr...\n');

  for (const activityId of ACTIVITY_IDS) {
    const activityFolder = await createFolder(client, M1_FOLDER_ID, activityId);
    console.log('  Created', activityId, '→', activityFolder.id);
    for (const sub of ASSET_SUBFOLDERS) {
      await createFolder(client, activityFolder.id, sub);
      console.log('    →', sub);
    }
  }

  console.log('\nDone. 1-4-1, 1-4-2, 1-4-3 structure created.');
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
