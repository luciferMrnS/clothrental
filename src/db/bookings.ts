import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { bookings, type BookingRow, type BookingStatus } from "@/db/schema";

export const HOLDING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "collected",
];

export interface BookingInput {
  itemId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  idType: string;
  idNumber: string;
  note: string | null;
  collectionMode: "pickup" | "delivery";
  startDate: string;
  returnDate: string;
  rentalFee: number;
  deliveryFee: number;
  deposit: number;
}

export function createBookingReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `OH-${code}`;
}

export async function getOverlappingBookings(
  itemId: number,
  startDate: string,
  returnDate: string
): Promise<BookingRow[]> {
  try {
    return await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.itemId, itemId),
          inArray(bookings.status, HOLDING_STATUSES),
          lte(bookings.startDate, returnDate),
          gte(bookings.returnDate, startDate)
        )
      )
      .orderBy(asc(bookings.startDate));
  } catch {
    return [];
  }
}

export async function createBooking(input: BookingInput): Promise<BookingRow> {
  const reference = createBookingReference();
  const rows = await db
    .insert(bookings)
    .values({
      reference,
      itemId: input.itemId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      idType: input.idType,
      idNumber: input.idNumber,
      note: input.note,
      collectionMode: input.collectionMode,
      startDate: input.startDate,
      returnDate: input.returnDate,
      rentalFee: input.rentalFee,
      deliveryFee: input.deliveryFee,
      deposit: input.deposit,
    })
    .returning();
  return rows[0];
}

export async function getBookingByReference(
  reference: string
): Promise<BookingRow | null> {
  try {
    const rows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.reference, reference))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function markBookingConfirmed(
  reference: string
): Promise<void> {
  await db
    .update(bookings)
    .set({ status: "confirmed", paymentReference: reference })
    .where(eq(bookings.reference, reference));
}

export async function deleteBookingByReference(
  reference: string
): Promise<void> {
  await db.delete(bookings).where(eq(bookings.reference, reference));
}

export async function getAllBookings(): Promise<BookingRow[]> {
  try {
    return await db.select().from(bookings).orderBy(asc(bookings.createdAt));
  } catch {
    return [];
  }
}