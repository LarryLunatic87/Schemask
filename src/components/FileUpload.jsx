/**
 * FileUpload – drag & drop + click upload for .xlsx/.xls/.csv
 * After parsing: emits the parsed schema to the parent via onParsed()
 */

import { useState, useRef, useCallback } from 'react'
import { parseFile } from '../lib/sheetParser'

const ACCEPTED = ['.xlsx', '.xls', '.csv']
const ACCEPTED_MIME = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
]
const MAX_SIZE_MB = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export default function FileUpload({ onParsed }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = useCallback(async (file) => {
    setError(null)

    if (!file) return

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setError(`Datei zu groß (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: ${MAX_SIZE_MB} MB.`)
      return
    }

    // Validate extension
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      setError(`Nicht unterstütztes Format. Erlaubt: ${ACCEPTED.join(', ')}`)
      return
    }

    setIsLoading(true)
    try {
      const result = await parseFile(file)
      onParsed(result)
    } catch (err) {
      console.error(err)
      setError('Fehler beim Lesen der Datei. Ist sie eine gültige Excel/CSV-Datei?')
    } finally {
      setIsLoading(false)
    }
  }, [onParsed])

  // ── Drag handlers ──────────────────────────────────────────
  const onDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only clear if leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }, [])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }, [handleFile])

  const onInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }, [handleFile])

  return (
    <div className="w-full">
      {/* ── Drop zone ── */}
      <div
        className={`relative rounded-xl cursor-pointer select-none
                    ${isDragging ? 'dropzone-active' : 'dropzone-idle'}`}
        style={{
          backgroundColor: isDragging ? 'var(--accent-dim)' : 'var(--bg-1)',
          minHeight: '260px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => !isLoading && inputRef.current?.click()}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={onInputChange}
          className="sr-only"
          tabIndex={-1}
        />

        {isLoading ? (
          <LoadingState />
        ) : isDragging ? (
          <DragActiveState />
        ) : (
          <IdleState />
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="mt-3 flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm animate-fade-in"
          style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

/* ── Sub-states ──────────────────────────────────────────────── */

function IdleState() {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center pointer-events-none">
      {/* Upload icon */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: 'var(--bg-3)',
          border: '1px solid var(--border-default)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 18V10M14 10l-4 4M14 10l4 4"
            stroke="var(--text-secondary)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 20v2a2 2 0 002 2h16a2 2 0 002-2v-2"
            stroke="var(--text-muted)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div>
        <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          Excel-Datei hier ablegen
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          oder{' '}
          <span style={{ color: 'var(--accent)' }} className="font-medium">
            Datei auswählen
          </span>
        </p>
      </div>

      {/* Format pills */}
      <div className="flex items-center gap-2">
        {['.xlsx', '.xls', '.csv'].map(fmt => (
          <span
            key={fmt}
            className="font-mono text-xs px-2.5 py-1 rounded-md"
            style={{
              backgroundColor: 'var(--bg-3)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            {fmt}
          </span>
        ))}
        <span
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          · max. {10} MB
        </span>
      </div>
    </div>
  )
}

function DragActiveState() {
  return (
    <div className="flex flex-col items-center gap-3 p-8 pointer-events-none">
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: 'var(--accent-dim)',
          border: '1px solid var(--accent)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 6v12M14 6l-4 4M14 6l4 4"
            stroke="var(--accent)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 20v2a2 2 0 002 2h16a2 2 0 002-2v-2"
            stroke="var(--accent)"
            strokeWidth="1.75"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>
      <p className="text-base font-medium" style={{ color: 'var(--accent)' }}>
        Loslassen zum Hochladen
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      {/* Spinner */}
      <div
        className="h-10 w-10 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: 'var(--accent)',
          borderRightColor: 'var(--accent-glow)',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <div className="text-center">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          Datei wird verarbeitet…
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Lokal in deinem Browser
        </p>
      </div>
    </div>
  )
}
