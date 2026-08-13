import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { sessions } from "@/db/schema";
import { hashSessionToken } from "@/lib/auth/session";

const PUBLIC_PAGE = "/login";
const LOGIN_API = "/api/auth/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Jangan blokir halaman login dan endpoint login itu sendiri
  if (pathname === PUBLIC_PAGE || pathname === LOGIN_API) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;
  const session = token ? await getValidSession(token) : null;

  if (session) {
    const headers = new Headers(request.headers);
    headers.set("x-user-id", String(session.userId));
    headers.set("x-user-role", session.role);

    return NextResponse.next({
      request: { headers },
    });
  }

  if (pathname.startsWith("/api")) {
    return Response.json(
      {
        message: "Sesi tidak valid atau telah berakhir.",
      },
      { status: 401 },
    );
  }

  const loginUrl = new URL(PUBLIC_PAGE, request.url);

  return NextResponse.redirect(loginUrl);
}

async function getValidSession(token: string) {
  const id = hashSessionToken(token);

  const row = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
    with: {
      user: {
        with: {
          role: true,
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  if (row.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  if (!row.user.isActive) {
    return null;
  }

  return {
    userId: row.userId,
    role: row.user.role.name,
  };
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
