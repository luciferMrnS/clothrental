import { NextResponse } from "next/server";
import { getBookingByReference, markBookingConfirmed } from "@/db/bookings";
import { verifyWebhookSignature } from "@/lib/paystack";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const valid = await verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    return new Response("Unauthorized", { status: 401 });
  }

  let event: {
    event?: string;
    data?: { reference?: string };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const booking = await getBookingByReference(event.data.reference);
    if (booking && booking.status === "pending") {
      await markBookingConfirmed(event.data.reference);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}