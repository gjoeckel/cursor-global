#!/usr/bin/env node
/**
 * Standardize first_name (column C) and last_name (column D) in two CSV files.
 * Column structure (otterSheet): A=id, B=canvas_user_id, C=first_name, D=last_name,
 * E=email, F=enterprise, G=course_id, H=review_course_id, I=invited_date, J=earned_date,
 * K=certificate_date, L=certificate_date_multi.
 *
 * 1. Trim whitespace
 * 2. Convert to lowercase
 * 3. Save as otterSheet.csv and extractedSheet.csv
 *
 * Run from cursor-ops:
 *   node scripts/standardize-names-in-csvs.mjs
 *
 * Env (optional):
 *   OTTER_SHEET  — input path (default: ../resources/otter/OTTER_missing_dates_with_file_urls_earned_with_proxy_invited_proxy_invited_outliers_substituted.csv)
 *   EXTRACTED_SHEET — input path (default: ../resources/otter/All_certificates_earned_dates_extracted_pdf_02_13_26.csv)
 *   OUT_OTTER — output path (default: ../resources/otter/otterSheet.csv)
 *   OUT_EXTRACTED — output path (default: ../resources/otter/extractedSheet.csv)
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

function standardizeNames(inputPath, outputPath) {
  const text = readFileSync(inputPath, 'utf8');
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) {
    console.error(`No data rows in ${inputPath}`);
    return 0;
  }

  const header = lines[0];
  const headerFields = parseCsvLine(header);
  const firstIdx = headerFields.indexOf('first_name');
  const lastIdx = headerFields.indexOf('last_name');

  if (firstIdx < 0 || lastIdx < 0) {
    console.error(`Missing first_name or last_name columns in ${inputPath}`);
    return 0;
  }

  const outLines = [header];
  let updated = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      outLines.push(line);
      continue;
    }
    const fields = parseCsvLine(line);
    while (fields.length <= Math.max(firstIdx, lastIdx)) fields.push('');

    const origFirst = (fields[firstIdx] || '').trim();
    const origLast = (fields[lastIdx] || '').trim();
    const newFirst = origFirst.toLowerCase();
    const newLast = origLast.toLowerCase();

    if (origFirst !== newFirst || origLast !== newLast) {
      fields[firstIdx] = newFirst;
      fields[lastIdx] = newLast;
      updated++;
    }

    outLines.push(fields.map(quoteCsvField).join(','));
  }

  writeFileSync(outputPath, outLines.join('\n') + '\n', 'utf8');
  return updated;
}

function main() {
  const otterInput =
    process.env.OTTER_SHEET ||
    join(OTTER_RESOURCES, 'OTTER_missing_dates_with_file_urls_earned_with_proxy_invited_proxy_invited_outliers_substituted.csv');
  const extractedInput =
    process.env.EXTRACTED_SHEET ||
    join(OTTER_RESOURCES, 'All_certificates_earned_dates_extracted_pdf_02_13_26.csv');
  const otterOutput = process.env.OUT_OTTER || join(OTTER_RESOURCES, 'otterSheet.csv');
  const extractedOutput = process.env.OUT_EXTRACTED || join(OTTER_RESOURCES, 'extractedSheet.csv');

  console.error(`Standardizing names in ${otterInput}...`);
  const otterUpdated = standardizeNames(otterInput, otterOutput);
  console.error(`  Updated ${otterUpdated} rows → ${otterOutput}`);

  console.error(`Standardizing names in ${extractedInput}...`);
  const extractedUpdated = standardizeNames(extractedInput, extractedOutput);
  console.error(`  Updated ${extractedUpdated} rows → ${extractedOutput}`);

  console.error(`Done. Total: ${otterUpdated + extractedUpdated} rows standardized.`);
}

main();
