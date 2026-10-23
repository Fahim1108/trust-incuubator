import { z } from "zod";
const schema = z.object({
  url: z.url({ protocol: /^https$/ }).refine((value) => {
    const url = URL.parse(value);
    return url !== null && !url.username && !url.password && !url.search && !url.hash && url.pathname === "/";
  }, "Supabase URL must be a clean HTTPS origin"),
  publishableKey: z.string().startsWith("sb_publishable_").min(16),
});
export function getSupabaseConfig() {
  const result = schema.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (!result.success) return null;
  return result.data;
}
