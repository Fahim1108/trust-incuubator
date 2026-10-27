import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export function adminConfiguration() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (
    url?.replace(/\/$/, "") !== "https://euoannuvovsbwxjqnriw.supabase.co" ||
    !key
  )
    return null;
  if (!key.startsWith("sb_publishable_")) {
    try {
      const claims: unknown = JSON.parse(
        Buffer.from(key.split(".")[1] || "", "base64url").toString(),
      );
      if (
        !claims ||
        typeof claims !== "object" ||
        !("role" in claims) ||
        claims.role !== "anon"
      )
        return null;
    } catch {
      return null;
    }
  }
  return { url, key };
}
export async function adminClient(writeCookies = false) {
  const config = adminConfiguration();
  if (!config)
    throw new Error("Development Supabase configuration is unavailable.");
  const store = await cookies();
  return createServerClient(config.url, config.key, {
    db: { timeout: 20000, retry: false },
    global: {
      fetch: (url, init) =>
        fetch(url, {
          ...init,
          signal: init?.signal
            ? AbortSignal.any([init.signal, AbortSignal.timeout(25000)])
            : AbortSignal.timeout(25000),
        }),
    },
    cookieOptions: {
      name: "aa-admin-auth",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      getAll: () => store.getAll(),
      ...(writeCookies
        ? {
            setAll: (
              values: {
                name: string;
                value: string;
                options: import("@supabase/ssr").CookieOptions;
              }[],
            ) => {
              for (const v of values) store.set(v.name, v.value, v.options);
            },
          }
        : {}),
    },
  });
}
