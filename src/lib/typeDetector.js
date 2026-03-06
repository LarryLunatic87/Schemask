/**
 * typeDetector.js
 * Full type detection following spec v3, chapter 5 + 6.
 * Detection order: IBAN → VAT_ID → BIC → EMAIL → URL → IP → UUID → TELEFON
 *                  → EAN → DATUM → BETRAG → PLZ → ISO → PROZENT → ...
 *
 * Context-dependent types (PLZ, KOSTENSTELLE, KUNDENNUMMER, etc.)
 * require columnName to be passed.
 */

import { TYPE, TYPE_CLASS, CLASS } from './dataTypes'
export { TYPE, CLASS, TYPE_CLASS }

// ── Re-export maskValue so existing imports still work ──────────
export { maskValue } from './masker'

// ── Re-export class helpers ─────────────────────────────────────
export { TYPE_BADGE_CLASS, TYPE_LABEL, CLASS_BADGE, defaultEnabled } from './dataTypes'

// Klasse A set (for detectColumnType early-exit)
export const CLASS_A_TYPES = new Set(
  Object.entries(TYPE_CLASS)
    .filter(([, cls]) => cls === CLASS.A)
    .map(([t]) => t)
)

// ── Pattern libraries (spec chapter 5) ─────────────────────────

const VAT_PATTERNS = [
  /^DE[0-9]{9}$/,
  /^ATU[0-9]{8}$/,
  /^CHE[0-9]{3}[\.\-]?[0-9]{3}[\.\-]?[0-9]{3}(MWST|TVA|IVA)?$/,
  /^FR[A-Z0-9]{2}[0-9]{9}$/,
  /^IT[0-9]{11}$/,
  /^ES[A-Z0-9][0-9]{7}[A-Z0-9]$/,
  /^NL[0-9]{9}B[0-9]{2}$/,
  /^BE0[0-9]{9}$/,
  /^LU[0-9]{8}$/,
  /^PT[0-9]{9}$/,
  /^SE[0-9]{12}$/,
  /^DK[0-9]{8}$/,
  /^FI[0-9]{8}$/,
  /^NO[0-9]{9}MVA$/,
  /^PL[0-9]{10}$/,
  /^CZ[0-9]{8,10}$/,
  /^SK[0-9]{10}$/,
  /^HU[0-9]{8}$/,
  /^RO[0-9]{2,10}$/,
  /^GB([0-9]{9}|[0-9]{12}|GD[0-9]{3}|HA[0-9]{3})$/,
]

const IBAN_PATTERNS = [
  { cc: 'DE', len: 22, re: /^DE[0-9]{20}$/ },
  { cc: 'AT', len: 20, re: /^AT[0-9]{18}$/ },
  { cc: 'CH', len: 21, re: /^CH[0-9]{7}[A-Z0-9]{12}$/ },
  { cc: 'LI', len: 21, re: /^LI[0-9]{7}[A-Z0-9]{12}$/ },
  { cc: 'FR', len: 27, re: /^FR[0-9]{12}[A-Z0-9]{11}[0-9]{2}$/ },
  { cc: 'IT', len: 27, re: /^IT[0-9]{2}[A-Z][0-9]{10}[A-Z0-9]{12}$/ },
  { cc: 'ES', len: 24, re: /^ES[0-9]{22}$/ },
  { cc: 'NL', len: 18, re: /^NL[0-9]{2}[A-Z]{4}[0-9]{10}$/ },
  { cc: 'BE', len: 16, re: /^BE[0-9]{14}$/ },
  { cc: 'LU', len: 20, re: /^LU[0-9]{5}[A-Z0-9]{13}$/ },
  { cc: 'PT', len: 25, re: /^PT[0-9]{23}$/ },
  { cc: 'SE', len: 24, re: /^SE[0-9]{22}$/ },
  { cc: 'DK', len: 18, re: /^DK[0-9]{16}$/ },
  { cc: 'FI', len: 18, re: /^FI[0-9]{16}$/ },
  { cc: 'NO', len: 15, re: /^NO[0-9]{13}$/ },
  { cc: 'PL', len: 28, re: /^PL[0-9]{26}$/ },
  { cc: 'CZ', len: 24, re: /^CZ[0-9]{22}$/ },
  { cc: 'SK', len: 24, re: /^SK[0-9]{22}$/ },
  { cc: 'HU', len: 28, re: /^HU[0-9]{26}$/ },
  { cc: 'RO', len: 24, re: /^RO[0-9]{2}[A-Z]{4}[A-Z0-9]{16}$/ },
  { cc: 'GB', len: 22, re: /^GB[0-9]{2}[A-Z]{4}[0-9]{14}$/ },
]

