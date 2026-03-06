/**
 * anonymizer.js
 * High-level anonymization API.
 * Uses consistencyMap for session-wide value consistency.
 *
 * anonymizeCell(value, colState) → anonymized string
 * anonymizeRow(rawRow, columns, sheetState) → string[]
 */

import { anonymizeValue } from './consistencyMap'
import { TYPE_CLASS, CLASS } from './dataTypes'

/**
 * Anonymize a single cell value.
 * @param {string} value     – original cell value (string from SheetJS)
 * @param {{ type: string, enabled: boolean }} colState
 */
export function anonymizeCell(value, colState) {
  const str = String(value ?? '').trim()

  // Formulas and empty cells are never touched
  if (!str || str.startsWith('=')) return value

  if (!colState.enabled) return value

  const cls = TYPE_CLASS[colState.type] ?? CLASS.X
  // CLASS.X (plain Text) is not anonymized even if somehow enabled
  if (cls === CLASS.X) return value

  return anonymizeValue(str, colState.type, true)
}

/**
 * Anonymize all cells in a row.
 * @param {string[]} rawRow      – array of cell values (same order as columns)
 * @param {object[]} columns     – sheet.columns array (index, header, detectedType)
 * @param {object}   sheetState  – { [colIndex]: { enabled, type } }
 * @returns {string[]}
 */
export function anonymizeRow(rawRow, columns, sheetState) {
  return columns.map(col => {
    const value = rawRow[col.index] ?? ''
    const colState = sheetState[String(col.index)] ?? { enabled: false, type: col.detectedType }
    return anonymizeCell(value, colState)
  })
}

/**
 * Anonymize all rows of a sheet (for export).
 * @param {string[][]} rawRows   – all data rows from sheetParser
 * @param {object[]}   columns
 * @param {object}     sheetState
 * @returns {string[][]}
 */
export function anonymizeSheet(rawRows, columns, sheetState) {
  return rawRows.map(row => anonymizeRow(row, columns, sheetState))
}
