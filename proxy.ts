import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!session;

  const publicPaths = ["/", "/login", "/register"];
  const isPublic = publicPaths.includes(pathname) || pathname.startsWith("/api/auth") || pathname === "/api/register";

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
