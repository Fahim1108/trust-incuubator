import { NextRequest, NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/config/public-env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { callbackDestination } from "@/lib/auth/validation";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!getSupabaseConfig() || !code || code.length > 2048) {
    return new NextResponse("Invalid or unavailable authentication link.", { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const supabase = await createSupabaseServerClient({ writeCookies: true });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return new NextResponse("This link is invalid or expired. Please request a new link.", { status: 400, headers: { "Cache-Control": "no-store" } });
  return new NextResponse(null, { status: 303, headers: { Location: callbackDestination(request.nextUrl.searchParams.get("next")), "Cache-Control": "no-store" } });
}
