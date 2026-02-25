"use client";

import { useState } from "react";
import { createWhatsappLink, siteConfig } from "@/lib/site-config";

export function InventoryEmbed() {
  const [consented, setConsented] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="inventory-wrap">
      {!consented ? (
        <div className="consent-box" role="region" aria-live="polite">
          <h2>Fahrzeugbestand laden</h2>
          <p>
            Der Bestand wird über eine externe mobile.de Seite angezeigt. Beim Laden können Daten an den Anbieter
            übertragen werden.
          </p>
          <div className="button-row">
            <button className="btn btn-primary" type="button" onClick={() => setConsented(true)}>
              Inhalt aktivieren
            </button>
            <a className="btn btn-secondary" href={siteConfig.inventoryFallbackUrl} target="_blank" rel="noreferrer">
              Bestand extern öffnen
            </a>
          </div>
        </div>
      ) : (
        <div className="embed-shell" aria-busy={!loaded}>
          {!loaded ? <p className="loading-note">Bestand wird geladen...</p> : null}
          <iframe
            title="Fahrzeugbestand"
            src={siteConfig.inventoryEmbedUrl}
            onLoad={() => setLoaded(true)}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}

      <a className="btn btn-secondary" href={createWhatsappLink("Hallo, ich habe eine Frage zu einem Fahrzeug.")}>
        WhatsApp zu einem Fahrzeug
      </a>
    </div>
  );
}
