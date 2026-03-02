#!/usr/bin/env node
/**
 * Fill empty earned_date (column J) with proxy = average earned_date for that course_id (column G).
 * Reads earned CSV, computes per-course average (calendar date), fills blanks with that average or "-".
 * Writes a new CSV with all data retained and column J updated.
 *
 * Run from cursor-ops:
 *   node scripts/fill-proxy-earned-date-by-course.mjs
 *
 * Env (optional):
 *   INPUT_CSV  — input CSV (default: ../resources/otter/OTTER_missing_dates_with_file_urls_earned.csv)
 *   OUT_CSV    — output CSV (default: same dir, basename_with_proxy.csv)
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

/** Average calendar dates: parse as Date, average getTime(), then format as YYYY-MM-DD. */
function averageDateStrings(dateStrings) {
  const valid = dateStrings.filter((s) => s && YYYYMMDD.test(String(s).trim()));
  if (valid.length === 0) return null;
  let sum = 0;
  for (const s of valid) {
    const d = new Date(s.trim());
    if (!Number.isNaN(d.getTime())) sum += d.getTime();
  }
  if (valid.length === 0) return null;
  const avg = sum / valid.length;
  return new Date(avg).toISOString().slice(0, 10);
}

function main() {
  const inputPath =
    process.env.INPUT_CSV ||
    join(OTTER_RESOURCES, 'OTTER_missing_dates_with_file_urls_earned.csv');
  const outPath =
    process.env.OUT_CSV ||
    join(dirname(inputPath), (basename(inputPath, '.csv') || 'input') + '_with_proxy.csv');

  const text = readFileSync(inputPath, 'utf8');
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) {
    console.error('Input CSV has no data rows');
    process.exit(1);
  }

  const header = lines[0];
  const headerFields = parseCsvLine(header);
  const courseIdIdx = headerFields.indexOf('course_id');
  const earnedDateIdx = headerFields.indexOf('earned_date');
  if (courseIdIdx < 0 || earnedDateIdx < 0) {
    console.error('Input CSV must have course_id and earned_date columns');
    process.exit(1);
  }

  /** course_id -> array of earned_date strings (YYYY-MM-DD only) */
  const datesByCourse = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    const courseId = (fields[courseIdIdx] ?? '').trim();
    const earnedDate = (fields[earnedDateIdx] ?? '').trim();
    if (!courseId) continue;
    if (earnedDate && YYYYMMDD.test(earnedDate)) {
      if (!datesByCourse.has(courseId)) datesByCourse.set(courseId, []);
      datesByCourse.get(courseId).push(earnedDate);
    }
  }

  /** course_id -> average date as YYYY-MM-DD, or null */
  const avgByCourse = new Map();
  for (const [courseId, arr] of datesByCourse) {
    const avg = averageDateStrings(arr);
    if (avg) avgByCourse.set(courseId, avg);
  }

  const outLines = [header];
  let filled = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      outLines.push(line);
      continue;
    }
    const fields = parseCsvLine(line);
    while (fields.length <= earnedDateIdx) fields.push('');
    const courseId = (fields[courseIdIdx] ?? '').trim();
    let earnedDate = (fields[earnedDateIdx] ?? '').trim();

    if (!earnedDate || !YYYYMMDD.test(earnedDate)) {
      const proxy = courseId ? (avgByCourse.get(courseId) ?? '-') : '-';
      fields[earnedDateIdx] = proxy;
      if (proxy !== '-') filled++;
    }

    outLines.push(fields.map(quoteCsvField).join(','));
  }

  writeFileSync(outPath, outLines.join('\n') + '\n', 'utf8');
  console.error(`Filled ${filled} proxy earned_date(s) by course_id average.`);
  console.error(`Wrote ${outPath}`);
}

main();
