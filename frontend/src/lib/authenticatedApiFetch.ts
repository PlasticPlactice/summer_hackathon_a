import "server-only";

import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "admin_session";

export async function authenticatedApiFetch(
  path: string,
  init: RequestInit = {},
) {
  const apiBaseUrl =
    process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    throw new Error("API URLが設定されていません");
  }

  const sessionCookie = (await cookies()).get(ADMIN_SESSION_COOKIE);
  const headers = new Headers(init.headers);

  if (sessionCookie) {
    headers.set(
      "cookie",
      `${ADMIN_SESSION_COOKIE}=${sessionCookie.value}`,
    );
  }

  return fetch(`${apiBaseUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers,
  });
}
