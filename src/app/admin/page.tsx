import { notFound } from "next/navigation";
// Fail closed until server-side identity, permissions and RLS are verified.
export default function AdminPage() { notFound(); }
