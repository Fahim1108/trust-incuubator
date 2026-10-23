import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ config: vi.fn(), client: vi.fn(), exchange: vi.fn() }));
vi.mock("@/lib/config/public-env", () => ({ getSupabaseConfig: mocks.config }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.client }));
import { GET } from "./route";
beforeEach(() => {
  vi.resetAllMocks(); mocks.config.mockReturnValue({});
  mocks.client.mockResolvedValue({ auth: { exchangeCodeForSession: mocks.exchange } });
  mocks.exchange.mockResolvedValue({ error: null });
});
describe("PKCE callback (mocked Auth)", () => {
  it("does not exchange codes without configured Supabase", async () => {
    mocks.config.mockReturnValue(null);
    expect((await GET(new NextRequest("https://store.invalid/auth/callback?code=test"))).status).toBe(400);
    expect(mocks.exchange).not.toHaveBeenCalled();
  });
  it("rejects missing codes and expired codes", async () => {
    expect((await GET(new NextRequest("https://store.invalid/auth/callback"))).status).toBe(400);
    mocks.exchange.mockResolvedValue({ error: { message: "sensitive failure" } });
    const response = await GET(new NextRequest("https://store.invalid/auth/callback?code=expired"));
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("sensitive");
  });
  it("uses only a fixed local redirect after successful exchange", async () => {
    const response = await GET(new NextRequest("https://store.invalid/auth/callback?code=test&next=https://evil.invalid"));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/account");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.client).toHaveBeenCalledWith({ writeCookies: true });
    expect(mocks.exchange).toHaveBeenCalledWith("test");
  });
  it("retains the known recovery destination", async () => {
    const response = await GET(new NextRequest("https://store.invalid/auth/callback?code=test&next=/account/password"));
    expect(response.headers.get("location")).toBe("/account/password");
  });
});
