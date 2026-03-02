#!/usr/bin/env node
/**
 * Two-pass less strict matching for otterSheet_nomatch.csv:
 * Pass 1: first_name exact + last_name substring match (handles hyphenated/compound names)
 * Pass 2: first initial + last_name exact, or first_name exact + last_name prefix match
 * Fill earned_date from extractedSheet, set "nomatch" for remaining empty cells.
 * Output: otterSheet_less_strict_extracted.csv
 *
 * Run from cursor-ops:
 *   node scripts/merge-earned-dates-less-strict.mjs
 *
 * Env (optional):
 *   NOMATCH_SHEET   — input path (default: ../resources/otter/otterSheet_nomatch.csv)
 *   EXTRACTED_SHEET — lookup path (default: ../resources/otter/extractedSheet.csv)
 *   OUT_CSV         — output path (default: ../resources/otter/otterSheet_less_strict_extracted.csv)
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
  const nomatchPath = process.env.NOMATCH_SHEET || join(OTTER_RESOURCES, 'otterSheet_nomatch.csv');
  const extractedPath = process.env.EXTRACTED_SHEET || join(OTTER_RESOURCES, 'extractedSheet.csv');
  const outPath = process.env.OUT_CSV || join(OTTER_RESOURCES, 'otterSheet_less_strict_extracted.csv');

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

  // Build lookup: exact name key -> earned_date (first occurrence)
  const earnedByNames = new Map();
  // Also build: first_name -> [{last_name, earned_date}] for substring matching
  const byFirstName = new Map();
  // Also build: first initial + last_name -> earned_date for pass 2
  const byInitialLast = new Map();
  // Also build: first_name + last_name prefix (3+ chars) -> earned_date
  const byFirstLastPrefix = new Map();

  for (let i = 1; i < extractedLines.length; i++) {
    const line = extractedLines[i];
    if (!line.trim()) continue;
    const fields = parseCsvLine(line);
    const first = (fields[extFirstIdx] ?? '').trim().toLowerCase();
    const last = (fields[extLastIdx] ?? '').trim().toLowerCase();
    const earned = (fields[extEarnedIdx] ?? '').trim();
    if (!first || !last || !earned) continue;

    const key = nameKey(first, last);
    if (!earnedByNames.has(key)) {
      earnedByNames.set(key, earned);
    }

    if (!byFirstName.has(first)) {
      byFirstName.set(first, []);
    }
    byFirstName.get(first).push({ last, earned });

    const initial = first[0] || '';
    const initialLastKey = `${initial}|${last}`;
    if (!byInitialLast.has(initialLastKey)) {
      byInitialLast.set(initialLastKey, earned);
    }

    if (last.length >= 3) {
      const prefix = last.substring(0, 3);
      const prefixKey = `${first}|${prefix}`;
      if (!byFirstLastPrefix.has(prefixKey)) {
        byFirstLastPrefix.set(prefixKey, earned);
      }
    }
  }

  const nomatchText = readFileSync(nomatchPath, 'utf8');
  const nomatchLines = nomatchText.split(/\r?\n/);
  const nomatchHeader = parseCsvLine(nomatchLines[0] || '');
  const nomatchFirstIdx = nomatchHeader.indexOf('first_name');
  const nomatchLastIdx = nomatchHeader.indexOf('last_name');
  const nomatchEarnedIdx = nomatchHeader.indexOf('earned_date');
  if (nomatchFirstIdx < 0 || nomatchLastIdx < 0 || nomatchEarnedIdx < 0) {
    console.error('nomatchSheet missing first_name, last_name, or earned_date');
    process.exit(1);
  }

  const outLines = [nomatchLines[0]];
  let pass1Matched = 0;
  let pass2Matched = 0;
  let finalNomatch = 0;

  for (let i = 1; i < nomatchLines.length; i++) {
    const line = nomatchLines[i];
    if (!line.trim()) {
      outLines.push(line);
      continue;
    }
    const fields = parseCsvLine(line);
    while (fields.length <= nomatchEarnedIdx) fields.push('');

    const first = (fields[nomatchFirstIdx] ?? '').trim().toLowerCase();
    const last = (fields[nomatchLastIdx] ?? '').trim().toLowerCase();
    let earned = '';

    // Pass 1: first_name exact + last_name substring match
    if (first && last) {
      const candidates = byFirstName.get(first);
      if (candidates) {
        for (const { last: extLast, earned: extEarned } of candidates) {
          if (extLast.includes(last) || last.includes(extLast)) {
            earned = extEarned;
            pass1Matched++;
            break;
          }
        }
      }
    }

    // Pass 2: first initial + last_name exact, or first_name exact + last_name prefix
    if (!earned && first && last) {
      const initial = first[0] || '';
      const initialLastKey = `${initial}|${last}`;
      if (byInitialLast.has(initialLastKey)) {
        earned = byInitialLast.get(initialLastKey);
        pass2Matched++;
      } else if (last.length >= 3) {
        const prefix = last.substring(0, 3);
        const prefixKey = `${first}|${prefix}`;
        if (byFirstLastPrefix.has(prefixKey)) {
          earned = byFirstLastPrefix.get(prefixKey);
          pass2Matched++;
        }
      }
    }

    if (!earned) {
      earned = 'nomatch';
      finalNomatch++;
    }

    fields[nomatchEarnedIdx] = earned;
    outLines.push(fields.map(quoteCsvField).join(','));
  }

  writeFileSync(outPath, outLines.join('\n') + '\n', 'utf8');
  console.error(`Pass 1 (substring match): ${pass1Matched} matched`);
  console.error(`Pass 2 (initial/prefix): ${pass2Matched} matched`);
  console.error(`Final nomatch: ${finalNomatch}`);
  console.error(`Wrote ${outPath}`);
}

main();
