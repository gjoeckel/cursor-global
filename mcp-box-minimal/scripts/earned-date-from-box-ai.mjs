#!/usr/bin/env node
/**
 * Fill earned_date (column J) in the matched CSV by asking Box AI for the date from each PDF.
 *
 * Run from cursor-ops:
 *   source config/box.env && node mcp-box-minimal/scripts/earned-date-from-box-ai.mjs
 *
 * Env (optional):
 *   MATCHED_CSV — input matched CSV (default: ../resources/otter/otter_data_box_retrieval_matched.csv)
 *   OUT_CSV — output CSV with earned_date filled (default: same dir, otter_data_box_retrieval_matched_with_earned.csv)
 *   BOX_AI_DELAY_MS — delay in ms between Box AI calls (default: 200; stay under rate limits)
 *   OTTER_EARNED_MAX — process only first N rows (for testing)
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';
import { readFileSync, writeFileSync } from 'fs';
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

function normalizeFileId(val) {
  if (val == null || val === '') return '';
  const s = String(val).trim();
  const n = parseFloat(s);
  if (!Number.isNaN(n) && s.toUpperCase().includes('E')) return String(Math.round(n));
  return s;
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

  const matchedPath =
    process.env.MATCHED_CSV ||
    join(OTTER_RESOURCES, 'otter_data_box_retrieval_matched.csv');
  const outPath =
    process.env.OUT_CSV ||
    join(dirname(matchedPath), (basename(matchedPath, '.csv') || 'matched') + '_with_earned.csv');
  const delayMs = process.env.BOX_AI_DELAY_MS != null ? parseInt(process.env.BOX_AI_DELAY_MS, 10) : 200;
  const maxRows = process.env.OTTER_EARNED_MAX != null ? parseInt(process.env.OTTER_EARNED_MAX, 10) : null;

  const auth = new BoxDeveloperTokenAuth({ token });
  const client = new BoxClient({ auth });

  const text = readFileSync(matchedPath, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) {
    console.error('Matched CSV has no data rows');
    process.exit(1);
  }
  const header = lines[0];
  const headerFields = parseCsvLine(header);
  const fileIdIdx = headerFields.indexOf('file_id');
  const earnedDateIdx = headerFields.indexOf('earned_date');
  if (fileIdIdx < 0 || earnedDateIdx < 0) {
    console.error('Matched CSV must have file_id and earned_date columns');
    process.exit(1);
  }

  const outLines = [header];
  const total = maxRows != null ? Math.min(maxRows, lines.length - 1) : lines.length - 1;
  if (maxRows != null) console.error(`Processing first ${total} rows (OTTER_EARNED_MAX=${maxRows})`);

  for (let i = 1; i < lines.length; i++) {
    if (maxRows != null && i > maxRows) break;
    const line = lines[i];
    if (!line.trim()) {
      outLines.push(line);
      continue;
    }
    const fields = parseCsvLine(line);
    while (fields.length < 15) fields.push('');
    const fileId = normalizeFileId(fields[fileIdIdx]);
    let earnedDate = (fields[earnedDateIdx] || '').trim();
    if (fileId) {
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
    if (i % 10 === 0 || i === lines.length - 1) console.error(`Processed ${i}/${lines.length - 1}`);
  }

  writeFileSync(outPath, outLines.join('\n') + '\n', 'utf8');
  console.error(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
