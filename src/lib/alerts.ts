import pool from "@/lib/db";
import { appUrl } from "@/lib/auth";
import { getBestOffer } from "@/lib/prices";
import { sendPriceAlertEmail, type PriceAlertInfo, type SendResult } from "@/lib/notify/email";
import { sendPriceAlertTelegram } from "@/lib/notify/telegram";

/**
 * "Once a day while below target". Scrapes run every 12h, so a strict 24h gap
 * would skip a run that lands a few minutes early and push the reminder to 36h;
 * 20h makes it fire on every other run.
 */
const REMIND_AFTER_HOURS = 20;

export interface AlertCheckSummary {
  checked: number;
  notified: number;
  failed: number;
}

/** Called after every scrape: notifies owners of alerts whose product is at/below target. */
export async function checkAlerts(): Promise<AlertCheckSummary> {
  const res = await pool.query(
    `SELECT a.id, a.product_id, a.target_price::float, p.name AS product_name,
            u.email, u.notify_email, u.notify_telegram, u.telegram_chat_id
     FROM alerts a
     JOIN users u ON u.id = a.user_id
     JOIN products p ON p.id = a.product_id
     WHERE a.active
       AND u.email_verified_at IS NOT NULL
       AND (a.last_notified_at IS NULL OR a.last_notified_at < NOW() - make_interval(hours => $1))`,
    [REMIND_AFTER_HOURS]
  );

  const summary: AlertCheckSummary = { checked: res.rows.length, notified: 0, failed: 0 };

  for (const a of res.rows) {
    const offer = await getBestOffer(pool, a.product_id);
    if (!offer || offer.price > a.target_price) continue;

    const info: PriceAlertInfo = {
      productName: a.product_name,
      price: offer.price,
      targetPrice: a.target_price,
      retailer: offer.retailer,
      retailerUrl: offer.url,
      productUrl: appUrl(`/product/${a.product_id}`),
      manageUrl: appUrl("/alerts"),
    };

    const attempts: Array<[channel: "email" | "telegram", Promise<SendResult>]> = [];
    if (a.notify_email) attempts.push(["email", sendPriceAlertEmail(a.email, info)]);
    if (a.notify_telegram && a.telegram_chat_id) {
      attempts.push(["telegram", sendPriceAlertTelegram(a.telegram_chat_id, info)]);
    }
    if (!attempts.length) continue;

    let anyOk = false;
    for (const [channel, pending] of attempts) {
      const result = await pending;
      anyOk ||= result.ok;
      await pool.query(
        `INSERT INTO alert_notifications (alert_id, channel, price, error) VALUES ($1, $2, $3, $4)`,
        [a.id, channel, offer.price, result.ok ? null : result.error ?? "unknown error"]
      );
    }

    // Only start the 20h quiet period if something was delivered; otherwise retry next run
    if (anyOk) {
      await pool.query(
        `UPDATE alerts SET last_notified_at = NOW(), last_notified_price = $2, triggered = TRUE WHERE id = $1`,
        [a.id, offer.price]
      );
      summary.notified++;
    } else {
      summary.failed++;
    }
  }

  return summary;
}
