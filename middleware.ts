import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/chat", "/settings"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const res = NextResponse.next();
  if (token?.sub) {
    res.headers.set("x-user-id", token.sub);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/settings/:path*"],
};
