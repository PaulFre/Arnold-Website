"use client";

import Link from "next/link";
import { createWhatsappLink, siteConfig } from "@/lib/site-config";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="Startseite">
          {siteConfig.businessName}
        </Link>
        <nav aria-label="Hauptnavigation">
          <ul className="nav-list">
            <li>
              <Link href="/fahrzeuge">Fahrzeuge</Link>
            </li>
            <li>
              <Link href="/bewerten">Bewerten</Link>
            </li>
            <li>
              <Link href="/termin">Termin</Link>
            </li>
            <li>
              <a href={createWhatsappLink()} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
