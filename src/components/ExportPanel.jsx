/**
 * ExportPanel – Phase 3 export view.
 *
 * Option 1 (required):  Anonymisierte .xlsx
 * Option 2 (optional):  Mapping-CSV – Original → Anonymisiert (mit Warnung)
 * Option 3 (optional):  Schema-JSON – Spaltenstruktur + Typen + Toggle-Status
 */

import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { anonymizeSheet } from '../lib/anonymizer'
import { TYPE, TYPE_CLASS, CLASS, TYPE_LABEL } from '../lib/dataTypes'

// ── Download helpers ─────────────────────────────────────────────

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Excel serial → JS Date: serial 1 = 1900-01-01, offset to Unix epoch = 25569 days
function excelSerialToDate(serial) {
  return new Date(serial * 86400000 - 2209161600000)
}

function buildAnonymizedXlsx(data, columnStates) {
  const wb = XLSX.utils.book_new()
  data.sheets.forEach((sheet, sheetIdx) => {
    const sheetState = columnStates[sheetIdx]
    const anonRows = anonymizeSheet(sheet.rawRows ?? [], sheet.columns, sheetState)

    // Find EXCEL_DATUM columns that are enabled → convert string serials to Date objects
    const excelDateCols = new Set(
      sheet.columns
        .filter(col => sheetState[String(col.index)]?.enabled &&
                       sheetState[String(col.index)]?.type === TYPE.EXCEL_DATUM)
        .map(col => col.index)
    )

    const wsRows = excelDateCols.size === 0 ? anonRows : anonRows.map(row =>
      row.map((cell, i) => {
        if (!excelDateCols.has(i)) return cell
        const serial = parseInt(cell, 10)
        return isNaN(serial) ? cell : excelSerialToDate(serial)
      })
    )

    const wsData = [sheet.headerRow ?? sheet.columns.map(c => c.header), ...wsRows]
    const ws = XLSX.utils.aoa_to_sheet(wsData, { cellDates: true })
    XLSX.utils.book_append_sheet(wb, ws, sheet.name)
  })
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

function buildMappingCsv(data, columnStates) {
  const rows = [['Sheet', 'Spalte', 'Typ', 'Original', 'Anonymisiert']]
  data.sheets.forEach((sheet, sheetIdx) => {
    const sheetState = columnStates[sheetIdx]
    const anonRows = anonymizeSheet(sheet.rawRows ?? [], sheet.columns, sheetState)
    sheet.columns.forEach(col => {
      const s = sheetState[String(col.index)]
      if (!s?.enabled || (TYPE_CLASS[s.type] ?? CLASS.X) === CLASS.X) return
      sheet.rawRows?.forEach((rawRow, rowIdx) => {
        const orig = String(rawRow[col.index] ?? '')
        const anon = String(anonRows[rowIdx]?.[col.index] ?? '')
        if (orig && orig !== anon) {
          rows.push([sheet.name, col.header, s.type, orig, anon])
        }
      })
    })
  })
  return rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
}

function buildSchemaJson(data, columnStates) {
  return JSON.stringify({
    tool: 'Schemask', version: '0.1',
    generatedAt: new Date().toISOString(),
    fileName: data.fileName,
    sheets: data.sheets.map((sheet, i) => ({
      name: sheet.name,
      rowCount: sheet.rowCount,
      columns: sheet.columns.map(col => {
        const s = columnStates[i]?.[String(col.index)]
        const effectiveType = s?.type ?? col.detectedType
        return {
          index: col.index,
          header: col.header,
          detectedType: col.detectedType,
          effectiveType,
          class: TYPE_CLASS[effectiveType] ?? CLASS.X,
          anonymized: s?.enabled ?? false,
          typeLabel: TYPE_LABEL[effectiveType] ?? '',
        }
      }),
    })),
  }, null, 2)
}

function computeSummary(data, columnStates) {
  let totalCols = 0, anonCols = 0, totalRows = 0
  const typeSet = new Set()
  data.sheets.forEach((sheet, i) => {
    totalRows += sheet.rowCount
    sheet.columns.forEach(col => {
      totalCols++
      const s = columnStates[i]?.[String(col.index)]
      if (s?.enabled && (TYPE_CLASS[s.type] ?? CLASS.X) !== CLASS.X) {
        anonCols++
        typeSet.add(s.type)
      }
    })
  })
  return { totalCols, anonCols, totalRows, typeCount: typeSet.size }
}

// ── Main component ───────────────────────────────────────────────

export default function ExportPanel({ data, columnStates, onBack, onReset }) {
  const [withMapping, setWithMapping] = useState(false)
  const [withSchema, setWithSchema] = useState(false)
  const [done, setDone] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const summary = computeSummary(data, columnStates)
  const baseName = data.fileName.replace(/\.[^.]+$/, '')

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const xlsxBytes = buildAnonymizedXlsx(data, columnStates)
      downloadBlob(
        new Blob([xlsxBytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `${baseName}_anonymisiert.xlsx`
      )
      if (withMapping) {
        await new Promise(r => setTimeout(r, 200))
        downloadBlob(new Blob([buildMappingCsv(data, columnStates)], { type: 'text/csv;charset=utf-8;' }), `${baseName}_mapping.csv`)
      }
      if (withSchema) {
        await new Promise(r => setTimeout(r, 200))
        downloadBlob(new Blob([buildSchemaJson(data, columnStates)], { type: 'application/json' }), `${baseName}_schema.json`)
      }
      setDone(true)
    } finally {
      setIsExporting(false)
    }
  }, [data, columnStates, baseName, withMapping, withSchema])

  return (
    <div className="w-full animate-slide-up">

      {/* ── Nav bar ── */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg mb-6"
        style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M9 6H3M6 9L3 6l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Vorschau
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Export</span>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 280px', alignItems: 'start' }}>

        {/* ── Options ── */}
        <div className="space-y-3">
          <ExportOption number="1" label="Anonymisierte Excel-Datei"
            filename={`${baseName}_anonymisiert.xlsx`}
            description="Strukturidentisch zur Originaldatei. Aktive Spalten anonymisiert, inaktive unverändert. Formeln werden als Werte exportiert."
            checked disabled required />

          <ExportOption number="2" label="Mapping-CSV"
            filename={`${baseName}_mapping.csv`}
            description="Zwei Spalten: Original → Anonymisiert. Nur tatsächlich geänderte Werte."
            checked={withMapping} onChange={setWithMapping}
            warning="Diese Datei enthält Originalwerte. Sicher aufbewahren und nicht weitergeben." />

          <ExportOption number="3" label="Schema-JSON"
            filename={`${baseName}_schema.json`}
            description="Spaltenstruktur, erkannte Typen, Klassen, Toggle-Status. Maschinenlesbar – Vorbereitung für Tool B."
            checked={withSchema} onChange={setWithSchema} />

          {!done ? (
            <button onClick={handleExport} disabled={isExporting}
              className="w-full py-3 rounded-lg text-sm font-semibold mt-2"
              style={{ backgroundColor: 'var(--accent)', color: '#000', opacity: isExporting ? 0.7 : 1 }}
            >
              {isExporting ? 'Wird exportiert…' :
                `Download starten (${1 + (withMapping ? 1 : 0) + (withSchema ? 1 : 0)} Datei${1 + (withMapping ? 1 : 0) + (withSchema ? 1 : 0) !== 1 ? 'en' : ''})`}
            </button>
          ) : (
            <div className="rounded-lg px-4 py-5 text-center mt-2"
              style={{ backgroundColor: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="8" stroke="var(--accent)" strokeWidth="1.5"/>
                  <path d="M5.5 9l2.5 2.5L12.5 7" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Export abgeschlossen</span>
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                Dateien in deinem Download-Ordner. Originalwerte haben den Browser nie verlassen.
              </p>
              <button onClick={onReset} className="text-xs font-medium" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                Neue Datei anonymisieren
              </button>
            </div>
          )}
        </div>

        {/* ── Summary ── */}
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-subtle)' }}>
          <div className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Zusammenfassung
          </div>
          <div className="space-y-3">
            <StatRow label="Zeilen verarbeitet" value={summary.totalRows.toLocaleString('de')} />
            <StatRow label="Spalten gesamt" value={String(summary.totalCols)} />
            <StatRow label="Spalten anonymisiert" value={String(summary.anonCols)} accent />
            <StatRow label="Erkannte Typen" value={String(summary.typeCount)} />
            <StatRow label="Sheets" value={String(data.sheets.length)} />
          </div>
          <div className="mt-5 pt-4 space-y-1.5 text-xs"
            style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            {['0 Bytes an Server gesendet', 'Lokal generiert im Browser'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <span className="inline-flex h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────

function ExportOption({ label, filename, description, checked, onChange, disabled, required, warning }) {
  return (
    <div className="rounded-lg p-4"
      style={{
        backgroundColor: 'var(--bg-2)',
        border: `1px solid ${checked ? (required ? 'var(--border-strong)' : 'rgba(34,197,94,0.3)') : 'var(--border-subtle)'}`,
        opacity: disabled ? 0.78 : 1,
      }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center"
          style={{
            backgroundColor: checked ? 'rgba(34,197,94,0.12)' : 'var(--bg-3)',
            border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--border-default)'}`,
            cursor: disabled ? 'default' : 'pointer',
          }}
          onClick={() => !disabled && onChange?.(!checked)}>
          {checked && (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2 5.5l2.5 2.5L9 3" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
            {required && (
              <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--accent)', border: '1px solid rgba(34,197,94,0.2)' }}>
                Pflicht
              </span>
            )}
          </div>
          <div className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{filename}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{description}</div>
          {warning && checked && (
            <div className="mt-2 flex items-start gap-1.5 rounded px-2.5 py-2 text-xs"
              style={{ backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0 mt-0.5">
                <path d="M6.5 1L12 11.5H1L6.5 1z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
                <path d="M6.5 5v3M6.5 9.5h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
              {warning}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="font-mono text-sm font-semibold"
        style={{ color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  )
}
