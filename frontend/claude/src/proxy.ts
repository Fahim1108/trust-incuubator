import { NextResponse } from "next/server";
// Never publish sample inventory or sample customer accounts as a live store.
export function proxy() {
  if (process.env.CLAUDE_DESIGN_PREVIEW !== "1" || process.env.VERCEL_ENV === "production") {
    return new NextResponse("Design preview is disabled", { status: 404 });
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
