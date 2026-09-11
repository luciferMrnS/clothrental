import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
} from "drizzle-orm/pg-core";

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  occasions: text("occasions").notNull(),
  pricePerRental: integer("price_per_rental").notNull(),
  deposit: integer("deposit").notNull(),
  sizes: text("sizes").notNull(),
  colors: text("colors").notNull(),
  images: text("images").notNull(),
  fit: text("fit").notNull(),
  careNotes: text("care_notes"),
  isAvailable: boolean("is_available").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(now())`),
});

export type ItemRow = typeof items.$inferSelect;
export type NewItemRow = typeof items.$inferInsert;

export const bookingStatus = [
  "pending",
  "confirmed",
  "collected",
  "returned",
  "cancelled",
] as const;

export type BookingStatus = (typeof bookingStatus)[number];

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    idType: text("id_type").notNull(),
    idNumber: text("id_number").notNull(),
    note: text("note"),
    collectionMode: text("collection_mode").notNull(),
    startDate: text("start_date").notNull(),
    returnDate: text("return_date").notNull(),
    rentalFee: integer("rental_fee").notNull(),
    deliveryFee: integer("delivery_fee").notNull().default(0),
    deposit: integer("deposit").notNull(),
    status: text("status", { enum: bookingStatus })
      .notNull()
      .default("pending"),
    paymentReference: text("payment_reference"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(now())`),
  },
  (table) => [
    index("bookings_item_status_idx").on(table.itemId, table.status),
    index("bookings_dates_idx").on(table.startDate, table.returnDate),
  ],
);

export type BookingRow = typeof bookings.$inferSelect;
export type NewBookingRow = typeof bookings.$inferInsert;