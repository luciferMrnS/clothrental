import { and, desc, eq, like } from "drizzle-orm";
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