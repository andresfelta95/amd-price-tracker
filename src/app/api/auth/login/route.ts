export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { createSession, normalizeEmail, verifyPassword } from "@/lib/auth";

// Compared against when the email is unknown, so both paths take the same time
const DUMMY_HASH =
  "scrypt$00000000000000000000000000000000$" + "0".repeat(128);

export async function POST(request: NextRequest) {
  const { email: rawEmail, password } = await request.json().catch(() => ({}));
  const email = normalizeEmail(rawEmail);
  if (!email || typeof password !== "string") {
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }

  const res = await pool.query(`SELECT id, password_hash FROM users WHERE email = $1`, [email]);
  const user = res.rows[0];
  const valid = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !valid) {
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
