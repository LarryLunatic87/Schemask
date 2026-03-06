/**
 * dataTypes.js
 * Single source of truth for all 28+ type definitions, their class membership,
 * badge styling, and default toggle state.
 *
 * Classes:
 *   A – Always anonymize. No toggle. Badge: red.
 *   B – Default ON.  User can disable per column. Badge: orange.
 *   C – Default OFF. User can enable  per column. Badge: gray.
 *   X – Unknown / plain text. Badge: white/muted. Toggle OFF.
 */

// ── Type identifiers ────────────────────────────────────────────
export const TYPE = {
  // Klasse A
  IBAN:              'IBAN',
  VAT_ID:            'USt-IdNr',
  BIC_SWIFT:         'BIC/SWIFT',
  GPS_KOORDINATEN:   'GPS-Koordinaten',

  // Klasse B – Identifiers
  EMAIL:             'Email',
  URL:               'URL',
  IP_V4:             'IP-Adresse',
  UUID:              'UUID',
  TELEFON:           'Telefon',
  EAN_BARCODE:       'EAN/Barcode',
  KUNDENNUMMER:      'Kundennummer',
  KOSTENSTELLE:      'Kostenstelle',
  UNTERNEHMENSNAME:  'Unternehmensname',
  VOLLSTAENDIGER_NAME: 'Vollst. Name',
  CHARGENNUMMER:     'Chargennummer',
  VERTRAGSNUMMER:    'Vertragsnummer',
  SERIENNUMMER:      'Seriennummer',
  HASH_ID:           'Hash-ID',

  // Klasse B – Financial
  BETRAG_MIT_SYMBOL: 'Betrag (€/$)',
  BETRAG_OHNE_SYMBOL:'Betrag',
  PROZENTSATZ:       'Prozentsatz',

  // Klasse B – Date/Time
  DATUM_ISO:         'Datum (ISO)',
  DATUM_DE:          'Datum (DE)',
  DATUM_US:          'Datum (US)',
  EXCEL_DATUM:       'Excel-Datum',
  TIMESTAMP:         'Timestamp',

  // Klasse B – Geographic
  PLZ:               'PLZ',

  // Klasse C
  LAENDERCODE_ISO2:  'ISO2-Code',
  LAENDERCODE_ISO3:  'ISO3-Code',
  LAENDERNAME:       'Ländername',
  KALENDERWOCHE:     'Kalenderwoche',
  QUARTAL:           'Quartal',
  MONAT_JAHR:        'Monat/Jahr',
  JAHR:              'Jahr',
  BOOLEAN:           'Boolean',

  // Numeric generic (catches plain numbers not matched by any contextual rule)
  ZAHL_GENERISCH:    'Zahl',

  // Fallback / unclassified text
  TEXT:              'Text',
}

// ── Class membership ────────────────────────────────────────────
export const CLASS = { A: 'A', B: 'B', C: 'C', X: 'X' }

export const TYPE_CLASS = {
  // A
  [TYPE.IBAN]:              CLASS.A,
  [TYPE.VAT_ID]:            CLASS.A,
  [TYPE.BIC_SWIFT]:         CLASS.A,
  [TYPE.GPS_KOORDINATEN]:   CLASS.A,
  // B
  [TYPE.EMAIL]:             CLASS.B,
  [TYPE.URL]:               CLASS.B,
  [TYPE.IP_V4]:             CLASS.B,
  [TYPE.UUID]:              CLASS.B,
  [TYPE.TELEFON]:           CLASS.B,
  [TYPE.EAN_BARCODE]:       CLASS.B,
  [TYPE.KUNDENNUMMER]:      CLASS.B,
  [TYPE.KOSTENSTELLE]:      CLASS.B,
  [TYPE.UNTERNEHMENSNAME]:  CLASS.B,
  [TYPE.VOLLSTAENDIGER_NAME]: CLASS.B,
  [TYPE.CHARGENNUMMER]:     CLASS.B,
  [TYPE.VERTRAGSNUMMER]:    CLASS.B,
  [TYPE.SERIENNUMMER]:      CLASS.B,
  [TYPE.HASH_ID]:           CLASS.B,
  [TYPE.BETRAG_MIT_SYMBOL]: CLASS.B,
  [TYPE.BETRAG_OHNE_SYMBOL]:CLASS.B,
  [TYPE.PROZENTSATZ]:       CLASS.B,
  [TYPE.DATUM_ISO]:         CLASS.B,
  [TYPE.DATUM_DE]:          CLASS.B,
  [TYPE.DATUM_US]:          CLASS.B,
  [TYPE.EXCEL_DATUM]:       CLASS.B,
  [TYPE.TIMESTAMP]:         CLASS.B,
  [TYPE.PLZ]:               CLASS.B,
  // C
  [TYPE.LAENDERCODE_ISO2]:  CLASS.C,
  [TYPE.LAENDERCODE_ISO3]:  CLASS.C,
  [TYPE.LAENDERNAME]:       CLASS.C,
  [TYPE.KALENDERWOCHE]:     CLASS.C,
  [TYPE.QUARTAL]:           CLASS.C,
  [TYPE.MONAT_JAHR]:        CLASS.C,
  [TYPE.JAHR]:              CLASS.C,
  [TYPE.BOOLEAN]:           CLASS.C,
  // B (numeric fallback)
  [TYPE.ZAHL_GENERISCH]:    CLASS.B,
  // X
  [TYPE.TEXT]:              CLASS.X,
}

