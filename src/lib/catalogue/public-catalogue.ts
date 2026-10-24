import "server-only";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabaseConfig } from "@/lib/config/public-env";

const categorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
});
const productSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  category_id: z.uuid().nullable(),
});
export type Category = z.infer<typeof categorySchema>;
export type CatalogueProduct = z.infer<typeof productSchema>;
export async function getPublicCatalogue(
  query: string,
  category: string,
  sort: string,
) {
  const config = getSupabaseConfig();
  const empty = {
    categories: [] as Category[],
    products: [] as CatalogueProduct[],
  };
  if (!config) return { ...empty, state: "unconfigured" as const };
  // Always anonymous, even when staff are signed in: staff-only drafts cannot leak into the storefront.
  const db = createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        }),
    },
  });
  try {
    const categoriesResponse = await db
      .from("categories")
      .select("id,name,slug")
      .eq("published", true)
      .order("name");
    const categories = z
      .array(categorySchema)
      .parse(categoriesResponse.data ?? []);
    if (categoriesResponse.error) return { ...empty, state: "error" as const };
    const selected = categories.find((item) => item.slug === category);
    if (category && !selected)
      return { categories, products: [], state: "ready" as const };
    let request = db
      .from("products")
      .select("id,name,slug,description,category_id")
      .eq("status", "published");
    if (selected) request = request.eq("category_id", selected.id);
    const term = query.replace(/[%_\\]/g, "").slice(0, 100);
    if (term) request = request.ilike("name", `%${term}%`);
    const response = await request
      .order(sort === "name" ? "name" : "created_at", {
        ascending: sort === "name",
      })
      .limit(24);
    if (response.error)
      return { categories, products: [], state: "error" as const };
    return {
      categories,
      products: z.array(productSchema).parse(response.data ?? []),
      state: "ready" as const,
    };
  } catch {
    return { ...empty, state: "error" as const };
  }
}
