import type { Metadata } from "next";
import { AppearanceEditor } from "@/components/admin/AppearanceEditor";
import { getStorefrontSettings } from "@/services";

export const metadata: Metadata = { title: "Appearance Editor" };

export default async function AppearancePage() {
  const settings = await getStorefrontSettings();
  return <AppearanceEditor initial={settings} />;
}
