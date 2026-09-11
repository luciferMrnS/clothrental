import { NextResponse } from "next/server";
import {
  createBooking,
  deleteBookingByReference,
  getOverlappingBookings,
} from "@/db/bookings";
import { getItemBySlug } from "@/db/items";
import { DELIVERY_FEE, MAX_RENTAL_DAYS } from "@/lib/site-config";
import { paystackInitiate } from "@/lib/paystack";

function isDateString(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isAfterToday(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date).getTime() > today.getTime();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { slug, startDate, returnDate, ...customer } = body as Record<
    string,
    unknown
  >;

  if (typeof slug !== "string") {
    return NextResponse.json({ error: "Missing dress slug." }, { status: 400 });
  }

  const item = await getItemBySlug(slug);
  if (!item || !item.isAvailable) {
    return NextResponse.json(
      { error: "This piece is not available for booking." },
      { status: 400 }
    );
  }

  if (!isDateString(startDate) || !isDateString(returnDate)) {
    return NextResponse.json(
      { error: "Choose a collection date and a return date." },
      { status: 400 }
    );
  }

  if (!isAfterToday(startDate)) {
    return NextResponse.json(
      { error: "Collection date must be at least one day ahead." },
      { status: 400 }
    );
  }

  if (new Date(returnDate).getTime() < new Date(startDate).getTime()) {
    return NextResponse.json(
      { error: "The return date must be after the collection date." },
      { status: 400 }
    );
  }

  const diffDays =
    (new Date(returnDate).getTime() - new Date(startDate).getTime()) /
    86_400_000;
  if (diffDays > MAX_RENTAL_DAYS) {
    return NextResponse.json(
      { error: `Rental periods are limited to ${MAX_RENTAL_DAYS} days.` },
      { status: 400 }
    );
  }

  const collectionMode = customer.collectionMode;
  if (collectionMode !== "pickup" && collectionMode !== "delivery") {
    return NextResponse.json(
      { error: "Choose collection or delivery." },
      { status: 400 }
    );
  }

  const required = [
    "customerName",
    "customerEmail",
    "customerPhone",
    "idType",
    "idNumber",
  ] as const;
  for (const field of required) {
    const value = customer[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      return NextResponse.json(
        { error: `${field} is required.` },
        { status: 400 }
      );
    }
  }

  const overlaps = await getOverlappingBookings(item.id, startDate, returnDate);
  if (overlaps.length > 0) {
    const conflict = overlaps[0];
    return NextResponse.json(
      {
        error: `Already booked from ${conflict.startDate} to ${conflict.returnDate}. Try different dates.`,
      },
      { status: 409 }
    );
  }

  const deliveryFee = collectionMode === "delivery" ? DELIVERY_FEE : 0;

  const booking = await createBooking({
    itemId: item.id,
    customerName: String(customer.customerName).trim(),
    customerEmail: String(customer.customerEmail).trim().toLowerCase(),
    customerPhone: String(customer.customerPhone).trim(),
    idType: String(customer.idType).trim(),
    idNumber: String(customer.idNumber).trim(),
    note:
      typeof customer.note === "string" && customer.note.trim()
        ? customer.note.trim()
        : null,
    collectionMode,
    startDate,
    returnDate,
    rentalFee: item.pricePerRental,
    deliveryFee,
    deposit: item.deposit,
  });

  const origin = new URL(request.url).origin;
  let payment: { authorizationUrl: string; reference: string; mode: "mock" | "live" };
  try {
    payment = await paystackInitiate({
      origin,
      reference: booking.reference,
      amountNaira: booking.rentalFee + booking.deliveryFee,
      email: booking.customerEmail,
      metadata: {
        booking: booking.reference,
        item: item.name,
        itemId: item.id,
      },
    });
  } catch (error) {
    await deleteBookingByReference(booking.reference);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Secure payment is unavailable right now. Please try again.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      booking: {
        reference: booking.reference,
        itemName: item.name,
        itemSlug: item.slug,
        collectionMode,
        startDate: booking.startDate,
        returnDate: booking.returnDate,
        rentalFee: booking.rentalFee,
        deliveryFee: booking.deliveryFee,
        deposit: booking.deposit,
        totalPayable: booking.rentalFee + booking.deliveryFee,
        status: booking.status,
        paymentMode: payment.mode,
      },
      payment: {
        authorizationUrl: payment.authorizationUrl,
        reference: payment.reference,
        mode: payment.mode,
      },
    },
    { status: 201 }
  );
}