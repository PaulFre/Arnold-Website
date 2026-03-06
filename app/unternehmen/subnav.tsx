import Link from "next/link";

const links = [
  { href: "/unternehmen/bewertungen", label: "Bewertungen", key: "bewertungen" },
  { href: "/unternehmen/galerie", label: "Bildergalerie", key: "galerie" },
  { href: "/unternehmen/ueber-uns", label: "Ueber uns", key: "ueber-uns" }
] as const;

type Props = {
  activeKey?: (typeof links)[number]["key"];
};

export function CompanySubnav({ activeKey }: Props) {
  return (
    <nav className="company-subnav card anchored-card" aria-label="Unternehmen Bereiche">
      <div className="company-subnav-grid">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={`company-subnav-link ${activeKey === link.key ? "active" : ""}`}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
