# Schemask – Tool A: Product Spec
**Excel Business Data Anonymizer**
Version 3.0 | MVP / Showcase für marcolarosa.com

---

## Änderungen v2 → v3
- Originalwerte in Preview werden maskiert (Datenschutz-Fix)
- Vollständige internationale Regelbibliothek für USt-ID, IBAN, PLZ, Telefon
- VAT_ID als eigener Klasse-A-Typ (war vorher fälschlich "Text")
- Länderabdeckung: DE, AT, CH, FR, IT, ES, NL, BE, PL, CZ, SE, DK, GB, US

---

## 1. Produkt-Übersicht

### Was ist Schemask Tool A?
Ein browser-basiertes Web-Tool das Excel-Dateien mit geschäftssensiblen Daten
lokal anonymisiert – sodass die anonymisierte Datei bedenkenlos in AI-Assistenten
(ChatGPT, Claude etc.) geladen werden kann, ohne echte Unternehmensdaten preiszugeben.

### Kern-Versprechen
> "Lade deine Excel-Datei. Bekomme in 30 Sekunden eine strukturgleiche,
> anonymisierte Version – bereit für ChatGPT, Claude oder Kollegen.
> Kein Upload. Kein Server. Keine Daten verlassen deinen Browser."

---

## 2. Kritische UX-Regel: Keine Originalwerte anzeigen

**Alle Beispielwerte in der Preview MÜSSEN maskiert werden:**

```javascript
function maskValue(value, type) {
  if (!value) return '•••';
  const s = String(value);
  
  if (type === 'EMAIL') {
    const [user, domain] = s.split('@');
    return user.slice(0,2) + '•'.repeat(Math.max(3, user.length-2)) 
           + '@' + domain.slice(0,2) + '•••';
  }
  if (type === 'IBAN') {
    return s.slice(0,4) + '•'.repeat(s.length - 4);
  }
  if (s.length <= 4) return s.slice(0,1) + '•'.repeat(s.length - 1);
  return s.slice(0,2) + '•'.repeat(Math.max(3, s.length - 3)) + s.slice(-1);
}
```

**Regel:** SheetJS liest Daten → sofort maskieren → nur Maskierte Version wird je in der UI angezeigt. Die Originaldaten leben nur im Memory für die spätere Anonymisierung.

---

## 3. Tech Stack

```
Frontend:       React 18 + Vite + Tailwind CSS
Excel-Parsing:  SheetJS (xlsx) – 100% lokal im Browser
Anonymisierung: Eigene JS-Logik (kein AI, kein API-Call)
Export:         SheetJS – anonymisierte .xlsx generieren
Hosting:        Statische Web App (Hetzner VPS via Coolify)
Repository:     GitHub (Open Source, MIT License)
```

---

## 4. Vollständige Datentypen & Klassen

### Klasse A – Immer anonymisieren (kein Toggle, Pflicht, Badge: rot)

| Typ | Erkennungslogik | Anonymisierung |
|---|---|---|
| VAT_ID | Siehe Kap. 5.1 | Land-Prefix erhalten, Ziffern randomisieren |
| IBAN | Siehe Kap. 5.2 | Land-Prefix + Prüfziffer-Position erhalten, Rest randomisieren |
| STEUERNUMMER | Siehe Kap. 5.3 | Struktur erhalten, Ziffern randomisieren |
| PERSONALNUMMER | Spaltenname enthält Personal/EmpID + numerisch | Zufällige Nummer gleicher Länge |
| GPS_KOORDINATEN | Dezimalgrad-Paar (48.1234, 11.5678) | ±0.5 Grad verschoben |
| BANKKONTONUMMER | Spaltenname Konto/Account + 8-10 Ziffern | Zufällige Ziffernfolge |
| BIC_SWIFT | 8-11 Zeichen, Buchstaben+Ziffern, bekanntes Format | Zufällige synthetische BIC |

### Klasse B – Standard AN (Badge: orange, abschaltbar)

**Identifikatoren**

