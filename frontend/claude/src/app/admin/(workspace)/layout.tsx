import {isProductionStorefront} from "@/lib/storefront-policy";
import { staffSession } from "@/lib/admin/access";
import { AdminShell } from "@/components/admin/access/AdminShell";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await staffSession();
  return <AdminShell roles={session.roles} stagingTools={!isProductionStorefront()}>{children}</AdminShell>;
}
