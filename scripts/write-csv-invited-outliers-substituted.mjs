#!/usr/bin/env node
/**
 * Write a new CSV with invited_date substituted by median proxy for outlier rows (by course_id IQR).
 * All other cells unchanged. Uses same outlier and median logic as find-invited-date-outliers-by-course.mjs.
 *
 * Run from cursor-ops:
 *   node scripts/write-csv-invited-outliers-substituted.mjs
 *
 * Env (optional):
 *   INPUT_CSV  — input CSV (default: ../resources/otter/OTTER_missing_dates_with_file_urls_earned_with_proxy_invited_proxy.csv)
 *   OUT_CSV    — output CSV (default: same dir, basename_invited_outliers_substituted.csv)
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

function quoteCsvField(value) {
  if (value == null) return '';
  const s = String(value);
  if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

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

function quartiles(sortedArr) {
  const n = sortedArr.length;
  if (n === 0) return { q1: 0, q3: 0, iqr: 0 };
  const q1 = sortedArr[Math.floor(n * 0.25)];
  const q3 = sortedArr[Math.floor(n * 0.75)];
  return { q1, q3, iqr: q3 - q1 };
}

function median(sortedArr) {
  const n = sortedArr.length;
  if (n === 0) return null;
  const mid = n >> 1;
  return n % 2 === 1 ? sortedArr[mid] : (sortedArr[mid - 1] + sortedArr[mid]) / 2;
}

function toYYYYMMDD(time) {
  const d = new Date(time);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function main() {
  const inputPath =
    process.env.INPUT_CSV ||
    join(OTTER_RESOURCES, 'OTTER_missing_dates_with_file_urls_earned_with_proxy_invited_proxy.csv');
  const outPath =
    process.env.OUT_CSV ||
    join(dirname(inputPath), (basename(inputPath, '.csv') || 'input') + '_invited_outliers_substituted.csv');

  const text = readFileSync(inputPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const header = lines[0];
  const headerFields = parseCsvLine(header);
  const courseIdIdx = headerFields.indexOf('course_id');
  const invitedIdx = headerFields.indexOf('invited_date');
  if (courseIdIdx < 0 || invitedIdx < 0) {
    console.error('Missing course_id or invited_date column');
    process.exit(1);
  }

  /** course_id -> [{ rowNum, time }] */
  const byCourse = new Map();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    const courseId = (fields[courseIdIdx] ?? '').trim();
    const invitedStr = (fields[invitedIdx] ?? '').trim();
    const d = parseInvitedDate(invitedStr);
    if (!courseId || !d) continue;
    const rowNum = i + 1;
    if (!byCourse.has(courseId)) byCourse.set(courseId, []);
    byCourse.get(courseId).push({ rowNum, time: d.getTime() });
  }

  /** course_id -> median invited timestamp */
  const medianByCourse = new Map();
  for (const [courseId, arr] of byCourse) {
    const sorted = arr.map((x) => x.time).sort((a, b) => a - b);
    const m = median(sorted);
    if (m != null) medianByCourse.set(courseId, m);
  }

  /** rowNum (1-based) -> substitute invited_date (YYYY-MM-DD) */
  const substituteByRow = new Map();
  for (const [courseId, arr] of byCourse) {
    if (arr.length < 2) continue;
    const sorted = arr.map((x) => x.time).sort((a, b) => a - b);
    const { q1, q3, iqr } = quartiles(sorted);
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    const proxyStr = medianByCourse.get(courseId) != null ? toYYYYMMDD(medianByCourse.get(courseId)) : '';
    if (!proxyStr) continue;
    for (const { rowNum, time } of arr) {
      if (time < lower || time > upper) substituteByRow.set(rowNum, proxyStr);
    }
  }

  const outLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      outLines.push(line);
      continue;
    }
    const fields = parseCsvLine(line);
    const rowNum = i + 1;
    if (substituteByRow.has(rowNum)) {
      while (fields.length <= invitedIdx) fields.push('');
      fields[invitedIdx] = substituteByRow.get(rowNum);
    }
    outLines.push(fields.map(quoteCsvField).join(','));
  }

  writeFileSync(outPath, outLines.join('\n') + '\n', 'utf8');
  console.error(`Substituted invited_date for ${substituteByRow.size} outlier row(s).`);
  console.error(`Wrote ${outPath}`);
}

main();
