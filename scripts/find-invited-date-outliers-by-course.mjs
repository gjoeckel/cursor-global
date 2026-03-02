#!/usr/bin/env node
/**
 * Find invited_date values that are outliers within their course_id.
 * Uses IQR: outlier if date < Q1 - 1.5*IQR or > Q3 + 1.5*IQR (within same course_id).
 * Outputs row # and invited_date to stdout; also prints to stderr for logging.
 */

import { readFileSync } from 'fs';
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

  const text = readFileSync(inputPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const header = lines[0];
  const headerFields = parseCsvLine(header);
  const courseIdIdx = headerFields.indexOf('course_id');
  const invitedIdx = headerFields.indexOf('invited_date');
  const earnedIdx = headerFields.indexOf('earned_date');
  if (courseIdIdx < 0 || invitedIdx < 0) {
    console.error('Missing course_id or invited_date column');
    process.exit(1);
  }

  const YYYYMMDD = /^\d{4}-\d{2}-\d{2}$/;

  /** Compute mean lag (earned - invited) in days from rows with both */
  const lags = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    const invitedRaw = (fields[invitedIdx] ?? '').trim();
    const earnedRaw = (fields[earnedIdx] ?? '').trim();
    const inv = parseInvitedDate(invitedRaw);
    if (!inv || !earnedRaw || earnedRaw === '-' || !YYYYMMDD.test(earnedRaw)) continue;
    const earned = new Date(earnedRaw);
    if (Number.isNaN(earned.getTime())) continue;
    lags.push((earned.getTime() - inv.getTime()) / (24 * 60 * 60 * 1000));
  }
  const meanLagDays = lags.length > 0 ? lags.reduce((a, b) => a + b, 0) / lags.length : 0;

  /** course_id -> [{ rowNum, invitedStr, time, earnedStr }] */
  const byCourse = new Map();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    const courseId = (fields[courseIdIdx] ?? '').trim();
    const invitedStr = (fields[invitedIdx] ?? '').trim();
    const earnedStr = (fields[earnedIdx] ?? '').trim();
    const d = parseInvitedDate(invitedStr);
    if (!courseId || !d) continue;
    const rowNum = i + 1;
    if (!byCourse.has(courseId)) byCourse.set(courseId, []);
    byCourse.get(courseId).push({ rowNum, invitedStr, time: d.getTime(), earnedStr });
  }

  /** course_id -> median invited timestamp */
  const medianByCourse = new Map();
  for (const [courseId, arr] of byCourse) {
    const sorted = arr.map((x) => x.time).sort((a, b) => a - b);
    const m = median(sorted);
    if (m != null) medianByCourse.set(courseId, m);
  }

  const results = [];
  for (const [courseId, arr] of byCourse) {
    if (arr.length < 2) continue;
    const sorted = arr.map((x) => x.time).sort((a, b) => a - b);
    const { q1, q3, iqr } = quartiles(sorted);
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    const med = medianByCourse.get(courseId);
    const proxyStr = med != null ? toYYYYMMDD(med) : '';
    for (const { rowNum, invitedStr, time, earnedStr } of arr) {
      if (time < lower || time > upper) {
        let proxyByLag = '';
        if (earnedStr && earnedStr !== '-' && YYYYMMDD.test(earnedStr)) {
          const earnedTime = new Date(earnedStr).getTime();
          const proxyTime = earnedTime - meanLagDays * 24 * 60 * 60 * 1000;
          proxyByLag = toYYYYMMDD(proxyTime);
        }
        results.push({
          rowNum,
          invitedStr,
          courseId,
          proxyInvitedDate: proxyStr,
          creationLogic: 'Median invited_date for course_id',
          proxyInvitedByLag: proxyByLag,
          creationLogicLag: `earned_date minus mean lag (${meanLagDays.toFixed(1)} days)`,
        });
      }
    }
  }

  results.sort((a, b) => a.rowNum - b.rowNum);

  const sep = ' | ';
  const headerRow = ['Row #', 'invited_date', 'proxy_invited_date', 'creation_logic', 'proxy_invited_date_by_lag', 'creation_logic_lag'].join(sep);
  const rows = results.map((r) =>
    [r.rowNum, r.invitedStr, r.proxyInvitedDate, r.creationLogic, r.proxyInvitedByLag, r.creationLogicLag].join(sep)
  );
  console.log(headerRow);
  rows.forEach((line) => console.log(line));

  if (results.length > 0) {
    console.error(`Found ${results.length} invited_date outlier(s) with proxy column.`);
  } else {
    console.error('No invited_date outliers found (IQR method, 1.5×).');
  }
}

main();
