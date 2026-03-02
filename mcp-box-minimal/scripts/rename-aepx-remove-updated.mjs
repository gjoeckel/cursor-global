#!/usr/bin/env node
// Version: 1.0.0
/**
 * Rename .aepx files in M1 Ae folders (1-3-1 through 1-5-3): remove "_updated"
 * e.g. 1-3-1_updated.aepx → 1-3-1.aepx
 *
 * Run: CURSOR_OPS=/path/to/cursor-ops node mcp-box-minimal/scripts/rename-aepx-remove-updated.mjs
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_OPS = process.env.CURSOR_OPS || join(__dirname, '..', '..');

const M1_FOLDER_ID = '366834357370';
const ACTIVITY_IDS = ['1-3-1', '1-3-2', '1-4-1', '1-4-2', '1-4-3', '1-5-1', '1-5-2', '1-5-3'];

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

/** New name with _updated removed (e.g. 1-3-1_updated.aepx → 1-3-1.aepx) */
function newName(name) {
  return name.replace(/_updated(?=\.aepx$)/i, '');
}

async function main() {
  const client = getClient();
  console.log('M1 folder ID:', M1_FOLDER_ID);
  console.log('Renaming *_updated.aepx → *.aepx in Ae folders for', ACTIVITY_IDS.join(', '), '...\n');

  const m1Items = await client.folders.getFolderItems(M1_FOLDER_ID, { fields: ['id', 'name', 'type'] });
  const activityFolders = m1Items.entries.filter((e) => e.type === 'folder' && ACTIVITY_IDS.includes(e.name));

  let renamed = 0;
  let skipped = 0;

  for (const af of activityFolders) {
    await sleep(THROTTLE_MS);
    const children = await client.folders.getFolderItems(af.id, { fields: ['id', 'name', 'type'] });
    const ae = children.entries.find((e) => e.type === 'folder' && e.name === 'Ae');
    if (!ae) continue;

    await sleep(THROTTLE_MS);
    const aeItems = await client.folders.getFolderItems(ae.id, { fields: ['id', 'name', 'type'] });
    const aepxFiles = aeItems.entries.filter((e) => e.type === 'file' && e.name && e.name.endsWith('.aepx') && e.name.includes('_updated'));

    for (const file of aepxFiles) {
      const targetName = newName(file.name);
      if (targetName === file.name) {
        skipped++;
        continue;
      }
      await sleep(THROTTLE_MS);
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await client.files.updateFileById(file.id, {
            requestBody: { name: targetName },
          });
          console.log('  Renamed', file.name, '→', targetName, '(' + af.name + '/Ae)');
          renamed++;
          break;
        } catch (err) {
          if (err?.statusCode === 429 && attempt < MAX_RETRIES - 1) {
            await sleep(RETRY_DELAY_MS * (attempt + 1));
            continue;
          }
          console.error('  Error renaming', file.name, ':', err.message || err);
          break;
        }
      }
    }
  }

  console.log('\nDone. Renamed:', renamed, 'Skipped:', skipped);
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
