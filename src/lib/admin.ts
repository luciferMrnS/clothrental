import { createHash } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "oh_admin";

export function adminToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? "changeme";
  return createHash("sha256")
    .update(`occasions-house:${password}`)
    .digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === adminToken();
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;