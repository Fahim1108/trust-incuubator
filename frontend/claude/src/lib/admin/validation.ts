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
const measurement=z.string().regex(/^([0-9]{1,3}(\.[0-9]{1,2})?)?$/).refine(v=>!v||(Number(v)>0&&Number(v)<=100),'Enter inches between 0 and 100.').optional().default('');
export const shirtAttributes=["Solid", "Striped", "Formal", "Casual", "Checked / Plaid", "Printed", "Denim", "Oxford", "Flannel", "Overshirt", "Linen", "Cuban Collar", "Short Sleeve", "Long Sleeve"] as const;
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
  attributes:z.array(z.enum(shirtAttributes)).max(14).optional().default([]),
  seo_title:z.string().trim().max(70).optional().default(""),
  seo_description:z.string().trim().max(160).optional().default(""),
  chest_inches:measurement,
  length_inches:measurement,
  condition:z.enum(["","excellent","very_good","good","fair"]).optional().default(""),
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
      attributes:z.array(z.enum(shirtAttributes)).optional().default([]),
      seo_title:z.string().nullable().optional(),
      seo_description:z.string().nullable().optional(),
      chest_inches:z.number().positive().max(100).nullable().optional(),
      length_inches:z.number().positive().max(100).nullable().optional(),
      condition:z.string().nullable().optional(),
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
