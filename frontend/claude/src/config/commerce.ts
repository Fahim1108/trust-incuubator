import type { CommerceSettings, DemoSettings } from "@/types";

export const commerce: CommerceSettings = {
  currencySymbol: "BDT ",
  currencyCode: "BDT",
  locale: "en-BD",
  deliveryCharges: { insideDhaka: 80, outsideDhaka: 130 },
  freeDeliveryThreshold: 2000,
  returnWindowDays: 7,
  codEnabled: true,
  onlinePaymentEnabled: false,
  demoCoupons: [
    { code: "WELCOME10", type: "percent", value: 10, description: "10% off your order (demo coupon)", minSubtotal: 1000 },
    { code: "FREESHIP", type: "free-shipping", value: 0, description: "Free delivery (demo coupon)" },
  ],
};

export const demo: DemoSettings = {
  showNotices: true,
  seedCart: true,
};