| Typ | Erkennungslogik | Anonymisierung |
|---|---|---|
| EMAIL | Enthält @ | user_XXX@example.com, konsistent |
| TELEFON | Siehe Kap. 5.4 | Ländervorwahl erhalten, Ziffern randomisieren |
| KUNDENNUMMER | 4-8 Ziffern, Spaltenname Kunden/Customer | K-XXXX, konsistent |
| LIEFERANTENNUMMER | Wie Kundennummer, Spaltenname Liefer/Vendor | L-XXXX, konsistent |
| AUFTRAGSNUMMER | Prefix+Jahr+Sequenz (RE-2024-0047) | Struktur erhalten, Ziffern random |
| RECHNUNGSNUMMER | Wie Auftragsnummer | Wie Auftragsnummer |
| ARTIKELNUMMER_SKU | Alphanumerisch mit Bindestrichen (ART-2847-B) | Struktur erhalten, random |
| KOSTENSTELLE | 4-6 Ziffern, Spaltenname KST/Cost | Zufällige Ziffernfolge, konsistent |
| PROJEKTNUMMER | Alphanumerisch, Spaltenname PRJ/Projekt | Konsistentes Pseudonym |
| CHARGENNUMMER | CH-YYYY-XXX, Pharma-relevant | Struktur erhalten, random |
| EAN_BARCODE | Genau 13 Ziffern | Zufällige 13-stellige Nr. mit gültiger Prüfziffer |
| SERIENNUMMER | Alphanumerisch, Spaltenname Serial | Zufällige Zeichenfolge gleicher Länge |
| UUID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | Neu generierte UUID |

**Finanziell**

| Typ | Erkennungslogik | Anonymisierung |
|---|---|---|
| BETRAG_MIT_SYMBOL | Enthält €/$£/CHF + Zahl | ±15-25% verschoben, Größenordnung erhalten |
| BETRAG_OHNE_SYMBOL | Numerisch, 2 Dez., >10, Spaltenname Betrag/Amount | Wie oben |
| PROZENTSATZ | 0-100+% oder 0.0-1.0 | ±5% verschoben, Bereich erhalten |
| RABATTSATZ | 0-50+%, Spaltenname Rabatt/Discount | Wie Prozentsatz |
| WECHSELKURS | Dezimal 1.0-2.5, Spaltenname Kurs/Rate/FX | ±0.05 verschoben |

**Datum & Zeit**

| Typ | Erkennungslogik | Anonymisierung |
|---|---|---|
| DATUM_DE | TT.MM.JJJJ | ±30-90 Tage verschoben |
| DATUM_ISO | YYYY-MM-DD | Wie oben |
| DATUM_US | MM/DD/YYYY | Wie oben |
| EXCEL_DATUM | Ganzzahl 40000-50000 | Als Seriennummer verschoben |
| TIMESTAMP | Datum + Uhrzeit | Datum verschoben, Uhrzeit leicht verschoben |
| ABLAUFDATUM | Spaltenname Ablauf/Expiry | ±14-60 Tage verschoben |

**Personen & Organisation**

| Typ | Erkennungslogik | Anonymisierung |
|---|---|---|
| UNTERNEHMENSNAME | Endet mit GmbH/AG/SE/Ltd/GbR/KG/UG/SRL/SAS/BV | Firma_XXX + Rechtsform erhalten |
| VOLLSTAENDIGER_NAME | Zwei Wörter, Spaltenname Name/Person | Person_XXX, konsistent |
| ABTEILUNGSNAME | Spaltenname Abt/Dept | Abt_XXX, konsistent |

**Geografisch**

| Typ | Erkennungslogik | Anonymisierung |
|---|---|---|
| PLZ | Siehe Kap. 5.5 | Gültige PLZ gleicher Region |
| STRASSE | Wortfolge + Zahl, Spaltenname Straße/Street | Straße_XXX + zufällige Hausnummer |
| STADTNAME | Aus bekannter Liste Top 500 DACH+EU | Stadt_XXX |

**Technisch**

