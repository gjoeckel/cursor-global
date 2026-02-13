#!/usr/bin/env node
/**
 * Fill earned_date (column J) by asking Box AI for the completion date from each PDF.
 * Input: CSV with file_url in column L (e.g. OTTER_missing_dates_with_file_urls.csv).
 * Extracts file_id from file_url, calls Box AI, writes YYYY-MM-DD to column J.
 * Output: new CSV with all data retained and earned_date filled where available.
 *
 * Run from cursor-ops:
 *   source config/box.env && node mcp-box-minimal/scripts/earned-date-from-box-ai-missing-dates.mjs
 *
 * Env (optional):
 *   INPUT_CSV  — input CSV with file_url column (default: ../resources/otter/OTTER_missing_dates_with_file_urls.csv)
 *   OUT_CSV    — output CSV (default: same dir, basename_earned.csv)
 *   BOX_AI_DELAY_MS — delay in ms between Box AI calls (default: 200)
 *   OTTER_EARNED_MAX — process only first N rows (for testing)
 *   OTTER_ROWS_WITH_FILE_URL — when CSV is sorted with file_url rows first, set to 162 so only those rows get Box AI; remaining rows are appended unchanged
 *   RESUME — if 1 or true, read OUT_CSV and skip rows that already have earned_date (no re-call Box AI)
 *
 * Writes the output file after each row so progress is not lost if the run is interrupted.
 * Exemplar certificate format: date on its own line after course name (e.g. "June 23, 2022", "February 10, 2026").
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_OPS = process.env.CURSOR_OPS || join(__dirname, '..', '..');
const OTTER_RESOURCES = join(CURSOR_OPS, '..', 'resources', 'otter');

const EARNED_DATE_PROMPT =
  'This is a Certificate of Completion. The completion date appears on its own line after the course or program name (e.g. "June 23, 2022" or "February 10, 2026"). What is that date? Reply with only the date in YYYY-MM-DD format. If no date is found, reply UNKNOWN.';

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

/** Extract Box file ID from app URL: https://app.box.com/file/1234567890 */
function fileIdFromFileUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return '';
  const m = fileUrl.trim().match(/\/file\/(\d+)/);
  return m ? m[1] : '';
}

function extractYYYYMMDD(text) {
  if (!text || typeof text !== 'string') return '';
  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return iso[0];
  const d = new Date(text);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return '';
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function quote(f) {
  if (f == null) return '';
  const s = String(f);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const token = process.env.BOX_ACCESS_TOKEN;
  if (!token) {
    console.error('Missing BOX_ACCESS_TOKEN. Run: source config/box.env from cursor-ops');
    process.exit(1);
  }

  const inputPath =
    process.env.INPUT_CSV ||
    join(OTTER_RESOURCES, 'OTTER_missing_dates_with_file_urls.csv');
  const outPath =
    process.env.OUT_CSV ||
    join(dirname(inputPath), (basename(inputPath, '.csv') || 'input') + '_earned.csv');
  const delayMs = process.env.BOX_AI_DELAY_MS != null ? parseInt(process.env.BOX_AI_DELAY_MS, 10) : 200;
  const maxRows = process.env.OTTER_EARNED_MAX != null ? parseInt(process.env.OTTER_EARNED_MAX, 10) : null;
  const rowsWithFileUrl = process.env.OTTER_ROWS_WITH_FILE_URL != null ? parseInt(process.env.OTTER_ROWS_WITH_FILE_URL, 10) : null;
  const resume = /^(1|true|yes)$/i.test(process.env.RESUME || '');

  const auth = new BoxDeveloperTokenAuth({ token });
  const client = new BoxClient({ auth });

  const text = readFileSync(inputPath, 'utf8');
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) {
    console.error('Input CSV has no data rows');
    process.exit(1);
  }

  const header = lines[0];
  const headerFields = parseCsvLine(header);
  const fileUrlIdx = headerFields.indexOf('file_url');
  const earnedDateIdx = headerFields.indexOf('earned_date');
  if (fileUrlIdx < 0 || earnedDateIdx < 0) {
    console.error('Input CSV must have file_url and earned_date columns');
    process.exit(1);
  }

  /** When resuming: row index (1-based data row) -> earned_date from existing output file */
  const existingEarnedByRow = new Map();
  if (resume && existsSync(outPath)) {
    const existingText = readFileSync(outPath, 'utf8');
    const existingLines = existingText.split(/\r?\n/);
    const existingHeader = parseCsvLine(existingLines[0] || '');
    const existingEarnedIdx = existingHeader.indexOf('earned_date');
    if (existingEarnedIdx >= 0) {
      for (let r = 1; r < existingLines.length; r++) {
        const row = parseCsvLine(existingLines[r]);
        const ed = (row[existingEarnedIdx] || '').trim();
        if (ed && /^\d{4}-\d{2}-\d{2}$/.test(ed)) existingEarnedByRow.set(r, ed);
      }
      console.error(`Resume: found ${existingEarnedByRow.size} existing earned_date(s) in ${outPath}`);
    }
  }

  const outLines = [header];
  const processLimit = maxRows != null ? maxRows : (rowsWithFileUrl != null ? rowsWithFileUrl : lines.length - 1);
  if (rowsWithFileUrl != null) console.error(`Scoped to first ${rowsWithFileUrl} rows (with file_url); remaining rows appended unchanged.`);
  if (maxRows != null) console.error(`Processing first ${maxRows} rows (OTTER_EARNED_MAX=${maxRows})`);

  function flushOutput() {
    writeFileSync(outPath, outLines.join('\n') + '\n', 'utf8');
  }

  for (let i = 1; i < lines.length; i++) {
    if (i > processLimit) break;
    const line = lines[i];
    if (!line.trim()) {
      outLines.push(line);
      flushOutput();
      continue;
    }
    const fields = parseCsvLine(line);
    while (fields.length <= earnedDateIdx) fields.push('');
    const fileUrl = (fields[fileUrlIdx] || '').trim();
    const fileId = fileIdFromFileUrl(fileUrl);
    let earnedDate = (fields[earnedDateIdx] || '').trim();

    if (resume && existingEarnedByRow.has(i)) {
      earnedDate = existingEarnedByRow.get(i);
    } else if (fileId) {
      try {
        const response = await client.ai.createAiAsk({
          mode: 'single_item_qa',
          prompt: EARNED_DATE_PROMPT,
          items: [{ id: fileId, type: 'file' }],
        });
        const answer = (response && (response.answer ?? response.message)) || '';
        const extracted = extractYYYYMMDD(answer);
        if (extracted) earnedDate = extracted;
        if (delayMs > 0) await sleep(delayMs);
      } catch (err) {
        console.error(`Row ${i} file_id=${fileId}: ${err.message || err}`);
      }
    }

    fields[earnedDateIdx] = earnedDate;
    outLines.push(fields.map(quote).join(','));
    flushOutput();
    if (i % 10 === 0 || i === processLimit) console.error(`Processed ${i}/${processLimit} (Box AI rows)`);
  }

  if (rowsWithFileUrl != null && lines.length - 1 > rowsWithFileUrl) {
    for (let i = rowsWithFileUrl + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) {
        outLines.push(line);
      } else {
        const fields = parseCsvLine(line);
        outLines.push(fields.map(quote).join(','));
      }
      flushOutput();
    }
    console.error(`Appended ${lines.length - 1 - rowsWithFileUrl} rows without file_url.`);
  }

  console.error(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
