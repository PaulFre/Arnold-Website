import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import { TopChrome } from "@/components/top-chrome";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${siteConfig.businessName} | Fahrzeuge kaufen und verkaufen`,
  description:
    "Fahrzeuge ansehen, bewerten lassen und schnell einen Termin vereinbaren. Mobil optimiert und DSGVO-konform.",
  metadataBase: new URL(siteConfig.siteUrl)
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <a href="#main-content" className="skip-link">
          Direkt zum Inhalt
        </a>
        <TopChrome />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
