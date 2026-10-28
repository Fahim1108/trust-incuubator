import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export { publicSupabaseConfiguration as adminConfiguration } from "../supabase-public";
import { publicSupabaseConfiguration as adminConfiguration } from "../supabase-public";
export async function adminClient(writeCookies = false) {
  const config = adminConfiguration();
  if (!config)
    throw new Error("Supabase configuration is unavailable.");
  const store = await cookies();
  return createServerClient(config.url, config.key, {
    db: { timeout: 20000, retry: false },
    global: {
      fetch: (url, init) =>
        fetch(url, {
          ...init,
          cache: "no-store",
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
