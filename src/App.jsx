import { useState } from 'react'
import TrustIndicator from './components/TrustIndicator'
import FileUpload from './components/FileUpload'
import ColumnConfig from './components/ColumnConfig'
import PreviewPanel from './components/PreviewPanel'
import ExportPanel from './components/ExportPanel'
import LandingPage from './components/LandingPage'
import { reset as resetConsistencyMap } from './lib/consistencyMap'
import { defaultEnabled } from './lib/dataTypes'

// view: 'landing' | 'upload' | 'config' | 'preview' | 'export'
const GITHUB_ISSUES = 'https://github.com/LarryLunatic87/Schemask/issues/new/choose'

/** Build initial columnStates from parsedData */
function initColumnStates(data) {
  return data.sheets.map(sheet =>
    Object.fromEntries(
      sheet.columns.map(col => [String(col.index), {
        enabled: defaultEnabled(col.detectedType),
        type: col.detectedType,
      }])
    )
  )
}

export default function App() {
  const [parsedData, setParsedData] = useState(null)
  const [columnStates, setColumnStates] = useState(null)  // Array<{[colIdx]: {enabled,type}}>
  const [view, setView] = useState('landing')             // 'landing'|'upload'|'config'|'preview'|'export'

  const handleParsed = (data) => {
    resetConsistencyMap()
    setColumnStates(initColumnStates(data))
    setParsedData(data)
    setView('config')
  }

  const handleReset = () => {
    resetConsistencyMap()
    setParsedData(null)
    setColumnStates(null)
    setView('upload')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-0)' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40"
        style={{
          backgroundColor: 'rgba(8,9,14,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* ── Logo ── */}
          <button
            className="flex items-center gap-3"
            onClick={() => { if (!parsedData) setView('landing') }}
            style={{ cursor: parsedData ? 'default' : 'pointer', background: 'none', border: 'none', padding: 0 }}
          >
            <LogoMark />
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
            >
              Schemask
            </span>
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'var(--bg-3)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
              }}
            >
              v0.2 · Beta
            </span>
          </button>

          {/* ── Right side: Trust + GitHub ── */}
          <div className="flex items-center gap-3">
            <TrustIndicator />

            <div
              className="h-4 w-px"
              style={{ backgroundColor: 'var(--border-default)' }}
            />

            <a
              href={GITHUB_ISSUES}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md
                         transition-colors duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 py-12">

        {view === 'landing' && (
          <LandingPage onStart={() => setView('upload')} />
        )}

        {(view === 'upload' && !parsedData) && (
          <>
            {/* ── Hero ── */}
            <div className="mb-10 animate-fade-in">
              <h1
                className="text-3xl font-semibold mb-3"
                style={{
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                }}
              >
                Excel anonymisieren.
                <br />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                  Lokal. Sicher. Sofort.
                </span>
              </h1>
              <p
                className="text-base max-w-xl"
                style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
              >
                Lade eine Excel-Datei. Bekomme eine strukturgleiche, anonymisierte Version,
                bereit fur ChatGPT oder Claude. Kein Server, kein Upload, keine Daten verlassen
                deinen Browser.
              </p>
            </div>

            {/* ── Trust points ── */}
            <div className="flex items-center gap-6 mb-8 animate-slide-up-delay">
              {[
                { icon: '🔒', text: 'Kein Upload' },
                { icon: '💻', text: 'Lokal im Browser' },
                { icon: '⚡', text: 'In Sekunden' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <span
                    className="text-sm leading-none"
                    style={{ display: 'inline-block', width: '1rem', textAlign: 'center' }}
                  >
                    {icon}
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Upload zone ── */}
            <FileUpload onParsed={handleParsed} />
          </>
        )}

        {parsedData && (
          <>
          {view === 'config' && (
            <ColumnConfig
              data={parsedData}
              columnStates={columnStates}
              setColumnStates={setColumnStates}
              onReset={handleReset}
              onPreview={() => setView('preview')}
            />
          )}
          {view === 'preview' && (
            <PreviewPanel
              data={parsedData}
              columnStates={columnStates}
              onBack={() => setView('config')}
              onExport={() => setView('export')}
            />
          )}
          {view === 'export' && (
            <ExportPanel
              data={parsedData}
              columnStates={columnStates}
              onBack={() => setView('preview')}
              onReset={handleReset}
            />
          )}
          </>
        )}
      </main>

      {/* ── Grid texture overlay (decorative) ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.4,
          zIndex: -1,
        }}
      />
    </div>
  )
}

/* ── Logo mark ───────────────────────────────────────────────── */
function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {/* Grid of cells representing a spreadsheet */}
      <rect x="1" y="1" width="9" height="9" rx="2" fill="var(--accent)" opacity="0.9"/>
      <rect x="12" y="1" width="9" height="9" rx="2" fill="var(--border-strong)"/>
      <rect x="1" y="12" width="9" height="9" rx="2" fill="var(--border-strong)"/>
      <rect x="12" y="12" width="9" height="9" rx="2" fill="var(--border-default)" opacity="0.6"/>
      {/* Mask/shield overlay */}
      <rect x="5" y="5" width="12" height="12" rx="2"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  )
}
