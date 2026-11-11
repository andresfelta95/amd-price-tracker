export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { sendVerification } from "@/lib/account";

export async function POST() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  if (user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  const sent = await sendVerification(user.id, user.email);
  if (!sent.ok) {
    return NextResponse.json({ error: "Couldn't send the email — try again later" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
