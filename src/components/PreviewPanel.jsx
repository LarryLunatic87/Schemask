/**
 * PreviewPanel – Side-by-side preview.
 * Left:  original values (masked, as per spec – no raw data in UI)
 * Right: anonymized values (via anonymizer.js + consistencyMap)
 * Shows first 5 data rows per sheet.
 */

import { useState, useMemo } from 'react'
import { maskValue } from '../lib/masker'
import { anonymizeRow } from '../lib/anonymizer'
import { TYPE_CLASS, CLASS } from '../lib/dataTypes'

export default function PreviewPanel({ data, columnStates, onBack, onExport }) {
  const [activeSheet, setActiveSheet] = useState(0)

  const sheet = data.sheets[activeSheet]
  const sheetState = columnStates[activeSheet]

  // Generate anonymized preview rows (sampleValues = first 5 rows)
  const anonRows = useMemo(() => {
    const previewRows = sheet.rawRows?.slice(0, 5) ?? sheet.columns.map(() => [])
    return previewRows.map(row => anonymizeRow(row, sheet.columns, sheetState))
  }, [sheet, sheetState])

  // Visible columns (skip truly empty header columns)
  const visibleCols = sheet.columns.filter(c => c.header)

  // Count anonymized columns in this sheet
  const anonCount = sheet.columns.filter(c => {
    const s = sheetState[String(c.index)]
    if (!s?.enabled) return false
    const cls = TYPE_CLASS[s.type] ?? CLASS.X
    return cls !== CLASS.X
  }).length

  return (
    <div className="w-full animate-slide-up">

      {/* ── Nav bar ── */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-lg mb-4"
        style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-subtle)' }}
      >
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
            Konfiguration
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Vorschau</span>
            <InfoTag>{anonCount} Spalten anonymisiert</InfoTag>
            <InfoTag>erste 5 Zeilen</InfoTag>
          </div>
        </div>

        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-opacity"
          style={{ backgroundColor: 'var(--accent)', color: '#000' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Exportieren
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── Sheet tabs ── */}
      {data.sheets.length > 1 && (
        <div className="flex items-center gap-1.5 px-1 mb-3 overflow-x-auto">
          {data.sheets.map((s, i) => (
            <button key={s.name} onClick={() => setActiveSheet(i)}
              className={`sheet-tab ${i === activeSheet ? 'sheet-tab-active' : ''}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Trust notice ── */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg mb-4 text-xs"
        style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', color: 'var(--text-secondary)' }}
      >
        <span className="inline-flex h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
        Kein Server hat diese Daten gesehen. Originaldaten werden nur maskiert angezeigt.
      </div>

      {/* ── Side-by-side tables ── */}
      {anonRows.length === 0 ? (
        <div className="flex items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
          <span className="text-sm">Keine Datenzeilen vorhanden</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">

          {/* LEFT – Original (maskiert) */}
          <SideTable
            title="Original"
            subtitle="maskiert"
            titleColor="var(--text-secondary)"
            cols={visibleCols}
            rows={anonRows.map((_, rowIdx) =>
              visibleCols.map(col => maskValue(String(sheet.rawRows?.[rowIdx]?.[col.index] ?? '')))
            )}
            colStates={sheetState}
            isOriginal
          />

          {/* RIGHT – Anonymisiert */}
          <SideTable
            title="Anonymisiert"
            subtitle="generiert"
            titleColor="var(--accent)"
            cols={visibleCols}
            rows={anonRows.map(row => visibleCols.map(col => row[col.index] ?? ''))}
            colStates={sheetState}
            isOriginal={false}
          />
        </div>
      )}

      {/* ── Column legend ── */}
      <div
        className="mt-4 grid gap-y-1.5 rounded-lg px-4 py-3 text-xs"
        style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Spaltenstatus</div>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {visibleCols.map(col => {
            const s = sheetState[String(col.index)]
            const cls = TYPE_CLASS[s?.type] ?? CLASS.X
            const isActive = s?.enabled && cls !== CLASS.X
            return (
              <span key={col.index} style={{ color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${isActive ? '' : ''}`}
                  style={{ backgroundColor: isActive ? 'var(--accent)' : 'var(--text-muted)', verticalAlign: 'middle' }} />
                {col.header}
                {isActive && <span style={{ color: 'var(--text-muted)' }}> ({s.type})</span>}
                {!isActive && <span style={{ color: 'var(--text-muted)' }}> – unverändert</span>}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Side table ───────────────────────────────────────────────────
function SideTable({ title, subtitle, titleColor, cols, rows, colStates, isOriginal }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: 'var(--bg-2)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span className="text-sm font-medium" style={{ color: titleColor }}>{title}</span>
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{subtitle}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ backgroundColor: 'var(--bg-1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {cols.map(col => {
                const s = colStates[String(col.index)]
                const cls = TYPE_CLASS[s?.type] ?? CLASS.X
                const isActive = s?.enabled && cls !== CLASS.X
                return (
                  <th
                    key={col.index}
                    style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid var(--border-subtle)',
                      color: isActive ? (isOriginal ? 'var(--text-muted)' : 'var(--accent)') : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={col.header}
                  >
                    {col.header}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const col = cols[ci]
                  const s = colStates[String(col.index)]
                  const cls = TYPE_CLASS[s?.type] ?? CLASS.X
                  const isActive = s?.enabled && cls !== CLASS.X
                  return (
                    <td
                      key={ci}
                      style={{
                        padding: '9px 12px',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                        fontFamily: "'Fira Code', monospace",
                        color: isActive
                          ? (isOriginal ? 'var(--text-muted)' : 'var(--text-primary)')
                          : 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        maxWidth: '160px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={cell}
                    >
                      {cell || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InfoTag({ children }) {
  return (
    <span className="font-mono text-xs px-2 py-0.5 rounded"
      style={{ backgroundColor: 'var(--bg-3)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
      {children}
    </span>
  )
}
