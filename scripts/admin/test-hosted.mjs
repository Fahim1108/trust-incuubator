// Real development Auth/PostgREST; no permanent accounts or business records changed.
import assert from "node:assert/strict";
import { randomUUID, randomBytes, createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import {
  projectUrl,
  getTestAdminKey,
  query,
  uuid,
  literal,
} from "../lib/supabase-development.mjs";
export function totp(secret) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of secret.toUpperCase().replace(/=+$/, ""))
    bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8)
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const h = createHmac("sha1", Buffer.from(bytes)).update(counter).digest(),
    offset = h[h.length - 1] & 15;
  return String((h.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(
    6,
    "0",
  );
}
const options = {
  db: { timeout: 20000, retry: false },
  global: {
    fetch: (url, init) =>
      fetch(url, {
        ...init,
        signal: init?.signal
          ? AbortSignal.any([init.signal, AbortSignal.timeout(25000)])
          : AbortSignal.timeout(25000),
      }),
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
function ok(r) {
  if (r.error)
    throw new Error(
      "Provider operation failed (details withheld): " + r.error.code,
    );
  return r.data;
}
const users = [],
  checks = [];
const product = randomUUID();

const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const operator = createClient(projectUrl, await getTestAdminKey(), options);
const password = randomBytes(32).toString("base64url");
const client = () => createClient(projectUrl, key, options);
function pass(label) {
  checks.push(label);
  console.log("PASS: " + label);
}
try {
  const anonymous = client();
  assert((await anonymous.rpc("admin_catalogue_snapshot")).error);
  pass("anonymous cannot read admin snapshot");
  await query(
    `insert into public.products(id,name,slug) values(${uuid(product)},'Disposable admin verification shirt',${literal("admin-test-" + product)});
 insert into public.thrift_intake(source_id,product_id,image_path,image_sha256,price_minor) values('AA-SHIRT-999',${uuid(product)},'/inventory/thrift-shirts/AA-SHIRT-001-front.jpg',${literal(randomBytes(32).toString("hex"))},55000);`,
    false,
  );

  let ownerContext;
  for (const role of ["customer", "owner", "analyst"]) {
    const email = `attires-admin-test-${randomUUID()}@example.com`;
    const user = ok(
      await operator.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "owner" },
      }),
    ).user;
    users.push(user.id);
    if (role === "owner")
      await query(
        `select private.provision_owner(${uuid(user.id)},${literal(email)},'Disposable admin MFA verification')`,
        false,
      );
    else if (role === "analyst")
      await query(
        `insert into public.user_roles(user_id,role) values(${uuid(user.id)},'analyst')`,
        false,
      );
    const c = client();
    ok(await c.auth.signInWithPassword({ email, password }));
    assert((await c.rpc("admin_catalogue_snapshot")).error);
    pass(role + " AAL1 denied admin snapshot");
    const factor = ok(
      await c.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Disposable verification",
      }),
    );
    ok(
      await c.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code: totp(factor.totp.secret),
      }),
    );
    assert.equal(
      ok(await c.auth.mfa.getAuthenticatorAssuranceLevel()).currentLevel,
      "aal2",
    );
    const snapshot = await c.rpc("admin_catalogue_snapshot");
    if (role === "customer") {
      assert(snapshot.error);
      assert(
        (await c.from("user_roles").insert({ user_id: user.id, role: "owner" }))
          .error,
      );
      pass(
        "MFA customer still denied; metadata and role writes cannot promote",
      );
    } else {
      const data = ok(snapshot);
      assert(data.items.some((i) => i.id === product));
      pass(role + " AAL2 sees actual intake");
    }
    const p = (
      await query(
        `select updated_at from public.products where id=${uuid(product)}`,
      )
    )[0];
    const payload = {
      target_id: product,
      expected_updated_at: p.updated_at,
      draft: {
        name: "Verified disposable edit",
        description: "No real product changed",
        price_minor: 57500,
        stock_quantity: 1,
        actual_size: "",
        actual_color: "",
      },
    };
    const save = await c.rpc("admin_save_thrift_draft", payload);
    if (role === "owner") {
      ok(save);
      const after = (
        await query(
          `select p.name,p.status,i.actual_size,i.price_minor from public.products p join public.thrift_intake i on i.product_id=p.id where p.id=${uuid(product)}`,
        )
      )[0];
      assert.equal(after.name, "Verified disposable edit");
      assert.equal(after.status, "draft");
      assert.equal(after.actual_size, null);
      assert.equal(after.price_minor, 57500);
      assert.equal(
        (
          await query(
            `select count(*)::int as n from public.admin_audit_logs where target_id=${uuid(product)}`,
          )
        )[0].n,
        1,
      );
      const stale = await c.rpc("admin_save_thrift_draft", payload);
      if (stale.error?.code !== "PT409")
        console.log(
          "Stale response diagnostic:",
          JSON.stringify({
            status: stale.status,
            code: stale.error?.code,
            message: stale.error?.message?.slice(0, 150),
          }),
        );
      assert.equal(stale.error?.code, "PT409");
      pass(
        "real owner draft save persists, audit records actor, stale update denied",
      );
      ownerContext = {
        email,
        password,
        secret: factor.totp.secret,
        userId: user.id,
        product,
      };
    } else {
      assert.equal(save.error?.code, "42501");
      pass(role + " cannot save drafts");
    }
    assert(
      (
        await c
          .from("admin_audit_logs")
          .insert({ action: "forged", target_id: product, changes: {} })
      ).error,
    );
    assert(
      (
        await c
          .from("inventory")
          .update({ on_hand: 100 })
          .eq("variant_id", product)
      ).error,
    );
    if (role !== "owner") ok(await c.auth.signOut());
  }
  // Optional browser adapter runs while disposable owner exists; no secrets written to disk.
  if (process.env.ADMIN_VERCEL_DEPLOYMENT_FILE) {
    const { verifyHostedPreview } = await import(
      "./hosted-preview-browser.mjs"
    );
    await verifyHostedPreview(ownerContext);
    pass("hosted Preview browser verified at the exact deployed commit");
  } else if (process.env.ADMIN_BROWSER_BASE) {
    const { verifyAdminBrowser } = await import("./verify-browser.mjs");
    await verifyAdminBrowser({
      ...ownerContext,
      baseURL: process.env.ADMIN_BROWSER_BASE,
    });
    pass(
      "real browser staff sign-in, MFA, protected routes, draft save, logout and responsive UI",
    );
  }
} catch (e) {
  console.error("Admin verification failed: " + e.message);
  process.exitCode = 1;
} finally {
  // Cleanup operations are idempotent and independent: a network failure deleting
  // the product must not prevent deletion of disposable Auth accounts.
  async function clean(operation) {
    for(let attempt=0;attempt<3;attempt++){
      try { await operation(); return true; }
      catch { if(attempt<2) await new Promise(resolve=>setTimeout(resolve,500)); }
    }
    return false;
  }
  const productCleaned=await clean(()=>query(
    `delete from public.admin_audit_logs where target_id=${uuid(product)};delete from public.thrift_intake where product_id=${uuid(product)};delete from public.products where id=${uuid(product)};`, false));
  let usersCleaned=true;
  for(const id of users){if(!await clean(async()=>ok(await operator.auth.admin.deleteUser(id))))usersCleaned=false;}
  if(productCleaned&&usersCleaned)pass("disposable accounts, roles, product and product-edit audit removed; operator provisioning audit retained");
  else {console.error("Fixture cleanup requires investigation.");process.exitCode=1;}
  await mkdir("artifacts/admin", { recursive: true });
  await writeFile(
    "artifacts/admin/hosted-results.json",
    JSON.stringify(
      {
        scope: "Real development Supabase Auth, TOTP MFA and PostgREST",
        passed: checks,
        success: !process.exitCode,
      },
      null,
      2,
    ) + "\n",
  );
}
