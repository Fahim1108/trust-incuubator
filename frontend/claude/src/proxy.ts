import { createServerClient } from "@supabase/ssr";
import { browsableShirts } from "@/services/adapters/owner-catalogue";
import { NextResponse, type NextRequest } from "next/server";
// Never publish sample inventory or sample customer accounts as a live store.
export async function proxy(request?: NextRequest) {
  if (
    process.env.CLAUDE_DESIGN_PREVIEW !== "1" ||
    process.env.VERCEL_ENV === "production"
  ) {
    return new NextResponse("Design preview is disabled", { status: 404 });
  }
  // Resolve public product existence before streaming can commit a misleading HTTP 200.
  if (request?.nextUrl.pathname.startsWith("/product/")) {
    const slug = request.nextUrl.pathname.slice("/product/".length);
    if (!(await browsableShirts()).some((product) => product.slug === slug)) {
      return new NextResponse(
        '<!doctype html><html lang="en"><head><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Attires Arena</title></head><body style="margin:0;background:#fff;color:#171717;font-family:system-ui"><main style="min-height:100vh;display:grid;place-content:center;text-align:center;padding:24px"><a href="/" aria-label="Attires Arena home"><img src="/brand/logo-maroon.png" alt="Attires Arena" width="96" height="92" style="object-fit:contain"></a><h1 style="color:#6B0202">Page not found</h1><p>This item is not currently available.</p><a href="/category/shirts" style="color:#6B0202">Back to Shirts</a></main></body></html>',
        {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
          },
        },
      );
    }
  }
  if (request?.nextUrl.pathname.startsWith("/admin")) {
    let response = NextResponse.next({ request });
    response.headers.set("Cache-Control", "private, no-store");
    const url =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (
      url?.replace(/\/$/, "") === "https://euoannuvovsbwxjqnriw.supabase.co" &&
      key
    ) {
      const client = createServerClient(url, key, {
        cookieOptions: {
          name: "aa-admin-auth",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        },
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (values) => {
            for (const v of values) request.cookies.set(v.name, v.value);
            response = NextResponse.next({ request });
            response.headers.set("Cache-Control", "private, no-store");
            for (const v of values)
              response.cookies.set(v.name, v.value, v.options);
          },
        },
      });
      // Validate/refresh only admin sessions. Authorization still runs in every data/action boundary.
      await client.auth.getUser();
    }
    return response;
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
