/**
 * Single source of truth for otterSheet.csv column structure.
 * Use this in scripts that read/write otterSheet or CSVs with the same structure.
 *
 * Col  Header
 * A    id
 * B    canvas_user_id
 * C    first_name
 * D    last_name
 * E    email
 * F    enterprise
 * G    course_id
 * H    review_course_id
 * I    invited_date
 * J    earned_date
 * K    certificate_date   ← Box file created_at (YYYY-MM-DD)
 * L    certificate_date_multi
 */

export const OTTER_SHEET_HEADERS = [
  'id',
  'canvas_user_id',
  'first_name',
  'last_name',
  'email',
  'enterprise',
  'course_id',
  'review_course_id',
  'invited_date',
  'earned_date',
  'certificate_date',
  'certificate_date_multi',
];

export const OTTER_SHEET_HEADER_ROW = OTTER_SHEET_HEADERS.join(',');

/** Column letter to 0-based index */
export const COL = {
  A: 0,  B: 1,  C: 2,  D: 3,  E: 4,  F: 5,
  G: 6,  H: 7,  I: 8,  J: 9,  K: 10, L: 11,
};

/** Key column names for convenience */
export const IDX = {
  id: 0,
  canvas_user_id: 1,
  first_name: 2,
  last_name: 3,
  email: 4,
  enterprise: 5,
  course_id: 6,
  review_course_id: 7,
  invited_date: 8,
  earned_date: 9,
  certificate_date: 10,
  certificate_date_multi: 11,
};
