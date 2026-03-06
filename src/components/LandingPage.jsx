/**
 * LandingPage – Public landing page before the tool.
 * 6 sections: Hero, Das Problem, Wie es funktioniert, Der Name, Typen & Abdeckung, Privacy by Design.
 * No em-dashes. Mobile-responsive. Uses existing design tokens.
 */

const GITHUB_ISSUES = 'https://github.com/LarryLunatic87/Schemask/issues/new/choose'

// ── Type coverage data ──────────────────────────────────────────
const TYPE_GROUPS = [
  {
    label: 'Klasse A',
    desc: 'Immer anonymisiert',
    color: '#ef4444',
    types: ['IBAN', 'USt-IdNr', 'BIC/SWIFT', 'GPS-Koordinaten'],
  },
  {
    label: 'Klasse B',
    desc: 'Standard AN',
    color: '#f97316',
    types: ['Email', 'Telefon', 'UUID', 'URL', 'IP-Adresse', 'EAN', 'Kunden-Nr', 'Firma', 'Name', 'Charge', 'Vertrag', 'Serien-Nr', 'Hash-ID', 'Betrag', 'Datum', 'Timestamp', 'PLZ'],
  },
  {
    label: 'Klasse C',
    desc: 'Standard AUS',
    color: '#6b7280',
    types: ['ISO2-Code', 'ISO3-Code', 'Land', 'Quartal', 'Kalenderwoche', 'Jahr', 'Boolean'],
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Datei laden',
    desc: 'Excel (.xlsx/.xls) oder CSV per Drag-and-drop. Die Datei verlasst den Browser nicht. Alles verarbeitet JavaScript lokal.',
  },
  {
    n: '02',
    title: 'Typen prufen',
    desc: 'Schemask erkennt automatisch 33 Datentypen in 3 Klassen. Jede Spalte einzeln prufen, Typ uberschreiben, Anonymisierung an- oder abschalten.',
  },
  {
    n: '03',
    title: 'Export',
    desc: 'Anonymisierte Excel-Datei herunterladen, strukturidentisch zum Original. Optional: Mapping-CSV und Schema-JSON.',
  },
]

const PROBLEMS = [
  {
    title: 'KI-Tools brauchen echte Daten',
    desc: 'ChatGPT und Claude konnen Datensatze analysieren und Formeln schreiben. Das funktioniert aber nur, wenn sie die Struktur der Daten sehen. Echte Kundendaten gehoren nicht in eine KI.',
  },
  {
    title: 'DSGVO ist kein Detail',
    desc: 'Personenbezogene Daten durfen nicht ohne Rechtsgrundlage verarbeitet werden. Das gilt besonders fur SaaS-Tools und KI-APIs.',
  },
  {
    title: 'Anonymisierung ist aufwandig',
    desc: 'Spalte fur Spalte in Excel bearbeiten, Formeln entfernen, Werte ersetzen. Das kostet Zeit und Fehler passieren dabei. Schemask macht das in Sekunden.',
  },
]

const PRIVACY_POINTS = [
  { title: 'Kein Server', desc: 'Keine API-Aufrufe, keine Webhooks, keine Telemetrie. Die App ist eine HTML-Datei.' },
  { title: 'Kein Account', desc: 'Kein Login, kein Tracking, keine Cookies. Schemask weiss nichts uber den Nutzer.' },
  { title: 'Open Source', desc: 'Der Quellcode ist offentlich einsehbar. Jeder kann prufen, was die App tut.' },
  { title: 'Session-Konsistenz', desc: 'Gleiche Eingabe ergibt immer gleiche Ausgabe, innerhalb einer Sitzung. Beim Neuladen beginnt alles neu.' },
]

// ── Sub-components ─────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="text-xs font-mono font-medium tracking-widest uppercase mb-4"
      style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}>
      {children}
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <h2 className="text-2xl font-semibold mb-4"
      style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
      {children}
    </h2>
  )
}

function Divider() {
  return <div className="my-24" style={{ borderTop: '1px solid var(--border-subtle)' }} />
}

// ── Main component ─────────────────────────────────────────────

