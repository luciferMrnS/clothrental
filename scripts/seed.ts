import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, client } from "../src/db";
import { items } from "../src/db/schema";

const DRESSES_DIR = path.resolve(process.cwd(), "public", "dresses");

const PALLETTE: Array<[string, string]> = [
  ["#2d3370", "#6a5dbb"],
  ["#7a2336", "#c2536a"],
  ["#8c8aa9", "#dfe0ea"],
  ["#d2674b", "#f2b29a"],
  ["#14634f", "#3f9d78"],
  ["#c77ba8", "#f5dbe9"],
  ["#a9812f", "#ecd49a"],
  ["#20242e", "#4a5568"],
];

const DRESS_PATH =
  "M 420 300 C 414 286 412 274 418 262 " +
  "C 410 258 402 256 398 246 L 502 246 " +
  "C 498 256 488 258 480 262 C 486 274 484 284 478 298 " +
  "L 462 332 L 536 352 L 596 900 " +
  "C 616 952 636 940 648 982 L 252 982 " +
  "C 264 940 282 952 302 900 L 362 352 L 436 332 Z";

function svgPlaceholder(index: number, name: string, from: string, to: string): string {
  const num = String(index + 1).padStart(2, "0");
  return [
    `<svg width="900" height="1200" viewBox="0 0 900 1200" xmlns="http://www.w3.org/2000/svg">`,
    `  <defs>`,
    `    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">`,
    `      <stop offset="0" stop-color="${from}"/>`,
    `      <stop offset="1" stop-color="${to}"/>`,
    `    </linearGradient>`,
    `    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">`,
    `      <stop offset="0" stop-color="rgba(255,255,255,0.18)"/>`,
    `      <stop offset="1" stop-color="rgba(255,255,255,0)"/>`,
    `    </radialGradient>`,
    `  </defs>`,
    `  <rect width="900" height="1200" fill="url(#bg)"/>`,
    `  <circle cx="450" cy="360" r="330" fill="url(#halo)"/>`,
    `  <text x="64" y="104" font-family="Georgia, serif" font-size="30" letter-spacing="6" fill="rgba(255,255,255,0.75)">${num}</text>`,
    `  <path d="${DRESS_PATH}" fill="rgba(255,255,255,0.32)"/>`,
    `  <text x="450" y="1050" text-anchor="middle" font-family="Georgia, serif" font-size="56" fill="rgba(255,255,255,0.95)">${name}</text>`,
    `  <text x="450" y="1106" text-anchor="middle" font-family="Georgia, serif" font-size="22" letter-spacing="10" fill="rgba(255,255,255,0.65)">OCCASION HOUSE</text>`,
    `</svg>`,
  ].join("\n");
}

