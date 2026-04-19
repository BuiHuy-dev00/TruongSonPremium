import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isAdminLogin = path === "/admin/login";

  if (isAdminLogin && req.auth) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  if (path.startsWith("/admin") && !isAdminLogin && !req.auth) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (path.startsWith("/api/admin") && !req.auth) {
    return NextResponse.json(
      { success: false, message: "Không có quyền truy cập" },
      { status: 401 }
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
