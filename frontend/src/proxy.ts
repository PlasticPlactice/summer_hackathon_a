import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(new URL("/admin", request.url));
}

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE);

  if (!sessionCookie) {
    return redirectToLogin(request);
  }

  const apiBaseUrl =
    process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    return redirectToLogin(request);
  }

  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/api/v1/auth/me`,
      {
        headers: {
          cookie: `${ADMIN_SESSION_COOKIE}=${sessionCookie.value}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      },
    );

    if (response.ok) {
      return NextResponse.next();
    }
  } catch (error) {
    console.error("管理者セッションの確認に失敗しました", error);
  }

  return redirectToLogin(request);
}

export const config = {
  matcher: [
    "/admin/home/:path*",
    "/admin/parkList/:path*",
    "/admin/sensors/:path*",
    "/admin/imageRegister/:path*",
  ],
};
