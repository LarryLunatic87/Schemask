/**
 * SheetPreview – shows the parsed schema after upload.
 * Sheet tabs + column table with type badges + sample values.
 */

import { useState } from 'react'
import { TYPE_BADGE_CLASS, TYPE_LABEL, maskValue, CLASS_A_TYPES } from '../lib/typeDetector'

export default function SheetPreview({ data, onReset }) {
  const [activeSheet, setActiveSheet] = useState(0)

  const sheet = data.sheets[activeSheet]
  const fileSizeKB = (data.fileSize / 1024).toFixed(1)

  return (
    <div className="w-full animate-slide-up">
      {/* ── File info bar ── */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-lg mb-4"
        style={{
          backgroundColor: 'var(--bg-2)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* File icon */}
          <div
            className="rounded-md p-1.5"
            style={{ backgroundColor: 'var(--bg-3)', border: '1px solid var(--border-default)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 2h7l4 4v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"
                stroke="var(--accent)"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
              <path d="M10 2v4h4" stroke="var(--accent)" strokeWidth="1.25" opacity="0.6"/>
            </svg>
          </div>

          <div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {data.fileName}
            </span>
            <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>
              {fileSizeKB} KB · {data.sheets.length} Sheet{data.sheets.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                     transition-colors duration-150"
          style={{
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--text-primary)'
            e.currentTarget.style.borderColor = 'var(--border-strong)'
            e.currentTarget.style.backgroundColor = 'var(--bg-3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-secondary)'
            e.currentTarget.style.borderColor = 'var(--border-default)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 6A5 5 0 1111 6M1 6V2M1 6H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Andere Datei
        </button>
      </div>

      {/* ── Sheet tabs ── */}
      {data.sheets.length > 1 && (
        <div
          className="flex items-center gap-1.5 px-1 mb-4 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: 'none' }}
        >
          {data.sheets.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActiveSheet(i)}
              className={`sheet-tab ${i === activeSheet ? 'sheet-tab-active' : ''}`}
            >
              {s.name}
              <span
                className="ml-1.5 font-mono"
                style={{ fontSize: '10px', color: 'var(--text-muted)' }}
              >
                {s.rowCount}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Column table ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        {/* Table header with sheet summary */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            backgroundColor: 'var(--bg-2)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {data.sheets.length === 1 ? data.sheets[0].name : sheet.name}
            </span>
            <span
              className="font-mono text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: 'var(--bg-3)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {sheet.rowCount} Zeilen
            </span>
            <span
              className="font-mono text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: 'var(--bg-3)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {sheet.columns.length} Spalten
            </span>
          </div>

          <TypeSummary columns={sheet.columns} />
        </div>

        {/* Table */}
        {sheet.columns.length === 0 ? (
          <div
            className="flex items-center justify-center py-12"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="text-sm">Keine Spalten gefunden</span>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ backgroundColor: 'var(--bg-1)' }}>
            <table className="schema-table">
              <thead>
                <tr>
                  <th style={{ width: '32px' }}>#</th>
                  <th>Spalte</th>
                  <th style={{ width: '130px' }}>Typ</th>
                  <th>Beispielwerte</th>
                </tr>
              </thead>
              <tbody>
                {sheet.columns.map((col) => (
                  <tr key={col.index}>
                    {/* Index */}
                    <td>
                      <span
                        className="font-mono text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {col.index + 1}
                      </span>
                    </td>

                    {/* Column name */}
                    <td>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {col.header}
                      </span>
                    </td>

                    {/* Type badge */}
                    <td>
                      <span className={TYPE_BADGE_CLASS[col.detectedType]}>
                        {TYPE_LABEL[col.detectedType]}
                      </span>
                    </td>

                    {/* Sample values */}
                    <td>
                      <SampleValues
                        values={col.sampleValues}
                        isClassA={CLASS_A_TYPES.has(col.detectedType)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Phase 1 status note ── */}
      <div
        className="mt-4 flex items-start gap-2.5 rounded-lg px-4 py-3 text-xs"
        style={{
          backgroundColor: 'var(--bg-2)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25"/>
          <path d="M7 6.5v3.5M7 4.5h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
        </svg>
        <span>
          <strong style={{ color: 'var(--text-primary)' }}>Phase 1</strong> – Typen:
          USt-IdNr (Klasse A), E-Mail, Datum, Prozent, Zahl, Text.
          Alle Beispielwerte werden maskiert – keine Originaldaten im UI.
          In Phase 2 werden alle 54 Typen aus der Spec unterstützt.
        </span>
      </div>
    </div>
  )
}

/* ── Helper components ───────────────────────────────────────── */

function SampleValues({ values, isClassA = false }) {
  const nonEmpty = values.filter(v => v !== '' && v !== null && v !== undefined)
  if (nonEmpty.length === 0) {
    return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {nonEmpty.slice(0, 3).map((v, i) => {
        const masked = maskValue(String(v))
        return (
          <span
            key={i}
            className="font-mono text-xs px-1.5 py-0.5 rounded inline-block"
            style={{
              backgroundColor: isClassA
                ? 'rgba(239,68,68,0.07)'
                : 'var(--bg-3)',
              color: isClassA ? '#f87171' : 'var(--text-secondary)',
              border: `1px solid ${isClassA ? 'rgba(239,68,68,0.18)' : 'var(--border-subtle)'}`,
              maxWidth: '180px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            // tooltip shows masked value too – original never exposed in DOM
            title={masked}
          >
            {masked}
          </span>
        )
      })}
      {nonEmpty.length > 3 && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          +{nonEmpty.length - 3}
        </span>
      )}
      {isClassA && (
        <span
          className="text-xs ml-1"
          style={{ color: 'rgba(248,113,113,0.7)', fontStyle: 'italic' }}
          title="Klasse A – wird immer anonymisiert"
        >
          Klasse A
        </span>
      )}
    </div>
  )
}

function TypeSummary({ columns }) {
  const counts = {}
  for (const col of columns) {
    counts[col.detectedType] = (counts[col.detectedType] || 0) + 1
  }

  return (
    <div className="flex items-center gap-1.5">
      {Object.entries(counts).map(([type, count]) => (
        <span key={type} className={TYPE_BADGE_CLASS[type]}>
          {count}× {type}
        </span>
      ))}
    </div>
  )
}
