#!/usr/bin/env node
// Version: 1.0.0
/**
 * Recursively map a Box folder and all subfolders to JSON + tree markdown.
 *
 * Run from cursor-ops:
 *   source config/box.env && node mcp-box-minimal/scripts/map-box-folder.mjs <BOX_FOLDER_ID> [OUTPUT_DIR]
 *
 * Example:
 *   source config/box.env && node mcp-box-minimal/scripts/map-box-folder.mjs 184899190488
 *   source config/box.env && node mcp-box-minimal/scripts/map-box-folder.mjs 184899190488 ./output
 *
 * Requires: BOX_ACCESS_TOKEN or BOX_DEV_TOKEN in environment.
 * Output: <output_dir>/<root_name>-map.json, <root_name>-tree.md
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_OPS = process.env.CURSOR_OPS || join(__dirname, '..', '..');

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

const LIST_PAGE_SIZE = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const THROTTLE_MS = 300;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getClient() {
  loadBoxEnv();
  const token = process.env.BOX_ACCESS_TOKEN || process.env.BOX_DEV_TOKEN;
  if (!token) {
    console.error('❌ BOX_ACCESS_TOKEN or BOX_DEV_TOKEN must be set.');
    console.error('   Option 1: Run: source config/box.env (from cursor-ops)');
    console.error('   Option 2: Set CURSOR_OPS and ensure config/box.env exists');
    process.exit(1);
  }
  const auth = new BoxDeveloperTokenAuth({ token });
  return new BoxClient({ auth });
}

async function getFolderMeta(client, folderId) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const folder = await client.folders.getFolderById(folderId, {
        queryParams: { fields: ['id', 'name', 'type'] },
      });
      return folder;
    } catch (err) {
      if (err?.statusCode === 429 && attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
}

async function getFolderItems(client, folderId, offset = 0) {
  await sleep(THROTTLE_MS);
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const page = await client.folders.getFolderItems(folderId, {
        queryParams: {
          limit: LIST_PAGE_SIZE,
          offset,
          fields: ['id', 'name', 'type', 'size', 'modified_at', 'created_at'],
        },
      });
      return page;
    } catch (err) {
      if (err?.statusCode === 429 && attempt < MAX_RETRIES - 1) {
        const retryAfter = err?.responseHeaders?.['retry-after'];
        const wait = retryAfter ? parseInt(retryAfter, 10) * 1000 : RETRY_DELAY_MS * (attempt + 1);
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
}

async function traverseFolder(client, folderId, parentPath, depth, items) {
  let offset = 0;
  let page;
  do {
    page = await getFolderItems(client, folderId, offset);
    const entries = page.entries || [];
    for (const item of entries) {
      const name = item.name || `unnamed_${item.id}`;
      const path = parentPath ? `${parentPath}/${name}` : name;
      const record = {
        id: item.id,
        name,
        type: item.type,
        size: item.size ?? null,
        modified_at: item.modified_at ?? null,
        created_at: item.created_at ?? null,
        path,
        depth,
        parent_id: folderId,
        parent_path: parentPath || null,
      };
      items.push(record);
      if (item.type === 'folder') {
        await traverseFolder(client, item.id, path, depth + 1, items);
      }
    }
    offset += entries.length;
  } while (page.entries && page.entries.length === LIST_PAGE_SIZE);
}

function buildTreeMarkdown(items, rootName, rootId) {
  const lines = [`# ${rootName} (${rootId})\n`];
  const byParent = new Map();
  for (const item of items) {
    const key = item.parent_path ?? '';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(item);
  }
  function sortChildren(arr) {
    return [...arr].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  }
  function render(prefix, parentPath, isLast) {
    const children = sortChildren(byParent.get(parentPath) || []);
    for (let i = 0; i < children.length; i++) {
      const item = children[i];
      const isLastChild = i === children.length - 1;
      const conn = isLastChild ? '└── ' : '├── ';
      const name = item.type === 'folder' ? `${item.name}/` : item.name;
      lines.push(`${prefix}${conn}${name}`);
      if (item.type === 'folder') {
        const ext = isLastChild ? '    ' : '│   ';
        render(prefix + ext, item.path, isLastChild);
      }
    }
  }
  render('', rootName, true);
  return lines.join('\n');
}

async function main() {
  const folderId = process.argv[2];
  const outputDirArg = process.argv[3];
  if (!folderId) {
    console.error('Usage: source config/box.env && node map-box-folder.mjs <BOX_FOLDER_ID> [OUTPUT_DIR]');
    process.exit(1);
  }
  const outputDir = outputDirArg
    ? (outputDirArg.startsWith('/') ? outputDirArg.replace(/\/$/, '') : join(process.cwd(), outputDirArg).replace(/\/$/, ''))
    : join(CURSOR_OPS, '..', 'resources', 'canvas_media_manager');

  mkdirSync(outputDir, { recursive: true });

  const client = getClient();
  console.log(`Mapping Box folder ${folderId}...`);
  const root = await getFolderMeta(client, folderId);
  const rootName = root.name || `folder_${folderId}`;
  console.log(`Root: ${rootName}\n`);

  const items = [];
  await traverseFolder(client, folderId, rootName, 1, items);

  const folders = items.filter((i) => i.type === 'folder');
  const files = items.filter((i) => i.type === 'file');
  const maxDepth = items.length ? Math.max(...items.map((i) => i.depth)) : 0;
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);

  const snapshot = {
    root_id: folderId,
    root_name: rootName,
    captured_at: new Date().toISOString(),
    total_folders: folders.length,
    total_files: files.length,
    max_depth: maxDepth,
    total_size_bytes: totalSize,
    items,
  };

  const safeName = rootName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const jsonPath = join(outputDir, `${safeName}-map.json`);
  const treePath = join(outputDir, `${safeName}-tree.md`);

  writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2), 'utf-8');
  const treeMd = buildTreeMarkdown(items, rootName, folderId);
  writeFileSync(treePath, treeMd, 'utf-8');

  console.log(`✅ Wrote ${jsonPath}`);
  console.log(`✅ Wrote ${treePath}`);
  console.log(`\nStats: ${folders.length} folders, ${files.length} files, max depth ${maxDepth}, ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error('❌', err.message || err);
  process.exit(1);
});
