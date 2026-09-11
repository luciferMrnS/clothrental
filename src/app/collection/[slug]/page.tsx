import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemBySlug } from "@/db/items";
import { formatNaira } from "@/lib/format";
import { occasionLabel } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/collection/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) return { title: "Piece not found" };
  return {
    title: item.name,
    description: item.description.slice(0, 160),
  };
}

export default async function DressPage({
  params,
}: PageProps<"/collection/[slug]">) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-line bg-surface">
          {item.images[0] ? (
            <Image
              src={item.images[0]}
              alt={item.name}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            {item.occasions.map((o) => (
              <span
                key={o}
                className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted"
              >
                {occasionLabel(o)}
              </span>
            ))}
          </div>

          <h1 className="mt-4 font-display text-4xl text-foreground">
            {item.name}
          </h1>
          <p className="mt-2 text-lg text-muted">{item.description}</p>

          <div className="mt-6 flex items-baseline gap-6 border-y border-line py-5">
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">
                Rental fee
              </p>
              <p className="mt-1 font-display text-3xl text-foreground">
                {formatNaira(item.pricePerRental)}
              </p>
              <p className="text-xs text-muted">per event, 1–4 day period</p>
            </div>
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">
                Refundable deposit
              </p>
              <p className="mt-1 font-display text-3xl text-accent">
                {formatNaira(item.deposit)}
              </p>
              <p className="text-xs text-muted">returned after inspection</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              Available sizes
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.sizes.map((size) => (
                <span
                  key={size}
                  className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-foreground"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>

          {item.colors.length > 0 ? (
            <div className="mt-5">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                Colours
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.colors.map((color) => (
                  <span key={color} className="text-sm text-muted">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                Fit &amp; sizing
              </p>
              <p className="mt-1.5 text-sm leading-6 text-foreground">
                {item.fit}
              </p>
            </div>
            {item.careNotes ? (
              <div className="rounded-2xl border border-line bg-surface p-4">
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                  Care
                </p>
                <p className="mt-1.5 text-sm leading-6 text-foreground">
                  {item.careNotes}
                </p>
              </div>
            ) : null}
          </div>

          {item.isAvailable ? (
            <Link
              href={`/book?item=${item.slug}`}
              className="mt-8 rounded-full bg-foreground px-7 py-4 text-center text-sm font-medium text-background transition-colors hover:bg-accent"
            >
              Reserve this piece
            </Link>
          ) : (
            <div className="mt-8 rounded-full border border-line bg-surface px-7 py-4 text-center text-sm text-muted">
              This piece is currently booked.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}