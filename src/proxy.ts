import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/config/public-env";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  const config = getSupabaseConfig();
  if (!config) return response;
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        response.headers.set("Cache-Control", "private, no-store");
      },
    },
  });
  // Validate identity with Auth; never authorize from getSession() alone.
  await supabase.auth.getUser();
  return response;
}
export const config = { matcher: ["/account/:path*", "/auth/:path*"] };
