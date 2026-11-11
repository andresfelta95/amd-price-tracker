export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { appUrl, issueToken, normalizeEmail } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/notify/email";

// Always answers the same way so it can't be used to discover which emails have accounts
export async function POST(request: NextRequest) {
  const { email: rawEmail } = await request.json().catch(() => ({}));
  const email = normalizeEmail(rawEmail);

  if (email) {
    const res = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
    const userId: number | undefined = res.rows[0]?.id;
    if (userId) {
      const token = await issueToken(userId, "reset_password", 60);
      const sent = await sendPasswordResetEmail(email, appUrl(`/reset-password?token=${token}`));
      if (!sent.ok) console.error(`[forgot] reset email to ${email} failed: ${sent.error}`);
    }
  }

  return NextResponse.json({ ok: true });
}
