import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of routes that require authentication
const protectedRoutes = ["/create-trip", "/trip", "/activity"];

// List of routes that are only accessible to non-authenticated users
const authRoutes = ["/login", "/signup", "/otp-login"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;

  // Check if the path is a protected route and user is not authenticated
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if the path is an auth route and user is authenticated
  const isAuthRoute = authRoutes.some((route) => path === route);
  if (isAuthRoute && session) {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
