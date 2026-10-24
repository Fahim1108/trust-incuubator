import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  createClient: vi.fn(),
  from: vi.fn(),
  products: { data: [], error: null } as { data: unknown[]; error: unknown },
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/config/public-env", () => ({ getSupabaseConfig: mocks.config }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
import { getPublicCatalogue } from "./public-catalogue";
let productQuery: {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  ilike: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.config.mockReturnValue({
    url: "https://example.supabase.co",
    publishableKey: "sb_publishable_test",
  });
  mocks.products = { data: [], error: null };
  productQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(async () => mocks.products),
  };
  for (const method of [
    productQuery.select,
    productQuery.eq,
    productQuery.ilike,
    productQuery.order,
  ])
    method.mockReturnValue(productQuery);
  const categories = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(async () => ({ data: [], error: null })),
  };
  categories.select.mockReturnValue(categories);
  categories.eq.mockReturnValue(categories);
  mocks.from.mockImplementation((table: string) =>
    table === "categories" ? categories : productQuery,
  );
  mocks.createClient.mockReturnValue({ from: mocks.from });
});
describe("public storefront catalogue boundary (mocked SDK)", () => {
  it("fails closed without configuration", async () => {
    mocks.config.mockReturnValue(null);
    expect((await getPublicCatalogue("", "", "newest")).state).toBe(
      "unconfigured",
    );
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it("uses an anonymous client, explicitly excludes drafts and bounds results", async () => {
    expect((await getPublicCatalogue("", "", "newest")).state).toBe("ready");
    expect(mocks.createClient.mock.calls[0][2].auth).toEqual({
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    });
    expect(productQuery.eq).toHaveBeenCalledWith("status", "published");
    expect(productQuery.limit).toHaveBeenCalledWith(24);
  });
  it("does not broaden an unknown category into all products", async () => {
    expect(
      (await getPublicCatalogue("", "unpublished-category", "newest")).products,
    ).toEqual([]);
    expect(mocks.from).not.toHaveBeenCalledWith("products");
  });
  it("removes wildcard search characters", async () => {
    await getPublicCatalogue("%shirt_", "", "newest");
    expect(productQuery.ilike).toHaveBeenCalledWith("name", "%shirt%");
  });
  it("distinguishes database failure from an empty collection", async () => {
    mocks.products.error = { message: "private diagnostic" };
    expect(await getPublicCatalogue("", "", "newest")).toEqual({
      categories: [],
      products: [],
      state: "error",
    });
  });
  it("rejects malformed database records", async () => {
    mocks.products.data = [{ id: "bad", name: "Invalid" }];
    expect((await getPublicCatalogue("", "", "newest")).state).toBe("error");
  });
});
