import type { Metadata } from "next";
import { AddressManager } from "@/components/account/AddressManager";
import { getCurrentCustomer } from "@/services";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const customer = await getCurrentCustomer();
  return <AddressManager initial={customer?.addresses ?? []} />;
}
