/**
 * masker.js
 * Masks values for safe display in the UI preview.
 * Original data is never shown – only masked representations.
 */

/**
 * Mask a value based on its structure.
 *
 * Rules (spec v3, chapter 2):
 *  - Email:      user: first 2 chars; host: first 2 chars + •••; TLD: visible
 *  - IBAN:       first 4 chars (country + check digits) + • for rest
 *  - Space words: first word: 2 visible, others: 1 visible, rest •
 *  - Default:    first 2 + max(3,len-3) bullets + last 1 (if len>4)
 */
export function maskValue(value) {
  const str = String(value ?? '').trim()
  if (!str) return '•••'
  if (str.length <= 2) return str[0] + '•'.repeat(str.length - 1)

  // IBAN-like: starts with 2 letters + 2 digits
  if (/^[A-Z]{2}[0-9]{2}/i.test(str) && str.replace(/\s/g, '').length >= 15) {
    const clean = str.replace(/\s/g, '')
    return clean.slice(0, 4) + '•'.repeat(clean.length - 4)
  }

  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
    const atIdx = str.indexOf('@')
    const local  = str.slice(0, atIdx)
    const domain = str.slice(atIdx + 1)
    const dotIdx = domain.lastIndexOf('.')
    const host   = dotIdx > 0 ? domain.slice(0, dotIdx) : domain
    const tld    = dotIdx > 0 ? domain.slice(dotIdx) : ''
    return `${seg(local, 2)}@${seg(host, 2)}•••${tld}`
  }

  // Space-separated (names, company names)
  if (str.includes(' ')) {
    return str.split(' ').map((w, i) => seg(w, i === 0 ? 2 : 1)).join(' ')
  }

  // Default: first 2 + bullets + last 1
  const keep = Math.max(3, str.length - 3)
  return str.slice(0, 2) + '•'.repeat(keep) + (str.length > 4 ? str.slice(-1) : '')
}

/** Mask a single token: keep `n` chars at start, rest as bullets */
function seg(s, n) {
  if (!s || s.length <= n) return s
  return s.slice(0, n) + '•'.repeat(s.length - n)
}
