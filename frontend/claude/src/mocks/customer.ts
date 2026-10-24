import type { Customer } from "@/types";

/** Sample signed-in customer used by the account UI demo. Not a real person. */
export const mockCustomer: Customer = {
  id: "cus_demo",
  fullName: "Demo Customer",
  email: "demo.customer@example.com",
  phone: "01700000000",
  memberSince: "2025-12-01",
  addresses: [
    {
      id: "addr_home",
      label: "Home",
      fullName: "Demo Customer",
      phone: "01700000000",
      division: "Dhaka",
      district: "Dhaka",
      area: "Dhanmondi",
      addressLine: "House 00, Road 00 (sample address)",
      isDefault: true,
    },
    {
      id: "addr_office",
      label: "Office",
      fullName: "Demo Customer",
      phone: "01700000000",
      division: "Dhaka",
      district: "Dhaka",
      area: "Gulshan",
      addressLine: "Level 0, Sample Tower (sample address)",
      isDefault: false,
    },
  ],
};
