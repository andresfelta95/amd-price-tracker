export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireUser } from "@/lib/auth";

// PATCH /api/account — notification preferences
export async function PATCH(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await request.json().catch(() => ({}));
  const notifyEmail = typeof body.notifyEmail === "boolean" ? body.notifyEmail : user.notifyEmail;
  const notifyTelegram = typeof body.notifyTelegram === "boolean" ? body.notifyTelegram : user.notifyTelegram;

  if (notifyTelegram && !user.telegramLinked) {
    return NextResponse.json({ error: "Link Telegram first" }, { status: 400 });
  }

  await pool.query(
    `UPDATE users SET notify_email = $1, notify_telegram = $2 WHERE id = $3`,
    [notifyEmail, notifyTelegram, user.id]
  );
  return NextResponse.json({ ok: true, notifyEmail, notifyTelegram });
}