const SEED_ITEMS = [
  {
    slug: "adire-grace-gown",
    name: "Adire Grace Gown",
    description:
      "A flowing floor-length gown in handcrafted indigo adire, finished with a structured bodice and an elegant open back. A statement piece for weddings and milestone parties.",
    occasions: "wedding,party",
    pricePerRental: 28000,
    deposit: 20000,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Indigo", "White"],
    fit: "True to size. Fitted bodice, empire waist. Fits bust 30-38in, length 58in.",
    careNotes: "Professionally dry-cleaned and steamed between every booking.",
  },
  {
    slug: "aso-oke-ballerina",
    name: "Aso-oke Ballerina",
    description:
      "A regal ball gown crafted from richly woven aso-oke, with a fitted corset bodice and a dramatic full skirt. Made for ceremonies that deserve a grand entrance.",
    occasions: "wedding,birthday",
    pricePerRental: 35000,
    deposit: 25000,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Oxblood", "Gold"],
    fit: "Structurally bound. Fits bust 32-42in, waist 26-38in, length 62in.",
    careNotes: "Delicate traditional textile. Handled by trained professionals only.",
  },
  {
    slug: "ivory-garden-midi",
    name: "Ivory Garden Midi",
    description:
      "A romantic ivory midi with delicate floral appliqués and a soft fluted skirt. Effortless for garden parties, graduations and daytime photoshoots.",
    occasions: "graduation,party,photoshoot",
    pricePerRental: 22000,
    deposit: 15000,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Ivory"],
    fit: "Relaxed fit. Fits bust 30-36in, length 44in. Concealed side zip.",
    careNotes: "Spot-clean embellishments; steam-only between rentals.",
  },
  {
    slug: "coral-high-slit",
    name: "Coral High-Slit",
    description:
      "A vibrant coral satin dress with a daring thigh-high slit and a low draped back. Turns every birthday and rooftop party into a moment.",
    occasions: "party,birthday,photoshoot",
    pricePerRental: 25000,
    deposit: 18000,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Coral"],
    fit: "Form-fitting satin. Fits bust 32-38in, waist 26-32in, length 54in.",
    careNotes: "Dry-clean only. Avoid jewellery contact with satin.",
  },
  {
    slug: "emerald-a-line-gown",
    name: "Emerald A-Line Gown",
    description:
      "A timeless emerald a-line gown with sculpted straps and elegant gathering through the skirt. Equally at home at an evening wedding or a cathedral photoshoot.",
    occasions: "wedding,photoshoot",
    pricePerRental: 30000,
    deposit: 22000,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Emerald"],
    fit: "Flattering a-line. Fits bust 32-42in, waist 28-40in, length 60in.",
    careNotes: "Steamed and stored on a padded hanger.",
  },
  {
    slug: "rose-petal-wrap",
    name: "Rose Petal Wrap",
    description:
      "A blush rose wrap dress that flatters every figure, with adjustable ties and a breezy skirt. Your go-to for birthdays, brunches and graduations.",
    occasions: "birthday,party,graduation",
    pricePerRental: 19000,
    deposit: 12000,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Blush"],
    fit: "Adjustable wrap. One size fits bust 30-40in, length 48in.",
    careNotes: "Machine-washable on gentle cycle between bookings.",
  },
  {
    slug: "champagne-lace-column",
    name: "Champagne Lace Column",
    description:
      "A sleek champagne column covered in tonal lace, finished with a modest train. Understated, luxurious and perfect for weddings and graduations.",
    occasions: "wedding,graduation",
    pricePerRental: 32000,
    deposit: 25000,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Champagne"],
    fit: "Slim column. Fits bust 32-38in, waist 26-33in, length 58in.",
    careNotes: "Lace handled carefully; dry-clean only.",
  },
  {
    slug: "midnight-sequin-slip",
    name: "Midnight Sequin Slip",
    description:
      "A head-turning midnight slip dress fully embellished with hand-sewn sequins. Designed for parties where you intend to be remembered.",
    occasions: "party,birthday",
    pricePerRental: 27000,
    deposit: 20000,
    sizes: ["S", "M", "L"],
    colors: ["Midnight"],
    fit: "Body-conscious silhouette. Fits bust 32-37in, hip 34-39in, length 50in.",
    careNotes: "Sequin-safe cleaning required; turn inside out to store.",
  },
];

function ensureDressImages(): string[] {
  mkdirSync(DRESSES_DIR, { recursive: true });
  return SEED_ITEMS.map((item, index) => {
    const file = `dress-${index + 1}.svg`;
    const target = path.join(DRESSES_DIR, file);
    if (!existsSync(target)) {
      const [from, to] = PALLETTE[index % PALLETTE.length];
      writeFileSync(target, svgPlaceholder(index, item.name, from, to), "utf-8");
      console.log("created", file);
    }
    return `/dresses/${file}`;
  });
}

async function main() {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.SUPABASE_DB_URL ??
    "postgresql://postgres:postgres@localhost:5432/rental";
  const migrationClient = postgres(url, { max: 1 });
  const migrationDb = drizzle(migrationClient);
  await migrate(migrationDb, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await migrationClient.end();

  const images = ensureDressImages();

  await db.delete(items);

  const values = SEED_ITEMS.map((item, index) => ({
    ...item,
    images: JSON.stringify([images[index]]),
    sizes: JSON.stringify(item.sizes),
    colors: JSON.stringify(item.colors),
    isFeatured: index % 2 === 0,
  }));

  await db.insert(items).values(values);
  console.log(`Seeded ${values.length} items.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => client.end({ timeout: 1 }));