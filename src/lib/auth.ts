import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import pool from "@/lib/db";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = "amd_session";
const SESSION_DAYS = 30;
export const MIN_PASSWORD_LENGTH = 10;

export interface User {
  id: number;
  email: string;
  emailVerified: boolean;
  telegramLinked: boolean;
  notifyEmail: boolean;
  notifyTelegram: boolean;
}

export type TokenPurpose = "verify_email" | "reset_password" | "telegram_link";

// ── Passwords ─────────────────────────────────────────────────────────────────
// Stored as scrypt$<salt hex>$<hash hex>
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltHex, hashHex] = stored.split("$");
  if (algo !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const e = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254 ? e : null;
}

// ── Tokens ────────────────────────────────────────────────────────────────────
// Raw tokens only ever live in cookies/links; the DB stores their SHA-256.
function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function newRawToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function issueToken(userId: number, purpose: TokenPurpose, ttlMinutes: number): Promise<string> {
  const raw = newRawToken();
  // Invalidate any earlier unused token for the same purpose
  await pool.query(
    `UPDATE auth_tokens SET used_at = NOW() WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL`,
    [userId, purpose]
  );
  await pool.query(
    `INSERT INTO auth_tokens (token_hash, user_id, purpose, expires_at)
     VALUES ($1, $2, $3, NOW() + make_interval(mins => $4))`,
    [sha256(raw), userId, purpose, ttlMinutes]
  );
  return raw;
}

/** Marks the token used and returns its user id, or null if invalid/expired/used. */
export async function consumeToken(raw: unknown, purpose: TokenPurpose): Promise<number | null> {
  if (typeof raw !== "string" || !raw) return null;
  const res = await pool.query(
    `UPDATE auth_tokens SET used_at = NOW()
     WHERE token_hash = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > NOW()
     RETURNING user_id`,
    [sha256(raw), purpose]
  );
  return res.rows[0]?.user_id ?? null;
}

// ── Sessions ──────────────────────────────────────────────────────────────────
export async function createSession(userId: number): Promise<void> {
  const raw = newRawToken();
  await pool.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, NOW() + make_interval(days => $3))`,
    [sha256(raw), userId, SESSION_DAYS]
  );
  cookies().set(SESSION_COOKIE, raw, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (raw) await pool.query(`DELETE FROM sessions WHERE token_hash = $1`, [sha256(raw)]);
  cookies().delete(SESSION_COOKIE);
}

/** Ends every session of a user (after a password reset). */
export async function destroyAllSessions(userId: number): Promise<void> {
  await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
}

export async function getCurrentUser(): Promise<User | null> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const res = await pool.query(
    `SELECT u.id, u.email, u.email_verified_at, u.telegram_chat_id, u.notify_email, u.notify_telegram
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [sha256(raw)]
  );
  const u = res.rows[0];
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    emailVerified: u.email_verified_at !== null,
    telegramLinked: u.telegram_chat_id !== null,
    notifyEmail: u.notify_email,
    notifyTelegram: u.notify_telegram,
  };
}

/** For route handlers: the user, or a 401 response to return as-is. */
export async function requireUser(): Promise<User | NextResponse> {
  const user = await getCurrentUser();
  return user ?? NextResponse.json({ error: "Not signed in" }, { status: 401 });
}

export function appUrl(path: string): string {
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}
