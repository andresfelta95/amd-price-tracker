export const dynamic = "force-dynamic";

import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { appUrl, consumeToken } from "@/lib/auth";
import { sendTelegramMessage } from "@/lib/notify/telegram";

function validSecret(header: string | null): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * POST /api/telegram/webhook — Telegram Bot API updates.
 * Registered with scripts/set-telegram-webhook.sh; Telegram sends the secret
 * in X-Telegram-Bot-Api-Secret-Token on every call.
 */
export async function POST(request: NextRequest) {
  if (!validSecret(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const update = await request.json().catch(() => null);
  const message = update?.message;
  const chatId: number | undefined = message?.chat?.id;
  const text: string = (message?.text ?? "").trim();
  // Always 200 so Telegram doesn't retry updates we deliberately ignore
  if (!chatId || message?.chat?.type !== "private") return NextResponse.json({ ok: true });

  if (text.startsWith("/start")) {
    const token = text.split(/\s+/)[1];
    const userId = token ? await consumeToken(token, "telegram_link") : null;
    if (userId) {
      await pool.query(
        `UPDATE users SET telegram_chat_id = $1, notify_telegram = TRUE WHERE id = $2`,
        [chatId, userId]
      );
      await sendTelegramMessage(chatId, "✅ Linked! You'll get your AMD price alerts here. Send /stop to unlink.");
    } else {
      await sendTelegramMessage(
        chatId,
        `To link this chat, use the "Link Telegram" button on ${appUrl("/account")} — links expire after 15 minutes.`
      );
    }
  } else if (text === "/stop") {
    const res = await pool.query(
      `UPDATE users SET telegram_chat_id = NULL, notify_telegram = FALSE WHERE telegram_chat_id = $1`,
      [chatId]
    );
    await sendTelegramMessage(
      chatId,
      res.rowCount ? "Unlinked. You won't get alerts here anymore." : "This chat isn't linked to an account."
    );
  }

  return NextResponse.json({ ok: true });
}
