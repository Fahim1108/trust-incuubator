import { z } from "zod";
export const credentialsSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(12).max(128),
});
export const emailSchema = z.email().max(254);
export const passwordSchema = z.string().min(12).max(128);
// Fixed destinations only: no browser-supplied absolute or protocol-relative redirects.
export function callbackDestination(value: string | null): string {
  return value === "/account/password" ? value : "/account";
}
