import pool from "@/lib/db";
import { appUrl, issueToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/notify/email";

export async function sendVerification(userId: number, email: string) {
  const token = await issueToken(userId, "verify_email", 24 * 60);
  return sendVerificationEmail(email, appUrl(`/api/auth/verify?token=${token}`));
}

/** Marks the email verified and adopts pre-accounts alerts that were created with this email. */
export async function markEmailVerified(userId: number): Promise<void> {
  const res = await pool.query(
    `UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = $1 RETURNING email`,
    [userId]
  );
  const email = res.rows[0]?.email;
  if (email) {
    await pool.query(
      `UPDATE alerts SET user_id = $1 WHERE user_id IS NULL AND lower(email) = $2 AND product_id IS NOT NULL`,
      [userId, email]
    );
  }
}
