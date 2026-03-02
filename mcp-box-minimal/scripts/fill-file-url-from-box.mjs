#!/usr/bin/env node
/**
 * Fill file_url (column L) in OTTER_missing_dates.csv by matching first_name (C) and last_name (D)
 * to Box certificate PDFs (recurses same OTTER folders), then writing https://app.box.com/file/{id}.
 *
 * Run from cursor-ops (Box token required):
 *   source config/box.env && node mcp-box-minimal/scripts/fill-file-url-from-box.mjs
 *
 * Env (optional):
 *   INPUT_CSV  — input CSV (default: ../resources/otter/OTTER_missing_dates.csv)
 *   OUT_CSV   — output path (default: same dir as input, basename_with_file_urls.csv)
 *   OTTER_FOLDER_IDS — comma-separated Box folder IDs (default: same five year roots as scrape)
 *   BOX_REQUEST_DELAY_MS — delay after each Box API call (default: 0)
 *
 * After running: if your Box token is expired, generate a new one:
 *   node mcp-box-minimal/scripts/get-oauth-token.js
 * then source config/box.env and re-run this script if needed.
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_OPS = process.env.CURSOR_OPS || join(__dirname, '..', '..');
const OTTER_RESOURCES = join(CURSOR_OPS, '..', 'resources', 'otter');

const ROOT_FOLDER_IDS = [
  '189218588082', // 2022
  '204957740091', // 2023
  '258329235745', // 2024
  '303812677319', // 2025
  '332845475236', // FY 25-26
];

const LIST_PAGE_SIZE = 1000;
const MAX_RETRIES = 4;
const INITIAL_BACKOFF_MS = 2000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parsePdfFilename(name) {
  const base = (name || '').replace(/\.pdf$/i, '').trim();
  const firstSpace = base.indexOf(' ');
  if (firstSpace >= 0) {
    return { first_name: base.slice(0, firstSpace), last_name: base.slice(firstSpace + 1).trim() };
  }
  return { first_name: base, last_name: '' };
}

function nameKey(firstName, lastName) {
  return `${(firstName || '').trim().toLowerCase()}|${(lastName || '').trim().toLowerCase()}`;
}

async function getFolderItemsWithRetry(client, folderId, offset) {
  const delayMs = process.env.BOX_REQUEST_DELAY_MS != null ? parseInt(process.env.BOX_REQUEST_DELAY_MS, 10) : 0;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const page = await client.folders.getFolderItems(folderId, {
        queryParams: {
          limit: LIST_PAGE_SIZE,
          offset,
          fields: ['id', 'name', 'type'],
        },
      });
      if (delayMs > 0) await sleep(delayMs);
      return page;
    } catch (err) {
      const status = err?.statusCode ?? err?.response?.status;
      const retryAfter = err?.response?.headers?.['retry-after'];
      if (status === 429 && attempt < MAX_RETRIES - 1) {
        const waitSec = retryAfter != null ? parseInt(retryAfter, 10) : Math.min((INITIAL_BACKOFF_MS * Math.pow(2, attempt)) / 1000, 60);
        console.error(`Rate limited (429); waiting ${waitSec}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(waitSec * 1000);
        continue;
      }
      throw err;
    }
  }
}

async function listAllPdfsInFolder(client, folderId, acc) {
  let offset = 0;
  let page;
  do {
    page = await getFolderItemsWithRetry(client, folderId, offset);
    const entries = page.entries || [];
    for (const item of entries) {
      if (item.type === 'file' && /\.pdf$/i.test(item.name || '')) {
        const { first_name, last_name } = parsePdfFilename(item.name);
        const key = nameKey(first_name, last_name);
        if (!acc.has(key)) {
          acc.set(key, { file_id: String(item.id ?? ''), file_name: item.name || '' });
        }
      } else if (item.type === 'folder') {
        await listAllPdfsInFolder(client, item.id, acc);
      }
    }
    offset += entries.length;
  } while ((page.entries?.length || 0) === LIST_PAGE_SIZE);
}

function parseCsvLine(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let field = '';
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          field += line[i];
          i++;
        }
      }
      out.push(field);
    } else {
      let field = '';
      while (i < line.length && line[i] !== ',') {
        field += line[i];
        i++;
      }
      out.push(field.trim());
      if (line[i] === ',') i++;
    }
  }
  return out;
}

function quoteCsvField(value) {
  if (value == null) return '';
  const s = String(value);
  if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function main() {
  const inputPath = process.env.INPUT_CSV || join(OTTER_RESOURCES, 'OTTER_missing_dates.csv');
  const outPath =
    process.env.OUT_CSV ||
    join(dirname(inputPath), (basename(inputPath, '.csv') || 'input') + '_with_file_urls.csv');

  const token = process.env.BOX_ACCESS_TOKEN;
  if (!token) {
    console.error('Missing BOX_ACCESS_TOKEN. Run: source config/box.env from cursor-ops');
    process.exit(1);
  }

  const folderIdsEnv = process.env.OTTER_FOLDER_IDS;
  const folderIds = folderIdsEnv ? folderIdsEnv.split(',').map((id) => id.trim()).filter(Boolean) : ROOT_FOLDER_IDS;

  (async () => {
    const auth = new BoxDeveloperTokenAuth({ token });
    const client = new BoxClient({ auth });

    const nameToFile = new Map();
    for (const folderId of folderIds) {
      console.error(`Listing Box folder ${folderId}...`);
      await listAllPdfsInFolder(client, folderId, nameToFile);
    }
    console.error(`Indexed ${nameToFile.size} unique name→file mappings from Box.`);

    const text = readFileSync(inputPath, 'utf8');
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) {
      console.error('CSV has no data rows');
      process.exit(1);
    }

    const header = lines[0];
    const headerFields = parseCsvLine(header);
    const firstIdx = headerFields.indexOf('first_name');
    const lastIdx = headerFields.indexOf('last_name');
    const fileUrlIdx = headerFields.indexOf('file_url');
    if (firstIdx < 0 || lastIdx < 0 || fileUrlIdx < 0) {
      console.error('CSV must have first_name, last_name, and file_url columns');
      process.exit(1);
    }

    let filled = 0;
    let notFound = 0;
    const outLines = [header];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) {
        outLines.push(line);
        continue;
      }
      const fields = parseCsvLine(line);
      while (fields.length <= fileUrlIdx) fields.push('');
      const firstName = fields[firstIdx] ?? '';
      const lastName = fields[lastIdx] ?? '';
      const key = nameKey(firstName, lastName);
      const match = nameToFile.get(key);
      if (match) {
        fields[fileUrlIdx] = `https://app.box.com/file/${match.file_id}`;
        filled++;
      } else {
        if (firstName || lastName) notFound++;
        fields[fileUrlIdx] = '';
      }
      outLines.push(fields.map(quoteCsvField).join(','));
    }

    writeFileSync(outPath, outLines.join('\n') + (text.endsWith('\n') ? '' : '\n'), 'utf8');
    console.error(`Filled ${filled} file_url(s); ${notFound} row(s) with no matching Box PDF.`);
    console.error(`Wrote ${outPath}`);
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

main();
