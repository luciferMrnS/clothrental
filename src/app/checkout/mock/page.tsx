import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getBookingByReference } from "@/db/bookings";
import { isPaystackConfigured } from "@/lib/paystack";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function MockCheckoutPage({
  searchParams,
}: PageProps<"/checkout/mock">) {
  if (isPaystackConfigured()) redirect("/collection");

  const { reference } = await searchParams;
  const ref = typeof reference === "string" ? reference : "";
  if (!ref) redirect("/collection");

  const booking = await getBookingByReference(ref);
  if (!booking) redirect("/collection");

  const total = booking.rentalFee + booking.deliveryFee;

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <div className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="border-b border-dashed border-line bg-background p-6 text-center">
          <p className="text-xs tracking-[0.25em] text-muted uppercase">
            Demo payment gateway
          </p>
          <p className="mt-2 font-display text-2xl text-foreground">
            {formatNaira(total)}
          </p>
          <p className="mt-1 text-sm text-muted">Booking {booking.reference}</p>
        </div>

        <div className="p-6">
          <div
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
            role="note"
          >
            Mock mode is on — no paystack secret key is configured yet. Nothing
            will be charged. In production this page is disabled and customers
            pay through Paystack&apos;s secure hosted checkout.
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Rental fee</span>
              <span className="font-medium text-foreground">
                {formatNaira(booking.rentalFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Delivery</span>
              <span className="font-medium text-foreground">
                {booking.deliveryFee === 0
                  ? "Free"
                  : formatNaira(booking.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Refundable deposit</span>
              <span className="font-medium text-accent">
                {formatNaira(booking.deposit)}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href={`/payment/callback?reference=${encodeURIComponent(booking.reference)}`}
              className="block rounded-full bg-foreground px-7 py-4 text-center text-sm font-medium text-background transition-colors hover:bg-accent"
            >
              Approve payment (demo)
            </Link>
            <Link
              href="/collection"
              className="block rounded-full border border-line px-7 py-4 text-center text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}