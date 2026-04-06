import { NextRequest, NextResponse } from "next/server";

// Routes that need a valid auth_token cookie
// We now exclude /dashboard/characters and /dashboard/weapons to allow public access
const PROTECTED_PREFIXES = ["/dashboard/planner", "/admin"];

// Routes only guests should see (redirect logged-in users away)
const GUEST_ONLY = ["/sign-in", "/sign-up", "/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p));

  // Special cases for /dashboard:
  // If the path is exactly /dashboard, we want to protect it
  const isDashboardRoot = pathname === "/dashboard";
  
  if ((isProtected || isDashboardRoot) && !token) {
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
