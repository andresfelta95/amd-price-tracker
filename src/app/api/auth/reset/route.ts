export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  consumeToken,
  createSession,
  destroyAllSessions,
  hashPassword,
  MIN_PASSWORD_LENGTH,
} from "@/lib/auth";
import { markEmailVerified } from "@/lib/account";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json().catch(() => ({}));
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    );
  }

  const userId = await consumeToken(token, "reset_password");
  if (!userId) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired — request a new one" },
      { status: 400 }
    );
  }

  await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [await hashPassword(password), userId]);
  // Receiving the reset email proves the address works
  await markEmailVerified(userId);
  await destroyAllSessions(userId);
  await createSession(userId);
  return NextResponse.json({ ok: true });
}
