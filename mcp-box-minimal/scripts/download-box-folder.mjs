#!/usr/bin/env node
/**
 * Recursively download a Box folder and all subfolders/files to a local directory.
 *
 * Run from cursor-ops:
 *   source config/box.env && node mcp-box-minimal/scripts/download-box-folder.mjs <BOX_FOLDER_ID> <LOCAL_DIR>
 *
 * Example:
 *   source config/box.env && node mcp-box-minimal/scripts/download-box-folder.mjs 288120140549 /Users/a00288946/Projects/a11y_checkpoints
 *
 * Requires: BOX_ACCESS_TOKEN or BOX_DEV_TOKEN in environment (e.g. from config/box.env).
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_OPS = process.env.CURSOR_OPS || join(__dirname, '..', '..');

const LIST_PAGE_SIZE = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getClient() {
  const token = process.env.BOX_ACCESS_TOKEN || process.env.BOX_DEV_TOKEN;
  if (!token) {
    console.error('❌ BOX_ACCESS_TOKEN or BOX_DEV_TOKEN must be set. Run: source config/box.env');
    process.exit(1);
  }
  const auth = new BoxDeveloperTokenAuth({ token });
  return new BoxClient({ auth });
}

async function getFolderItems(client, folderId, offset = 0) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const page = await client.folders.getFolderItems(folderId, {
        queryParams: {
          limit: LIST_PAGE_SIZE,
          offset,
          fields: ['id', 'name', 'type', 'size'],
        },
      });
      return page;
    } catch (err) {
      if (err?.statusCode === 429 && attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
}

async function downloadFile(client, fileId, localPath) {
  const dir = dirname(localPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const stream = await client.downloads.downloadFile(fileId);
  const out = createWriteStream(localPath);
  for await (const chunk of stream) {
    out.write(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  out.end();
  return new Promise((resolve, reject) => {
    out.on('finish', resolve);
    out.on('error', reject);
  });
}

async function downloadFolderRecursive(client, boxFolderId, localBasePath) {
  let offset = 0;
  let page;
  do {
    page = await getFolderItems(client, boxFolderId, offset);
    const entries = page.entries || [];
    for (const item of entries) {
      const name = item.name || `unnamed_${item.id}`;
      const localPath = join(localBasePath, name);
      if (item.type === 'folder') {
        mkdirSync(localPath, { recursive: true });
        await downloadFolderRecursive(client, item.id, localPath);
      } else if (item.type === 'file') {
        process.stdout.write(`  ${localPath}\n`);
        await downloadFile(client, item.id, localPath);
      }
      // skip web_link
    }
    offset += entries.length;
  } while (page.entries && page.entries.length === LIST_PAGE_SIZE);
}

async function main() {
  const boxFolderId = process.argv[2];
  const localDir = process.argv[3];
  if (!boxFolderId || !localDir) {
    console.error('Usage: source config/box.env && node download-box-folder.mjs <BOX_FOLDER_ID> <LOCAL_DIR>');
    process.exit(1);
  }
  const absDir = localDir.startsWith('/') ? localDir.replace(/\/$/, '') : join(process.cwd(), localDir).replace(/\/$/, '');
  mkdirSync(absDir, { recursive: true });
  console.log(`Downloading Box folder ${boxFolderId} to ${absDir}\n`);
  const client = getClient();
  await downloadFolderRecursive(client, boxFolderId, absDir);
  console.log('\n✅ Done.');
}

main().catch((err) => {
  console.error('❌', err.message || err);
  process.exit(1);
});
