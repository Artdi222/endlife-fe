import { NextRequest, NextResponse } from "next/server";

// Routes that need a valid auth_token cookie
const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

// Routes only guests should see (redirect logged-in users away)
const GUEST_ONLY = ["/sign-in", "/sign-up", "/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p));

  // Not logged in → redirect to sign-in
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("from", pathname); // preserve intended destination
    return NextResponse.redirect(url);
  }

  // Already logged in → redirect away from guest-only pages
  if (isGuestOnly && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
