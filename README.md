# Arnold Automobile MVP Website

Phase-1/2 MVP als Next.js (App Router) fuer ein Autohaus in Deutschland.

## Enthaltene Seiten

- `/` Startseite mit Hero, 3 Haupt-CTAs, USP-Kacheln, Ablauf, FAQ
- `/fahrzeuge` eigener Fahrzeugbestand mit Kartenlayout und Markenfilter
- `/bewerten` Bewertungsformular (Ankauf/Kommission) mit Uploads und DSGVO-Checkbox
- `/termin` Live-Terminbuchung mit CalDAV-Abgleich + WhatsApp/Telefon
- `/impressum` Platzhalterseite
- `/datenschutz` Platzhalterseite
- `/internal/inventory` interner Bereich zum Inserieren/Bearbeiten/Loeschen von Fahrzeugen (Basic Auth geschützt)

## Tech-Stack

- Next.js App Router
- React + TypeScript
- API Routes: `/api/valuation`, `/api/internal/vehicles`, `/api/booking`, `/api/booking/availability`
- Validierung: `zod`
- E-Mail Versand: `nodemailer`

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Danach: `http://localhost:3000`

## Wichtige ENV Variablen

- `NEXT_PUBLIC_PHONE_E164` fuer WhatsApp `wa.me` (ohne `+`, ohne Leerzeichen)
- `CALDAV_URL` / `CALDAV_USERNAME` / `CALDAV_PASSWORD` fuer Live-Kalenderabgleich und Buchung
- `BOOKING_TIMEZONE` Zeitzone fuer Slots (Standard: `Europe/Berlin`)
- `CONTACT_EMAIL_TO` Empfaengeradresse fuer Bewertungsanfragen
- `ADMIN_USER` / `ADMIN_PASS` fuer internen Fahrzeugbereich ohne sichtbares Loginformular
- `SMTP_*` fuer Mailversand aus der API

## Fahrzeugbestand (eigene Inserate)

Die Fahrzeuge liegen in `data/vehicles.json` und werden auf `/fahrzeuge` angezeigt.

- Marken-Filter wird automatisch aus den verfuegbaren Marken erzeugt.
- Karten zeigen Preis, Daten, Laufleistung, Kraftstoff, Leistung, Getriebe, Standort.
- Fuer Mitarbeiter:
  - `/internal/inventory` aufrufen
  - Browser-Passwortfenster mit `ADMIN_USER` / `ADMIN_PASS`
  - Fahrzeuge einfuegen, bearbeiten oder loeschen

Zugehoerige interne API:
- `GET /api/internal/vehicles`
- `POST /api/internal/vehicles`
- `PUT /api/internal/vehicles/:id`
- `DELETE /api/internal/vehicles/:id`

Hinweis Produktion:
- In Vercel ist das Dateisystem nicht dauerhaft schreibbar.
- Der interne Inserieren-Flow mit `data/vehicles.json` ist daher fuer lokale Nutzung/MVP geeignet.
- Fuer dauerhaftes Online-Inserieren in Produktion sollte ein externes Storage/CMS/DB genutzt werden.

## Bewertungsformular + Uploads

- Endpoint: `POST /api/valuation` (multipart/form-data)
- Pflichtfelder serverseitig validiert.
- Bilder: mindestens 4, maximal 12, max 8 MB je Datei.
- Erlaubte Typen: JPG, PNG, HEIC/HEIF.
- Upload-Ziel lokal: `public/uploads/`
- In E-Mails werden Upload-Pfade mitgesendet.

## Produktion: Uploads und Sicherheit

Die lokale Speicherung in `public/uploads/` ist fuer MVP okay, aber fuer Produktion empfohlen:

- auf S3/Cloud Storage umstellen
- Malware/Content-Pruefung fuer Uploads
- Zugriffsschutz (signierte URLs oder private Buckets)
- Rotation/Loeschkonzept gemaess Datenschutz

## Optionaler Hinweis zu Tracking/Cookies

In dieser Phase ist kein Tracking eingebaut, daher kein Cookie-Banner erforderlich.

## Terminbuchung (CalDAV)

- Auf `/termin` oeffnet sich ein Buchungsfenster mit Monatskalender.
- Slots: 10:00-17:00 in 1h-Schritten, mit Mittagspause 12:00-13:00.
- Belegte Slots werden per CalDAV live geladen und rot dargestellt.
- Bei Buchung wird ein VEVENT direkt in den konfigurierten CalDAV-Kalender geschrieben.
