export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { appUrl, consumeToken } from "@/lib/auth";
import { markEmailVerified } from "@/lib/account";

// GET /api/auth/verify?token=… — the link in the verification email
export async function GET(request: NextRequest) {
  const userId = await consumeToken(request.nextUrl.searchParams.get("token"), "verify_email");
  if (!userId) return NextResponse.redirect(appUrl("/verify-email?status=invalid"));
  await markEmailVerified(userId);
  return NextResponse.redirect(appUrl("/verify-email?status=ok"));
}
