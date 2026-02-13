#!/usr/bin/env node
/**
 * Box certificate scrape — first pass.
 * Recurses USU Box year folders, collects all PDFs, parses first/last name and created_at → YYYY-MM-DD,
 * appends rows to otter_data_box_retrieval.csv with file_number and retrieved_at.
 *
 * Run from cursor-ops:
 *   source config/box.env && node mcp-box-minimal/scripts/box-cert-scrape-first-pass.mjs
 *
 * Optional: OTTER_DATA_CSV=/path/to/otter_data_box_retrieval.csv (default: ../resources/otter relative to CURSOR_OPS or cwd)
 * Optional: OTTER_MAX_FILES=N — stop after collecting N PDFs (default: no limit).
 * Optional: BOX_REQUEST_DELAY_MS=N — delay in ms after each list-folder API call (stays under ~1000/min).
 * Optional: OTTER_FOLDER_IDS=id1,id2 — only scrape these folder IDs (default: all five year roots).
 * 429 responses are retried with exponential backoff (respects retry-after when present).
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';
import { createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  const base = name.replace(/\.pdf$/i, '').trim();
  const firstSpace = base.indexOf(' ');
  if (firstSpace >= 0) {
    return { first_name: base.slice(0, firstSpace), last_name: base.slice(firstSpace + 1).trim() };
  }
  return { first_name: base, last_name: '' };
}

/** Returns YYYY-MM-DD or null. Handles ISO strings, Date objects, and Box SDK date shapes. */
function toYYYYMMDD(isoOrDate) {
  if (isoOrDate == null) return null;
  let str = null;
  if (typeof isoOrDate === 'string') str = isoOrDate;
  else if (isoOrDate instanceof Date && !isNaN(isoOrDate.getTime())) return isoOrDate.toISOString().slice(0, 10);
  else if (typeof isoOrDate === 'object' && isoOrDate != null && isoOrDate.value != null) {
    const v = isoOrDate.value;
    str = typeof v === 'string' ? v : (v instanceof Date ? v.toISOString() : String(v));
  }
  if (str) {
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[0];
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

/** Ensures value is strictly YYYY-MM-DD or empty string for CSV output. */
function ensureYYYYMMDD(value) {
  if (value == null || value === '') return '';
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? m[0] : '';
}

function escapeCsvField(value) {
  if (value == null) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function csvRow(fields) {
  return fields.map(escapeCsvField).join(',') + '\n';
}

function quoteFieldForCsv(value) {
  const s = value == null ? '' : String(value);
  return '"' + s.replace(/"/g, '""') + '"';
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
        const waitSec = retryAfter != null ? parseInt(retryAfter, 10) : Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempt) / 1000, 60);
        console.error(`Rate limited (429); waiting ${waitSec}s before retry (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(waitSec * 1000);
        continue;
      }
      throw err;
    }
  }
}

async function listAllPdfsInFolder(client, folderId, acc, maxFiles) {
  if (maxFiles != null && acc.length >= maxFiles) return;
  let offset = 0;
  let page;
  do {
    if (maxFiles != null && acc.length >= maxFiles) return;
    page = await getFolderItemsWithRetry(client, folderId, offset);
    const entries = page.entries || [];
    for (const item of entries) {
      if (maxFiles != null && acc.length >= maxFiles) return;
      if (item.type === 'file' && /\.pdf$/i.test(item.name || '')) {
        const created_at = item.created_at ?? item.createdAt;
        const certificate_date = toYYYYMMDD(created_at);
        const { first_name, last_name } = parsePdfFilename(item.name);
        acc.push({
          file_id: String(item.id ?? ''),
          file_name: item.name,
          first_name,
          last_name,
          certificate_date: ensureYYYYMMDD(certificate_date),
        });
      } else if (item.type === 'folder') {
        await listAllPdfsInFolder(client, item.id, acc, maxFiles);
      }
    }
    offset += entries.length;
  } while ((page.entries?.length || 0) === LIST_PAGE_SIZE);
}

async function main() {
  const token = process.env.BOX_ACCESS_TOKEN;
  if (!token) {
    console.error('Missing BOX_ACCESS_TOKEN. Run: source config/box.env from cursor-ops');
    process.exit(1);
  }

  const outPath =
    process.env.OTTER_DATA_CSV ||
    join(process.env.CURSOR_OPS || join(__dirname, '..', '..'), '..', 'resources', 'otter', 'otter_data_box_retrieval.csv');

  const maxFiles = process.env.OTTER_MAX_FILES != null ? parseInt(process.env.OTTER_MAX_FILES, 10) : null;
  const folderIdsEnv = process.env.OTTER_FOLDER_IDS;
  const folderIds = folderIdsEnv ? folderIdsEnv.split(',').map((id) => id.trim()).filter(Boolean) : ROOT_FOLDER_IDS;
  if (folderIdsEnv) console.error(`Folders: ${folderIds.join(', ')}`);

  if (maxFiles != null) console.error(`Limit: ${maxFiles} PDFs`);

  const auth = new BoxDeveloperTokenAuth({ token });
  const client = new BoxClient({ auth });

  const allPdfs = [];
  for (const folderId of folderIds) {
    if (maxFiles != null && allPdfs.length >= maxFiles) break;
    console.error(`Listing folder ${folderId}...`);
    await listAllPdfsInFolder(client, folderId, allPdfs, maxFiles);
  }

  console.error(`Total PDFs collected: ${allPdfs.length}`);

  const header =
    'id,canvas_user_id,first_name,last_name,email,enterprise,course_id,review_course_id,invited_date,earned_date,certificate_date,file_number,retrieved_at,file_id,file_name';
  const stream = createWriteStream(outPath, { flags: 'w' });
  stream.write(header + '\n');

  let fileNumber = 0;
  const start = Date.now();
  for (const row of allPdfs) {
    fileNumber += 1;
    const retrieved_at = new Date().toISOString();
    const rawFields = [
      '', '', row.first_name, row.last_name, '', '', '', '', '', '',
      ensureYYYYMMDD(row.certificate_date),
      fileNumber,
      retrieved_at,
      row.file_id ?? '',
      row.file_name ?? '',
    ];
    const line = rawFields.map((f, i) => (i === 13 ? quoteFieldForCsv(f) : escapeCsvField(f))).join(',') + '\n';
    stream.write(line);
  }
  stream.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.error(`Appended ${fileNumber} rows to ${outPath} in ${elapsed}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
