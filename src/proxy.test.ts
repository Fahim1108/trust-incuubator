import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
const mocks = vi.hoisted(() => ({ config: vi.fn(), createClient: vi.fn(), user: vi.fn() }));
vi.mock("@/lib/config/public-env", () => ({ getSupabaseConfig: mocks.config }));
vi.mock("@supabase/ssr", () => ({ createServerClient: mocks.createClient }));
import { proxy } from "./proxy";
beforeEach(() => { vi.resetAllMocks(); mocks.config.mockReturnValue({ url: "https://example.supabase.co", publishableKey: "sb_publishable_test" }); });
describe("session refresh proxy (mocked Auth)", () => {
  it("does not call Auth without configuration and prevents caching", async () => {
    mocks.config.mockReturnValue(null);
    const response = await proxy(new NextRequest("https://store.invalid/account"));
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it("validates user and forwards refreshed cookies to request and response", async () => {
    mocks.createClient.mockImplementation((_url: string, _key: string, options: { cookies: { setAll: (values: { name: string; value: string; options: CookieOptions }[]) => void } }) => ({ auth: { getUser: async () => {
      mocks.user(); options.cookies.setAll([{ name: "test-session", value: "test-only-cookie", options: { httpOnly: true, sameSite: "lax", secure: true } }]);
      return { data: { user: null }, error: null };
    } } }));
    const request = new NextRequest("https://store.invalid/account");
    const response = await proxy(request);
    expect(mocks.user).toHaveBeenCalledOnce();
    expect(request.cookies.get("test-session")?.value).toBe("test-only-cookie");
    expect(response.cookies.get("test-session")?.value).toBe("test-only-cookie");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
