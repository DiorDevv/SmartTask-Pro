import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/api/auth"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isLoggedIn = !!token;
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  const isStatic = pathname.startsWith("/_next") || pathname.startsWith("/uploads") || pathname === "/manifest.json";

  if (isStatic) return NextResponse.next();
  if (isPublic) return NextResponse.next();

  if (!isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/tasks/:path*", "/calendar/:path*", "/analytics/:path*", "/settings/:path*", "/api/:path*"],
};
