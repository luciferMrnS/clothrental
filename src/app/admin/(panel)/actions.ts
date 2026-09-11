"use server";

import { revalidatePath } from "next/cache";
import { bookings, type BookingStatus } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
  createItem,
  itemSlugExists,
  toggleItemAvailability,
  toggleItemFeatured,
} from "@/db/items";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function setBookingStatus(formData: FormData) {
  const reference = String(formData.get("reference") ?? "");
  const status = String(formData.get("status") ?? "") as BookingStatus;
  if (!reference || !status) return;

  await db
    .update(bookings)
    .set({ status })
    .where(eq(bookings.reference, reference));

  revalidatePath("/admin", "page");
  revalidatePath("/admin/bookings", "page");
}

export async function toggleAvailability(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await toggleItemAvailability(id);
  revalidatePath("/admin", "page");
  revalidatePath("/admin/inventory", "page");
}

export async function toggleFeatured(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await toggleItemFeatured(id);
  revalidatePath("/admin", "page");
  revalidatePath("/admin/inventory", "page");
}

export async function addItem(formData: FormData) {
  const get = (key: string) => String(formData.get(key) ?? "").trim();

  const name = get("name");
  const price = Number(formData.get("pricePerRental"));
  const deposit = Number(formData.get("deposit"));
  if (!name || !Number.isFinite(price) || !Number.isFinite(deposit)) return;

  const baseSlug = get("slug") || slugify(name);
  let slug = baseSlug;
  let index = 2;
  while (await itemSlugExists(slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  await createItem({
    slug,
    name,
    description: get("description"),
    occasions: get("occasions")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    pricePerRental: price,
    deposit,
    sizes: get("sizes")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    colors: get("colors")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    images: get("images")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    fit: get("fit"),
    careNotes: get("careNotes") || null,
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });

  revalidatePath("/", "layout");
}