/** Default toggle state: A always on, B on, C off, X off */
export function defaultEnabled(type) {
  const cls = TYPE_CLASS[type] ?? CLASS.X
  return cls === CLASS.A || cls === CLASS.B
}

// ── Badge config ────────────────────────────────────────────────
export const CLASS_BADGE = {
  [CLASS.A]: { label: 'A', cssClass: 'badge badge-class-a', title: 'Klasse A – immer anonymisiert' },
  [CLASS.B]: { label: 'B', cssClass: 'badge badge-class-b', title: 'Klasse B – Standard AN' },
  [CLASS.C]: { label: 'C', cssClass: 'badge badge-class-c', title: 'Klasse C – Standard AUS' },
  [CLASS.X]: { label: '–', cssClass: 'badge badge-class-x', title: 'Unbekannt – nicht anonymisiert' },
}

export const TYPE_BADGE_CLASS = {
  [TYPE.IBAN]:              'badge badge-type-a',
  [TYPE.VAT_ID]:            'badge badge-type-a',
  [TYPE.BIC_SWIFT]:         'badge badge-type-a',
  [TYPE.GPS_KOORDINATEN]:   'badge badge-type-a',
  [TYPE.EMAIL]:             'badge badge-type-b',
  [TYPE.URL]:               'badge badge-type-b',
  [TYPE.IP_V4]:             'badge badge-type-b',
  [TYPE.UUID]:              'badge badge-type-b',
  [TYPE.TELEFON]:           'badge badge-type-b',
  [TYPE.EAN_BARCODE]:       'badge badge-type-b',
  [TYPE.KUNDENNUMMER]:      'badge badge-type-b',
  [TYPE.KOSTENSTELLE]:      'badge badge-type-b',
  [TYPE.UNTERNEHMENSNAME]:  'badge badge-type-b',
  [TYPE.VOLLSTAENDIGER_NAME]:'badge badge-type-b',
  [TYPE.CHARGENNUMMER]:     'badge badge-type-b',
  [TYPE.VERTRAGSNUMMER]:    'badge badge-type-b',
  [TYPE.SERIENNUMMER]:      'badge badge-type-b',
  [TYPE.HASH_ID]:           'badge badge-type-b',
  [TYPE.BETRAG_MIT_SYMBOL]: 'badge badge-type-b',
  [TYPE.BETRAG_OHNE_SYMBOL]:'badge badge-type-b',
  [TYPE.PROZENTSATZ]:       'badge badge-type-b',
  [TYPE.DATUM_ISO]:         'badge badge-type-b badge-date',
  [TYPE.DATUM_DE]:          'badge badge-type-b badge-date',
  [TYPE.DATUM_US]:          'badge badge-type-b badge-date',
  [TYPE.EXCEL_DATUM]:       'badge badge-type-b badge-date',
  [TYPE.TIMESTAMP]:         'badge badge-type-b badge-date',
  [TYPE.PLZ]:               'badge badge-type-b',
  [TYPE.LAENDERCODE_ISO2]:  'badge badge-type-c',
  [TYPE.LAENDERCODE_ISO3]:  'badge badge-type-c',
  [TYPE.LAENDERNAME]:       'badge badge-type-c',
  [TYPE.KALENDERWOCHE]:     'badge badge-type-c',
  [TYPE.QUARTAL]:           'badge badge-type-c',
  [TYPE.MONAT_JAHR]:        'badge badge-type-c',
  [TYPE.JAHR]:              'badge badge-type-c',
  [TYPE.BOOLEAN]:           'badge badge-type-c',
  [TYPE.ZAHL_GENERISCH]:    'badge badge-type-b',
  [TYPE.TEXT]:              'badge badge-type-x',
}

