import type { Metadata } from "next";
import Link from "next/link";
import DressCard from "@/components/dress-card";
import { getAllItems, getItemsByOccasion } from "@/db/items";
import { OCCASIONS } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Collection",
};

export default async function CollectionPage({
  searchParams,
}: PageProps<"/collection">) {
  const { occasion } = await searchParams;
  const active = typeof occasion === "string" ? occasion : "";

  const items = active
    ? await getItemsByOccasion(active)
    : await getAllItems();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl text-foreground">
          The Collection
        </h1>
        <p className="mt-3 text-muted">
          A curated selection of occasion pieces — rented clean, steamed and
          presentation-ready, one booking at a time.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/collection"
          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
            active === ""
              ? "border-foreground bg-foreground text-background"
              : "border-line bg-surface text-muted hover:border-foreground hover:text-foreground"
          }`}
        >
          All
        </Link>
        {OCCASIONS.map((o) => {
          const isActive = active === o.slug;
          return (
            <Link
              key={o.slug}
              href={`/collection?occasion=${o.slug}`}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-line bg-surface text-muted hover:border-foreground hover:text-foreground"
              }`}
            >
              {o.label}
            </Link>
          );
        })}
      </div>

      {items.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {items.map((item) => (
            <DressCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="font-display text-2xl text-foreground">
            Nothing here yet
          </p>
          <p className="mt-2 text-sm text-muted">
            We are adding pieces for this occasion soon. Check back shortly.
          </p>
        </div>
      )}
    </div>
  );
}