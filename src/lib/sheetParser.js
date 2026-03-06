/**
 * sheetParser.js
 * Wraps SheetJS (xlsx) for local, in-browser Excel/CSV parsing.
 * No data leaves the browser. FileReader API + XLSX.read() only.
 */

import * as XLSX from 'xlsx'
import { detectColumnType } from './typeDetector'

const MAX_PREVIEW_ROWS = 5
const MAX_TYPE_SAMPLE_ROWS = 20  // rows used for type detection

/**
 * Parse a File object (xlsx/xls/csv) and return a structured schema.
 *
 * Returns:
 * {
 *   fileName: string,
 *   fileSize: number,
 *   sheets: Array<{
 *     name: string,
 *     rowCount: number,
 *     columns: Array<{
 *       index: number,
 *       header: string,
 *       detectedType: string,
 *       sampleValues: string[],
 *     }>,
 *   }>
 * }
 */
export async function parseFile(file) {
  const buffer = await readFileAsArrayBuffer(file)

  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: false,   // keep raw strings for reliable type detection
    raw: false,         // format numbers as strings
    dateNF: 'dd.mm.yyyy',
  })

  const sheets = workbook.SheetNames.map(name => {
    const ws = workbook.Sheets[name]
    return parseSheet(name, ws)
  })

  return {
    fileName: file.name,
    fileSize: file.size,
    sheets,
  }
}

/**
 * Parse a single worksheet into our schema format.
 */
function parseSheet(name, ws) {
  // sheet_to_json with header:1 gives us a 2D array
  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: false,
  })

  if (rows.length === 0) {
    return { name, rowCount: 0, columns: [] }
  }

  const headerRow = rows[0]
  const dataRows  = rows.slice(1)
  const previewRows = dataRows.slice(0, MAX_PREVIEW_ROWS)
  const sampleRows  = dataRows.slice(0, MAX_TYPE_SAMPLE_ROWS)

  const headers = headerRow.map((h, i) => String(h ?? '').trim() || `Spalte ${i + 1}`)

  const columns = headers.map((header, colIdx) => {
    const neighborCols = headers.filter((_, i) => Math.abs(i - colIdx) <= 2 && i !== colIdx)
    const colSamples = sampleRows.map(row => row[colIdx] ?? '')
    const colPreview = previewRows.map(row => String(row[colIdx] ?? ''))
    const detectedType = detectColumnType(colSamples, header, neighborCols)

    return {
      index: colIdx,
      header,
      detectedType,
      sampleValues: colPreview,
    }
  })

  return {
    name,
    rowCount: dataRows.length,
    columns,
    rawRows: dataRows,     // all data rows (for anonymization + export)
    headerRow: headers,    // for xlsx generation
  }
}

/**
 * Promisified FileReader as ArrayBuffer.
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(new Uint8Array(e.target.result))
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'))
    reader.readAsArrayBuffer(file)
  })
}
