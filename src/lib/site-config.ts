export const SITE_NAME = "Occasion House";
export const SITE_DESCRIPTION =
  "A premium occasion-wear rental service. Look memorable, spend intentionally, return it — and let someone else enjoy it next.";
export const CONTACT_WHATSAPP = "+2348000000000";
export const CONTACT_EMAIL = "hello@occasionhouse.test";
export const DELIVERY_FEE = 3000;
export const MAX_RENTAL_DAYS = 4;

export const ID_TYPES = [
  "National ID card",
  "Driver's licence",
  "Voters card",
  "International passport",
] as const;

export const OCCASIONS = [
  { slug: "wedding", label: "Weddings" },
  { slug: "birthday", label: "Birthdays" },
  { slug: "graduation", label: "Graduations" },
  { slug: "party", label: "Parties" },
  { slug: "photoshoot", label: "Photoshoots" },
] as const;

export type OccasionSlug = (typeof OCCASIONS)[number]["slug"];

export function occasionLabel(slug: string): string {
  return OCCASIONS.find((o) => o.slug === slug)?.label ?? slug;
}

export function parseOccasions(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}