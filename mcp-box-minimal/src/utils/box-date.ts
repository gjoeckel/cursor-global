/**
 * Normalize Box API date (DateTimeWrapper, string, or Date) to ISO 8601 string.
 * Box SDK returns dates as DateTimeWrapper { value: string } or similar; MCP should return plain strings.
 */
export function toISOString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value === 'object' && value !== null && 'value' in value) {
    const v = (value as { value: unknown }).value;
    if (typeof v === 'string') return v;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v.toISOString();
    if (v != null) return String(v);
  }
  return null;
}
