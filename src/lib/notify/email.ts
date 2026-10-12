import { Resend } from "resend";

export interface SendResult {
  ok: boolean;
  error?: string;
}

let client: Resend | null = null;
function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#0b0b0e;font-family:Helvetica,Arial,sans-serif;color:#edece8">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
  <p style="font-weight:700;letter-spacing:2px;color:#e8281f;margin:0 0 24px">AMD // TRACKER</p>
  <h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>
  ${bodyHtml}
  <p style="font-size:12px;color:#7d848c;margin-top:32px">Not affiliated with AMD. Prices scraped from public retailer pages — verify before buying.</p>
</div></body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="background:#e8281f;color:#fff;text-decoration:none;padding:12px 20px;border-radius:4px;font-weight:600">${escapeHtml(label)}</a></p>`;
}

async function send(to: string, subject: string, html: string, text: string): Promise<SendResult> {
  const resend = getClient();
  if (!resend) {
    // Unconfigured (local dev): log instead of sending so links can still be followed
    console.warn(`[email] RESEND_API_KEY not set — would send "${subject}" to ${to}:\n${text}`);
    return { ok: false, error: "Email not configured" };
  }
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "AMD Tracker <alerts@paisbru.com>",
      to,
      subject,
      html,
      text,
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function sendVerificationEmail(to: string, link: string) {
  return send(
    to,
    "Confirm your email — AMD Price Tracker",
    layout(
      "Confirm your email",
      `<p>Confirm this address to start receiving price alerts.</p>${button(link, "Confirm email")}
       <p style="font-size:13px;color:#a3a9b0">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>`
    ),
    `Confirm your email to start receiving price alerts:\n${link}\n\nThis link expires in 24 hours.`
  );
}

export function sendPasswordResetEmail(to: string, link: string) {
  return send(
    to,
    "Reset your password — AMD Price Tracker",
    layout(
      "Reset your password",
      `<p>Someone asked to reset the password for this account.</p>${button(link, "Choose a new password")}
       <p style="font-size:13px;color:#a3a9b0">This link expires in 1 hour. If it wasn't you, ignore this email — your password stays the same.</p>`
    ),
    `Reset your password:\n${link}\n\nThis link expires in 1 hour. If it wasn't you, ignore this email.`
  );
}

export interface PriceAlertInfo {
  productName: string;
  price: number;
  targetPrice: number;
  retailer: string;
  retailerUrl: string;
  productUrl: string;
  manageUrl: string;
}

export function sendPriceAlertEmail(to: string, a: PriceAlertInfo) {
  const price = `C$${a.price.toFixed(2)}`;
  return send(
    to,
    `▼ ${a.productName} is ${price} at ${a.retailer}`,
    layout(
      `${a.productName} hit your target`,
      `<p style="font-size:28px;font-weight:700;color:#4ade80;margin:0 0 8px">${price}</p>
       <p style="margin:0 0 4px">at <strong>${escapeHtml(a.retailer)}</strong> · your target C$${a.targetPrice.toFixed(2)}</p>
       ${button(a.retailerUrl, `View at ${a.retailer}`)}
       <p style="font-size:13px"><a href="${escapeHtml(a.productUrl)}" style="color:#a3a9b0">Price history</a> ·
       <a href="${escapeHtml(a.manageUrl)}" style="color:#a3a9b0">Manage alerts</a></p>
       <p style="font-size:12px;color:#7d848c">You'll get at most one reminder a day while the price stays under your target.</p>`
    ),
    `${a.productName} is ${price} at ${a.retailer} (your target C$${a.targetPrice.toFixed(2)}).\n${a.retailerUrl}\n\nPrice history: ${a.productUrl}\nManage alerts: ${a.manageUrl}`
  );
}
