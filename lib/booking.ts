const REQUIRED_SLOTS = [10, 11, 13, 14, 15, 16] as const;

type CalendarEvent = {
  startUtc: Date;
  endUtc: Date;
};

type IcalProperty = {
  value: string;
  tzid?: string;
};

export class SlotOccupiedError extends Error {}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }
  return value;
}

function bookingConfig() {
  return {
    url: requiredEnv("CALDAV_URL"),
    username: requiredEnv("CALDAV_USERNAME"),
    password: requiredEnv("CALDAV_PASSWORD"),
    timezone: process.env.BOOKING_TIMEZONE || "Europe/Berlin"
  };
}

function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) {
    throw new Error("Invalid date format, expected YYYY-MM-DD");
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function getOffsetMinutes(timeZone: string, utcDate: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(utcDate);
  const tzName = parts.find((part) => part.type === "timeZoneName")?.value || "GMT+0";
  const match = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/.exec(tzName);
  if (!match) {
    return 0;
  }
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] || "0");
  return sign * (hours * 60 + minutes);
}

function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date {
  const roughUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMinutes = getOffsetMinutes(timeZone, roughUtc);
  return new Date(roughUtc.getTime() - offsetMinutes * 60_000);
}

function formatUtcForCalDav(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "T",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    "Z"
  ].join("");
}

function decodeXmlEntities(value: string): string {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function unfoldIcalLines(text: string): string[] {
  return text
    .replace(/\r?\n[ \t]/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractProperty(lines: string[], name: string): IcalProperty | null {
  const line = lines.find((entry) => entry.toUpperCase().startsWith(name.toUpperCase()));
  if (!line) {
    return null;
  }
  const splitIndex = line.indexOf(":");
  if (splitIndex < 0) {
    return null;
  }

  const left = line.slice(0, splitIndex);
  const value = line.slice(splitIndex + 1);
  const tzMatch = /TZID=([^;:]+)/i.exec(left);
  return {
    value,
    tzid: tzMatch?.[1]
  };
}

function parseIcalDateToUtc(value: string, timeZone: string): Date {
  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));
    return zonedTimeToUtc(year, month, day, 0, 0, timeZone);
  }

  if (/^\d{8}T\d{6}Z$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));
    const hour = Number(value.slice(9, 11));
    const minute = Number(value.slice(11, 13));
    const second = Number(value.slice(13, 15));
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }

  if (/^\d{8}T\d{6}$/.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));
    const hour = Number(value.slice(9, 11));
    const minute = Number(value.slice(11, 13));
    return zonedTimeToUtc(year, month, day, hour, minute, timeZone);
  }

  throw new Error(`Unsupported iCal date format: ${value}`);
}

function parseEventsFromIcs(icsText: string, fallbackTimeZone: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const blocks = icsText.split("BEGIN:VEVENT").slice(1);

  for (const block of blocks) {
    const section = block.split("END:VEVENT")[0];
    if (!section) {
      continue;
    }
    const lines = unfoldIcalLines(section);
    const dtStart = extractProperty(lines, "DTSTART");
    const dtEnd = extractProperty(lines, "DTEND");
    if (!dtStart || !dtEnd) {
      continue;
    }

    const startTz = dtStart.tzid || fallbackTimeZone;
    const endTz = dtEnd.tzid || fallbackTimeZone;
    const startUtc = parseIcalDateToUtc(dtStart.value, startTz);
    const endUtc = parseIcalDateToUtc(dtEnd.value, endTz);
    if (endUtc.getTime() <= startUtc.getTime()) {
      continue;
    }

    events.push({ startUtc, endUtc });
  }

  return events;
}

