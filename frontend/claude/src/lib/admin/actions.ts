"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminClient } from "./supabase";
import {isProductionStorefront} from "../storefront-policy";
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
    issuer: isProductionStorefront()?"Attires Arena":"Attires Arena Staging",
    friendlyName: isProductionStorefront()?"Store administration":"Staging store administration",
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
  const parsed = draftSchema.safeParse({...Object.fromEntries(form),attributes:form.getAll("attributes")});
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
      chest_inches:d.chest_inches,
      length_inches:d.length_inches,
      condition:d.condition,
      attributes:d.attributes,
      seo_title:d.seo_title,
      seo_description:d.seo_description,
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
  revalidatePath("/", "layout");
  if(form.get('save_next')==='1'){
   const next=await client.rpc('admin_catalogue_snapshot');
   const {snapshotSchema}=await import('./validation');
   const parsedNext=snapshotSchema.safeParse(next.data);
   const id=parsedNext.success?parsedNext.data.items.find(i=>i.id===d.id)?.source_id:undefined;
   const following=parsedNext.success?parsedNext.data.items.find(i=>id&&i.source_id>id):undefined;
   if(following)redirect('/admin/products?review='+encodeURIComponent(following.source_id));
   redirect('/admin/products?filter=missing-size');
  }
  return {
    success:
      "Draft saved. Actual measurements and publication still require verification.",
  };
}

export async function createProductDraft(_:AdminActionState,form:FormData):Promise<AdminActionState>{
 const session=await staffSession();
 if(!session.roles.some(r=>r==='owner'||r==='product_manager'))return {error:'Product creation is not authorized.'};
 const {z}=await import('zod');
 const parsed=z.object({request_id:z.uuid(),name:z.string().trim().min(1).max(200),description:z.string().max(20000)}).safeParse(Object.fromEntries(form));
 if(!parsed.success)return {error:'Enter a product name (maximum 200 characters) and a description up to 20,000 characters.'};
 const d=parsed.data;const client=await adminClient(true);
 const result=await client.rpc('admin_create_product_draft',{request_id:d.request_id,product_name:d.name,product_description:d.description});
 if(result.error)return {error:'Draft creation could not be confirmed. Reload the product list before retrying.'};
 if(result.data!==d.request_id)return {error:'Saved product reference could not be confirmed. Reload the product list before retrying.'};
 revalidatePath('/admin');revalidatePath('/admin/products');
 return {success:'Product draft saved. It remains unpublished.',productId:d.request_id};
}
