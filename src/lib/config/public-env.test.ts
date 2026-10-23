import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseConfig } from "./public-env";
afterEach(() => vi.unstubAllEnvs());
describe("public Supabase configuration", () => {
  it("fails closed without configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(getSupabaseConfig()).toBeNull();
  });
  it("rejects privileged key formats", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_secret_test");
    expect(getSupabaseConfig()).toBeNull();
  });
  it("accepts the public publishable key format", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    expect(getSupabaseConfig()?.url).toBe("https://example.supabase.co");
  });
  it("rejects unencrypted URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    expect(getSupabaseConfig()).toBeNull();
  });
});

describe("Supabase origin restrictions", () => {
  it("rejects URLs with credentials, paths, queries or fragments", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    for (const url of ["https://u:p@example.supabase.co", "https://example.supabase.co/path", "https://example.supabase.co/?token=secret", "https://example.supabase.co/#fragment"]) {
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
      expect(getSupabaseConfig()).toBeNull();
    }
  });
  it("rejects an empty publishable key suffix", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_");
    expect(getSupabaseConfig()).toBeNull();
  });
});
