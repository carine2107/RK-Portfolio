/**
 * CSV for spreadsheet software (Excel, LibreOffice, Numbers).
 *
 * - `;` separator and a UTF-8 byte-order mark: Excel in French and German
 *   opens the file directly in columns, with accents intact;
 * - CRLF line endings, every field quoted when needed (RFC 4180);
 * - cells starting with `=`, `+`, `-`, `@`, tab or carriage return are
 *   prefixed with `'` so a value typed by a visitor can never run as a
 *   spreadsheet formula (CSV injection).
 */

export const CSV_SEPARATOR = ';'
const BOM = '﻿'

function cell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[";\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export function toCsv(rows: string[][]): string {
  return BOM + rows.map((row) => row.map(cell).join(CSV_SEPARATOR)).join('\r\n') + '\r\n'
}
