import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  config: vi.fn(), client: vi.fn(), redirect: vi.fn(),
  auth: { signInWithPassword: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), resetPasswordForEmail: vi.fn(), getUser: vi.fn(), updateUser: vi.fn() },
}));
vi.mock("@/lib/config/public-env", () => ({ getSupabaseConfig: mocks.config }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.client }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
import { register, signIn, signOut, requestPasswordReset, updatePassword } from "./actions";
const previous = { message: "" };
function form(fields: Record<string, string>) { const data = new FormData(); Object.entries(fields).forEach(([k, v]) => data.set(k, v)); return data; }
const credentials = { email: "customer@example.invalid", password: "test-password-long" };
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("SITE_URL", "https://store.example.invalid");
  mocks.config.mockReturnValue({ url: "https://example.supabase.co", publishableKey: "sb_publishable_test" });
  mocks.client.mockResolvedValue({ auth: mocks.auth });
  mocks.auth.signUp.mockResolvedValue({ error: null });
  mocks.auth.signInWithPassword.mockResolvedValue({ error: null });
  mocks.auth.signOut.mockResolvedValue({ error: null });
  mocks.auth.resetPasswordForEmail.mockResolvedValue({ error: null });
  mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "customer-id" } }, error: null });
  mocks.auth.updateUser.mockResolvedValue({ error: null });
  mocks.redirect.mockImplementation(() => { throw new Error("REDIRECT"); });
});
afterEach(() => vi.unstubAllEnvs());
describe("auth server actions (mocked SDK, not Supabase integration)", () => {
  it("fails closed without Supabase configuration", async () => {
    mocks.config.mockReturnValue(null);
    expect((await signIn(previous, form(credentials))).message).toContain("unavailable");
    expect((await register(previous, form(credentials))).message).toContain("unavailable");
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("rejects invalid registration before calling Auth", async () => {
    await register(previous, form({ email: "invalid", password: "short" }));
    expect(mocks.auth.signUp).not.toHaveBeenCalled();
  });
  it("forwards only credentials and a canonical callback, never requested roles", async () => {
    await register(previous, form({ ...credentials, role: "owner", is_admin: "true", data: '{"role":"owner"}' }));
    expect(mocks.auth.signUp).toHaveBeenCalledWith({ ...credentials, options: { emailRedirectTo: "https://store.example.invalid/auth/callback" } });
    expect(mocks.client).toHaveBeenCalledWith({ writeCookies: true });
  });
  it("does not claim registration success or expose Auth errors", async () => {
    mocks.auth.signUp.mockResolvedValue({ error: { message: "private Auth diagnostic" } });
    expect((await register(previous, form(credentials))).message).not.toContain("private");
  });
  it("redirects only after a successful password login", async () => {
    await expect(signIn(previous, form(credentials))).rejects.toThrow("REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/account");
  });
  it("does not redirect after failed login or expose provider details", async () => {
    mocks.auth.signInWithPassword.mockResolvedValue({ error: { message: "sensitive provider error" } });
    const result = await signIn(previous, form(credentials));
    expect(result.message).not.toContain("sensitive");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
  it("signs out before redirecting", async () => {
    await expect(signOut()).rejects.toThrow("REDIRECT");
    expect(mocks.auth.signOut).toHaveBeenCalledOnce();
  });
  it("does not claim logout after an upstream failure", async () => {
    mocks.auth.signOut.mockResolvedValue({ error: { message: "failure" } });
    await expect(signOut()).rejects.toThrow("Unable to sign out");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
  it("uses canonical origin for reset and returns an enumeration-safe message", async () => {
    const first = await requestPasswordReset(previous, form(credentials));
    mocks.auth.resetPasswordForEmail.mockResolvedValue({ error: { message: "not found" } });
    expect(await requestPasswordReset(previous, form(credentials))).toEqual(first);
    expect(mocks.auth.resetPasswordForEmail).toHaveBeenCalledWith(credentials.email, { redirectTo: "https://store.example.invalid/auth/callback?next=/account/password" });
  });
  it("rejects an invalid reset origin", async () => {
    vi.stubEnv("SITE_URL", "https://user:password@store.example.invalid/path");
    expect((await requestPasswordReset(previous, form(credentials))).message).toContain("unavailable");
    expect(mocks.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });
  it("requires validated identity before changing password", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await updatePassword(previous, form(credentials))).message).toContain("Sign in");
    expect(mocks.auth.updateUser).not.toHaveBeenCalled();
  });
  it("updates a valid password for a verified session", async () => {
    await updatePassword(previous, form(credentials));
    expect(mocks.auth.updateUser).toHaveBeenCalledWith({ password: credentials.password });
  });
});
