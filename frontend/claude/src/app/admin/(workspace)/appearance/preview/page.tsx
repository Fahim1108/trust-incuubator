import { staffSession } from "@/lib/admin/access";
export default async function AppearanceUnavailable() {
  await staffSession();
  return (
    <main id="main" className="aa-main">
      <h1>Appearance management</h1>
      <p>
        Unavailable: the preserved design editor has no real CMS persistence
        yet. Storefront settings cannot be published from this module.
      </p>
    </main>
  );
}