| Typ | Erkennungslogik | Anonymisierung |
|---|---|---|
| URL | Beginnt mit http/https | https://example-XXX.com |
| IP_V4 | xxx.xxx.xxx.xxx | 192.168.x.x (privater Bereich) |

### Klasse C – Standard AUS (Badge: grau, einschaltbar)

| Typ | Anonymisierung wenn aktiv |
|---|---|
| LAENDERCODE_ISO2 | Anderer gültiger ISO2-Code |
| LAENDERCODE_ISO3 | Anderer gültiger ISO3-Code |
| LÄNDERNAME | Anderes Land gleichen Kontinents |
| KALENDERWOCHE | ±4 Wochen verschoben |
| QUARTAL | Anderes Quartal, gleiches Jahr |
| MONAT_JAHR | ±3 Monate, gleiches Jahr |
| JAHR | ±1 Jahr |
| VERSIONSNUMMER | Zufällige Version gleicher Struktur |
| STATUS_FELD | Werte tauschen oder neutral ersetzen |
| BOOLEAN | Zufällig tauschen |
| MENGE_EINHEIT | Zahl ±20%, Einheit erhalten |
| QUALITAETSSTUFE | Andere Stufe aus gleichem Set |

### Niemals anfassen
- Formeln (beginnt mit `=`)
- Leere Zellen
- Spalten-/Zeilenüberschriften

---

## 5. Internationale Regelbibliothek (vollständig)

### 5.1 USt-ID / VAT Number

Diese Patterns decken >95% der realen Fälle im europäischen B2B-Handel ab.

```javascript
const VAT_PATTERNS = [
  // DACH
  { country: 'DE', regex: /^DE[0-9]{9}$/, example: 'DE123456789' },
  { country: 'AT', regex: /^ATU[0-9]{8}$/, example: 'ATU12345678' },
  { country: 'CH', regex: /^CHE[0-9]{3}[\.\-]?[0-9]{3}[\.\-]?[0-9]{3}(MWST|TVA|IVA)?$/, example: 'CHE-123.456.789 MWST' },
  
  // Westeuropa
  { country: 'FR', regex: /^FR[A-Z0-9]{2}[0-9]{9}$/, example: 'FRXX123456789' },
  { country: 'IT', regex: /^IT[0-9]{11}$/, example: 'IT12345678901' },
  { country: 'ES', regex: /^ES[A-Z0-9][0-9]{7}[A-Z0-9]$/, example: 'ESX1234567X' },
  { country: 'NL', regex: /^NL[0-9]{9}B[0-9]{2}$/, example: 'NL123456789B01' },
  { country: 'BE', regex: /^BE0[0-9]{9}$/, example: 'BE0123456789' },
  { country: 'LU', regex: /^LU[0-9]{8}$/, example: 'LU12345678' },
  { country: 'PT', regex: /^PT[0-9]{9}$/, example: 'PT123456789' },
  
  // Nordeuropa
  { country: 'SE', regex: /^SE[0-9]{12}$/, example: 'SE123456789012' },
  { country: 'DK', regex: /^DK[0-9]{8}$/, example: 'DK12345678' },
  { country: 'FI', regex: /^FI[0-9]{8}$/, example: 'FI12345678' },
  { country: 'NO', regex: /^NO[0-9]{9}MVA$/, example: 'NO123456789MVA' },
  
  // Osteuropa
  { country: 'PL', regex: /^PL[0-9]{10}$/, example: 'PL1234567890' },
  { country: 'CZ', regex: /^CZ[0-9]{8,10}$/, example: 'CZ12345678' },
  { country: 'SK', regex: /^SK[0-9]{10}$/, example: 'SK1234567890' },
  { country: 'HU', regex: /^HU[0-9]{8}$/, example: 'HU12345678' },
  { country: 'RO', regex: /^RO[0-9]{2,10}$/, example: 'RO12345678' },
  
  // UK (post-Brexit)
  { country: 'GB', regex: /^GB([0-9]{9}|[0-9]{12}|GD[0-9]{3}|HA[0-9]{3})$/, example: 'GB123456789' },
];

function detectVAT(value) {
  const clean = String(value).replace(/\s/g, '').toUpperCase();
  return VAT_PATTERNS.some(p => p.regex.test(clean));
}
```

