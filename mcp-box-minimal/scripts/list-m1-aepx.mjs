#!/usr/bin/env node
// Version: 1.0.0
/**
 * List all .aepx files in M1 folder (each activity's Ae subfolder).
 * Outputs JSON: { "activityId": "https://app.box.com/file/FILE_ID", ... }
 *
 * Run: CURSOR_OPS=/path/to/cursor-ops node mcp-box-minimal/scripts/list-m1-aepx.mjs
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_OPS = process.env.CURSOR_OPS || join(__dirname, '..', '..');

const M1_FOLDER_ID = '366834357370';
const THROTTLE_MS = 400;

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
    console.error('❌ BOX_ACCESS_TOKEN or BOX_DEV_TOKEN must be set.');
    process.exit(1);
  }
  return new BoxClient({ auth: new BoxDeveloperTokenAuth({ token }) });
}

async function main() {
  const client = getClient();
  const m1Items = await client.folders.getFolderItems(M1_FOLDER_ID, { fields: ['id', 'name', 'type'] });
  const activityFolders = m1Items.entries.filter(
    (e) => e.type === 'folder' && e.name && /^\d+-\d+-\d+$/.test(e.name)
  );

  const out = {};
  for (const af of activityFolders) {
    await sleep(THROTTLE_MS);
    const children = await client.folders.getFolderItems(af.id, { fields: ['id', 'name', 'type'] });
    const ae = children.entries.find((e) => e.type === 'folder' && e.name === 'Ae');
    if (!ae) continue;
    await sleep(THROTTLE_MS);
    const aeItems = await client.folders.getFolderItems(ae.id, { fields: ['id', 'name', 'type'] });
    const aepx = aeItems.entries.find((e) => e.type === 'file' && e.name && e.name.endsWith('.aepx'));
    if (aepx) out[af.name] = `https://app.box.com/file/${aepx.id}`;
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
