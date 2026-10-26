import { browsableShirts } from "@/services/adapters/owner-catalogue";
import { NextResponse, type NextRequest } from "next/server";
// Never publish sample inventory or sample customer accounts as a live store.
export async function proxy(request?: NextRequest) {
  if (process.env.CLAUDE_DESIGN_PREVIEW !== "1" || process.env.VERCEL_ENV === "production") {
    return new NextResponse("Design preview is disabled", { status: 404 });
  }
  // Resolve public product existence before streaming can commit a misleading HTTP 200.
  if (request?.nextUrl.pathname.startsWith('/product/')) {
    const slug = request.nextUrl.pathname.slice('/product/'.length);
    if (!(await browsableShirts()).some(product=>product.slug===slug)) {
      return new NextResponse('<!doctype html><html lang="en"><head><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Attires Arena</title></head><body style="margin:0;background:#fff;color:#171717;font-family:system-ui"><main style="min-height:100vh;display:grid;place-content:center;text-align:center;padding:24px"><a href="/" aria-label="Attires Arena home"><img src="/brand/logo-maroon.png" alt="Attires Arena" width="96" height="92" style="object-fit:contain"></a><h1 style="color:#6B0202">Page not found</h1><p>This item is not currently available.</p><a href="/category/shirts" style="color:#6B0202">Back to Shirts</a></main></body></html>',{status:404,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