**Anonymisierung:** Land-Prefix erhalten, Prüfstruktur erhalten, Ziffern randomisieren.
```javascript
function anonymizeVAT(value) {
  // Behalte die ersten 2-4 Zeichen (Länderkennung)
  const clean = value.replace(/\s/g, '').toUpperCase();
  const prefix = clean.match(/^[A-Z]{2,4}/)[0];
  const rest = clean.slice(prefix.length);
  const randomRest = rest.replace(/[0-9]/g, () => Math.floor(Math.random() * 10));
  return prefix + randomRest;
}
```

---

### 5.2 IBAN

```javascript
const IBAN_PATTERNS = [
  // DACH
  { country: 'DE', regex: /^DE[0-9]{2}[0-9]{18}$/, length: 22 },
  { country: 'AT', regex: /^AT[0-9]{2}[0-9]{16}$/, length: 20 },
  { country: 'CH', regex: /^CH[0-9]{2}[0-9]{5}[A-Z0-9]{12}$/, length: 21 },
  { country: 'LI', regex: /^LI[0-9]{2}[0-9]{5}[A-Z0-9]{12}$/, length: 21 },
  
  // Westeuropa
  { country: 'FR', regex: /^FR[0-9]{2}[0-9]{10}[A-Z0-9]{11}[0-9]{2}$/, length: 27 },
  { country: 'IT', regex: /^IT[0-9]{2}[A-Z][0-9]{10}[A-Z0-9]{12}$/, length: 27 },
  { country: 'ES', regex: /^ES[0-9]{2}[0-9]{20}$/, length: 24 },
  { country: 'NL', regex: /^NL[0-9]{2}[A-Z]{4}[0-9]{10}$/, length: 18 },
  { country: 'BE', regex: /^BE[0-9]{2}[0-9]{12}$/, length: 16 },
  { country: 'LU', regex: /^LU[0-9]{2}[0-9]{3}[A-Z0-9]{13}$/, length: 20 },
  { country: 'PT', regex: /^PT[0-9]{2}[0-9]{21}$/, length: 25 },
  
  // Nordeuropa
  { country: 'SE', regex: /^SE[0-9]{2}[0-9]{20}$/, length: 24 },
  { country: 'DK', regex: /^DK[0-9]{2}[0-9]{14}$/, length: 18 },
  { country: 'FI', regex: /^FI[0-9]{2}[0-9]{14}$/, length: 18 },
  { country: 'NO', regex: /^NO[0-9]{2}[0-9]{11}$/, length: 15 },
  
  // Osteuropa
  { country: 'PL', regex: /^PL[0-9]{2}[0-9]{24}$/, length: 28 },
  { country: 'CZ', regex: /^CZ[0-9]{2}[0-9]{20}$/, length: 24 },
  { country: 'SK', regex: /^SK[0-9]{2}[0-9]{20}$/, length: 24 },
  { country: 'HU', regex: /^HU[0-9]{2}[0-9]{24}$/, length: 28 },
  { country: 'RO', regex: /^RO[0-9]{2}[A-Z]{4}[A-Z0-9]{16}$/, length: 24 },
  
  // UK & Sonstige
  { country: 'GB', regex: /^GB[0-9]{2}[A-Z]{4}[0-9]{14}$/, length: 22 },
];

function detectIBAN(value) {
  const clean = String(value).replace(/\s/g, '').toUpperCase();
  if (clean.length < 15 || clean.length > 34) return false;
  const pattern = IBAN_PATTERNS.find(p => clean.startsWith(p.country));
  return pattern ? pattern.regex.test(clean) : false;
}

function anonymizeIBAN(value) {
  const clean = value.replace(/\s/g, '').toUpperCase();
  // Behalte Ländercode + Prüfziffern, randomisiere Rest
  const prefix = clean.slice(0, 4);
  const rest = clean.slice(4).replace(/[0-9]/g, () => Math.floor(Math.random() * 10));
  return prefix + rest;
}
```

