import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;
  const { nextUrl } = req;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isTechnicianRoute = nextUrl.pathname.startsWith("/technician");
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (role !== "admin") {
      // Redirect technicians to their own dashboard; customers to homepage
      const destination = role === "technician" ? "/technician" : "/";
      return NextResponse.redirect(new URL(destination, nextUrl));
    }
  }

  if (isTechnicianRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (role !== "technician" && role !== "admin") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/technician/:path*", "/login", "/register"],
};
