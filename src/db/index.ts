import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.SUPABASE_DB_URL ??
  "postgresql://postgres:postgres@localhost:5432/rental";

export const client = postgres(url, { max: 1, prepare: false });

export const db = drizzle(client, { schema });