---

### 5.3 Steuernummern (national)

```javascript
const TAX_NUMBER_PATTERNS = [
  // Deutschland: 10-11 Ziffern, Format variiert je Bundesland
  { country: 'DE', regex: /^[0-9]{2,3}[\/ ]?[0-9]{3}[\/ ]?[0-9]{4,5}$/ },
  
  // Österreich: 9 Ziffern
  { country: 'AT', regex: /^[0-9]{2}-?[0-9]{3}[\/ ]?[0-9]{4}$/ },
  
  // Schweiz: AHV-Nummer 13-stellig
  { country: 'CH', regex: /^756\.[0-9]{4}\.[0-9]{4}\.[0-9]{2}$/ },
];
// Hinweis: Steuernummern sind schwer von anderen Nummernfolgen zu trennen.
// Erkennung NUR über Spaltennamen (enthält "Steuer/Tax/StNr/TaxID")
```

---

### 5.4 Telefonnummern

```javascript
const PHONE_PATTERNS = [
  // International E.164 Format
  { name: 'INTERNATIONAL', regex: /^\+[1-9][0-9]{6,14}$/ },
  
  // DACH
  { country: 'DE', regex: /^(\+49|0049|0)[1-9][0-9]{3,13}$/ },
  { country: 'AT', regex: /^(\+43|0043|0)[1-9][0-9]{3,12}$/ },
  { country: 'CH', regex: /^(\+41|0041|0)[1-9][0-9]{8}$/ },
  
  // Westeuropa
  { country: 'FR', regex: /^(\+33|0033|0)[1-9][0-9]{8}$/ },
  { country: 'IT', regex: /^(\+39|0039)[0-9]{6,12}$/ },
  { country: 'ES', regex: /^(\+34|0034)[6-9][0-9]{8}$/ },
  { country: 'NL', regex: /^(\+31|0031|0)[1-9][0-9]{8}$/ },
  { country: 'BE', regex: /^(\+32|0032|0)[1-9][0-9]{7,8}$/ },
  
  // UK & US
  { country: 'GB', regex: /^(\+44|0044|0)[1-9][0-9]{9}$/ },
  { country: 'US', regex: /^(\+1|001)?[2-9][0-9]{9}$/ },
];

function detectPhone(value) {
  const clean = String(value).replace(/[\s\-\(\)\.]/g, '');
  return PHONE_PATTERNS.some(p => p.regex.test(clean));
}

function anonymizePhone(value) {
  const clean = value.replace(/[\s\-\(\)\.]/g, '');
  // Ländervorwahl erhalten, Rest randomisieren
  const prefixMatch = clean.match(/^(\+[0-9]{1,3}|00[0-9]{2}|0)/);
  if (!prefixMatch) return '+49' + '0'.repeat(10);
  const prefix = prefixMatch[0];
  const rest = clean.slice(prefix.length);
  return prefix + rest.replace(/[0-9]/g, () => Math.floor(Math.random() * 10));
}
```

---

### 5.5 Postleitzahlen

```javascript
const PLZ_PATTERNS = [
  // DACH
  { country: 'DE', regex: /^[0-9]{5}$/, validate: v => parseInt(v) >= 1001 && parseInt(v) <= 99998 },
  { country: 'AT', regex: /^[0-9]{4}$/, validate: v => parseInt(v) >= 1000 && parseInt(v) <= 9999 },
  { country: 'CH', regex: /^[0-9]{4}$/, validate: v => parseInt(v) >= 1000 && parseInt(v) <= 9999 },
  
  // Westeuropa
  { country: 'FR', regex: /^[0-9]{5}$/ },
  { country: 'IT', regex: /^[0-9]{5}$/ },
  { country: 'ES', regex: /^[0-9]{5}$/, validate: v => parseInt(v) >= 1000 },
  { country: 'NL', regex: /^[0-9]{4}\s?[A-Z]{2}$/ },  // 1234 AB
  { country: 'BE', regex: /^[0-9]{4}$/, validate: v => parseInt(v) >= 1000 && parseInt(v) <= 9999 },
  { country: 'LU', regex: /^[0-9]{4}$/, validate: v => parseInt(v) >= 1000 && parseInt(v) <= 9999 },
  { country: 'PT', regex: /^[0-9]{4}-[0-9]{3}$/ },    // 1234-567
  
  // Nordeuropa
  { country: 'SE', regex: /^[0-9]{3}\s?[0-9]{2}$/ },  // 123 45
  { country: 'DK', regex: /^[0-9]{4}$/, validate: v => parseInt(v) >= 1000 && parseInt(v) <= 9990 },
  { country: 'FI', regex: /^[0-9]{5}$/ },
  { country: 'NO', regex: /^[0-9]{4}$/ },
  
  // Osteuropa
  { country: 'PL', regex: /^[0-9]{2}-[0-9]{3}$/ },    // 12-345
  { country: 'CZ', regex: /^[0-9]{3}\s?[0-9]{2}$/ },  // 123 45
  { country: 'SK', regex: /^[0-9]{3}\s?[0-9]{2}$/ },
  { country: 'HU', regex: /^[0-9]{4}$/, validate: v => parseInt(v) >= 1000 },
  { country: 'RO', regex: /^[0-9]{6}$/ },
  
  // UK & US
  { country: 'GB', regex: /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i }, // SW1A 1AA
  { country: 'US', regex: /^[0-9]{5}(-[0-9]{4})?$/ }, // 12345 oder 12345-6789
  { country: 'CA', regex: /^[A-Z][0-9][A-Z]\s?[0-9][A-Z][0-9]$/i }, // K1A 0A6
];

// Wichtig: PLZ-Erkennung braucht Kontext
// Nur wenn Spaltenname "PLZ/ZIP/Postleitzahl/Postal" enthält ODER
// Nachbarspalte heißt "Stadt/City/Ort"
function detectPLZ(value, columnName, neighborColumns) {
  const isContextual = /plz|zip|postal|postleitzahl/i.test(columnName) ||
    neighborColumns.some(c => /stadt|city|ort|town/i.test(c));
  if (!isContextual) return false;
  return PLZ_PATTERNS.some(p => p.regex.test(String(value).trim()));
}

function anonymizePLZ(value, detectedCountry) {
  const pattern = PLZ_PATTERNS.find(p => p.country === detectedCountry);
  if (!pattern) return value; // Unbekanntes Land: unverändert
  
  // Erste Ziffer/Buchstaben erhalten (Region), Rest randomisieren
  const v = String(value);
  if (detectedCountry === 'DE') {
    return v[0] + String(Math.floor(Math.random() * 9000 + 1000)).slice(1);
  }
  if (detectedCountry === 'NL') {
    const digits = (Math.floor(Math.random() * 9000) + 1000).toString();
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                    String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return digits + ' ' + letters;
  }
  // Fallback: alle Ziffern randomisieren
  return v.replace(/[0-9]/g, () => Math.floor(Math.random() * 10));
}
```

---

### 5.6 Ländercodes (Referenzliste für Klasse C)

```javascript
const ISO2_CODES = new Set([
  'DE','AT','CH','FR','IT','ES','NL','BE','LU','PT','SE','DK','FI','NO',
  'PL','CZ','SK','HU','RO','BG','HR','SI','EE','LV','LT',
  'GB','IE','US','CA','AU','NZ','JP','CN','IN','BR','MX','RU','TR',
  'GR','CY','MT','IS','LI','MC','SM','VA','AD'
]);

const ISO3_CODES = new Set([
  'DEU','AUT','CHE','FRA','ITA','ESP','NLD','BEL','LUX','PRT','SWE','DNK',
  'FIN','NOR','POL','CZE','SVK','HUN','ROU','BGR','HRV','SVN','EST','LVA',
  'LTU','GBR','IRL','USA','CAN','AUS','NZL','JPN','CHN','IND','BRA','MEX',
  'RUS','TUR','GRC','CYP','MLT','ISL','LIE'
]);

function detectCountryCode(value) {
  const v = String(value).trim().toUpperCase();
  if (v.length === 2) return ISO2_CODES.has(v) ? 'LAENDERCODE_ISO2' : null;
  if (v.length === 3) return ISO3_CODES.has(v) ? 'LAENDERCODE_ISO3' : null;
  return null;
}
```

