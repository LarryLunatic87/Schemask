/**
 * ColumnConfig – Phase 2/3 column configuration view.
 * Controlled component: state lives in App.jsx (columnStates / setColumnStates).
 *
 * Per column:
 *   – Class badge (A/B/C/X)
 *   – Type badge + override dropdown
 *   – Toggle (disabled for Klasse A)
 *   – Masked sample values
 */

import { useState, useMemo } from 'react'
import {
  TYPE_BADGE_CLASS, TYPE_LABEL, CLASS_BADGE,
  TYPE_CLASS, CLASS, TYPE_GROUPS,
} from '../lib/dataTypes'
import { maskValue } from '../lib/masker'

// ── Toggle ──────────────────────────────────────────────────────
function Toggle({ on, disabled, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className={`toggle-track ${on ? 'is-on' : 'is-off'} ${disabled ? 'is-disabled' : ''}`}
      title={disabled ? 'Klasse A – immer aktiv' : on ? 'Deaktivieren' : 'Aktivieren'}
    >
      <span className="toggle-thumb" />
    </button>
  )
}

// ── Type override dropdown ───────────────────────────────────────
function TypeSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="font-mono text-xs rounded-md px-1.5 py-0.5 cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-3)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)',
        maxWidth: '130px',
        outline: 'none',
      }}
      title="Typ manuell überschreiben"
    >
      {TYPE_GROUPS.map(group => (
        <optgroup key={group.label} label={group.label}>
          {group.types.map(t => (
            <option key={t} value={t}>{TYPE_LABEL[t] ?? t}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

// ── Column row ──────────────────────────────────────────────────
function ColumnRow({ col, colState, onToggle, onTypeChange }) {
  const effectiveType = colState.type
  const cls = TYPE_CLASS[effectiveType] ?? CLASS.X
  const classBadge = CLASS_BADGE[cls]
  const isClassA = cls === CLASS.A
  const nonEmpty = col.sampleValues.filter(v => v !== '' && v !== null)

  return (
    <tr style={{ opacity: (!colState.enabled && !isClassA) ? 0.48 : 1 }}>
      {/* Index */}
      <td style={{ width: '36px' }}>
        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          {col.index + 1}
        </span>
      </td>

      {/* Column header */}
      <td style={{ minWidth: '120px', maxWidth: '160px' }}>
        <span
          className="text-sm font-medium block overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: 'var(--text-primary)' }}
          title={col.header}
        >
          {col.header}
        </span>
      </td>

      {/* Class badge */}
      <td style={{ width: '36px' }}>
        <span className={classBadge.cssClass} title={classBadge.title}>
          {classBadge.label}
        </span>
      </td>

      {/* Type badge + override select */}
      <td style={{ minWidth: '200px' }}>
        <div className="flex items-center gap-2">
          <span className={TYPE_BADGE_CLASS[effectiveType] ?? 'badge badge-type-x'} style={{ flexShrink: 0 }}>
            {TYPE_LABEL[effectiveType] ?? effectiveType}
          </span>
          {effectiveType !== col.detectedType && (
            <span className="text-xs" style={{ color: 'var(--accent)', fontStyle: 'italic' }}>
              overridden
            </span>
          )}
          <TypeSelect value={effectiveType} onChange={onTypeChange} />
        </div>
      </td>

      {/* Toggle */}
      <td style={{ width: '48px' }}>
        <Toggle on={colState.enabled} disabled={isClassA} onChange={onToggle} />
      </td>

      {/* Masked samples */}
      <td>
        {nonEmpty.length === 0 ? (
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {nonEmpty.slice(0, 3).map((v, i) => {
              const masked = maskValue(String(v))
              return (
                <span
                  key={i}
                  className="font-mono text-xs px-1.5 py-0.5 rounded inline-block"
                  style={{
                    backgroundColor: isClassA ? 'rgba(239,68,68,0.07)' : 'var(--bg-3)',
                    color: isClassA ? '#f87171' : colState.enabled ? 'var(--text-secondary)' : 'var(--text-muted)',
                    border: `1px solid ${isClassA ? 'rgba(239,68,68,0.18)' : 'var(--border-subtle)'}`,
                    maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
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
          </div>
        )}
      </td>
    </tr>
  )
}

// ── Main component ──────────────────────────────────────────────
export default function ColumnConfig({ data, columnStates, setColumnStates, onReset, onPreview }) {
  const [activeSheet, setActiveSheet] = useState(0)

  const sheet = data.sheets[activeSheet]
  const sheetState = columnStates[activeSheet]

  function toggleColumn(colIndex) {
    setColumnStates(prev => {
      const next = [...prev]
      const key = String(colIndex)
      next[activeSheet] = { ...next[activeSheet], [key]: { ...next[activeSheet][key], enabled: !next[activeSheet][key].enabled } }
      return next
    })
  }

  function setColumnType(colIndex, newType) {
    setColumnStates(prev => {
      const next = [...prev]
      const key = String(colIndex)
      const isClassA = (TYPE_CLASS[newType] ?? CLASS.X) === CLASS.A
      next[activeSheet] = {
        ...next[activeSheet],
        [key]: {
          type: newType,
          // If switching to Klasse A, force enabled; otherwise keep current
          enabled: isClassA ? true : next[activeSheet][key].enabled,
        },
      }
      return next
    })
  }

  const stats = useMemo(() => {
    const cols = sheet.columns
    const active = cols.filter(c => sheetState[String(c.index)]?.enabled).length
    const classA = cols.filter(c => (TYPE_CLASS[sheetState[String(c.index)]?.type] ?? CLASS.X) === CLASS.A).length
    const classB = cols.filter(c => (TYPE_CLASS[sheetState[String(c.index)]?.type] ?? CLASS.X) === CLASS.B).length
    const classC = cols.filter(c => (TYPE_CLASS[sheetState[String(c.index)]?.type] ?? CLASS.X) === CLASS.C).length
    return { active, total: cols.length, classA, classB, classC }
  }, [sheet, sheetState])

  return (
    <div className="w-full animate-slide-up">

      {/* ── File info bar ── */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-lg mb-4"
        style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <FileIcon />
          <div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {data.fileName}
            </span>
            <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>
              {(data.fileSize / 1024).toFixed(1)} KB · {data.sheets.length} Sheet{data.sheets.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ResetButton onClick={onReset} />
          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Vorschau
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Sheet tabs ── */}
      {data.sheets.length > 1 && (
        <div className="flex items-center gap-1.5 px-1 mb-3 overflow-x-auto">
          {data.sheets.map((s, i) => (
            <button key={s.name} onClick={() => setActiveSheet(i)}
              className={`sheet-tab ${i === activeSheet ? 'sheet-tab-active' : ''}`}>
              {s.name}
              <span className="ml-1.5 font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {s.rowCount}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Column table ── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>

        {/* Header bar */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: 'var(--bg-2)', borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sheet.name}</span>
            <Tag>{sheet.rowCount} Zeilen</Tag>
            <Tag>{stats.active}/{stats.total} aktiv</Tag>
          </div>
          <div className="flex items-center gap-2">
            {stats.classA > 0 && <span className="badge-class-a" style={{ width: 22, height: 22 }}>{stats.classA}</span>}
            {stats.classB > 0 && <span className="badge-class-b" style={{ width: 22, height: 22 }}>{stats.classB}</span>}
            {stats.classC > 0 && <span className="badge-class-c" style={{ width: 22, height: 22 }}>{stats.classC}</span>}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Spalten</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 px-4 py-2 text-xs"
          style={{ backgroundColor: 'rgba(0,0,0,0.12)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
          <LegendItem cls="a" label="A – Immer anonymisiert" />
          <LegendItem cls="b" label="B – Standard AN" />
          <LegendItem cls="c" label="C – Standard AUS" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto" style={{ backgroundColor: 'var(--bg-1)' }}>
          <table className="schema-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th>Spalte</th>
                <th style={{ width: 36 }}>Kl.</th>
                <th>Typ / Override</th>
                <th style={{ width: 48 }}>Aktiv</th>
                <th>Beispielwerte (maskiert)</th>
              </tr>
            </thead>
            <tbody>
              {sheet.columns.map(col => (
                <ColumnRow
                  key={col.index}
                  col={col}
                  colState={sheetState[String(col.index)] ?? { enabled: false, type: col.detectedType }}
                  onToggle={() => toggleColumn(col.index)}
                  onTypeChange={t => setColumnType(col.index, t)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Info footer ── */}
      <div className="mt-4 flex items-start gap-2.5 rounded-lg px-4 py-3 text-xs"
        style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25"/>
          <path d="M7 6.5v3.5M7 4.5h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
        </svg>
        <span>
          Typ-Erkennung überschreibbar per Dropdown. Klasse A erzwingt immer Anonymisierung.
          Alle Beispielwerte sind maskiert – kein Originalwert im UI sichtbar.
        </span>
      </div>
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────

function Tag({ children }) {
  return (
    <span className="font-mono text-xs px-2 py-0.5 rounded"
      style={{ backgroundColor: 'var(--bg-3)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
      {children}
    </span>
  )
}

function LegendItem({ cls, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`badge-class-${cls}`} style={{ fontSize: '9px', width: 14, height: 14, borderRadius: 3 }}>
        {cls.toUpperCase()}
      </span>
      <span>{label}</span>
    </div>
  )
}

function FileIcon() {
  return (
    <div className="rounded-md p-1.5" style={{ backgroundColor: 'var(--bg-3)', border: '1px solid var(--border-default)' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2h7l4 4v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="var(--accent)" strokeWidth="1.25" strokeLinejoin="round"/>
        <path d="M10 2v4h4" stroke="var(--accent)" strokeWidth="1.25" opacity="0.6"/>
      </svg>
    </div>
  )
}

function ResetButton({ onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
      style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M1 6A5 5 0 1111 6M1 6V2M1 6H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Andere Datei
    </button>
  )
}
