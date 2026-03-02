#!/usr/bin/env node
/**
 * Fill certificate_date (column K) in otterSheet from Box: match first_name (C) + last_name (D)
 * to PDF filename, use file created_at → YYYY-MM-DD in column K.
 *
 * Column structure matches otterSheet: A=id, B=canvas_user_id, C=first_name, D=last_name,
 * E=email, F=enterprise, G=course_id, H=review_course_id, I=invited_date, J=earned_date,
 * K=certificate_date, L=certificate_date_multi. Created_at from Box match → K in YYYY-MM-DD.
 *
 * Run from cursor-ops:
 *   source config/box.env && node mcp-box-minimal/scripts/fill-certificate-date-from-box.mjs
 *
 * Env (optional):
 *   INPUT_CSV  — input CSV (default: ../resources/otter/otterSheet.csv)
 *   OUT_CSV    — output path (default: overwrites INPUT_CSV)
 *   OTTER_FOLDER_IDS — comma-separated Box folder IDs (year-based folders)
 *   BOX_REQUEST_DELAY_MS — delay after each Box API call
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

function toYYYYMMDD(val) {
  if (val == null) return '';
  let str = null;
  if (typeof val === 'string') str = val;
  else if (val instanceof Date && !isNaN(val.getTime())) return val.toISOString().slice(0, 10);
  else if (typeof val === 'object' && val != null && val.value != null) {
    const v = val.value;
    str = typeof v === 'string' ? v : (v instanceof Date ? v.toISOString() : String(v));
  }
  if (str) {
    const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[0];
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return '';
}

async function getFolderItemsWithRetry(client, folderId, offset) {
  const delayMs = process.env.BOX_REQUEST_DELAY_MS != null ? parseInt(process.env.BOX_REQUEST_DELAY_MS, 10) : 0;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const page = await client.folders.getFolderItems(folderId, {
        queryParams: {
          limit: LIST_PAGE_SIZE,
          offset,
          fields: ['id', 'name', 'type', 'created_at'],
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

async function listAllPdfsWithCreatedAt(client, folderId, acc) {
  let offset = 0;
  let page;
  do {
    page = await getFolderItemsWithRetry(client, folderId, offset);
    const entries = page.entries || [];
    for (const item of entries) {
      if (item.type === 'file' && /\.pdf$/i.test(item.name || '')) {
        const created_at = item.created_at ?? item.createdAt;
        const certDate = toYYYYMMDD(created_at);
        const { first_name, last_name } = parsePdfFilename(item.name);
        const key = nameKey(first_name, last_name);
        if (!acc.has(key)) {
          acc.set(key, certDate);
        }
      } else if (item.type === 'folder') {
        await listAllPdfsWithCreatedAt(client, item.id, acc);
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

async function main() {
  const token = process.env.BOX_ACCESS_TOKEN;
  if (!token) {
    console.error('Missing BOX_ACCESS_TOKEN. Run: source config/box.env from cursor-ops');
    process.exit(1);
  }

  const inputPath = process.env.INPUT_CSV || join(OTTER_RESOURCES, 'otterSheet.csv');
  const outPath = process.env.OUT_CSV || inputPath;
  const folderIdsEnv = process.env.OTTER_FOLDER_IDS;
  const folderIds = folderIdsEnv ? folderIdsEnv.split(',').map((id) => id.trim()).filter(Boolean) : ROOT_FOLDER_IDS;

  const auth = new BoxDeveloperTokenAuth({ token });
  const client = new BoxClient({ auth });

  const nameToCertDate = new Map();
  for (const folderId of folderIds) {
    console.error(`Listing Box folder ${folderId}...`);
    await listAllPdfsWithCreatedAt(client, folderId, nameToCertDate);
  }
  console.error(`Indexed ${nameToCertDate.size} unique name→certificate_date mappings from Box.`);

  const text = readFileSync(inputPath, 'utf8');
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) {
    console.error('Input CSV has no data rows');
    process.exit(1);
  }

  const header = lines[0];
  const headerFields = parseCsvLine(header);
  const firstIdx = headerFields.indexOf('first_name');
  const lastIdx = headerFields.indexOf('last_name');
  const certDateIdx = headerFields.indexOf('certificate_date');
  if (firstIdx < 0 || lastIdx < 0 || certDateIdx < 0) {
    console.error('Input CSV must have first_name, last_name, and certificate_date columns (otterSheet structure).');
    process.exit(1);
  }

  let filled = 0;
  const outLines = [header];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      outLines.push(line);
      continue;
    }
    const fields = parseCsvLine(line);
    while (fields.length <= certDateIdx) fields.push('');
    const firstName = (fields[firstIdx] ?? '').trim();
    const lastName = (fields[lastIdx] ?? '').trim();
    const key = nameKey(firstName, lastName);
    const certDate = nameToCertDate.get(key);
    if (certDate) {
      fields[certDateIdx] = certDate;
      filled++;
    }
    outLines.push(fields.map(quoteCsvField).join(','));
  }

  writeFileSync(outPath, outLines.join('\n') + '\n', 'utf8');
  console.error(`Filled ${filled} certificate_date (column K) values. Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
