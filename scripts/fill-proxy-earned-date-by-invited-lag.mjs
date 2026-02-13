#!/usr/bin/env node
/**
 * Fill earned_date "-" placeholders using mean lag (earned_date - invited_date) from rows that have both.
 * For each row with earned_date = "-", set earned_date = invited_date + mean_lag_days (YYYY-MM-DD).
 *
 * Run from cursor-ops:
 *   node scripts/fill-proxy-earned-date-by-invited-lag.mjs
 *
 * Env (optional):
 *   INPUT_CSV  — input CSV with "-" in earned_date (default: ../resources/otter/OTTER_missing_dates_with_file_urls_earned_with_proxy.csv)
 *   OUT_CSV    — output CSV (default: same dir, basename_invited_proxy.csv)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURSOR_OPS = process.env.CURSOR_OPS || join(__dirname, '..');
const OTTER_RESOURCES = join(CURSOR_OPS, '..', 'resources', 'otter');

const YYYYMMDD = /^\d{4}-\d{2}-\d{2}$/;

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

/** Parse invited_date: YYYY-MM-DD or M/D/YY or M/D/YYYY. Returns Date or null. */
function parseInvitedDate(val) {
  if (!val || typeof val !== 'string') return null;
  const s = val.trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const d = new Date(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const month = parseInt(slash[1], 10) - 1;
    const day = parseInt(slash[2], 10);
    let year = parseInt(slash[3], 10);
    if (year < 100) year += year >= 50 ? 1900 : 2000;
    const d = new Date(year, month, day);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Format Date as YYYY-MM-DD */
function toYYYYMMDD(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function main() {
  const inputPath =
    process.env.INPUT_CSV ||
    join(OTTER_RESOURCES, 'OTTER_missing_dates_with_file_urls_earned_with_proxy.csv');
  const outPath =
    process.env.OUT_CSV ||
    join(dirname(inputPath), (basename(inputPath, '.csv') || 'input') + '_invited_proxy.csv');

  const text = readFileSync(inputPath, 'utf8');
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) {
    console.error('Input CSV has no data rows');
    process.exit(1);
  }

  const header = lines[0];
  const headerFields = parseCsvLine(header);
  const invitedIdx = headerFields.indexOf('invited_date');
  const earnedIdx = headerFields.indexOf('earned_date');
  if (invitedIdx < 0 || earnedIdx < 0) {
    console.error('Input CSV must have invited_date and earned_date columns');
    process.exit(1);
  }

  const lags = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    const invitedRaw = (fields[invitedIdx] ?? '').trim();
    const earnedRaw = (fields[earnedIdx] ?? '').trim();
    const invitedDate = parseInvitedDate(invitedRaw);
    if (!invitedDate) continue;
    if (!earnedRaw || earnedRaw === '-' || !YYYYMMDD.test(earnedRaw)) continue;
    const earnedDate = new Date(earnedRaw);
    if (Number.isNaN(earnedDate.getTime())) continue;
    const lagMs = earnedDate.getTime() - invitedDate.getTime();
    lags.push(lagMs / (24 * 60 * 60 * 1000));
  }

  const meanLagDays = lags.length > 0 ? lags.reduce((a, b) => a + b, 0) / lags.length : 0;
  console.error(`Mean lag (earned - invited): ${meanLagDays.toFixed(1)} days (from ${lags.length} rows with both dates)`);

  const outLines = [header];
  let filled = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      outLines.push(line);
      continue;
    }
    const fields = parseCsvLine(line);
    while (fields.length <= earnedIdx) fields.push('');
    const invitedRaw = (fields[invitedIdx] ?? '').trim();
    let earnedDate = (fields[earnedIdx] ?? '').trim();

    if (earnedDate === '-' || !earnedDate || !YYYYMMDD.test(earnedDate)) {
      const invitedDate = parseInvitedDate(invitedRaw);
      if (invitedDate) {
        const proxyDate = new Date(invitedDate.getTime() + meanLagDays * 24 * 60 * 60 * 1000);
        fields[earnedIdx] = toYYYYMMDD(proxyDate);
        filled++;
      } else {
        fields[earnedIdx] = '-';
      }
    }

    outLines.push(fields.map(quoteCsvField).join(','));
  }

  writeFileSync(outPath, outLines.join('\n') + '\n', 'utf8');
  console.error(`Filled ${filled} proxy earned_date(s) using invited_date + mean lag.`);
  console.error(`Wrote ${outPath}`);
}

main();
