#!/usr/bin/env python3
"""
Extract /ModDate (Modification date) from every PDF under the Certificates folder.
Outputs a CSV: filename, relative_path, mod_date (YYYY-MM-DD).

Run from cursor-ops:
  pip install pypdf
  python scripts/extract-pdf-mod-dates.py

Env (optional):
  CERTIFICATES_DIR  — folder to scan (default: ../resources/otter/Certificates)
  OUT_CSV           — output CSV path (default: ../resources/otter/OTTER_certificates_mod_dates.csv)
  NAMES_CSV         — CSV with first_name, last_name, earned_date (default: ../resources/otter/OTTER_certificates_first_last_earned.csv)
  MAX_FILES         — stop after this many PDFs (for testing; default: no limit)
"""

import os
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    print("Install pypdf: pip install pypdf", file=sys.stderr)
    sys.exit(1)

# Default paths (script lives in cursor-ops/scripts/)
SCRIPT_DIR = Path(__file__).resolve().parent
CURSOR_OPS = os.environ.get("CURSOR_OPS", SCRIPT_DIR.parent)
OTTER_RESOURCES = Path(CURSOR_OPS) / ".." / "resources" / "otter"
DEFAULT_CERTIFICATES_DIR = (OTTER_RESOURCES / "Certificates").resolve()
DEFAULT_OUT_CSV = (OTTER_RESOURCES / "OTTER_certificates_mod_dates.csv").resolve()
DEFAULT_NAMES_CSV = (OTTER_RESOURCES / "OTTER_certificates_first_last_earned.csv").resolve()

# PDF date format: D:YYYYMMDDHHmmSS+HH'mm' or D:YYYYMMDDHHmmSS-HH'mm' or D:YYYYMMDD...
PDF_DATE_PATTERN = re.compile(r"D:(\d{4})(\d{2})(\d{2})")


def parse_mod_date(reader) -> str:
    """Get modification date as YYYY-MM-DD from pypdf reader. Returns '' on failure."""
    meta = reader.metadata
    if not meta:
        return ""

    # Prefer parsed datetime if available
    if hasattr(meta, "modification_date") and meta.modification_date is not None:
        dt = meta.modification_date
        if isinstance(dt, datetime):
            return dt.strftime("%Y-%m-%d")
        if isinstance(dt, str) and len(dt) >= 10:
            return dt[:10]

    # Fallback: raw /ModDate or /CreationDate string (dict-like or attribute)
    mod_str = None
    if hasattr(meta, "get") and callable(meta.get):
        mod_str = meta.get("/ModDate") or meta.get("/CreationDate")
    if not mod_str:
        mod_str = getattr(meta, "modification_date", None) or getattr(meta, "creation_date", None)
    if isinstance(mod_str, str):
        m = PDF_DATE_PATTERN.search(mod_str)
        if m:
            return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    return ""


def first_last_from_filename(filename: str) -> tuple:
    """Parse 'First Last.pdf' -> (first_name, last_name). No space -> (base, '')."""
    base = filename[:-4] if filename.lower().endswith(".pdf") else filename
    base = base.strip()
    i = base.find(" ")
    if i >= 0:
        return (base[:i].strip(), base[i + 1 :].strip())
    return (base, "")


def main():
    certificates_dir = Path(
        os.environ.get("CERTIFICATES_DIR", str(DEFAULT_CERTIFICATES_DIR))
    ).resolve()
    out_csv = Path(
        os.environ.get("OUT_CSV", str(DEFAULT_OUT_CSV))
    ).resolve()
    names_csv = Path(
        os.environ.get("NAMES_CSV", str(DEFAULT_NAMES_CSV))
    ).resolve()

    if not certificates_dir.is_dir():
        print(f"Certificates dir not found: {certificates_dir}", file=sys.stderr)
        sys.exit(1)

    out_csv.parent.mkdir(parents=True, exist_ok=True)
    max_files = os.environ.get("MAX_FILES")
    max_files = int(max_files) if max_files else None
    rows = []
    errors = 0
    count = 0

    for root, _dirs, files in os.walk(certificates_dir):
        for name in files:
            if not name.lower().endswith(".pdf"):
                continue
            if max_files is not None and count >= max_files:
                break
            filepath = Path(root) / name
            try:
                rel = filepath.relative_to(certificates_dir)
                reader = PdfReader(str(filepath))
                mod_date = parse_mod_date(reader)
                rows.append((name, str(rel), mod_date))
                count += 1
            except Exception as e:
                rows.append((name, str(Path(root).relative_to(certificates_dir) / name), ""))
                print(f"Error {filepath}: {e}", file=sys.stderr)
                errors += 1
                count += 1
        if max_files is not None and count >= max_files:
            break

    # Write mod_dates CSV
    with open(out_csv, "w", encoding="utf-8") as f:
        f.write("filename,relative_path,mod_date\n")
        for filename, rel_path, mod_date in sorted(rows, key=lambda r: (r[1], r[0])):
            rel_esc = f'"{rel_path}"' if "," in rel_path or '"' in rel_path else rel_path
            f.write(f"{filename},{rel_esc},{mod_date}\n")

    # Write first_name, last_name, earned_date CSV (earned_date = mod_date from PDF)
    names_csv.parent.mkdir(parents=True, exist_ok=True)
    with open(names_csv, "w", encoding="utf-8") as f:
        f.write("first_name,last_name,earned_date\n")
        for filename, _rel_path, mod_date in sorted(rows, key=lambda r: (r[1], r[0])):
            first, last = first_last_from_filename(filename)
            first_esc = f'"{first}"' if "," in first or '"' in first else first
            last_esc = f'"{last}"' if "," in last or '"' in last else last
            f.write(f"{first_esc},{last_esc},{mod_date}\n")

    print(f"Wrote {len(rows)} rows to {out_csv}", file=sys.stderr)
    print(f"Wrote first_name, last_name, earned_date to {names_csv}", file=sys.stderr)
    if errors:
        print(f"Errors: {errors}", file=sys.stderr)


if __name__ == "__main__":
    main()
