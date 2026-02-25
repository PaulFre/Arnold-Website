import { createWhatsappLink } from "@/lib/site-config";

export function FloatingWhatsapp() {
  return (
    <a
      className="floating-whatsapp"
      href={createWhatsappLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Per WhatsApp schreiben"
    >
      WhatsApp
    </a>
  );
}
