export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { createSession, hashPassword, normalizeEmail, MIN_PASSWORD_LENGTH } from "@/lib/auth";
import { sendVerification } from "@/lib/account";

export async function POST(request: NextRequest) {
  const { email: rawEmail, password } = await request.json().catch(() => ({}));
  const email = normalizeEmail(rawEmail);

  if (!email) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    );
  }

  const res = await pool.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [email, await hashPassword(password)]
  );
  if (!res.rows.length) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const userId: number = res.rows[0].id;
  await createSession(userId);
  const sent = await sendVerification(userId, email);
  if (!sent.ok) console.error(`[signup] verification email to ${email} failed: ${sent.error}`);

  return NextResponse.json({ ok: true, verificationSent: sent.ok }, { status: 201 });
}
