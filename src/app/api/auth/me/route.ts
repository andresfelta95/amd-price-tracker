export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null, alertCount: 0 });
  const res = await pool.query(
    `SELECT COUNT(*)::int AS n FROM alerts WHERE user_id = $1 AND active`,
    [user.id]
  );
  return NextResponse.json({ user, alertCount: res.rows[0].n });
}
