/**
 * Editable copy for informational pages. TEMPLATE TEXT — have it reviewed
 * (especially privacy and terms) before launch.
 */
export interface PolicySection {
  heading: string;
  body?: string[];
  list?: string[];
}

export interface PolicyPage {
  slug: string;
  title: string;
  intro: string;
  updated: string;
  sections: PolicySection[];
}

export const policyPages: Record<string, PolicyPage> = {
  "shipping-policy": {
    slug: "shipping-policy",
    title: "Shipping Policy",
    intro: "We deliver across all 64 districts of Bangladesh through trusted courier partners.",
    updated: "2026-10-01",
    sections: [
      { heading: "Delivery charges", list: ["Inside Dhaka: ৳80", "Outside Dhaka: ৳130", "Free delivery on orders over ৳2,000"] },
      { heading: "Delivery time", list: ["Inside Dhaka: 1–2 working days", "Outside Dhaka: 3–5 working days", "Delivery may take longer during Eid, public holidays, hartals or severe weather."] },
      { heading: "Order confirmation", body: ["For Cash on Delivery orders, our team calls the number you provide to confirm the order before dispatch. Orders that cannot be confirmed after two attempts may be cancelled."] },
      { heading: "Checking your parcel", body: ["You may check the product in front of the delivery rider before paying. If something is wrong, you can refuse the parcel and pay only the delivery charge."] },
    ],
  },
  "return-policy": {
    slug: "return-policy",
    title: "Return & Exchange Policy",
    intro: "Not the right fit? You can return or exchange eligible items within 7 days of delivery.",
    updated: "2026-10-01",
    sections: [
      { heading: "Eligibility", list: ["Items must be unused, unwashed and in original packaging with tags attached.", "Request a return within 7 days of delivery.", "Watches and wallets must be returned with all boxes and inserts."] },
      { heading: "Non-returnable items", list: ["Items damaged after delivery", "Items bought during clearance sales (unless faulty)", "Gift cards"] },
      { heading: "How to request a return", body: ["Contact us with your order number and photos of the item. We will arrange a pickup or share the drop-off address."] },
      { heading: "Refunds", body: ["Approved refunds are sent via bKash, Nagad or bank transfer within 7 working days after we receive the item. Delivery charges are non-refundable unless the item was faulty or incorrect."] },
      { heading: "Exchanges", body: ["Size and colour exchanges are free once per order, subject to availability."] },
    ],
  },
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    intro: "This policy explains what personal information we collect and how we use it.",
    updated: "2026-10-01",
    sections: [
      { heading: "Information we collect", list: ["Name, phone number, email and delivery address you provide at checkout or registration", "Order history and wishlist", "Device and browsing information collected through cookies"] },
      { heading: "How we use it", list: ["To process, confirm and deliver your orders", "To provide customer support", "To send updates or offers you have opted in to", "To improve our website and prevent fraud"] },
      { heading: "Sharing", body: ["We share delivery details with courier partners only to fulfil your order. We never sell your personal information."] },
      { heading: "Your choices", body: ["You can update your profile, unsubscribe from emails, or ask us to delete your account by contacting support."] },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    intro: "By using this website and placing an order you agree to the following terms.",
    updated: "2026-10-01",
    sections: [
      { heading: "Products and pricing", body: ["We try to display products, colours and prices accurately. Colours may vary slightly between screens. Prices are in Bangladeshi Taka (BDT) and may change without notice."] },
      { heading: "Orders", body: ["An order is confirmed only after we accept it and confirm by phone or message. We may cancel orders in case of stock issues, pricing errors or suspected fraud."] },
      { heading: "Payment", body: ["We accept Cash on Delivery. Online payment options will be available when announced."] },
      { heading: "Liability", body: ["Our liability for any order is limited to the value of that order."] },
      { heading: "Governing law", body: ["These terms are governed by the laws of Bangladesh."] },
    ],
  },
};

export const faqs: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Orders & Payment",
    items: [
      { q: "How do I place an order?", a: "Add products to your cart, go to checkout, enter your delivery details and choose Cash on Delivery. Our team will call to confirm." },
      { q: "Which payment methods do you accept?", a: "Cash on Delivery is available across Bangladesh. bKash, Nagad and card payments are coming soon." },
      { q: "Can I change or cancel my order?", a: "Yes — contact us before the order is dispatched and we will update or cancel it." },
    ],
  },
  {
    category: "Delivery",
    items: [
      { q: "How long does delivery take?", a: "1–2 working days inside Dhaka and 3–5 working days outside Dhaka." },
      { q: "How much is delivery?", a: "৳80 inside Dhaka and ৳130 outside Dhaka. Delivery is free on orders over ৳2,000." },
      { q: "Can I check the product before paying?", a: "Yes. You can inspect your parcel in front of the rider before paying." },
    ],
  },
  {
    category: "Returns & Sizing",
    items: [
      { q: "What is your return policy?", a: "Unused items with tags can be returned or exchanged within 7 days of delivery." },
      { q: "How do I find my size?", a: "Every product page has a Size Guide with measurements. If you're between sizes, we recommend sizing up." },
    ],
  },
];
