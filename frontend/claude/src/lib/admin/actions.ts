"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminClient } from "./supabase";
import { staffSession } from "./access";
import {
  signInSchema,
  totpSchema,
  rolesSchema,
  draftSchema,
  toMinorUnits,
  type AdminActionState,
} from "./validation";
export async function signInStaff(
  _: AdminActionState,
  form: FormData,
): Promise<AdminActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const client = await adminClient(true);
  const result = await client.auth.signInWithPassword(parsed.data);
  if (result.error)
    return {
      error: "Sign-in failed. Check your credentials or try again later.",
    };
  const roles = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", result.data.user.id);
  const membership = rolesSchema.safeParse(roles.data);
  if (
    roles.error ||
    !membership.success ||
    !membership.data.length ||
    result.data.user.is_anonymous
  ) {
    await client.auth.signOut({ scope: "local" });
    return { error: "This account does not have staff access." };
  }
  redirect("/admin/mfa");
}
export async function signOutStaff() {
  const client = await adminClient(true);
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) throw new Error("Sign-out failed. Please retry.");
  redirect("/admin/sign-in");
}
export async function enrollStaffMfa(): Promise<AdminActionState> {
  await staffSession(false);
  const client = await adminClient(true);
  const factors = await client.auth.mfa.listFactors();
  if (factors.error)
    return { error: "Unable to check authenticator settings." };
  if (factors.data.totp.length)
    return { error: "An authenticator is already configured. Use its code." };
  // Clear only this session user’s abandoned, unverified TOTP enrollments.
  for (const factor of factors.data.all.filter(
    (f) => f.factor_type === "totp" && f.status === "unverified",
  )) {
    const removed = await client.auth.mfa.unenroll({ factorId: factor.id });
    if (removed.error)
      return { error: "Unable to restart authenticator setup." };
  }
  const result = await client.auth.mfa.enroll({
    factorType: "totp",
    issuer: "Attires Arena",
    friendlyName: "Store administration",
  });
  if (result.error)
    return { error: "Authenticator setup unavailable. Try again later." };
  return { qr: result.data.totp.qr_code, factorId: result.data.id };
}
export async function verifyStaffMfa(
  _: AdminActionState,
  form: FormData,
): Promise<AdminActionState> {
  await staffSession(false);
  const parsed = totpSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { error: "Enter the six-digit authenticator code." };
  const client = await adminClient(true);
  const result = await client.auth.mfa.challengeAndVerify(parsed.data);
  if (result.error)
    return {
      error: "Code not accepted. Use a current code or try again later.",
    };
  redirect("/admin");
}
export async function saveThriftDraft(
  _: AdminActionState,
  form: FormData,
): Promise<AdminActionState> {
  const session = await staffSession();
  if (!session.roles.some((r) => r === "owner" || r === "product_manager"))
    return { error: "You do not have catalogue editing permission." };
  const parsed = draftSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message || "Check the product fields.",
    };
  const d = parsed.data;
  const client = await adminClient(true);
  const result = await client.rpc("admin_save_thrift_draft", {
    target_id: d.id,
    expected_updated_at: d.updated_at,
    draft: {
      name: d.name,
      description: d.description,
      price_minor: toMinorUnits(d.price),
      stock_quantity: Number(d.stock_quantity),
      actual_size: d.actual_size,
      actual_color: d.actual_color,
    },
  });
  if (result.error)
    return {
      error:
        result.error.code === "PT409"
          ? "This product changed. Reload before saving."
          : "Draft could not be saved. Reload and check your access; SKU-backed items require the inventory workflow.",
    };
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return {
    success:
      "Draft saved. Actual measurements and publication still require verification.",
  };
}