---

### 5.7 Unternehmens-Rechtsformen (internationale Erkennung)

```javascript
const LEGAL_FORMS = [
  // DACH
  /\bGmbH\b/, /\bAG\b/, /\bSE\b/, /\bKG\b/, /\bOHG\b/, /\bGbR\b/, /\bUG\b/,
  /\bGmbH\s*&\s*Co\.\s*KG\b/,
  // Österreich
  /\bGesmbH\b/, /\bOG\b/,
  // Schweiz
  /\bAG\b/, /\bSàrl\b/, /\bGmbH\b/,
  // Frankreich
  /\bSAS\b/, /\bSARL\b/, /\bSA\b/, /\bSNC\b/, /\bSCI\b/,
  // Italien
  /\bSRL\b/, /\bSpA\b/, /\bSnc\b/, /\bSas\b/,
  // Spanien
  /\bSL\b/, /\bSA\b/, /\bSLL\b/,
  // Niederlande / Belgien
  /\bBV\b/, /\bNV\b/, /\bVOF\b/,
  // UK
  /\bLtd\b/, /\bLtd\.\b/, /\bLLP\b/, /\bPLC\b/,
  // USA
  /\bInc\b/, /\bInc\.\b/, /\bLLC\b/, /\bCorp\b/, /\bCorp\.\b/,
  // International
  /\bS\.A\.\b/, /\bS\.p\.A\.\b/,
];

function detectCompanyName(value, columnName) {
  const isContextual = /firma|company|unternehmen|kunde|lieferant|vendor|client/i.test(columnName);
  return isContextual && LEGAL_FORMS.some(pattern => pattern.test(String(value)));
}
```

---

## 6. Erkennungs-Priorität (Reihenfolge im typeDetector.js)

Wichtig: Typen werden in dieser Reihenfolge geprüft. Erster Match gewinnt.

```
1.  Formel (=...)           → skip, niemals anfassen
2.  Leer/Null               → skip
3.  IBAN                    → Klasse A, spezifischstes Pattern zuerst
4.  VAT_ID                  → Klasse A
5.  BIC_SWIFT               → Klasse A
6.  EMAIL                   → eindeutig durch @
7.  URL                     → eindeutig durch http/https
8.  IP_V4                   → eindeutig durch x.x.x.x
9.  UUID                    → eindeutig durch xxxx-xxxx-Format
10. TELEFON                 → nach Bereinigung prüfen
11. EAN_BARCODE             → genau 13 Ziffern
12. DATUM_ISO               → YYYY-MM-DD
13. DATUM_DE                → TT.MM.JJJJ
14. DATUM_US                → MM/DD/YYYY
15. EXCEL_DATUM             → Ganzzahl 40000-50000
16. BETRAG_MIT_SYMBOL       → Enthält €/$£
17. PLZ                     → kontextabhängig (Spaltenname!)
18. LAENDERCODE_ISO2        → genau 2 Großbuchstaben aus Liste
19. LAENDERCODE_ISO3        → genau 3 Großbuchstaben aus Liste
20. VAT_ID (nochmal)        → falls Spaltenname "USt/VAT/MwSt" enthält
21. PROZENTSATZ             → Zahl + %
22. BETRAG_OHNE_SYMBOL      → Zahl, 2 Dez., kontextabhängig
23. KOSTENSTELLE            → kontextabhängig
24. KUNDENNUMMER            → kontextabhängig
25. UNTERNEHMENSNAME        → Rechtsform-Erkennung
26. VOLLSTAENDIGER_NAME     → kontextabhängig
27. TEXT_KURZ               → String <20 Zeichen (Code/ID-Fallback)
28. TEXT_LANG               → String >=20 Zeichen (Beschreibung-Fallback)
```

