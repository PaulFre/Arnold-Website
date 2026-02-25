"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createWhatsappLink, siteConfig } from "@/lib/site-config";

type MenuKey = "verkaufen" | "unternehmen" | null;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 4.9A9.8 9.8 0 0 0 3.4 16.6L2 22l5.6-1.3A9.8 9.8 0 1 0 19 4.9Zm-7.2 15a8 8 0 0 1-4-.9l-.3-.2-3.3.8.8-3.2-.2-.3a8 8 0 1 1 7 3.8Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.1.2-.6.8-.8.9-.1.1-.3.2-.6 0-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.8-.2-.3 0-.4.1-.6l.4-.4.2-.4c.1-.1 0-.3 0-.4L9.1 7c-.1-.3-.3-.2-.5-.2h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 4 3.5 2.4 1 2.4.7 2.9.7.4 0 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.1-.5-.3Z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.5l9 5.7 9-5.7V7H3Zm18 10V9.8l-8.5 5.4a1 1 0 0 1-1 0L3 9.8V17h18Z"
      />
    </svg>
  );
}

function ContactModal({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) {
      setSent(false);
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="kontakt-dialog-title">
      <div className="modal">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Dialog schliessen">
          x
        </button>
        <h2 id="kontakt-dialog-title">Kontaktanfrage</h2>
        {!sent ? (
          <form className="contact-form" onSubmit={onSubmit}>
            <label>
              Name*
              <input required name="fullName" />
            </label>
            <label>
              Nummer*
              <input required name="phone" type="tel" />
            </label>
            <label>
              E-Mail*
              <input required name="email" type="email" />
            </label>
            <label>
              Nachricht*
              <textarea required name="message" rows={4} />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" required /> Ich stimme der Datenschutzerklaerung zu.*
            </label>
            <label className="checkbox-row">
              <input type="checkbox" required /> Ich stimme der Datennutzung zu, mit Loeschung nach Abschluss.*
            </label>
            <button className="btn btn-primary" type="submit">
              Anfrage senden
            </button>
          </form>
        ) : (
          <div className="success-box" role="status">
            <h3>Danke, wir melden uns zeitnah.</h3>
            <p>Die Kontaktanfrage wurde aufgenommen.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function TopChrome() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const waLink = useMemo(() => createWhatsappLink(), []);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 140 && currentY > lastY.current) {
        setHidden(true);
        setOpenMenu(null);
      } else if (currentY < lastY.current) {
        setHidden(false);
      }
      lastY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`site-header${hidden ? " hidden" : ""}`}>
        <div className="container header-inner">
          <div className="brand-row">
            <Link href="/" className="logo" aria-label="Startseite">
              <span className="logo-box" aria-hidden="true">
                Logo
              </span>
              <span>{siteConfig.businessName}</span>
            </Link>

            <nav aria-label="Hauptnavigation">
              <ul className="nav-list">
                <li>
                  <Link href="/">Startseite</Link>
                </li>
                <li>
                  <Link href="/fahrzeuge">Fahrzeuge</Link>
                </li>
                <li className="menu-item">
                  <Link href="/fahrzeug-verkaufen">Fahrzeug verkaufen</Link>
                  <button
                    type="button"
                    className="menu-trigger"
                    aria-label="Untermenue Fahrzeug verkaufen"
                    onClick={() => setOpenMenu(openMenu === "verkaufen" ? null : "verkaufen")}
                  >
                    v
                  </button>
                  <div className={`dropdown${openMenu === "verkaufen" ? " show" : ""}`}>
                    <Link href="/bewerten" onClick={() => setOpenMenu(null)}>
                      Fahrzeug bewerten
                    </Link>
                    <Link href="/termin" onClick={() => setOpenMenu(null)}>
                      Direkt Termin buchen
                    </Link>
                  </div>
                </li>
                <li className="menu-item">
                  <Link href="/unternehmen">Unternehmen</Link>
                  <button
                    type="button"
                    className="menu-trigger"
                    aria-label="Untermenue Unternehmen"
                    onClick={() => setOpenMenu(openMenu === "unternehmen" ? null : "unternehmen")}
                  >
                    v
                  </button>
                  <div className={`dropdown${openMenu === "unternehmen" ? " show" : ""}`}>
                    <Link href="/unternehmen#bewertungen" onClick={() => setOpenMenu(null)}>
                      Bewertungen
                    </Link>
                    <Link href="/unternehmen#galerie" onClick={() => setOpenMenu(null)}>
                      Bildergalerie
                    </Link>
                    <Link href="/unternehmen#ueber-uns" onClick={() => setOpenMenu(null)}>
                      Ueber uns
                    </Link>
                  </div>
                </li>
                <li>
                  <Link href="/kontakt">Kontakt</Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="header-icons">
            <a className="icon-btn" href={waLink} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <WhatsAppIcon />
            </a>
            <button className="icon-btn" type="button" onClick={() => setContactOpen(true)} aria-label="Kontakt">
              <MailIcon />
            </button>
          </div>
        </div>
      </header>

      {hidden ? (
        <div className="floating-actions">
          <a className="icon-btn" href={waLink} target="_blank" rel="noreferrer" aria-label="WhatsApp">
            <WhatsAppIcon />
          </a>
          <button className="icon-btn" type="button" onClick={() => setContactOpen(true)} aria-label="Kontakt">
            <MailIcon />
          </button>
        </div>
      ) : null}

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
