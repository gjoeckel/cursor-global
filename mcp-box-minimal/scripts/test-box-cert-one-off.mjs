#!/usr/bin/env node
/**
 * One-off test: get one Box file, parse filename → first_name/last_name,
 * use created_at → certificate_date (YYYY-MM-DD). Validates the scrape logic.
 *
 * Run from cursor-ops:
 *   source config/box.env && node mcp-box-minimal/scripts/test-box-cert-one-off.mjs
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';

const FILE_ID = '2056741991647'; // Amos Hammar.pdf

function parsePdfFilename(name) {
  const base = name.replace(/\.pdf$/i, '').trim();
  const firstSpace = base.indexOf(' ');
  if (firstSpace >= 0) {
    return { first_name: base.slice(0, firstSpace), last_name: base.slice(firstSpace + 1).trim() };
  }
  return { first_name: base, last_name: '' };
}

function toYYYYMMDD(isoOrDate) {
  if (isoOrDate == null) return null;
  // Box SDK returns DateTimeWrapper with .value (ISO string or Date)
  let str = null;
  if (typeof isoOrDate === 'string') str = isoOrDate;
  else if (typeof isoOrDate === 'object' && isoOrDate != null && isoOrDate.value != null) {
    const v = isoOrDate.value;
    str = typeof v === 'string' ? v : (v instanceof Date ? v.toISOString() : String(v));
  }
  if (str) {
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[0];
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  if (isoOrDate instanceof Date && !isNaN(isoOrDate.getTime())) {
    return isoOrDate.toISOString().slice(0, 10);
  }
  return null;
}

async function main() {
  const token = process.env.BOX_ACCESS_TOKEN;
  if (!token) {
    console.error('Missing BOX_ACCESS_TOKEN. Run: source /path/to/cursor-ops/config/box.env');
    process.exit(1);
  }

  const auth = new BoxDeveloperTokenAuth({ token });
  const client = new BoxClient({ auth });

  const file = await client.files.getFileById(FILE_ID, {
    queryParams: { fields: ['id', 'name', 'type', 'created_at', 'modified_at'] },
  });

  const raw = file;
  const created_at = raw.created_at ?? raw.createdAt;
  const modified_at = raw.modified_at ?? raw.modifiedAt;

  const { first_name, last_name } = parsePdfFilename(file.name);
  const certificate_date = toYYYYMMDD(created_at);

  console.log('--- One-off Box cert scrape test ---');
  console.log('File ID:', FILE_ID);
  console.log('File name:', file.name);
  console.log('created_at (raw):', created_at ?? '(missing)');
  console.log('modified_at (raw):', modified_at ?? '(missing)');
  console.log('');
  console.log('Parsed row (template columns C, D, K):');
  console.log('  first_name (C):', first_name);
  console.log('  last_name (D):', last_name);
  console.log('  certificate_date (K):', certificate_date ?? '(could not parse date)');
  console.log('');
  if (certificate_date) {
    console.log('Valid: Yes — use created_at, format YYYY-MM-DD.');
  } else {
    console.log('Valid: No — created_at missing or unparseable. Check Box API / SDK.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
