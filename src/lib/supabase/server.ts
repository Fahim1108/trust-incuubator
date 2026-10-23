import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/config/public-env";
export async function createSupabaseServerClient({ writeCookies = false }: { writeCookies?: boolean } = {}) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase public configuration is missing or invalid");
  const cookieStore = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => cookieStore.getAll(),
      // Server Components cannot write cookies. Refresh runs in proxy.ts;
      // only Route Handlers and Server Actions opt into cookie writes.
      ...(writeCookies ? { setAll: (values: { name: string; value: string; options: import("@supabase/ssr").CookieOptions }[]) => {
        for (const { name, value, options } of values) cookieStore.set(name, value, options);
      } } : {}),
    },
  });
}
