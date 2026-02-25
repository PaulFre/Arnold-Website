# Arnold Automobile MVP Website

Phase-1 MVP als Next.js (App Router) fuer ein Autohaus in Deutschland.

## Enthaltene Seiten

- `/` Startseite mit Hero, 3 Haupt-CTAs, USP-Kacheln, Ablauf, FAQ
- `/fahrzeuge` Fahrzeugbestand mit datenschutzbasiertem Embed + Fallback-Link
- `/bewerten` Bewertungsformular (Ankauf/Kommission) mit Uploads und DSGVO-Checkbox
- `/termin` Termin-CTA (Booking Link) + WhatsApp/Telefon
- `/impressum` Platzhalterseite
- `/datenschutz` Platzhalterseite

## Tech-Stack

- Next.js App Router
- React + TypeScript
- API Route: `/api/valuation`
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
- `NEXT_PUBLIC_INVENTORY_EMBED_URL` mobile.de oder andere Bestands-URL fuer iFrame
- `NEXT_PUBLIC_INVENTORY_FALLBACK_URL` externer Link, falls iFrame blockiert ist
- `NEXT_PUBLIC_BOOKING_URL` Link zur Terminseite (z.B. Google Booking)
- `CONTACT_EMAIL_TO` Empfaengeradresse fuer Bewertungsanfragen
- `SMTP_*` fuer Mailversand aus der API

## mobile.de Bestand setzen

1. `NEXT_PUBLIC_INVENTORY_EMBED_URL` auf die gewuenschte Bestandsseite setzen.
2. Wenn Einbettung per `X-Frame-Options`/`CSP` blockiert wird:
   - Nutzer klicken auf "Bestand extern oeffnen" (`NEXT_PUBLIC_INVENTORY_FALLBACK_URL`).
3. Die Seite laedt den Embed erst nach Klick auf "Inhalt aktivieren" (Datenschutz-Flow).

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
