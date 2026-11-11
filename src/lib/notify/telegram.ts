import type { SendResult, PriceAlertInfo } from "./email";

const API = "https://api.telegram.org";

export function telegramConfigured(): boolean {
  return !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_BOT_USERNAME;
}

export async function sendTelegramMessage(chatId: number | string, text: string): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "Telegram not configured" };
  try {
    const res = await fetch(`${API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    const data = await res.json().catch(() => null);
    return data?.ok ? { ok: true } : { ok: false, error: data?.description ?? `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function sendPriceAlertTelegram(chatId: number | string, a: PriceAlertInfo) {
  return sendTelegramMessage(
    chatId,
    `▼ ${a.productName} is C$${a.price.toFixed(2)} at ${a.retailer}\n` +
      `Your target: C$${a.targetPrice.toFixed(2)}\n\n${a.retailerUrl}\n\nManage alerts: ${a.manageUrl}`
  );
}

/** Deep link that opens the bot with a one-time link token as the /start payload. */
export function telegramLinkUrl(token: string): string {
  return `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${token}`;
}
