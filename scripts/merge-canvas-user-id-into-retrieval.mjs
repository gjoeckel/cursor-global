#!/usr/bin/env node
/**
 * Merge canvas_user_id (column B) from OTTER Legacy Data - Missing Cert Dates.csv
 * into otter_data_box_retrieval.csv by matching first_name + last_name (case-insensitive, trimmed).
 *
 * Usage (from cursor-ops):
 *   node scripts/merge-canvas-user-id-into-retrieval.mjs
 *
 * Env (optional):
 *   LEGACY_CSV  — path to legacy CSV (default: ../resources/otter/OTTER Legacy Data - Missing Cert Dates.csv)
 *   RETRIEVAL_CSV — path to retrieval CSV (default: ../resources/otter/otter_data_box_retrieval.csv)
 *   OUT_CSV     — output path (default: same as RETRIEVAL_CSV; file is overwritten)
 *   MATCHED_ONLY_CSV — path for CSV of matched rows only (default: retrieval dir + otter_data_box_retrieval_matched.csv)
 *   LEGACY_UNMATCHED_CSV — path for CSV of legacy rows that had no retrieval match (default: legacy dir + OTTER Legacy Data - Unmatched.csv)
 *
 * Writes merged result to OUT_CSV, matched-only to MATCHED_ONLY_CSV, and legacy unmatched rows to LEGACY_UNMATCHED_CSV.
 *
 * Matched-only CSV: same columns as retrieval. For each matched row, columns A,B,E,F,G,H,I
 * (id, canvas_user_id, email, enterprise, course_id, review_course_id, invited_date) and C,D
 * (first_name, last_name) come from the legacy file; J–O (earned_date, certificate_date,
 * file_number, retrieved_at, file_id, file_name) come from the retrieval row.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_OPS = process.env.CURSOR_OPS || join(__dirname, '..');
const OTTER_RESOURCES = join(CURSOR_OPS, '..', 'resources', 'otter');

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

function toKey(first, last) {
  return `${String(first || '').trim().toLowerCase()}|||${String(last || '').trim().toLowerCase()}`;
}

function main() {
  const legacyPath =
    process.env.LEGACY_CSV ||
    join(OTTER_RESOURCES, 'OTTER Legacy Data - Missing Cert Dates.csv');
  const retrievalPath =
    process.env.RETRIEVAL_CSV || join(OTTER_RESOURCES, 'otter_data_box_retrieval.csv');
  const outPath = process.env.OUT_CSV || retrievalPath;
  const matchedOnlyPath =
    process.env.MATCHED_ONLY_CSV ||
    join(dirname(retrievalPath), (basename(retrievalPath, '.csv') || 'out') + '_matched.csv');
  const legacyUnmatchedPath =
    process.env.LEGACY_UNMATCHED_CSV ||
    join(dirname(legacyPath), 'OTTER Legacy Data - Unmatched.csv');

  const legacyText = readFileSync(legacyPath, 'utf8');
  const legacyLines = legacyText.split(/\r?\n/).filter((l) => l.length > 0);
  const legacyHeader = parseCsvLine(legacyLines[0]);
  const firstIdx = legacyHeader.indexOf('first_name');
  const lastIdx = legacyHeader.indexOf('last_name');
  const canvasIdIdx = legacyHeader.indexOf('canvas_user_id');
  if (firstIdx < 0 || lastIdx < 0 || canvasIdIdx < 0) {
    console.error('Legacy CSV must have first_name, last_name, canvas_user_id columns');
    process.exit(1);
  }

  const map = new Map();
  for (let i = 1; i < legacyLines.length; i++) {
    const fields = parseCsvLine(legacyLines[i]);
    const first = fields[firstIdx];
    const last = fields[lastIdx];
    const canvasId = fields[canvasIdIdx];
    if (canvasId == null || canvasId === '') continue;
    const key = toKey(first, last);
    if (!map.has(key)) {
      const padded = [...fields];
      while (padded.length < 15) padded.push('');
      map.set(key, padded);
    }
  }
  console.error(`Legacy: ${legacyLines.length - 1} rows, ${map.size} unique first+last with canvas_user_id`);

  const retrievalText = readFileSync(retrievalPath, 'utf8');
  const retrievalLines = retrievalText.split(/\r?\n/);
  if (retrievalLines.length === 0) {
    console.error('Retrieval CSV is empty');
    process.exit(1);
  }
  const retrievalHeader = parseCsvLine(retrievalLines[0]);
  const rFirstIdx = retrievalHeader.indexOf('first_name');
  const rLastIdx = retrievalHeader.indexOf('last_name');
  const rCanvasIdIdx = retrievalHeader.indexOf('canvas_user_id');
  if (rFirstIdx < 0 || rLastIdx < 0 || rCanvasIdIdx < 0) {
    console.error('Retrieval CSV must have first_name, last_name, canvas_user_id columns');
    process.exit(1);
  }

  const outLines = [retrievalLines[0]];
  const matchedRows = [];
  const matchedLegacyKeys = new Set();
  let matched = 0;
  const quote = (f) => (f != null && /[",\r\n]/.test(String(f)) ? `"${String(f).replace(/"/g, '""')}"` : f);

  for (let i = 1; i < retrievalLines.length; i++) {
    const line = retrievalLines[i];
    if (!line.trim()) {
      outLines.push(line);
      continue;
    }
    const fields = parseCsvLine(line);
    const first = fields[rFirstIdx];
    const last = fields[rLastIdx];
    const key = toKey(first, last);
    const legacyRow = map.get(key);
    if (legacyRow != null) {
      matchedLegacyKeys.add(key);
      fields[rCanvasIdIdx] = legacyRow[1];
      matched++;
      const r = [...fields];
      while (r.length < 15) r.push('');
      const merged = [
        legacyRow[0],
        legacyRow[1],
        legacyRow[2],
        legacyRow[3],
        legacyRow[4],
        legacyRow[5],
        legacyRow[6],
        legacyRow[7],
        legacyRow[8],
        r[9],
        r[10],
        r[11],
        r[12],
        r[13],
        r[14],
      ];
      const quoteFileId = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
      matchedRows.push(merged.map((f, i) => (i === 13 ? quoteFileId(f) : quote(f))).join(','));
    }
    outLines.push(fields.map(quote).join(','));
  }

  const unmatchedLegacyRows = [];
  for (let i = 1; i < legacyLines.length; i++) {
    const fields = parseCsvLine(legacyLines[i]);
    const first = fields[firstIdx];
    const last = fields[lastIdx];
    const key = toKey(first, last);
    if (!matchedLegacyKeys.has(key)) {
      const padded = [...fields];
      while (padded.length < 15) padded.push('');
      unmatchedLegacyRows.push(padded.map(quote).join(','));
    }
  }

  writeFileSync(outPath, outLines.join('\n') + '\n', 'utf8');
  const matchedCsv = [retrievalLines[0], ...matchedRows].join('\n') + '\n';
  writeFileSync(matchedOnlyPath, matchedCsv, 'utf8');
  const unmatchedCsv = [legacyLines[0], ...unmatchedLegacyRows].join('\n') + '\n';
  writeFileSync(legacyUnmatchedPath, unmatchedCsv, 'utf8');
  console.error(`Retrieval: ${retrievalLines.length - 1} rows, ${matched} rows updated with canvas_user_id`);
  console.error(`Wrote ${outPath}`);
  console.error(`Wrote ${matchedOnlyPath} (${matched} matched rows)`);
  console.error(`Wrote ${legacyUnmatchedPath} (${unmatchedLegacyRows.length} unmatched legacy rows)`);
}

main();
