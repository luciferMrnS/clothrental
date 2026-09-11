import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminToken, ADMIN_COOKIE_NAME } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== "string" || password.trim() === "") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD ?? "changeme";
  if (password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ ok: true });
}