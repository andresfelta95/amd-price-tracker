export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { issueToken, requireUser } from "@/lib/auth";
import { telegramConfigured, telegramLinkUrl } from "@/lib/notify/telegram";

// POST — returns a one-time t.me deep link that links this account to the user's chat
export async function POST() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  if (!telegramConfigured()) {
    return NextResponse.json({ error: "Telegram isn't set up on this server yet" }, { status: 503 });
  }
  const token = await issueToken(user.id, "telegram_link", 15);
  return NextResponse.json({ url: telegramLinkUrl(token) });
}

// DELETE — unlink Telegram
export async function DELETE() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  await pool.query(
    `UPDATE users SET telegram_chat_id = NULL, notify_telegram = FALSE WHERE id = $1`,
    [user.id]
  );
  return NextResponse.json({ ok: true });
}
