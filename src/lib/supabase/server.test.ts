import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ config: vi.fn(), createClient: vi.fn(), cookies: { getAll: vi.fn(), set: vi.fn() } }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/config/public-env", () => ({ getSupabaseConfig: mocks.config }));
vi.mock("@supabase/ssr", () => ({ createServerClient: mocks.createClient }));
vi.mock("next/headers", () => ({ cookies: async () => mocks.cookies }));
import { createSupabaseServerClient } from "./server";
beforeEach(() => { vi.resetAllMocks(); mocks.config.mockReturnValue({ url: "https://example.supabase.co", publishableKey: "sb_publishable_test" }); });
describe("server-only client boundaries (mocked SSR SDK)", () => {
  it("does not initialize a client without configuration", async () => {
    mocks.config.mockReturnValue(null);
    await expect(createSupabaseServerClient()).rejects.toThrow("configuration");
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it("omits cookie writes in a read-only Server Component", async () => {
    await createSupabaseServerClient();
    const options = mocks.createClient.mock.calls[0][2];
    expect(options.cookies.setAll).toBeUndefined();
    expect(options.cookieOptions.httpOnly).toBe(true);
  });
  it("permits explicit action/handler cookie writes", async () => {
    await createSupabaseServerClient({ writeCookies: true });
    const options = mocks.createClient.mock.calls[0][2];
    options.cookies.setAll([{ name: "test", value: "test-only", options: { httpOnly: true } }]);
    expect(mocks.cookies.set).toHaveBeenCalledWith("test", "test-only", { httpOnly: true });
  });
});
