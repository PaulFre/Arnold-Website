import Link from "next/link";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  href: string;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}>;

export function CtaButton({ href, children, variant = "primary", fullWidth }: Props) {
  return (
    <Link
      className={`btn ${variant === "secondary" ? "btn-secondary" : "btn-primary"}${fullWidth ? " btn-full" : ""}`}
      href={href}
    >
      {children}
    </Link>
  );
}