// BIC: 8 or 11 chars: 4 bank + 2 country + 2 location + optional 3 branch
const BIC_RE = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/

const PHONE_PATTERNS = [
  /^\+[1-9][0-9]{6,14}$/,                  // E.164
  /^(\+49|0049|0)[1-9][0-9]{3,13}$/,       // DE
  /^(\+43|0043|0)[1-9][0-9]{3,12}$/,       // AT
  /^(\+41|0041|0)[1-9][0-9]{8}$/,          // CH
  /^(\+33|0033|0)[1-9][0-9]{8}$/,          // FR
  /^(\+39|0039)[0-9]{6,12}$/,              // IT
  /^(\+34|0034)[6-9][0-9]{8}$/,            // ES
  /^(\+31|0031|0)[1-9][0-9]{8}$/,          // NL
  /^(\+32|0032|0)[1-9][0-9]{7,8}$/,        // BE
  /^(\+44|0044|0)[1-9][0-9]{9}$/,          // GB
  /^(\+1|001)?[2-9][0-9]{9}$/,             // US
]

const PLZ_PATTERNS = [
  { cc: 'DE', re: /^[0-9]{5}$/,              validate: v => +v >= 1001 && +v <= 99998 },
  { cc: 'AT', re: /^[0-9]{4}$/,              validate: v => +v >= 1000 && +v <= 9999 },
  { cc: 'CH', re: /^[0-9]{4}$/,              validate: v => +v >= 1000 && +v <= 9999 },
  { cc: 'FR', re: /^[0-9]{5}$/ },
  { cc: 'IT', re: /^[0-9]{5}$/ },
  { cc: 'ES', re: /^[0-9]{5}$/,              validate: v => +v >= 1000 },
  { cc: 'NL', re: /^[0-9]{4}\s?[A-Z]{2}$/i },
  { cc: 'BE', re: /^[0-9]{4}$/,              validate: v => +v >= 1000 && +v <= 9999 },
  { cc: 'PT', re: /^[0-9]{4}-[0-9]{3}$/ },
  { cc: 'SE', re: /^[0-9]{3}\s?[0-9]{2}$/ },
  { cc: 'DK', re: /^[0-9]{4}$/,              validate: v => +v >= 1000 && +v <= 9990 },
  { cc: 'FI', re: /^[0-9]{5}$/ },
  { cc: 'NO', re: /^[0-9]{4}$/ },
  { cc: 'PL', re: /^[0-9]{2}-[0-9]{3}$/ },
  { cc: 'CZ', re: /^[0-9]{3}\s?[0-9]{2}$/ },
  { cc: 'SK', re: /^[0-9]{3}\s?[0-9]{2}$/ },
  { cc: 'HU', re: /^[0-9]{4}$/,              validate: v => +v >= 1000 },
  { cc: 'RO', re: /^[0-9]{6}$/ },
  { cc: 'GB', re: /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i },
  { cc: 'US', re: /^[0-9]{5}(-[0-9]{4})?$/ },
  { cc: 'CA', re: /^[A-Z][0-9][A-Z]\s?[0-9][A-Z][0-9]$/i },
]

const ISO2_CODES = new Set([
  'DE','AT','CH','FR','IT','ES','NL','BE','LU','PT','SE','DK','FI','NO',
  'PL','CZ','SK','HU','RO','BG','HR','SI','EE','LV','LT',
  'GB','IE','US','CA','AU','NZ','JP','CN','IN','BR','MX','RU','TR',
  'GR','CY','MT','IS','LI','MC','SM','AD',
])

const ISO3_CODES = new Set([
  'DEU','AUT','CHE','FRA','ITA','ESP','NLD','BEL','LUX','PRT','SWE','DNK',
  'FIN','NOR','POL','CZE','SVK','HUN','ROU','BGR','HRV','SVN','EST','LVA',
  'LTU','GBR','IRL','USA','CAN','AUS','NZL','JPN','CHN','IND','BRA','MEX',
  'RUS','TUR','GRC','CYP','MLT','ISL','LIE',
])

