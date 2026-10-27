import { z } from "zod";
import { staffSession } from "@/lib/admin/access";
export default async function AuditPage() {
  const { client, roles } = await staffSession();
  if (!roles.some((r) => r === "owner" || r === "product_manager"))
    return (
      <main id="main" className="aa-main">
        <h1>Audit access unavailable</h1>
        <p>Your role cannot read catalogue change records.</p>
      </main>
    );
  const result = await client
    .from("admin_audit_logs")
    .select("id,actor_id,action,target_id,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (result.error) throw new Error("Unable to retrieve audit records.");
  const rows = z
    .array(
      z.object({
        id: z.uuid(),
        actor_id: z.uuid().nullable(),
        action: z.string(),
        target_id: z.uuid(),
        created_at: z.iso.datetime({ offset: true }),
      }),
    )
    .parse(result.data);
  return (
    <main id="main" className="aa-main">
      <p className="aa-eyebrow">Security / Accountability</p>
      <h1>Catalogue audit log</h1>
      <p>
        Latest 50 persisted catalogue edits. Records cannot be changed or
        deleted through staff access.
      </p>
      {rows.length ? (
        rows.map((r) => (
          <article className="aa-panel" key={r.id}>
            <h2>{r.action.replaceAll(".", " / ").replaceAll("_", " ")}</h2>
            <p>
              <time dateTime={r.created_at}>
                {new Intl.DateTimeFormat("en-GB", {
                  timeZone: "Asia/Dhaka",
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(r.created_at))}{" "}
                (Dhaka)
              </time>
            </p>
            <p>Product: {r.target_id}</p>
            <p>Staff account: {r.actor_id || "Removed account"}</p>
          </article>
        ))
      ) : (
        <section className="aa-panel">
          No catalogue edits have been recorded.
        </section>
      )}
    </main>
  );
}
