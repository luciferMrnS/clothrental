import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getItemBySlug } from "@/db/items";
import { formatNaira } from "@/lib/format";
import BookingForm from "@/components/booking-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reserve a piece",
};

export default async function BookPage({
  searchParams,
}: PageProps<"/book">) {
  const { item } = await searchParams;
  if (typeof item !== "string" || !item) redirect("/collection");

  const piece = await getItemBySlug(item);
  if (!piece) notFound();

  if (!piece.isAvailable) {
    redirect(`/collection/${piece.slug}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-4xl text-foreground">Reserve a piece</h1>
      <p className="mt-3 max-w-xl text-muted">
        Pick your dates, confirm your details and we will hold the piece for
        you. Payment is collected securely to confirm the booking.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="sticky top-24 overflow-hidden rounded-3xl border border-line bg-surface">
            <div className="relative aspect-[3/4]">
              {piece.images[0] ? (
                <Image
                  src={piece.images[0]}
                  alt={piece.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="p-5">
              <p className="font-display text-xl text-foreground">
                {piece.name}
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Rental fee</dt>
                  <dd className="font-medium text-foreground">
                    {formatNaira(piece.pricePerRental)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Refundable deposit</dt>
                  <dd className="font-medium text-accent">
                    {formatNaira(piece.deposit)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery (optional)</dt>
                  <dd className="font-medium text-foreground">
                    {formatNaira(3000)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 rounded-xl bg-background p-3 text-xs leading-5 text-muted">
                The deposit is fully refundable after the returned piece passes
                inspection and is never counted as rental revenue.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <BookingForm item={piece} />
        </div>
      </div>
    </div>
  );
}