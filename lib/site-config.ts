const required = (value: string | undefined, fallback: string): string =>
  value && value.trim().length > 0 ? value : fallback;

const digitsOnly = (value: string): string => value.replace(/\D/g, "");

export const siteConfig = {
  businessName: required(process.env.NEXT_PUBLIC_BUSINESS_NAME, "Arnold Automobile"),
  city: required(process.env.NEXT_PUBLIC_CITY, "Bad Dürkheim"),
  phoneDisplay: required(process.env.NEXT_PUBLIC_PHONE_DISPLAY, "+49 0000 000000"),
  phoneInternational: required(process.env.NEXT_PUBLIC_PHONE_E164, "490000000000"),
  siteUrl: required(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"),
  whatsappMessage: required(
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE,
    "Hallo, ich interessiere mich für ein Fahrzeug von Arnold Automobile."
  ),
  inventoryEmbedUrl: required(
    process.env.NEXT_PUBLIC_INVENTORY_EMBED_URL,
    "https://home.mobile.de/"
  ),
  inventoryFallbackUrl: required(
    process.env.NEXT_PUBLIC_INVENTORY_FALLBACK_URL,
    "https://home.mobile.de/"
  ),
  bookingUrl: required(process.env.NEXT_PUBLIC_BOOKING_URL, "https://calendar.google.com/")
};

export const createWhatsappLink = (text?: string): string => {
  const message = encodeURIComponent(text ?? siteConfig.whatsappMessage);
  return `https://wa.me/${siteConfig.phoneInternational}?text=${message}`;
};

export const createTelLink = (): string => `tel:+${digitsOnly(siteConfig.phoneInternational)}`;
