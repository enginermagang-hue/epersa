import { NextResponse, type NextRequest } from "next/server";
import { login } from "@/lib/auth/auth";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const username = body.username;
    const password = body.password;

    if (
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          message:
            "Username dan password wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    const result = await login(
      username,
      password,
    );

    if (!result) {
      return NextResponse.json(
        {
          message:
            "Username atau password salah.",
        },
        {
          status: 401,
        },
      );
    }

    const response = NextResponse.json({
      message: "Login berhasil",
      user: {
        id: result.user.id,
        name: result.user.name,
        username: result.user.username,
        role: result.user.role.name,
      },
    });

    response.cookies.set("session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        message: "Terjadi kesalahan.",
      },
      {
        status: 500,
      },
    );
  }
}