export const TYPE_LABEL = {
  [TYPE.IBAN]:              '🔴 IBAN',
  [TYPE.VAT_ID]:            '🔴 USt-Id',
  [TYPE.BIC_SWIFT]:         '🔴 BIC',
  [TYPE.GPS_KOORDINATEN]:   '🔴 GPS',
  [TYPE.EMAIL]:             '@ Email',
  [TYPE.URL]:               '🔗 URL',
  [TYPE.IP_V4]:             '⬡ IP v4',
  [TYPE.UUID]:              '⬡ UUID',
  [TYPE.TELEFON]:           '☎ Telefon',
  [TYPE.EAN_BARCODE]:       '▦ EAN',
  [TYPE.KUNDENNUMMER]:      '# Kunden-Nr',
  [TYPE.KOSTENSTELLE]:      '# KST',
  [TYPE.UNTERNEHMENSNAME]:  '🏢 Firma',
  [TYPE.VOLLSTAENDIGER_NAME]:'👤 Name',
  [TYPE.CHARGENNUMMER]:     '# Charge',
  [TYPE.VERTRAGSNUMMER]:    '# Vertrag',
  [TYPE.SERIENNUMMER]:      '# Serien-Nr',
  [TYPE.HASH_ID]:           '# Hash',
  [TYPE.BETRAG_MIT_SYMBOL]: '€ Betrag',
  [TYPE.BETRAG_OHNE_SYMBOL]:'# Betrag',
  [TYPE.PROZENTSATZ]:       '% Prozent',
  [TYPE.DATUM_ISO]:         '📅 Datum',
  [TYPE.DATUM_DE]:          '📅 Datum',
  [TYPE.DATUM_US]:          '📅 Datum',
  [TYPE.EXCEL_DATUM]:       '📅 XL-Datum',
  [TYPE.TIMESTAMP]:         '📅 Timestamp',
  [TYPE.PLZ]:               '📮 PLZ',
  [TYPE.LAENDERCODE_ISO2]:  '🌍 ISO2',
  [TYPE.LAENDERCODE_ISO3]:  '🌍 ISO3',
  [TYPE.LAENDERNAME]:       '🌍 Land',
  [TYPE.KALENDERWOCHE]:     '📆 KW',
  [TYPE.QUARTAL]:           '📆 Quartal',
  [TYPE.MONAT_JAHR]:        '📆 Monat/J.',
  [TYPE.JAHR]:              '📆 Jahr',
  [TYPE.BOOLEAN]:           '⊙ Boolean',
  [TYPE.ZAHL_GENERISCH]:    '# Zahl',
  [TYPE.TEXT]:              'Aa Text',
}

// ── Grouped type list for the override dropdown ─────────────────
export const TYPE_GROUPS = [
  { label: 'Klasse A – Immer anonymisiert', types: [TYPE.IBAN, TYPE.VAT_ID, TYPE.BIC_SWIFT, TYPE.GPS_KOORDINATEN] },
  { label: 'Klasse B – Identifikatoren', types: [TYPE.EMAIL, TYPE.TELEFON, TYPE.UUID, TYPE.URL, TYPE.IP_V4, TYPE.EAN_BARCODE, TYPE.KUNDENNUMMER, TYPE.KOSTENSTELLE, TYPE.UNTERNEHMENSNAME, TYPE.VOLLSTAENDIGER_NAME, TYPE.CHARGENNUMMER, TYPE.VERTRAGSNUMMER, TYPE.SERIENNUMMER, TYPE.HASH_ID] },
  { label: 'Klasse B – Finanziell', types: [TYPE.BETRAG_MIT_SYMBOL, TYPE.BETRAG_OHNE_SYMBOL, TYPE.PROZENTSATZ, TYPE.ZAHL_GENERISCH] },
  { label: 'Klasse B – Datum & Zeit', types: [TYPE.DATUM_DE, TYPE.DATUM_ISO, TYPE.DATUM_US, TYPE.EXCEL_DATUM, TYPE.TIMESTAMP] },
  { label: 'Klasse B – Geografisch', types: [TYPE.PLZ] },
  { label: 'Klasse C', types: [TYPE.LAENDERCODE_ISO2, TYPE.LAENDERCODE_ISO3, TYPE.LAENDERNAME, TYPE.KALENDERWOCHE, TYPE.QUARTAL, TYPE.MONAT_JAHR, TYPE.JAHR, TYPE.BOOLEAN] },
  { label: 'Kein Typ (nicht anonymisiert)', types: [TYPE.TEXT] },
]
