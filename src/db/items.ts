import { and, desc, eq, inArray, like } from "drizzle-orm";
import { db } from "@/db";
import { items } from "@/db/schema";
import { parseOccasions } from "@/lib/site-config";

export interface Item {
  id: number;
  slug: string;
  name: string;
  description: string;
  occasions: string[];
  pricePerRental: number;
  deposit: number;
  sizes: string[];
  colors: string[];
  images: string[];
  fit: string;
  careNotes: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
}

function toItem(row: {
  id: number;
  slug: string;
  name: string;
  description: string;
  occasions: string;
  pricePerRental: number;
  deposit: number;
  sizes: string;
  colors: string;
  images: string;
  fit: string;
  careNotes: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
}): Item {
  return {
    ...row,
    occasions: parseOccasions(row.occasions),
    sizes: safeJsonParse<string[]>(row.sizes, []),
    colors: safeJsonParse<string[]>(row.colors, []),
    images: safeJsonParse<string[]>(row.images, []),
  };
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getAllItems(): Promise<Item[]> {
  const rows = await db
    .select()
    .from(items)
    .orderBy(desc(items.isFeatured), items.name);
  return rows.map(toItem);
}

export async function getFeaturedItems(limit = 4): Promise<Item[]> {
  const rows = await db
    .select()
    .from(items)
    .where(eq(items.isFeatured, true))
    .orderBy(items.name)
    .limit(limit);
  return rows.map(toItem);
}

export async function getItemBySlug(slug: string): Promise<Item | null> {
  const rows = await db
    .select()
    .from(items)
    .where(eq(items.slug, slug))
    .limit(1);
  return rows.length > 0 ? toItem(rows[0]) : null;
}

export async function getItemsByOccasion(occasion: string): Promise<Item[]> {
  const rows = await db
    .select()
    .from(items)
    .where(and(eq(items.isAvailable, true), like(items.occasions, `%${occasion}%`)))
    .orderBy(desc(items.isFeatured), items.name);
  return rows.map(toItem);
}

export async function getItemNameMap(
  ids: number[]
): Promise<Record<number, string>> {
  if (ids.length === 0) return {};
  const rows = await db
    .select({ id: items.id, name: items.name })
    .from(items)
    .where(inArray(items.id, distinctIds(ids)));
  return Object.fromEntries(rows.map((r) => [r.id, r.name]));
}

function distinctIds(ids: number[]): number[] {
  return [...new Set(ids)];
}

export async function toggleItemAvailability(id: number): Promise<void> {
  const rows = await db
    .select({ isAvailable: items.isAvailable })
    .from(items)
    .where(eq(items.id, id))
    .limit(1);
  const current = rows[0]?.isAvailable ?? true;
  await db
    .update(items)
    .set({ isAvailable: !current })
    .where(eq(items.id, id));
}

export async function toggleItemFeatured(id: number): Promise<void> {
  const rows = await db
    .select({ isFeatured: items.isFeatured })
    .from(items)
    .where(eq(items.id, id))
    .limit(1);
  const current = rows[0]?.isFeatured ?? false;
  await db
    .update(items)
    .set({ isFeatured: !current })
    .where(eq(items.id, id));
}

export async function createItem(input: {
  slug: string;
  name: string;
  description: string;
  occasions: string[];
  pricePerRental: number;
  deposit: number;
  sizes: string[];
  colors: string[];
  images: string[];
  fit: string;
  careNotes: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
}): Promise<void> {
  await db.insert(items).values({
    slug: input.slug,
    name: input.name,
    description: input.description,
    occasions: input.occasions.join(","),
    pricePerRental: input.pricePerRental,
    deposit: input.deposit,
    sizes: JSON.stringify(input.sizes),
    colors: JSON.stringify(input.colors),
    images: JSON.stringify(input.images),
    fit: input.fit,
    careNotes: input.careNotes,
    isAvailable: input.isAvailable,
    isFeatured: input.isFeatured,
  });
}

export async function itemSlugExists(slug: string): Promise<boolean> {
  const rows = await db
    .select({ id: items.id })
    .from(items)
    .where(eq(items.slug, slug))
    .limit(1);
  return rows.length > 0;
}