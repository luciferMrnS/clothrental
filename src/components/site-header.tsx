import Link from "next/link";
import { OCCASIONS, SITE_NAME } from "@/lib/site-config";

const navLinks = [
  { href: "/collection", label: "The Collection" },
  { href: "/how-it-works", label: "How It Works" },
  ...OCCASIONS.slice(0, 3).map((o) => ({
    href: `/collection?occasion=${o.slug}`,
    label: o.label,
  })),
];

export default function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface/90 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight">
          {SITE_NAME}
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/collection"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-accent"
        >
          Book a rental
        </Link>
      </div>
    </header>
  );
}