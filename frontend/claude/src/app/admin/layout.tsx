import { notFound } from "next/navigation";
// Appearance components are preserved, but no public admin access is enabled.
// Integrate the existing verified staff authorization before mounting this UI.
export default function AdminLayout() { notFound(); }
