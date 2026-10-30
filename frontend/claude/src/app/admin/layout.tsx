import type { Metadata } from "next";
import "./admin.css";
import {isProductionStorefront} from '@/lib/storefront-policy';
export const metadata: Metadata = {
  title: "Administration | Attires Arena",
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={'aa-admin'+(isProductionStorefront()?'':' aa-admin--dark')}>{children}</div>;
}
