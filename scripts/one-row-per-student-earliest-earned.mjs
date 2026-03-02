#!/usr/bin/env node
/**
 * From a matched-with-earned CSV, keep one row per student: the row with the earliest earned_date.
 *
 * Run from cursor-ops:
 *   node scripts/one-row-per-student-earliest-earned.mjs
 *
 * Env (optional):
 *   INPUT_CSV  — input CSV with possible duplicate students (default: ../resources/otter/otter_data_box_retrieval_matched_with_earned.csv)
 *   OUT_CSV   — output path (default: same dir, basename_one_per_student.csv)
 *
 * Groups by canvas_user_id (column B). For each student, keeps the row with the minimum earned_date (column J).
 * Rows with empty earned_date are ordered after any dated row.
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

function quote(f) {
  if (f == null) return '';
  const s = String(f);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function quoteFileId(v) {
  return '"' + String(v ?? '').replace(/"/g, '""') + '"';
}

function main() {
  const inputPath =
    process.env.INPUT_CSV ||
    join(OTTER_RESOURCES, 'otter_data_box_retrieval_matched_with_earned.csv');
  const outPath =
    process.env.OUT_CSV ||
    join(dirname(inputPath), (basename(inputPath, '.csv') || 'input') + '_one_per_student.csv');

  const text = readFileSync(inputPath, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) {
    console.error('Input CSV has no data rows');
    process.exit(1);
  }

  const header = lines[0];
  const headerFields = parseCsvLine(header);
  const canvasUserIdIdx = headerFields.indexOf('canvas_user_id');
  const earnedDateIdx = headerFields.indexOf('earned_date');
  const fileIdIdx = headerFields.indexOf('file_id');

  if (canvasUserIdIdx < 0 || earnedDateIdx < 0) {
    console.error('Input CSV must have canvas_user_id and earned_date columns');
    process.exit(1);
  }

  const byStudent = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    const canvasUserId = (fields[canvasUserIdIdx] ?? '').trim();
    const earnedDate = (fields[earnedDateIdx] ?? '').trim();

    const key = canvasUserId || `row_${i}`;
    const existing = byStudent.get(key);
    const earnedForCompare = earnedDate && /^\d{4}-\d{2}-\d{2}$/.test(earnedDate) ? earnedDate : '\uffff';

    if (!existing || earnedForCompare < (existing.earnedForCompare ?? '\uffff')) {
      byStudent.set(key, { fields, earnedForCompare });
    }
  }

  const outLines = [header];
  for (const [, { fields }] of byStudent) {
    while (fields.length < 15) fields.push('');
    const line = fields.map((f, i) => (i === fileIdIdx ? quoteFileId(f) : quote(f))).join(',');
    outLines.push(line);
  }

  writeFileSync(outPath, outLines.join('\n') + '\n', 'utf8');
  console.error(`Input: ${lines.length - 1} rows → Output: ${byStudent.size} rows (one per student, earliest earned_date)`);
  console.error(`Wrote ${outPath}`);
}

main();
