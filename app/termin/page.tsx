"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createTelLink, createWhatsappLink } from "@/lib/site-config";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_LABELS = [
  "Januar",
  "Februar",
  "Maerz",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember"
];
const SLOT_HOURS = [10, 11, 13, 14, 15, 16];

function formatDateKey(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildMonthGrid(monthStart: Date): Array<Date | null> {
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const mondayBasedStartOffset = (monthStart.getDay() + 6) % 7;
  const cells: Array<Date | null> = [];

  for (let i = 0; i < mondayBasedStartOffset; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function TerminPage() {
  const today = atMidnight(new Date());
  const [monthStart, setMonthStart] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [showBooking, setShowBooking] = useState(false);
  const [occupiedOnSelectedDate, setOccupiedOnSelectedDate] = useState<number[]>([]);
  const [availabilityState, setAvailabilityState] = useState<"idle" | "loading" | "error">("idle");
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [bookingState, setBookingState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [bookingMessage, setBookingMessage] = useState("");

  const monthCells = useMemo(() => buildMonthGrid(monthStart), [monthStart]);
  const selectedDateKey = formatDateKey(selectedDate);

  useEffect(() => {
    if (!showBooking) {
      return;
    }

    let cancelled = false;
    setAvailabilityState("loading");

    async function loadAvailability() {
      try {
        const response = await fetch(`/api/booking/availability?date=${selectedDateKey}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Availability request failed");
        }
        const payload = (await response.json()) as { occupiedHours?: number[] };
        if (!cancelled) {
          setOccupiedOnSelectedDate(Array.isArray(payload.occupiedHours) ? payload.occupiedHours : []);
          setAvailabilityState("idle");
        }
      } catch {
        if (!cancelled) {
          setOccupiedOnSelectedDate([]);
          setAvailabilityState("error");
        }
      }
    }

    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [selectedDateKey, showBooking]);

  async function refreshAvailability() {
    setAvailabilityState("loading");
    try {
      const response = await fetch(`/api/booking/availability?date=${selectedDateKey}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Availability request failed");
      }
      const payload = (await response.json()) as { occupiedHours?: number[] };
      setOccupiedOnSelectedDate(Array.isArray(payload.occupiedHours) ? payload.occupiedHours : []);
      setAvailabilityState("idle");
    } catch {
      setAvailabilityState("error");
    }
  }

  function previousMonth() {
    setMonthStart((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  function nextMonth() {
    setMonthStart((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  function closeModal() {
    setShowBooking(false);
    setSelectedHour(null);
    setBookingState("idle");
    setBookingMessage("");
  }

  function onSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedHour(null);
    setBookingState("idle");
    setBookingMessage("");
  }

  async function onBookSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedHour === null) {
      setBookingState("error");
      setBookingMessage("Bitte zuerst einen freien Zeitslot auswaehlen.");
      return;
    }

    setBookingState("saving");
    setBookingMessage("");

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDateKey,
          hour: selectedHour,
          name: customerName,
          phone: customerPhone || undefined,
          email: customerEmail || undefined
        })
      });

      if (response.status === 409) {
        setBookingState("error");
        setBookingMessage("Der Slot wurde gerade belegt. Bitte waehle einen anderen.");
        await refreshAvailability();
        return;
      }

      if (!response.ok) {
        setBookingState("error");
        setBookingMessage("Buchung fehlgeschlagen. Bitte versuche es erneut.");
        return;
      }

      setBookingState("success");
      setBookingMessage("Termin erfolgreich gebucht.");
      setSelectedHour(null);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      await refreshAvailability();
    } catch {
      setBookingState("error");
      setBookingMessage("Buchung fehlgeschlagen. Bitte versuche es erneut.");
    }
  }

  return (
    <section className="section">
      <div className="container narrow">
        <h1>Termin vereinbaren</h1>
        <p>Waehlen Sie Ihren Wunschtermin, wir bestaetigen kurzfristig.</p>
        <div className="card booking-entry-card">
          <button className="btn btn-primary" type="button" onClick={() => setShowBooking(true)}>
            Termin direkt buchen
          </button>
          <a className="btn btn-secondary" href={createTelLink()}>
            Telefonisch anrufen
          </a>
          <a className="btn btn-secondary" href={createWhatsappLink("Hallo, ich moechte einen Termin vereinbaren.")}>
            WhatsApp schreiben
          </a>
        </div>
      </div>

      {showBooking && (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <div className="modal booking-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Schliessen" onClick={closeModal}>
              x
            </button>

            <h2>Termin direkt buchen</h2>
            <div className="booking-calendar">
              <div className="booking-calendar-head">
                <button className="slot-nav-btn" type="button" onClick={previousMonth} aria-label="Vorheriger Monat">
                  {"<"}
                </button>
                <strong>
                  {MONTH_LABELS[monthStart.getMonth()]} {monthStart.getFullYear()}
                </strong>
                <button className="slot-nav-btn" type="button" onClick={nextMonth} aria-label="Naechster Monat">
                  {">"}
                </button>
              </div>

              <div className="booking-weekdays">
                {WEEKDAY_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>

              <div className="booking-days-grid">
                {monthCells.map((date, index) => {
                  if (!date) {
                    return <span key={`empty-${index}`} className="booking-day-empty" aria-hidden="true" />;
                  }

                  const isSelected = formatDateKey(date) === selectedDateKey;
                  const isPast = date.getTime() < today.getTime();

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      className={`booking-day-btn${isSelected ? " active" : ""}`}
                      onClick={() => onSelectDate(date)}
                      disabled={isPast}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="booking-slots">
              <h3>
                Zeitslots am {selectedDate.getDate()}.{selectedDate.getMonth() + 1}.{selectedDate.getFullYear()}
              </h3>
              {availabilityState === "loading" && <p>Verfuegbarkeit wird geladen...</p>}
              {availabilityState === "error" && <p className="error-text">Verfuegbarkeit konnte nicht geladen werden.</p>}
              <ul className="slot-list">
                {SLOT_HOURS.map((hour) => {
                  const isOccupied = occupiedOnSelectedDate.includes(hour);
                  const isSelected = selectedHour === hour;
                  const label = `${hour}:00 - ${hour + 1}:00`;

                  return (
                    <li key={hour}>
                      <button
                        type="button"
                        className={`slot-btn${isOccupied ? " occupied" : ""}${isSelected ? " selected" : ""}`}
                        onClick={() => setSelectedHour(hour)}
                        disabled={isOccupied || availabilityState !== "idle"}
                      >
                        {label} {isOccupied ? "(belegt)" : "(frei)"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <form className="booking-form" onSubmit={onBookSlot}>
              <h3>Termin abschliessen</h3>
              <label>
                Name *
                <input type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
              </label>
              <label>
                Telefon
                <input type="text" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} />
              </label>
              <label>
                E-Mail
                <input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} />
              </label>
              <button className="btn btn-primary" type="submit" disabled={bookingState === "saving" || !selectedHour}>
                {bookingState === "saving" ? "Buchen..." : "Termin buchen"}
              </button>
              {bookingMessage && <p className={bookingState === "success" ? "booking-success" : "error-text"}>{bookingMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
