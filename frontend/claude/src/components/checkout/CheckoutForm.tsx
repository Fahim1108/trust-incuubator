"use client";

import { ArrowLeft, ArrowRight, Lock, PackageCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { CouponField } from "@/components/cart/CouponField";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Button, ButtonLink, Checkbox, DemoNotice, EmptyState, Input, Modal, Select, Skeleton, SmartImage, Textarea } from "@/components/ui";
import { commerce } from "@/config";
import { useCart } from "@/context/CartContext";
import { areasOf, districtsOf, divisionNames, isInsideDhaka } from "@/data/bangladesh";
import { formatPrice } from "@/lib/format";
import { isValidBdPhone, isValidEmail, normalizePhone, type FieldErrors } from "@/lib/validation";
import { placeOrderAction } from "@/services/actions";
import type { CheckoutPayload, PaymentMethod } from "@/types";
import { CheckoutSteps } from "./CheckoutSteps";
import { PaymentMethodSelector } from "./PaymentMethodSelector";

type Field = "fullName" | "phone" | "email" | "division" | "district" | "area" | "addressLine";

const STEPS = ["Delivery", "Payment", "Review"];

export function CheckoutForm() {
  const router = useRouter();
  const { items, hydrated, getSummary } = useCart();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<Field, string>>({ fullName: "", phone: "", email: "", division: "", district: "", area: "", addressLine: "" });
  const [note, setNote] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [result, setResult] = useState<{ title: string; message: string; payload: CheckoutPayload } | null>(null);
  const [pending, startTransition] = useTransition();

  const summary = getSummary(form.district || undefined);
  const districts = useMemo(() => districtsOf(form.division), [form.division]);
  const areas = useMemo(() => areasOf(form.district), [form.district]);

  const set = (field: Field, value: string) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "division") Object.assign(next, { district: "", area: "" });
      if (field === "district") next.area = "";
      return next;
    });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: FieldErrors<Field> = {};
    if (form.fullName.trim().length < 3) e.fullName = "Please enter your full name";
    if (!isValidBdPhone(form.phone)) e.phone = "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)";
    if (form.email && !isValidEmail(form.email)) e.email = "Enter a valid email address";
    if (!form.division) e.division = "Select a division";
    if (!form.district) e.district = "Select a district";
    if (!form.area.trim()) e.area = "Select or enter your area";
    if (form.addressLine.trim().length < 8) e.addressLine = "Enter house, road and area details";
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) document.getElementById(`checkout-${first}`)?.focus();
    return !first;
  };

  const next = () => {
    if (step === 0 && !validate()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = () => {
    if (!validate()) return setStep(0);
    const payload: CheckoutPayload = {
      customer: { fullName: form.fullName.trim(), phone: normalizePhone(form.phone), email: form.email.trim() || undefined },
      address: { fullName: form.fullName.trim(), phone: normalizePhone(form.phone), division: form.division, district: form.district, area: form.area.trim(), addressLine: form.addressLine.trim() },
      paymentMethod: payment,
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      couponCode: summary.coupon?.code,
      note: note.trim() || undefined,
      saveAddress,
    };
    startTransition(async () => {
      const res = await placeOrderAction(payload);
      if (res.ok) {
        // Only reachable once a real backend confirms the order.
        router.push(`/account/orders?placed=${encodeURIComponent(res.data.orderNumber)}`);
        return;
      }
      setResult({ title: res.reason === "not_connected" ? "Order not placed" : "Could not place order", message: res.message, payload });
    });
  };

  if (!hydrated)
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <Skeleton className="h-[520px] w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );

  if (!items.length)
    return <EmptyState icon={<ShoppingBag className="h-7 w-7" />} title="Your cart is empty" description="Add products to your cart before checking out." action={<ButtonLink href="/shop">Browse Products</ButtonLink>} />;

  const deliveryLabel = form.district ? (isInsideDhaka(form.district) ? "Inside Dhaka" : "Outside Dhaka") : "Select a district to calculate delivery";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12 [&>*]:min-w-0">
      <div className="min-w-0">
        <DemoNotice force className="mb-5">
          <strong>Checkout UI demonstration.</strong> Orders and payments are not processed until the backend is connected. Placing an order here will not create an order or charge anyone.
        </DemoNotice>
        <CheckoutSteps steps={STEPS} current={step} onStepClick={setStep} />

        <div className="mt-6 rounded-card border border-line p-5 sm:p-7">
          {step === 0 && (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
              className="space-y-5"
            >
              <h2 className="font-serif text-2xl text-ink">Delivery Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input id="checkout-fullName" label="Full Name" required autoComplete="name" placeholder="Enter your full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} error={errors.fullName} wrapperClassName="sm:col-span-2" />
                <Input id="checkout-phone" label="Phone Number" required type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} hint="We'll call to confirm your order." />
                <Input id="checkout-email" label="Email (optional)" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
                <Select id="checkout-division" label="Division" required placeholder="Select division" options={divisionNames.map((d) => ({ value: d, label: d }))} value={form.division} onChange={(e) => set("division", e.target.value)} error={errors.division} />
                <Select
                  id="checkout-district"
                  label="District"
                  required
                  placeholder={form.division ? "Select district" : "Select division first"}
                  disabled={!form.division}
                  options={districts.map((d) => ({ value: d, label: d }))}
                  value={form.district}
                  onChange={(e) => set("district", e.target.value)}
                  error={errors.district}
                />
                {areas.length ? (
                  <Select id="checkout-area" label="Area / Thana" required placeholder="Select area" options={areas.map((a) => ({ value: a, label: a }))} value={form.area} onChange={(e) => set("area", e.target.value)} error={errors.area} wrapperClassName="sm:col-span-2" />
                ) : (
                  <Input id="checkout-area" label="Area / Upazila" required placeholder={form.district ? "e.g. Sadar" : "Select district first"} disabled={!form.district} value={form.area} onChange={(e) => set("area", e.target.value)} error={errors.area} wrapperClassName="sm:col-span-2" />
                )}
                <Textarea id="checkout-addressLine" label="Detailed Address" required autoComplete="street-address" placeholder="House, road, area details" value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} error={errors.addressLine} wrapperClassName="sm:col-span-2" className="min-h-[88px]" />
              </div>
              <Checkbox label="Save this address for next time" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                <Link href="/cart" className="inline-flex items-center justify-center gap-2 text-sm text-ink-muted hover:text-primary">
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Back to cart
                </Link>
                <Button type="submit" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Continue to Payment
                </Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <PaymentMethodSelector value={payment} onChange={setPayment} onlineEnabled={commerce.onlinePaymentEnabled} />
              <Textarea label="Order note (optional)" placeholder="Anything we should know? e.g. preferred delivery time" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[80px]" />
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="ghost" onClick={() => setStep(0)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back
                </Button>
                <Button size="lg" onClick={next} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-ink">Review your order</h2>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-control bg-[#F9F8F7] p-4">
                  <dt className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Deliver to
                    <button type="button" onClick={() => setStep(0)} className="normal-case tracking-normal text-primary underline underline-offset-4">
                      Edit
                    </button>
                  </dt>
                  <dd className="mt-2 leading-relaxed text-ink">
                    {form.fullName}
                    <br />
                    {form.phone}
                    <br />
                    {form.addressLine}, {form.area}, {form.district}, {form.division}
                  </dd>
                </div>
                <div className="rounded-control bg-[#F9F8F7] p-4">
                  <dt className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Payment
                    <button type="button" onClick={() => setStep(1)} className="normal-case tracking-normal text-primary underline underline-offset-4">
                      Edit
                    </button>
                  </dt>
                  <dd className="mt-2 text-ink">{payment === "cod" ? "Cash on Delivery" : "Online Payment"}</dd>
                  <dd className="mt-1 text-xs text-ink-muted">{deliveryLabel}</dd>
                </div>
              </dl>
              <ul className="divide-y divide-line border-y border-line">
                {items.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 py-3">
                    <span className="relative h-16 w-[52px] shrink-0 overflow-hidden rounded bg-[#F4F2F0]">
                      <SmartImage src={i.image.src} alt="" fill sizes="52px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{i.name}</span>
                      <span className="block text-xs text-ink-muted">
                        {i.colorName} · {i.size} · Qty {i.quantity}
                      </span>
                    </span>
                    <span className="text-sm font-medium">{formatPrice(i.unitPrice * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="ghost" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back
                </Button>
                <Button size="lg" onClick={placeOrder} loading={pending} leftIcon={<Lock className="h-4 w-4" />}>
                  Place Order ({payment === "cod" ? "COD" : "Online"}) · {formatPrice(summary.total)}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="space-y-5 rounded-card border border-line p-5 sm:p-6">
          <h2 className="font-serif text-2xl text-ink">Order Summary</h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-[#F4F2F0]">
                  <SmartImage src={i.image.src} alt="" fill sizes="44px" className="object-cover" />
                  <span className="absolute -right-0 -top-0 flex h-4 min-w-4 items-center justify-center rounded-bl bg-ink px-1 text-[9px] text-white">{i.quantity}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs text-ink">{i.name}</span>
                  <span className="block text-[11px] text-ink-muted">
                    {i.colorName} · {i.size}
                  </span>
                </span>
                <span className="text-xs font-medium">{formatPrice(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <CouponField />
          <OrderSummary summary={summary} title={null} deliveryNote={deliveryLabel} />
        </div>
      </aside>

      <Modal
        open={Boolean(result)}
        onClose={() => setResult(null)}
        title={result?.title ?? ""}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setResult(null)}>Back to checkout</Button>
          </div>
        }
      >
        {result && (
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3 rounded-control bg-selected p-4 text-primary">
              <PackageCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <p>{result.message}</p>
            </div>
            <p className="text-ink-muted">Your cart has been kept. When the backend is connected, this button will create a real order with the payload below:</p>
            <pre className="max-h-56 overflow-auto rounded-control bg-ink p-3 text-[11px] leading-relaxed text-white/90">{JSON.stringify(result.payload, null, 2)}</pre>
          </div>
        )}
      </Modal>
    </div>
  );
}