async function queryEventsForRange(rangeStartUtc: Date, rangeEndUtc: Date): Promise<CalendarEvent[]> {
  const { url, username, password, timezone } = bookingConfig();
  const auth = Buffer.from(`${username}:${password}`).toString("base64");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<c:calendar-query xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:d="DAV:">
  <d:prop>
    <d:getetag />
    <c:calendar-data />
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${formatUtcForCalDav(rangeStartUtc)}" end="${formatUtcForCalDav(rangeEndUtc)}" />
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`;

  const response = await fetch(url, {
    method: "REPORT",
    headers: {
      Authorization: `Basic ${auth}`,
      Depth: "1",
      "Content-Type": "application/xml; charset=utf-8"
    },
    body,
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`CalDAV query failed: ${response.status}`);
  }

  const xml = await response.text();
  const calendarDataMatches = Array.from(xml.matchAll(/<[^>]*calendar-data[^>]*>([\s\S]*?)<\/[^>]*calendar-data>/gi));
  const events: CalendarEvent[] = [];

  for (const match of calendarDataMatches) {
    const icsContent = decodeXmlEntities(match[1] || "");
    events.push(...parseEventsFromIcs(icsContent, timezone));
  }

  return events;
}

export async function getOccupiedSlotsForDate(dateKey: string): Promise<number[]> {
  const { year, month, day } = parseDateKey(dateKey);
  const { timezone } = bookingConfig();
  const dayStartUtc = zonedTimeToUtc(year, month, day, 0, 0, timezone);
  const dayEndUtc = zonedTimeToUtc(year, month, day + 1, 0, 0, timezone);
  const events = await queryEventsForRange(dayStartUtc, dayEndUtc);
  const occupied = new Set<number>();

  for (const hour of REQUIRED_SLOTS) {
    const slotStart = zonedTimeToUtc(year, month, day, hour, 0, timezone);
    const slotEnd = zonedTimeToUtc(year, month, day, hour + 1, 0, timezone);
    const hasOverlap = events.some((event) => event.startUtc < slotEnd && event.endUtc > slotStart);
    if (hasOverlap) {
      occupied.add(hour);
    }
  }

  return Array.from(occupied).sort((a, b) => a - b);
}

function escapeIcalText(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,").replaceAll("\n", "\\n");
}

export async function createBooking(input: { dateKey: string; hour: number; name: string; phone?: string; email?: string }): Promise<void> {
  if (!REQUIRED_SLOTS.includes(input.hour as (typeof REQUIRED_SLOTS)[number])) {
    throw new Error("Invalid booking slot");
  }

  const occupied = await getOccupiedSlotsForDate(input.dateKey);
  if (occupied.includes(input.hour)) {
    throw new SlotOccupiedError("Slot already occupied");
  }

  const { year, month, day } = parseDateKey(input.dateKey);
  const { timezone, url, username, password } = bookingConfig();
  const startUtc = zonedTimeToUtc(year, month, day, input.hour, 0, timezone);
  const endUtc = zonedTimeToUtc(year, month, day, input.hour + 1, 0, timezone);
  const auth = Buffer.from(`${username}:${password}`).toString("base64");
  const nowUtc = new Date();
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}@arnold-website.local`;
  const separator = url.endsWith("/") ? "" : "/";
  const eventUrl = `${url}${separator}${uid}.ics`;

  const descriptionParts = [
    `Kunde: ${input.name}`,
    input.phone ? `Telefon: ${input.phone}` : "",
    input.email ? `E-Mail: ${input.email}` : "",
    "Quelle: Website Terminbuchung"
  ].filter(Boolean);

  const icsBody = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Arnold Automobile//Website Booking//DE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatUtcForCalDav(nowUtc)}`,
    `DTSTART:${formatUtcForCalDav(startUtc)}`,
    `DTEND:${formatUtcForCalDav(endUtc)}`,
    `SUMMARY:${escapeIcalText(`Website Termin: ${input.name}`)}`,
    `DESCRIPTION:${escapeIcalText(descriptionParts.join("\n"))}`,
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");

  const response = await fetch(eventUrl, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "text/calendar; charset=utf-8"
    },
    body: icsBody,
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`CalDAV create failed: ${response.status}`);
  }
}

export { REQUIRED_SLOTS };