const LEGAL_FORMS = [
  /\bGmbH\b/i, /\b(GmbH\s*&\s*Co\.?\s*KG)\b/i,
  /\bAktiengesellschaft\b/i, /\b(?<!\w)AG(?!\w)/,
  /\b(?<!\w)SE(?!\w)/, /\b(?<!\w)KG(?!\w)/,
  /\b(?<!\w)OHG(?!\w)/, /\b(?<!\w)GbR(?!\w)/,
  /\b(?<!\w)UG(?!\w)/, /\bGesmbH\b/i, /\b(?<!\w)OG(?!\w)/,
  /\bSàrl\b/i, /\b(?<!\w)SAS(?!\w)/, /\b(?<!\w)SARL(?!\w)/,
  /\b(?<!\w)SNC(?!\w)/, /\b(?<!\w)SCI(?!\w)/,
  /\b(?<!\w)SRL(?!\w)/, /\b(?<!\w)SpA(?!\w)/,
  /\b(?<!\w)S\.p\.A\.(?!\w)/, /\b(?<!\w)Snc(?!\w)/,
  /\b(?<!\w)SL(?!\w)/, /\b(?<!\w)SLL(?!\w)/,
  /\b(?<!\w)BV(?!\w)/, /\b(?<!\w)NV(?!\w)/, /\b(?<!\w)VOF(?!\w)/,
  /\bLtd\.?\b/i, /\b(?<!\w)LLP(?!\w)/, /\b(?<!\w)PLC(?!\w)/,
  /\bInc\.?\b/i, /\b(?<!\w)LLC(?!\w)/, /\bCorp\.?\b/i,
  /\b(?<!\w)S\.A\.(?!\w)/,
]

const COUNTRY_NAMES = new Set([
  'Deutschland','Germany','Österreich','Austria','Schweiz','Switzerland',
  'Frankreich','France','Italien','Italy','Spanien','Spain',
  'Niederlande','Netherlands','Belgien','Belgium','Polen','Poland',
  'Tschechien','Czech Republic','Schweden','Sweden','Dänemark','Denmark',
  'Norwegen','Norway','Finnland','Finland','Ungarn','Hungary',
  'Rumänien','Romania','Großbritannien','United Kingdom','England',
  'USA','United States','Kanada','Canada','Australien','Australia',
  'Japan','China','Indien','India','Brasilien','Brazil',
])

// ── Column-name helpers ─────────────────────────────────────────

function colContains(columnName, ...terms) {
  if (!columnName) return false
  const cn = columnName.toLowerCase()
  return terms.some(t => cn.includes(t.toLowerCase()))
}

// ── Single-value detection ──────────────────────────────────────

/**
 * Detect the type of a single cell value.
 * @param {*}      value
 * @param {string} [columnName]      – column header for context-dependent types
 * @param {string[]} [neighborCols]  – adjacent column names for PLZ detection
 */