---

## 7. Konsistenz-Mechanik

```javascript
const consistencyMap = new Map();

function anonymizeValue(value, type) {
  const key = `${type}::${value}`;
  if (consistencyMap.has(key)) return consistencyMap.get(key);
  const anonymized = generateAnonymized(value, type);
  consistencyMap.set(key, anonymized);
  return anonymized;
}
// Gleicher Input → immer gleicher Output innerhalb einer Session
// "Müller GmbH" → immer "Firma_047", nicht verschiedene Werte pro Zeile
```

---

## 8. Claude Code Prompt: Phase 2

```
Phase 2 von Schemask. Basis (Phase 1) läuft.

Aufgaben in dieser Phase:

**1. Sofort-Fix: Originalwerte maskieren**
In SheetPreview werden aktuell echte Datenwerte gezeigt.
Ersetze alle Beispielwerte durch maskierte Versionen:
- Email: erste 2 Zeichen + ••• + @domain.tld (Domain auch maskieren)
- Zahlen: erste + letzte Ziffer sichtbar, Rest •
- Text: erste 2 + letzte 1 Zeichen, Rest •
- IBAN/VAT: erste 4 Zeichen + ••••••••
Originaldaten nur im Memory für spätere Anonymisierung.

**2. Erweiterte Typ-Erkennung**
Füge diese neuen Typen hinzu (Patterns stehen in der Spec):
- VAT_ID (Klasse A, rot) – alle EU-Länder + CH + GB
- IBAN (Klasse A, rot) – alle EU-Länder + CH + GB
- TELEFON (Klasse B) – internationale Patterns
- PLZ (Klasse B) – kontextabhängig, alle EU-Länder + US
- UNTERNEHMENSNAME (Klasse B) – internationale Rechtsformen
- LAENDERCODE_ISO2/ISO3 (Klasse C, grau)

**3. 3-Klassen UI**
Spalten-Konfigurations-Ansicht mit:
- Klasse A: roter Badge, kein Toggle (immer aktiv, grayed out)
- Klasse B: oranger Badge, Toggle standardmäßig AN
- Klasse C: grauer Badge, Toggle standardmäßig AUS
- Klasse unbekannt: weißer Badge "Text", Toggle AUS

**4. Konsistenz-Map implementieren**
consistencyMap.js: gleicher Input → gleicher Output.
Jede Anonymisierungs-Funktion muss die Map nutzen.

Zeige mir nach jedem Abschnitt den Stand, bevor du weitermachst.
```

---

## 9. Phasen-Übersicht (aktualisiert)

### ✅ Phase 1 – Abgeschlossen
- Projektsetup React + Vite + Tailwind
- File Upload + SheetJS Parsing
- Basis Typ-Erkennung (5 Typen)
- Trust-Indikator
- SheetPreview

### 🔄 Phase 2 – Aktuell
- [ ] Sofort-Fix: Originalwerte maskieren
- [ ] Vollständige Typ-Erkennung (alle Typen aus Kap. 4)
- [ ] Internationale Regelbibliothek (Kap. 5)
- [ ] 3-Klassen UI mit Toggles
- [ ] Konsistenz-Map

### Phase 3 – Output & Export
- [ ] Anonymisierungs-Logik für alle Typen
- [ ] Side-by-Side Vorschau (Original maskiert vs. Anonymisiert)
- [ ] Export: anonymisierte .xlsx
- [ ] Export: optionale Mapping-CSV
- [ ] Export: Schema-JSON

### Phase 4 – Showcase-Ready
- [ ] Landing Page (separate von Tool)
- [ ] GitHub README
- [ ] Design-Polish
- [ ] Deployment Hetzner via Coolify
- [ ] marcolarosa.com Verlinkung

---

*Spec-Version: 3.0 | Aktualisiert: März 2026*
