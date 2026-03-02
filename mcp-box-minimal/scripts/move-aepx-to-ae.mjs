#!/usr/bin/env node
// Version: 1.0.0
/**
 * Move .aepx files from a source Box folder into each file's activity Ae subfolder under M1.
 * Filename pattern: {activityId}_updated.aepx (e.g. 1-3-1_updated.aepx → M1/1-3-1/Ae/).
 *
 * Run from cursor-ops:
 *   CURSOR_OPS=/path/to/cursor-ops node mcp-box-minimal/scripts/move-aepx-to-ae.mjs
 *
 * Requires: BOX_ACCESS_TOKEN or BOX_DEV_TOKEN in environment (e.g. from config/box.env).
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_OPS = process.env.CURSOR_OPS || join(__dirname, '..', '..');

const SOURCE_FOLDER_ID = '366994101205';
const M1_FOLDER_ID = '366834357370';

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

/** Extract activity ID from filename like "1-3-1_updated.aepx" → "1-3-1" */
function activityIdFromName(name) {
  const m = name.match(/^(\d+-\d+-\d+)_/);
  return m ? m[1] : null;
}

async function main() {
  const client = getClient();
  console.log('Source folder:', SOURCE_FOLDER_ID);
  console.log('M1 folder:', M1_FOLDER_ID);

  const sourceItems = await client.folders.getFolderItems(SOURCE_FOLDER_ID, { fields: ['id', 'name', 'type'] });
  const aepxFiles = sourceItems.entries.filter((e) => e.type === 'file' && e.name && e.name.endsWith('.aepx'));
  if (aepxFiles.length === 0) {
    console.log('No .aepx files in source folder.');
    return;
  }
  console.log('Found', aepxFiles.length, '.aepx file(s)\n');

  const m1Items = await client.folders.getFolderItems(M1_FOLDER_ID, { fields: ['id', 'name', 'type'] });
  const activityFolders = m1Items.entries.filter((e) => e.type === 'folder' && e.name && /^\d+-\d+-\d+$/.test(e.name));
  const activityIds = new Set(activityFolders.map((f) => f.name));

  const aeFolderIds = {};
  for (const af of activityFolders) {
    await sleep(THROTTLE_MS);
    const children = await client.folders.getFolderItems(af.id, { fields: ['id', 'name', 'type'] });
    const ae = children.entries.find((e) => e.type === 'folder' && e.name === 'Ae');
    if (ae) aeFolderIds[af.name] = ae.id;
  }

  let moved = 0;
  let skipped = 0;
  for (const file of aepxFiles) {
    const activityId = activityIdFromName(file.name);
    if (!activityId) {
      console.log('  Skip (no activity ID in name):', file.name);
      skipped++;
      continue;
    }
    const aeFolderId = aeFolderIds[activityId];
    if (!aeFolderId) {
      console.log('  Skip (no Ae folder for', activityId + '):', file.name);
      skipped++;
      continue;
    }
    await sleep(THROTTLE_MS);
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        await client.files.updateFileById(file.id, {
          requestBody: { parent: { id: aeFolderId } },
        });
        console.log('  Moved', file.name, '→', activityId + '/Ae');
        moved++;
        break;
      } catch (err) {
        if (err?.statusCode === 429 && attempt < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        console.error('  Error moving', file.name, ':', err.message || err);
        break;
      }
    }
  }

  console.log('\nDone. Moved:', moved, 'Skipped:', skipped);
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
