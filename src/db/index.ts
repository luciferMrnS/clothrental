import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:./data/rental.db";

if (url.startsWith("file:")) {
  const raw = url.slice("file:".length);
  const dir = path.dirname(path.resolve(raw));
  if (dir) mkdirSync(dir, { recursive: true });
}

export const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });