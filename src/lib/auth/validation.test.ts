import { afterEach, describe, expect, it, vi } from "vitest";
import { callbackDestination, credentialsSchema } from "./validation";
import { getAuthSiteOrigin } from "./site-url";
afterEach(() => vi.unstubAllEnvs());
describe("auth validation", () => {
  it("permits only known relative destinations", () => {
    for (const target of [null, "https://evil.invalid", "//evil.invalid", "/admin", "/\\evil.invalid", "/account/password?next=https://evil.invalid"]) expect(callbackDestination(target)).toBe("/account");
    expect(callbackDestination("/account/password")).toBe("/account/password");
  });
  it("rejects weak registration credentials", () => {
    expect(credentialsSchema.safeParse({ email: "customer@example.invalid", password: "short" }).success).toBe(false);
  });
  it("rejects insecure, credential-bearing and path-bearing origins", () => {
    for (const value of ["", "http://store.invalid", "https://u:p@store.invalid", "https://store.invalid/path", "https://store.invalid/?q=1", "https://store.invalid/#fragment"]) {
      vi.stubEnv("SITE_URL", value); expect(getAuthSiteOrigin()).toBeNull();
    }
  });
});

describe("development-only loopback callbacks", () => {
  it("allows loopback HTTP only in development", () => {
    vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("SITE_URL", "http://localhost:3000");
    expect(getAuthSiteOrigin()).toBe("http://localhost:3000");
  });
  it("rejects the same HTTP origin in production", () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("SITE_URL", "http://localhost:3000");
    expect(getAuthSiteOrigin()).toBeNull();
  });
  it("still rejects non-loopback HTTP during development", () => {
    vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("SITE_URL", "http://store.invalid");
    expect(getAuthSiteOrigin()).toBeNull();
  });
});
