import { z } from "zod";
export const staffRoles = [
  "owner",
  "product_manager",
  "order_manager",
  "customer_support",
  "marketing_manager",
  "analyst",
] as const;
export const rolesSchema = z.array(z.object({ role: z.enum(staffRoles) }));
export const signInSchema = z.object({
  email: z.email().trim().max(254),
  password: z.string().min(1).max(256),
});
export const totpSchema = z.object({
  factorId: z.uuid(),
  code: z.string().regex(/^\d{6}$/),
});
export const draftSchema = z.object({
  id: z.uuid(),
  updated_at: z.iso.datetime({ offset: true }),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(20000),
  price: z.string().regex(/^\d{1,9}(\.\d{1,2})?$/),
  stock_quantity: z.enum(["0", "1"]),
  actual_size: z
    .string()
    .trim()
    .max(40)
    .refine(
      (s) => !["N/A", "NA", "UNKNOWN"].includes(s.toUpperCase()),
      "Enter an actual size or leave blank.",
    ),
  actual_color: z.string().trim().max(80),
});
export function toMinorUnits(value: string): number {
  const [whole = "", fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
export const snapshotSchema = z.object({
  products: z.number().int().nonnegative(),
  published: z.number().int().nonnegative(),
  drafts: z.number().int().nonnegative(),
  available: z.number().int().nonnegative(),
  sold_out: z.number().int().nonnegative(),
  pending_sizes: z.number().int().nonnegative(),
  items: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      description: z.string(),
      status: z.enum(["draft", "published", "archived"]),
      slug: z.string(),
      updated_at: z.iso.datetime({ offset: true }),
      source_id: z.string(),
      image_path: z
        .string()
        .regex(/^\/inventory\/thrift-shirts\/AA-SHIRT-\d{3}-front\.jpg$/),
      price_minor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
      stock_quantity: z.number().int().min(0).max(1),
      actual_size: z.string().nullable(),
      actual_color: z.string().nullable(),
      size_verified: z.boolean(),
      details_verified: z.boolean(),
    }),
  ),
});
export type IntakeItem = z.infer<typeof snapshotSchema>["items"][number];
export type AdminActionState = {
  error?: string;
  success?: string;
  qr?: string;
  factorId?: string;
};