export function detectType(value, columnName = '', neighborCols = []) {
  if (value === null || value === undefined) return TYPE.TEXT
  const str = String(value).trim()
  if (str === '' || str.startsWith('=')) return TYPE.TEXT

  // ── 1. IBAN (Klasse A) ──────────────────────────────────────
  {
    const clean = str.replace(/\s/g, '').toUpperCase()
    if (clean.length >= 15 && clean.length <= 34) {
      const entry = IBAN_PATTERNS.find(p => clean.startsWith(p.cc))
      if (entry && entry.re.test(clean)) return TYPE.IBAN
    }
  }

  // ── 2. VAT_ID (Klasse A) ────────────────────────────────────
  {
    const clean = str.replace(/[\s.\-]/g, '').toUpperCase()
    if (VAT_PATTERNS.some(re => re.test(clean))) return TYPE.VAT_ID
  }

  // ── 3. BIC/SWIFT (Klasse A) ─────────────────────────────────
  {
    const clean = str.replace(/\s/g, '').toUpperCase()
    if ((clean.length === 8 || clean.length === 11) && BIC_RE.test(clean)) {
      // Extra check: 3rd + 4th chars must be valid ISO2 country code
      const country = clean.slice(4, 6)
      if (ISO2_CODES.has(country)) return TYPE.BIC_SWIFT
    }
  }

  // ── 3b. GPS_KOORDINATEN (Klasse A) ──────────────────────────
  // Decimal degree pair: "48.1234, 11.5678" or "48.123456 11.567890"
  {
    const gpsMatch = str.match(/^(-?\d{1,2}\.\d{4,})[,\s]+(-?\d{1,3}\.\d{4,})$/)
    if (gpsMatch) {
      const lat = parseFloat(gpsMatch[1])
      const lon = parseFloat(gpsMatch[2])
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) return TYPE.GPS_KOORDINATEN
    }
  }

  // ── 4. Email ────────────────────────────────────────────────
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return TYPE.EMAIL

  // ── 5. URL ──────────────────────────────────────────────────
  if (/^https?:\/\/.+/i.test(str)) return TYPE.URL

  // ── 6. IP v4 ────────────────────────────────────────────────
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(str)) {
    const parts = str.split('.').map(Number)
    if (parts.every(p => p >= 0 && p <= 255)) return TYPE.IP_V4
  }

  // ── 7. UUID ─────────────────────────────────────────────────
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) return TYPE.UUID

  // ── 8. Telefon ──────────────────────────────────────────────
  {
    const clean = str.replace(/[\s\-\(\)\.\/]/g, '')
    if (clean.length >= 7 && clean.length <= 16 && PHONE_PATTERNS.some(re => re.test(clean))) {
      return TYPE.TELEFON
    }
  }

  // ── 9. EAN/Barcode (exactly 13 digits) ──────────────────────
  if (/^[0-9]{13}$/.test(str)) return TYPE.EAN_BARCODE

  // ── 10. Timestamp (date + time) ─────────────────────────────
  if (/\d{4}[-\/\.]\d{2}[-\/\.]\d{2}[T ]\d{2}:\d{2}/.test(str)) return TYPE.TIMESTAMP
  if (/\d{1,2}[.\/]\d{1,2}[.\/]\d{2,4}\s+\d{2}:\d{2}/.test(str)) return TYPE.TIMESTAMP

  // ── 11. Date formats ────────────────────────────────────────
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return TYPE.DATUM_ISO
  if (/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(str)) return TYPE.DATUM_DE
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(str)) return TYPE.DATUM_US

  // Excel serial date: integer 40000–50000 (roughly 2009–2037)
  const numVal = Number(str.replace(',', '.'))
  if (Number.isInteger(numVal) && numVal >= 40000 && numVal <= 50000) {
    return TYPE.EXCEL_DATUM
  }

  // ── 12. Betrag mit Symbol ────────────────────────────────────
  if (/[€$£]/.test(str) || /\bCHF\b/.test(str)) {
    const stripped = str.replace(/[€$£CHF,.\s]/g, '')
    if (/^\d+$/.test(stripped) && stripped.length > 0) return TYPE.BETRAG_MIT_SYMBOL
  }

  // ── 13. PLZ (context-dependent) ─────────────────────────────
  const plzContext = colContains(columnName, 'plz','zip','postal','postleitzahl','postcode') ||
    neighborCols.some(c => colContains(c, 'stadt','city','ort','town','gemeinde'))
  if (plzContext) {
    if (PLZ_PATTERNS.some(p => p.re.test(str) && (!p.validate || p.validate(str)))) {
      return TYPE.PLZ
    }
  }

  // ── 14. ISO2 / ISO3 country codes ───────────────────────────
  if (/^[A-Z]{2}$/.test(str) && ISO2_CODES.has(str)) return TYPE.LAENDERCODE_ISO2
  if (/^[A-Z]{3}$/.test(str) && ISO3_CODES.has(str)) return TYPE.LAENDERCODE_ISO3

  // ── 15. Country names ────────────────────────────────────────
  if (COUNTRY_NAMES.has(str)) return TYPE.LAENDERNAME

  // ── 16. Prozentsatz ──────────────────────────────────────────
  if (/^-?\d+([.,]\d+)?%$/.test(str)) return TYPE.PROZENTSATZ
  // Decimal ratio 0.0–1.0 that looks like a percentage (column context)
  if (colContains(columnName, 'rate','quote','anteil','ratio','percent','prozent','%')) {
    if (/^0?\.[0-9]+$/.test(str)) return TYPE.PROZENTSATZ
  }

  // ── 17. Betrag ohne Symbol (context) ─────────────────────────
  if (colContains(columnName, 'betrag','amount','wert','preis','price','umsatz','revenue','kosten','cost')) {
    const numStr = str.replace(/[,\s]/g, '').replace('.', '')
    if (!isNaN(parseFloat(str.replace(',','.'))) && /\.\d{2}$|,\d{2}$/.test(str)) {
      return TYPE.BETRAG_OHNE_SYMBOL
    }
  }

  // ── 18. Calendar week / Quarter / Month-Year / Year ──────────
  if (/^(KW|W|CW)\s?\d{1,2}(\s*[\/\-]\s*\d{2,4})?$/i.test(str)) return TYPE.KALENDERWOCHE
  if (/^\d{4}-(W|KW)\d{2}$/i.test(str)) return TYPE.KALENDERWOCHE
  if (/^Q[1-4][\s\/\-]?\d{2,4}$/i.test(str)) return TYPE.QUARTAL
  if (/^(Jan|Feb|Mär|Mar|Apr|Mai|May|Jun|Jul|Aug|Sep|Okt|Oct|Nov|Dez|Dec)\w*[\s\-\/]\d{2,4}$/i.test(str)) return TYPE.MONAT_JAHR
  if (/^\d{2}[\/\.]\d{4}$/.test(str)) return TYPE.MONAT_JAHR
  if (/^(20[1-3][0-9]|19[89][0-9])$/.test(str)) return TYPE.JAHR

  // ── 19. Boolean ───────────────────────────────────────────────
  if (/^(true|false|ja|nein|yes|no|wahr|falsch|1|0)$/i.test(str)) return TYPE.BOOLEAN

  // ── 20. Kostenstelle (context + 4-6 digits) ──────────────────
  if (colContains(columnName, 'kst','kostenstelle','cost center','kosten')) {
    if (/^[0-9]{3,6}$/.test(str)) return TYPE.KOSTENSTELLE
  }

  // ── 21. Kundennummer (context + 4-8 digits/codes) ────────────
  if (colContains(columnName, 'kunden','customer','client','kdnr')) {
    if (/^[A-Z0-9\-]{3,12}$/.test(str)) return TYPE.KUNDENNUMMER
  }

  // ── 21b. Chargennummer (context) ─────────────────────────────
  if (colContains(columnName, 'charge','chargennr','lot','batch','losnr','los-nr')) {
    if (/^(CH|LOT|L|CHARGE|BATCH)[\-_]?[A-Z0-9\-]{2,14}$/i.test(str) ||
        /^[A-Z0-9]{4,16}$/i.test(str)) return TYPE.CHARGENNUMMER
  }

  // ── 21c. Vertragsnummer (context) ────────────────────────────
  if (colContains(columnName, 'vertrag','contract','vertr','kontrakt')) {
    if (/^[A-Z0-9\-\/]{3,20}$/.test(str)) return TYPE.VERTRAGSNUMMER
  }

  // ── 21d. Seriennummer (context) ──────────────────────────────
  if (colContains(columnName, 'serien','serial','s/n','sn','serie-')) {
    if (/^[A-Z0-9\-]{4,20}$/.test(str)) return TYPE.SERIENNUMMER
  }

  // ── 22. Unternehmensname ─────────────────────────────────────
  if (colContains(columnName, 'firma','company','unternehmen','kunde','lieferant','vendor','client','name')) {
    if (LEGAL_FORMS.some(re => re.test(str))) return TYPE.UNTERNEHMENSNAME
  }

  // ── 23. Vollständiger Name (context) ─────────────────────────
  if (colContains(columnName, 'name','person','kontakt','ansprechpartner')) {
    if (/^[A-ZÄÖÜ][a-zäöüß]+ [A-ZÄÖÜ][a-zäöüß]+/.test(str)) return TYPE.VOLLSTAENDIGER_NAME
  }

  // ── 24. HASH_ID – MD5 (32 hex), SHA1 (40 hex), SHA256 (64 hex) ──
  if (/^[0-9a-f]{32}$/i.test(str) || /^[0-9a-f]{40}$/i.test(str) || /^[0-9a-f]{64}$/i.test(str)) {
    return TYPE.HASH_ID
  }

  // ── 25. ZAHL_GENERISCH – any plain number not caught above ───
  // Handles integers, decimals, negative numbers, even single digits.
  if (/^-?[0-9]+([.,][0-9]+)?$/.test(str.replace(/\s/g, ''))) return TYPE.ZAHL_GENERISCH

  return TYPE.TEXT
}

// ── Column-level detection ──────────────────────────────────────

/**
 * Detect the dominant type for an array of sample values.
 * - Class A: one match immediately classifies the whole column
 * - Others: majority vote
 */
export function detectColumnType(values, columnName = '', neighborCols = []) {
  const counts = {}
  let nonEmpty = 0

  for (const v of values) {
    const str = String(v ?? '').trim()
    if (str === '' || str.startsWith('=')) continue
    nonEmpty++
    const t = detectType(v, columnName, neighborCols)
    if (CLASS_A_TYPES.has(t)) return t   // one Klasse A hit → done
    counts[t] = (counts[t] || 0) + 1
  }

  if (nonEmpty === 0) return TYPE.TEXT
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}
