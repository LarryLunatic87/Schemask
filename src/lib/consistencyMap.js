/**
 * consistencyMap.js
 * Session-wide value consistency: same input → same anonymized output.
 *
 * "Müller GmbH" → always "Firma_047", not a different value per row.
 * The map resets when a new file is uploaded (call reset()).
 *
 * Usage:
 *   import { anonymizeValue } from './consistencyMap'
 *   const result = anonymizeValue(originalValue, type)
 *
 * Architecture:
 *   - One Map per session, keyed by `${type}::${value}`
 *   - Counter per type for sequential pseudonyms (Firma_001, Firma_002…)
 *   - Generators are pure functions: they take value + counter, return string
 */

import { TYPE } from './dataTypes'

// ── Session state ────────────────────────────────────────────────
let _map     = new Map()   // `${type}::${value}` → anonymized
let _counter = {}          // type → number (for sequential IDs)

/** Reset the map – call when a new file is uploaded */
export function reset() {
  _map     = new Map()
  _counter = {}
}

/** Get the current map size (useful for debug / UI stats) */
export function size() { return _map.size }

// ── Public API ───────────────────────────────────────────────────

/**
 * Anonymize a value with consistency.
 * @param {string} value   Original cell value
 * @param {string} type    One of TYPE.*
 * @param {boolean} [enabled] If false, returns value unchanged
 */
export function anonymizeValue(value, type, enabled = true) {
  if (!enabled) return value
  const str = String(value ?? '').trim()
  if (!str || str.startsWith('=')) return value  // formulas untouched

  const key = `${type}::${str}`
  if (_map.has(key)) return _map.get(key)

  const result = generate(str, type)
  _map.set(key, result)
  return result
}

// ── Counter helper ───────────────────────────────────────────────
function nextId(type) {
  _counter[type] = (_counter[type] ?? 0) + 1
  return _counter[type]
}
function pad(n, digits = 3) { return String(n).padStart(digits, '0') }

// ── Random helpers ───────────────────────────────────────────────
function randDigit()  { return Math.floor(Math.random() * 10) }
function randLetter() { return String.fromCharCode(65 + Math.floor(Math.random() * 26)) }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function randomizeDigits(str) {
  return str.replace(/[0-9]/g, () => randDigit())
}
function randomizeAlnum(str) {
  return str.replace(/[0-9]/g, () => randDigit()).replace(/[A-Z]/g, () => randLetter())
}
function shiftNumber(value, pctMin, pctMax) {
  const n = parseFloat(String(value).replace(',', '.'))
  if (isNaN(n)) return value
  const factor = 1 + (Math.random() * (pctMax - pctMin) + pctMin) / 100 * (Math.random() < 0.5 ? -1 : 1)
  return (n * factor).toFixed(2)
}
function shiftDate(dateStr, minDays, maxDays) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const shift = randInt(minDays, maxDays) * (Math.random() < 0.5 ? -1 : 1)
  d.setDate(d.getDate() + shift)
  return d.toISOString().slice(0, 10)
}

