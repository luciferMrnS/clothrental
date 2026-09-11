import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const url =
  process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL ?? "file:./data/rental.db";
const authToken =
  process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

if (url.startsWith("file:")) {
  const raw = url.slice("file:".length);
  const dir = path.dirname(path.resolve(raw));
  if (dir) mkdirSync(dir, { recursive: true });
}

export const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });