import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const cookie = req.cookies.get("axon_user")?.value;
  const path = req.nextUrl.pathname;

  if (!cookie && !path.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  if (cookie && path.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace/:path*", "/auth/:path*", "/home"],
};
