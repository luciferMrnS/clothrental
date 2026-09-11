import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookingByReference, markBookingConfirmed } from "@/db/bookings";
import { formatNaira } from "@/lib/format";
import { paystackVerify } from "@/lib/paystack";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment result",
  robots: { index: false },
};

export default async function PaymentCallbackPage({
  searchParams,
}: PageProps<"/payment/callback">) {
  const { reference } = await searchParams;
  const ref = typeof reference === "string" ? reference : "";
  if (!ref) notFound();

  const booking = await getBookingByReference(ref);
  if (!booking) notFound();

  let outcome: "confirmed" | "pending" | "error";
  if (booking.status === "confirmed") {
    outcome = "confirmed";
  } else {
    try {
      const { verified } = await paystackVerify(ref);
      if (verified) {
        await markBookingConfirmed(ref);
        outcome = "confirmed";
      } else {
        outcome = "pending";
      }
    } catch {
      outcome = "error";
    }
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-20">
      <div className="rounded-3xl border border-line bg-surface p-8 text-center">
        {outcome === "confirmed" ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
              ✓
            </div>
            <h1 className="mt-4 font-display text-3xl text-foreground">
              Payment confirmed
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Your booking <strong className="text-foreground">{booking.reference}</strong>{" "}
              is confirmed. Your piece is now held for your dates.
            </p>
          </>
        ) : outcome === "pending" ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
              ?
            </div>
            <h1 className="mt-4 font-display text-3xl text-foreground">
              Payment not completed
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              We could not confirm a successful payment for{" "}
              <strong className="text-foreground">{booking.reference}</strong>.
              Your booking is still held — choose below to retry or cancel.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
              !
            </div>
            <h1 className="mt-4 font-display text-3xl text-foreground">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              We could not verify your payment just now. Please try again in a
              moment.
            </p>
          </>
        )}

        <dl className="mt-6 space-y-2 rounded-2xl border border-line bg-background p-5 text-left text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Reference</dt>
            <dd className="font-medium text-foreground">{booking.reference}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Dates</dt>
            <dd className="font-medium text-foreground">
              {booking.startDate} → {booking.returnDate}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Total paid</dt>
            <dd className="font-medium text-foreground">
              {formatNaira(booking.rentalFee + booking.deliveryFee)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/collection"
            className="rounded-full bg-foreground px-7 py-4 text-center text-sm font-medium text-background transition-colors hover:bg-accent"
          >
            {outcome === "confirmed" ? "Back to the collection" : "Browse the collection"}
          </Link>
          {outcome === "pending" ? (
            <Link
              href="/collection"
              className="rounded-full border border-line px-7 py-4 text-center text-sm font-medium text-foreground transition-colors hover:border-red-400 hover:text-red-600"
            >
              I need to change this booking
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}