// Development only. Default is a transaction-rolled-back migration dry run.
import { readFile } from "node:fs/promises";
import { query, literal, projectRef } from "../lib/supabase-development.mjs";
const names = [
  "20261027000100_order_number_foundation",
  "20261027000200_admin_catalogue",
  "20261027000300_admin_edit_conflicts",
  "20261028000100_thrift_measurements",
  "20261028000200_create_product_draft",
];
const history = await query(
  "select version from supabase_migrations.schema_migrations order by version",
);
const applied = new Set(history.map((r) => r.version));
let body = "";
for (const name of names) {
  const version = name.slice(0, 14);
  if (applied.has(version)) continue;
  const sql = await readFile(`supabase/migrations/${name}.sql`, "utf8");
  body += sql.replace(/^begin;\s*/i, "").replace(/commit;\s*$/i, "") + "\n";
  body += `insert into supabase_migrations.schema_migrations(version,name,statements) values (${literal(version)},${literal(name.slice(15))},ARRAY[${literal(sql)}]);\n`;
}
if (!body) {
  console.log("No pending admin foundation migrations.");
  process.exit(0);
}
await query("begin;\n" + body + "\nrollback;", false);
console.log("Development migration dry run passed: " + projectRef);
if (process.argv.includes("--apply")) {
  await query("begin;\n" + body + "\ncommit;", false);
  console.log(
    "Applied additive migrations to the fixed development project only. No existing product data changed.",
  );
} else
  console.log(
    "No changes persisted. Pass --apply after reviewing the migrations.",
  );