export default function LandingPage({ onStart }) {
  return (
    <div className="w-full">

      {/* ── 1. Hero ──────────────────────────────────────────── */}
      <section className="py-20 animate-fade-in">
        <div className="max-w-2xl">
          <div className="text-xs font-mono font-medium tracking-widest uppercase mb-6 flex items-center gap-2"
            style={{ color: 'var(--accent)' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            Browser-only · Kein Server · Open Source
          </div>

          <h1 className="text-4xl font-semibold mb-6"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Excel-Daten anonymisieren.
            <br />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
              Lokal. Sicher. In Sekunden.
            </span>
          </h1>

          <p className="text-base mb-10 max-w-xl" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            Schemask erkennt 33 sensible Datentypen automatisch, ersetzt sie durch realistische
            Pseudodaten und erzeugt eine strukturidentische Excel-Datei, bereit fur ChatGPT,
            Claude oder andere KI-Tools. Kein Byte verlasst den Browser.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onStart}
              className="px-6 py-3 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: 'var(--accent)', color: '#000' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Jetzt ausprobieren
            </button>
            <a href={GITHUB_ISSUES} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg text-sm font-medium"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}
            >
              Feedback geben
            </a>
          </div>
        </div>

        {/* Type badge preview strip */}
        <div className="mt-16 flex flex-wrap gap-2 opacity-60 pointer-events-none select-none">
          {['IBAN', 'Email', 'Telefon', 'USt-IdNr', 'Datum', 'Kunden-Nr', 'Betrag', 'UUID', 'PLZ', 'Firma', 'BIC', 'GPS', 'Hash', 'Serien-Nr'].map(t => (
            <span key={t} className="font-mono text-xs px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--bg-2)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
              }}>
              {t}
            </span>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── 2. Das Problem ──────────────────────────────────── */}
      <section>
        <SectionLabel>Das Problem</SectionLabel>
        <SectionHeading>Warum anonymisieren?</SectionHeading>
        <p className="text-sm mb-10 max-w-xl" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          Moderne KI-Tools sind machtiger als je zuvor, aber sie verarbeiten alles,
          was hineingeht. Drei Grunde, warum das ein Problem ist:
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {PROBLEMS.map(p => (
            <div key={p.title} className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-subtle)' }}>
              <div className="w-6 h-6 rounded-md mb-4 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              </div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── 3. Wie es funktioniert ──────────────────────────── */}
      <section>
        <SectionLabel>Workflow</SectionLabel>
        <SectionHeading>Wie es funktioniert</SectionHeading>
        <p className="text-sm mb-10 max-w-xl" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          Drei Schritte. Keine Einrichtung, keine Registrierung.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(s => (
            <div key={s.n} className="rounded-xl p-6 relative overflow-hidden"
              style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-subtle)' }}>
              <div className="font-mono text-5xl font-bold absolute top-4 right-5 select-none"
                style={{ color: 'var(--border-subtle)', lineHeight: 1 }}>
                {s.n}
              </div>
              <h3 className="text-sm font-semibold mb-2 relative" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
              <p className="text-xs leading-relaxed relative" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onStart}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Datei laden und loslegen
          </button>
        </div>
      </section>

      <Divider />

      {/* ── 4. Der Name ─────────────────────────────────────── */}
      <section>
        <SectionLabel>Der Name</SectionLabel>
        <div className="grid gap-10 sm:grid-cols-2 items-start">
          <div>
            <SectionHeading>Schema + Mask</SectionHeading>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              Der Name kombiniert zwei Konzepte, die das Tool beschreiben:
            </p>
            <div className="space-y-4">
              <NameCard word="Schema" def="Die Struktur der Daten: Spalten, Typen, Relationen. Schemask erkennt und erhalt das Schema vollstandig." />
              <NameCard word="Mask" def="Das Verdecken von Werten. Nicht loschen, sondern ersetzen, mit realistischen, konsistenten Pseudodaten." />
            </div>
          </div>
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-subtle)' }}>
            <div className="font-mono text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Beispiel</div>
              <Row label="Mueller GmbH" value="Firma_001" />
              <Row label="max@example.com" value="user_001@example.com" />
              <Row label="DE89 3704 0044 ..." value="DE71 5823 9012 ..." />
              <Row label="49.1234, 11.5678" value="49.1156, 11.5521" />
              <Row label="K-10042" value="K-001" />
              <Row label="01.03.2024" value="12.04.2024" />
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 5. Typen & Abdeckung ────────────────────────────── */}
      <section>
        <SectionLabel>Typen</SectionLabel>
        <SectionHeading>33 Datentypen in 3 Klassen</SectionHeading>
        <p className="text-sm mb-8 max-w-xl" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          Schemask erkennt alle gangigen sensiblen Datentypen in europaischen Geschaftsdaten --
          automatisch, ohne Konfiguration.
        </p>

        <div className="space-y-4">
          {TYPE_GROUPS.map(g => (
            <div key={g.label} className="rounded-xl p-5"
              style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md"
                  style={{
                    backgroundColor: `${g.color}18`,
                    border: `1px solid ${g.color}30`,
                    color: g.color,
                  }}>
                  {g.label}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{g.desc}</span>
                <span className="ml-auto font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{g.types.length} Typen</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.types.map(t => (
                  <span key={t} className="font-mono text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: 'var(--bg-3)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          Zusatzlich: Zahl (generisch) und Text als Fallback-Typen ohne Anonymisierung.
        </p>
      </section>

      <Divider />

      {/* ── 6. Privacy by Design ────────────────────────────── */}
      <section>
        <SectionLabel>Privacy by Design</SectionLabel>
        <SectionHeading>Keine Daten, keine Risiken</SectionHeading>
        <p className="text-sm mb-8 max-w-xl" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          Schemask wurde von Grund auf so gebaut, dass keine Daten gespeichert oder ubertragen
          werden konnen, nicht durch Design-Entscheidungen, sondern durch die Architektur.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {PRIVACY_POINTS.map(p => (
            <div key={p.title} className="flex gap-4 p-5 rounded-xl"
              style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-subtle)' }}>
              <span className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
              <div>
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{p.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-xl"
          style={{ backgroundColor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <div className="flex-1">
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Bereit zum Anonymisieren?
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Keine Installation, kein Account. Einfach starten.
            </div>
          </div>
          <button
            onClick={onStart}
            className="flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Jetzt starten
          </button>
        </div>
      </section>

      <Divider />

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Schemask</span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>v0.2 · Beta</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>MIT License</span>
          </div>

          <div className="flex items-center gap-6">
            <a href={GITHUB_ISSUES} target="_blank" rel="noopener noreferrer"
              className="text-xs font-medium flex items-center gap-1.5"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Bug melden / Feedback
            </a>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Kein Server. Kein Account. Kein Tracking.
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────

function NameCard({ word, def }) {
  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-3)', border: '1px solid var(--border-subtle)' }}>
      <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent)' }}>{word}</span>
      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{def}</p>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 text-xs truncate" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
        <path d="M2 6h8M7 3l3 3-3 3" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="flex-1 text-xs truncate" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}
