import { NextRequest, NextResponse } from "next/server";

// Edge runtime: no DB here, only checks the cookie exists. Pages and API routes
// validate the session themselves via getCurrentUser()/requireUser().
export function middleware(req: NextRequest) {
  if (req.cookies.get("amd_session")?.value) return NextResponse.next();

  const login = req.nextUrl.clone();
  login.pathname = "/login";
  login.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/alerts", "/account"],
};
