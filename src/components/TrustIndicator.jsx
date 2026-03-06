/**
 * TrustIndicator – persistent header badge.
 * Always shows: "🟢 Lokal verarbeitet – 0 Bytes gesendet"
 * Clicking it expands a small explainer panel.
 */

import { useState } from 'react'

export default function TrustIndicator() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* ── Main badge ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium
                   transition-colors duration-150
                   hover:bg-white/5 active:bg-white/8"
        style={{ color: 'var(--text-secondary)' }}
        title="Wie funktioniert lokale Verarbeitung?"
      >
        {/* Pulsing green dot */}
        <span className="relative flex items-center">
          <span
            className="absolute inline-flex h-2 w-2 rounded-full opacity-60"
            style={{
              backgroundColor: 'var(--accent)',
              animation: 'pulse-dot 2.5s ease-in-out infinite',
            }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        </span>

        <span className="font-mono" style={{ letterSpacing: '0.01em' }}>
          Lokal verarbeitet
        </span>

        <span
          className="h-3 w-px"
          style={{ backgroundColor: 'var(--border-default)' }}
        />

        <span className="font-mono">0 Bytes gesendet</span>

        {/* Chevron */}
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.5 }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── Explainer dropdown ── */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-lg p-4 z-50 animate-fade-in"
          style={{
            backgroundColor: 'var(--bg-2)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: 'var(--accent)' }}
            />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Wie funktioniert das?
            </span>
          </div>

          {/* Body */}
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            SheetJS liest deine Datei direkt im <strong style={{ color: 'var(--text-primary)' }}>Browser-Speicher</strong>.
            Die Verarbeitung passiert in JavaScript auf deinem Gerät.
            Nichts verlässt deinen Computer.
          </p>

          {/* Proof link */}
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            Überprüfe es selbst:{' '}
            <span className="font-mono" style={{ color: 'var(--accent)', fontSize: '11px' }}>
              DevTools → Network Tab
            </span>
            {' '}– keine einzige Anfrage an externe Server.
          </p>

          {/* Trust points */}
          <div
            className="rounded-md p-3 space-y-1.5"
            style={{ backgroundColor: 'var(--bg-3)', border: '1px solid var(--border-subtle)' }}
          >
            {[
              'Kein Backend',
              'Kein Cloud-Upload',
              'Kein Account',
              'Open Source (MIT)',
            ].map(point => (
              <div key={point} className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M2 6l3 3 5-5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
