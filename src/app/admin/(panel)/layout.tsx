import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/inventory", label: "Inventory" },
];

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
            Owner area
          </p>
          <h1 className="font-display text-3xl text-foreground">
            Occasion House admin
          </h1>
        </div>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="rounded-full border border-line px-5 py-2 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>

      <nav className="mt-6 flex gap-2 overflow-x-auto">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}