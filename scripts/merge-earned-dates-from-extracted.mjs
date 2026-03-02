#!/usr/bin/env node
/**
 * For otterSheet rows 2–301: match by first_name + last_name to extractedSheet,
 * fill earned_date (column J) from match, or "nomatch" if no match. Write updated otterSheet.
 *
 * Column structure (otterSheet): A=id, B=canvas_user_id, C=first_name, D=last_name,
 * E=email, F=enterprise, G=course_id, H=review_course_id, I=invited_date, J=earned_date,
 * K=certificate_date, L=certificate_date_multi.
 *
 * Run from cursor-ops:
 *   node scripts/merge-earned-dates-from-extracted.mjs
 *
 * Env (optional):
 *   OTTER_SHEET   — path to otterSheet.csv
 *   EXTRACTED_SHEET — path to extractedSheet.csv
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
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

function nameKey(first, last) {
  return `${(first || '').trim().toLowerCase()}|${(last || '').trim().toLowerCase()}`;
}

function main() {
  const otterPath = process.env.OTTER_SHEET || join(OTTER_RESOURCES, 'otterSheet.csv');
  const extractedPath = process.env.EXTRACTED_SHEET || join(OTTER_RESOURCES, 'extractedSheet.csv');

  const extractedText = readFileSync(extractedPath, 'utf8');
  const extractedLines = extractedText.split(/\r?\n/);
  const extHeader = parseCsvLine(extractedLines[0] || '');
  const extFirstIdx = extHeader.indexOf('first_name');
  const extLastIdx = extHeader.indexOf('last_name');
  const extEarnedIdx = extHeader.indexOf('earned_date');
  if (extFirstIdx < 0 || extLastIdx < 0 || extEarnedIdx < 0) {
    console.error('extractedSheet missing first_name, last_name, or earned_date');
    process.exit(1);
  }

  // Build lookup: (first_name, last_name) -> earned_date (first occurrence)
  const earnedByNames = new Map();
  for (let i = 1; i < extractedLines.length; i++) {
    const line = extractedLines[i];
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    const first = (fields[extFirstIdx] ?? '').trim().toLowerCase();
    const last = (fields[extLastIdx] ?? '').trim().toLowerCase();
    const key = nameKey(first, last);
    if (!earnedByNames.has(key)) {
      const earned = (fields[extEarnedIdx] ?? '').trim();
      earnedByNames.set(key, earned || '');
    }
  }

  const otterText = readFileSync(otterPath, 'utf8');
  const otterLines = otterText.split(/\r?\n/);
  const otterHeader = parseCsvLine(otterLines[0] || '');
  const otterFirstIdx = otterHeader.indexOf('first_name');
  const otterLastIdx = otterHeader.indexOf('last_name');
  const otterEarnedIdx = otterHeader.indexOf('earned_date');
  const otterCanvasIdx = otterHeader.indexOf('canvas_user_id');
  if (otterFirstIdx < 0 || otterLastIdx < 0 || otterEarnedIdx < 0) {
    console.error('otterSheet missing first_name, last_name, or earned_date');
    process.exit(1);
  }

  // Rows 2–301 (1-based) = line indices 1–300
  const outLines = [otterLines[0]];
  let matched = 0;
  let noMatch = 0;

  for (let i = 1; i < otterLines.length; i++) {
    const line = otterLines[i];
    if (!line.trim()) {
      outLines.push(line);
      continue;
    }
    const fields = parseCsvLine(line);
    while (fields.length <= otterEarnedIdx) fields.push('');

    if (i >= 1 && i <= 300) {
      const first = (fields[otterFirstIdx] ?? '').trim().toLowerCase();
      const last = (fields[otterLastIdx] ?? '').trim().toLowerCase();
      const key = nameKey(first, last);
      const canvasUserId = (fields[otterCanvasIdx] ?? '').trim();
      const earned = earnedByNames.get(key);
      if (earned !== undefined && earned !== '') {
        fields[otterEarnedIdx] = earned;
        matched++;
      } else {
        fields[otterEarnedIdx] = 'nomatch';
        noMatch++;
      }
    }

    outLines.push(fields.map(quoteCsvField).join(','));
  }

  writeFileSync(otterPath, outLines.join('\n') + '\n', 'utf8');
  console.error(`Rows 2–301: ${matched} matched, ${noMatch} nomatch. Wrote ${otterPath}`);
}

main();
