import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = [
  "/admin",
  "/essay/write",
  "/relay/new",
  "/bookclub/new",
  "/photostory/new",
];

const PROTECTED_SUFFIXES = ["/edit", "/review"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    PROTECTED_SUFFIXES.some((s) => pathname.endsWith(s));
  if (!isProtected) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/essay/write",
    "/essay/:id/edit",
    "/relay/new",
    "/relay/:id/edit",
    "/bookclub/new",
    "/bookclub/:id/edit",
    "/bookclub/:id/review",
    "/keyword/:id/edit",
    "/photostory/new",
    "/photostory/:id/edit",
  ],
};
