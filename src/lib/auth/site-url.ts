import { z } from "zod";
export function getAuthSiteOrigin(): string | null {
  const result = z.url({ protocol: /^https$/ }).safeParse(process.env.SITE_URL);
  if (!result.success) return null;
  const url = new URL(result.data);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
  return url.origin;
}