// ── Generators per type ──────────────────────────────────────────
function generate(value, type) {
  switch (type) {

    // ── Klasse A ────────────────────────────────────────────────

    case TYPE.VAT_ID: {
      const clean = value.replace(/[\s.\-]/g, '').toUpperCase()
      const prefix = (clean.match(/^[A-Z]{2,4}/) ?? ['DE'])[0]
      const rest = clean.slice(prefix.length)
      return prefix + randomizeDigits(rest)
    }

    case TYPE.IBAN: {
      const clean = value.replace(/\s/g, '').toUpperCase()
      // Keep country code + check digits (first 4 chars), randomize rest
      return clean.slice(0, 4) + randomizeAlnum(clean.slice(4))
    }

    case TYPE.BIC_SWIFT: {
      const clean = value.replace(/\s/g, '').toUpperCase()
      // Keep country code in positions 4-5, randomize bank code + branch
      return randLetter() + randLetter() + randLetter() + randLetter() +
        clean.slice(4, 6) +   // country preserved
        randLetter() + randLetter() +
        (clean.length === 11 ? randLetter() + randLetter() + randLetter() : '')
    }

    case TYPE.GPS_KOORDINATEN: {
      // Shift coordinates by a small random delta (±0.05 degrees ≈ ±5 km)
      const gpsMatch = value.match(/^(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)$/)
      if (!gpsMatch) return value
      const lat = parseFloat(gpsMatch[1]) + (Math.random() * 0.1 - 0.05)
      const lon = parseFloat(gpsMatch[2]) + (Math.random() * 0.1 - 0.05)
      const decimals = gpsMatch[1].split('.')[1]?.length ?? 6
      return `${lat.toFixed(decimals)}, ${lon.toFixed(decimals)}`
    }

    // ── Klasse B – Identifiers ──────────────────────────────────

    case TYPE.EMAIL: {
      const id = pad(nextId(TYPE.EMAIL))
      return `user_${id}@example.com`
    }

    case TYPE.TELEFON: {
      // Preserve country prefix, randomize rest
      const clean = value.replace(/[\s\-\(\)\.\/]/g, '')
      const prefixMatch = clean.match(/^(\+[0-9]{1,3}|00[0-9]{2}|0)/)
      const prefix = prefixMatch ? prefixMatch[0] : '+49'
      const rest = clean.slice(prefix.length)
      return prefix + ' ' + randomizeDigits(rest).replace(/(.{3})(.{4})/, '$1 $2')
    }

    case TYPE.KUNDENNUMMER: {
      return `K-${pad(nextId(TYPE.KUNDENNUMMER))}`
    }

    case TYPE.CHARGENNUMMER: {
      const year = 2020 + randInt(0, 5)
      return `CH-${year}-${pad(nextId(TYPE.CHARGENNUMMER), 4)}`
    }

    case TYPE.VERTRAGSNUMMER: {
      return `VTR-${pad(nextId(TYPE.VERTRAGSNUMMER), 4)}`
    }

    case TYPE.SERIENNUMMER: {
      return `SN-${randLetter()}${randLetter()}${pad(nextId(TYPE.SERIENNUMMER), 5)}`
    }

    case TYPE.HASH_ID: {
      const len = value.length === 64 ? 64 : value.length === 40 ? 40 : 32
      const chars = '0123456789abcdef'
      return Array.from({ length: len }, () => chars[randInt(0, 15)]).join('')
    }

    case TYPE.KOSTENSTELLE: {
      const len = value.replace(/\D/g, '').length
      return pad(nextId(TYPE.KOSTENSTELLE), Math.max(4, len))
    }

    case TYPE.UNTERNEHMENSNAME: {
      // Preserve legal form suffix
      const legalForms = ['GmbH', 'AG', 'SE', 'KG', 'Ltd', 'LLC', 'SRL', 'BV', 'SAS', 'SARL', 'UG']
      const found = legalForms.find(f => new RegExp(`\\b${f}\\b`, 'i').test(value))
      const suffix = found ? ` ${found}` : ''
      return `Firma_${pad(nextId(TYPE.UNTERNEHMENSNAME))}${suffix}`
    }

    case TYPE.VOLLSTAENDIGER_NAME: {
      return `Person_${pad(nextId(TYPE.VOLLSTAENDIGER_NAME))}`
    }

    case TYPE.UUID: {
      const hex = () => Math.floor(Math.random() * 16).toString(16)
      const seg = (n) => Array.from({ length: n }, hex).join('')
      return `${seg(8)}-${seg(4)}-4${seg(3)}-${['8','9','a','b'][Math.floor(Math.random()*4)]}${seg(3)}-${seg(12)}`
    }

    case TYPE.URL: {
      const id = pad(nextId(TYPE.URL))
      return `https://example-${id}.com`
    }

    case TYPE.IP_V4: {
      return `192.168.${randInt(1,254)}.${randInt(1,254)}`
    }

    case TYPE.EAN_BARCODE: {
      // Random 12 digits + EAN-13 check digit
      const digits = Array.from({ length: 12 }, () => randDigit())
      const check = (10 - (digits.reduce((sum, d, i) => sum + d * (i % 2 === 0 ? 1 : 3), 0) % 10)) % 10
      return [...digits, check].join('')
    }

    // ── Klasse B – Financial ────────────────────────────────────

    case TYPE.BETRAG_MIT_SYMBOL: {
      const symbol = (value.match(/[€$£]/) ?? ['€'])[0]
      const num = parseFloat(value.replace(/[^0-9.,]/g, '').replace(',', '.'))
      if (isNaN(num)) return value
      const shifted = (num * (0.75 + Math.random() * 0.5)).toFixed(2)
      return `${symbol}${shifted}`
    }

    case TYPE.BETRAG_OHNE_SYMBOL:
      return shiftNumber(value, 15, 25)

    case TYPE.PROZENTSATZ: {
      const num = parseFloat(String(value).replace('%', '').replace(',', '.'))
      if (isNaN(num)) return value
      const shifted = Math.min(100, Math.max(0, num + (Math.random() * 10 - 5))).toFixed(1)
      return `${shifted}%`
    }

    // ── Klasse B – Date/Time ────────────────────────────────────

    case TYPE.DATUM_ISO:
      return shiftDate(value, 30, 90)

    case TYPE.DATUM_DE: {
      // Convert DE to ISO, shift, convert back
      const [d, m, y] = value.split('.')
      const iso = `${y.length === 2 ? '20' + y : y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
      const shifted = shiftDate(iso, 30, 90)
      const [sy, sm, sd] = shifted.split('-')
      return `${sd}.${sm}.${sy}`
    }

    case TYPE.DATUM_US: {
      const [m, d, y] = value.split('/')
      const iso = `${y.length === 2 ? '20' + y : y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
      const shifted = shiftDate(iso, 30, 90)
      const [sy, sm, sd] = shifted.split('-')
      return `${sm}/${sd}/${sy}`
    }

    case TYPE.EXCEL_DATUM: {
      const num = parseInt(value, 10)
      const shift = randInt(30, 90) * (Math.random() < 0.5 ? -1 : 1)
      return String(num + shift)
    }

    // ── Klasse B – Geographic ───────────────────────────────────

    case TYPE.PLZ: {
      // German 5-digit: preserve first digit (region)
      if (/^[0-9]{5}$/.test(value)) {
        return value[0] + String(randInt(1000, 9999))
      }
      // 4-digit (AT/CH/BE/…)
      if (/^[0-9]{4}$/.test(value)) {
        return value[0] + String(randInt(100, 999))
      }
      // NL: 1234 AB
      if (/^[0-9]{4}\s?[A-Z]{2}$/i.test(value)) {
        return `${randInt(1000,9999)} ${randLetter()}${randLetter()}`
      }
      // Fallback: randomize digits
      return randomizeDigits(value)
    }

    // ── Klasse C ────────────────────────────────────────────────

    case TYPE.LAENDERCODE_ISO2: {
      const codes = ['DE','AT','CH','FR','IT','ES','NL','BE','PL','SE','DK','FI','NO']
      return codes[randInt(0, codes.length - 1)]
    }

    case TYPE.LAENDERCODE_ISO3: {
      const codes = ['DEU','AUT','CHE','FRA','ITA','ESP','NLD','BEL','POL','SWE','DNK']
      return codes[randInt(0, codes.length - 1)]
    }

    case TYPE.BOOLEAN: {
      const pairs = [['true','false'],['ja','nein'],['yes','no'],['1','0'],['wahr','falsch']]
      const match = pairs.find(([a, b]) => value.toLowerCase() === a || value.toLowerCase() === b)
      if (match) {
        const isFirst = value.toLowerCase() === match[0]
        return isFirst ? match[1] : match[0]
      }
      return Math.random() < 0.5 ? 'true' : 'false'
    }

    case TYPE.QUARTAL: {
      const q = randInt(1, 4)
      const yearMatch = value.match(/\d{2,4}/)
      return yearMatch ? `Q${q} ${yearMatch[0]}` : `Q${q}`
    }

    case TYPE.KALENDERWOCHE: {
      const kw = randInt(1, 52)
      const yearMatch = value.match(/\d{4}/)
      return yearMatch ? `KW${String(kw).padStart(2,'0')} ${yearMatch[0]}` : `KW${String(kw).padStart(2,'0')}`
    }

    case TYPE.JAHR: {
      const y = parseInt(value, 10)
      return isNaN(y) ? value : String(y + randInt(-1, 1))
    }

    case TYPE.ZAHL_GENERISCH: {
      const num = parseFloat(String(value).replace(',', '.'))
      if (isNaN(num)) return value
      const factor = 1 + (Math.random() * 0.4 - 0.2)   // ±20 %
      const decimals = (String(value).split(/[.,]/)[1] ?? '').length
      return (num * factor).toFixed(decimals)
    }

    // ── Fallback ─────────────────────────────────────────────────
    default:
      return value  // TEXT and unknown types are not anonymized
  }
}
