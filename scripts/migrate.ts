import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";

const url =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.SUPABASE_DB_URL ??
  "postgresql://postgres:postgres@localhost:5432/rental";

async function main() {
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await client.end();
  console.log("Migrations applied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});