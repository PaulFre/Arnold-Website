import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <section>
          <h2>{siteConfig.businessName}</h2>
          <p>Musterstraße 1</p>
          <p>67098 {siteConfig.city}</p>
          <p>Telefon: {siteConfig.phoneDisplay}</p>
        </section>
        <section>
          <h2>Öffnungszeiten</h2>
          <p>Mo-Fr: 09:00-18:00 Uhr</p>
          <p>Sa: 10:00-14:00 Uhr</p>
          <p>So: geschlossen</p>
        </section>
        <section>
          <h2>Rechtliches</h2>
          <p>
            <Link href="/impressum">Impressum</Link>
          </p>
          <p>
            <Link href="/datenschutz">Datenschutz</Link>
          </p>
          <p>
            <Link href="/kontakt">Kontakt</Link>
          </p>
          <p>
            <Link href="/unternehmen">Unternehmen</Link>
          </p>
          <p>
            <Link href="/fahrzeug-verkaufen">Fahrzeug verkaufen</Link>
          </p>
        </section>
      </div>
    </footer>
  );
}
