"use client";

import { Copy, Info } from "lucide-react";
import { useId, useRef, useState, useTransition } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { advanceBreakdown, formatPaymentAmount, validatePaymentDetails } from "@/lib/manual-payment";
import { submitManualPaymentAction } from "@/services/manual-payment-actions";
import type { AdvanceProvider, ManualPaymentConfiguration, PaymentSubmissionReceipt } from "@/types/manual-payment";

const names = { bkash: "bKash", nagad: "Nagad" };

export function ManualAdvancePayment({ configuration, totalMinor, division, district, orderReference = null }: {
  configuration: ManualPaymentConfiguration;
  totalMinor: number;
  division: string;
  district: string;
  orderReference?: string | null;
}) {
  const id = useId();
  const [provider, setProvider] = useState<AdvanceProvider>("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"transactionId" | "senderNumber" | "note" | "form", string>>>({});
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [receipt, setReceipt] = useState<PaymentSubmissionReceipt | null>(null);
  const [pending, start] = useTransition();
  const inFlight = useRef(false);
  const submissionKey = useRef<{ fingerprint: string; key: string } | null>(null);
  const destination = configuration.available ? configuration.destinations.find(d => d.provider === provider) : undefined;
  const breakdown = advanceBreakdown(totalMinor, division, district, configuration.policy);

  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setCopyMessage(`${label} copied.`); }
    catch { setCopyMessage(`Could not copy ${label.toLowerCase()}. Please select and copy it manually.`); }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || receipt) return;
    if (!breakdown) { setMessage("Select a valid delivery location before submitting."); return; }
    const fingerprint = JSON.stringify([orderReference, provider, transactionId.trim(), senderNumber.trim(), note.trim()]);
    if (submissionKey.current?.fingerprint !== fingerprint) submissionKey.current = { fingerprint, key: crypto.randomUUID() };
    const parsed = validatePaymentDetails({ provider, transactionId, senderNumber, note, orderReference, idempotencyKey: submissionKey.current.key });
    if (!parsed.ok) {
      setErrors(parsed.errors);
      const first = Object.keys(parsed.errors)[0];
      if (first) document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    setErrors({}); setMessage(""); setTransactionId(parsed.data.transactionId); setSenderNumber(parsed.data.senderNumber);
    inFlight.current = true;
    start(async () => {
      try {
        const result = await submitManualPaymentAction(parsed.data);
        if (result.ok) setReceipt(result.data);
        else setMessage(result.message);
      } catch {
        setMessage("Payment details could not be submitted. Check your payment status with support before trying again. No order confirmation was received.");
      } finally { inFlight.current = false; }
    });
  }

  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-5 border-t border-[#EAEAEA] pt-5" data-advance-payment>
      <div>
        <h3 id={`${id}-heading`} className="font-serif text-2xl">COD advance payment</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#74706C]">The advance is credited against your total. Delivery is already included in that total; this is not an additional delivery fee.</p>
      </div>
      <dl className="space-y-2 rounded-lg border border-[#EAEAEA] bg-white p-4 text-sm" data-advance-breakdown>
        <div className="flex justify-between gap-4"><dt>Order reference</dt><dd className="break-all text-right">{orderReference ?? "Not created yet"}</dd></div>
        <div className="flex justify-between gap-4"><dt>Total order amount</dt><dd>{formatPaymentAmount(totalMinor)}</dd></div>
        <div className="flex justify-between gap-4 font-semibold text-primary"><dt>Required advance</dt><dd data-required-advance>{breakdown ? formatPaymentAmount(breakdown.advanceMinor) : "Select location"}</dd></div>
        <div className="flex justify-between gap-4 border-t border-[#EAEAEA] pt-2"><dt>Remaining on delivery</dt><dd data-remaining-balance>{breakdown ? formatPaymentAmount(breakdown.remainingMinor) : "—"}</dd></div>
      </dl>
      {breakdown && <p className="text-sm text-[#74706C]">{breakdown.zone === "inside-dhaka" ? "Inside Dhaka district" : "Outside Dhaka district"}: {formatPaymentAmount(breakdown.advanceMinor)} advance required to confirm COD. Amounts shown are estimates until a secure order quote is available.</p>}
      <div role="tablist" aria-label="Advance payment method" className="grid grid-cols-2 gap-2">
        {(["bkash", "nagad"] as const).map((method, index) => (
          <button key={method} id={`${id}-${method}`} type="button" role="tab" aria-selected={provider === method}
            aria-controls={`${id}-panel`} tabIndex={provider === method ? 0 : -1} disabled={pending || !!receipt}
            onClick={() => { setProvider(method); setCopyMessage(""); }}
            onKeyDown={event => {
              const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : ["ArrowLeft", "ArrowRight"].includes(event.key) ? 1 - index : null;
              if (next === null) return;
              event.preventDefault(); setProvider(next ? "nagad" : "bkash");
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
            }}
            className={`aa-press min-h-12 rounded-lg border bg-white px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${provider === method ? "border-primary text-primary" : "border-[#EAEAEA] text-[#74706C]"}`}>
            {names[method]}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${provider}`} className="space-y-4 rounded-lg border border-[#EAEAEA] bg-white p-4">
        <h4 className="font-semibold">{names[provider]} advance</h4>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs text-[#74706C]">Recipient number</p><p className="mt-1 font-medium">{destination?.recipientNumber ?? "Not configured"}</p></div>
          <Button size="sm" variant="outline" disabled={!destination} onClick={() => destination && void copy(destination.recipientNumber, "Number")} leftIcon={<Copy size={14} />}>Copy Number</Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs text-[#74706C]">Exact advance amount</p><p className="mt-1 text-lg font-semibold text-primary">{breakdown ? formatPaymentAmount(breakdown.advanceMinor) : "Select location"}</p></div>
          <Button size="sm" variant="outline" disabled={!breakdown} onClick={() => breakdown && void copy((breakdown.advanceMinor / 100).toFixed(breakdown.advanceMinor % 100 ? 2 : 0), "Amount")} leftIcon={<Copy size={14} />}>Copy Amount</Button>
        </div>
        <p role="status" className="min-h-4 text-xs text-primary">{copyMessage}</p>
        <h4 className="font-semibold">How to pay</h4>
        {destination ? <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#74706C]">
          <li>Open {names[provider]}.</li><li>{destination.transferInstructions}</li>
          <li>Send the exact required advance amount.</li><li>Copy the Transaction ID.</li><li>Return here and submit your payment information.</li>
        </ol> : <p className="flex items-start gap-2 text-sm leading-relaxed text-primary"><Info className="mt-0.5 shrink-0" size={17} aria-hidden />Payment collection is unavailable. Do not send money. Approved receiving-account instructions will appear here when configured.</p>}
      </div>
      {receipt ? <div role="status" className="space-y-2 rounded-lg border border-[#EAEAEA] p-5">
        <h4 className="font-serif text-2xl">Payment Details Submitted</h4>
        <p>Your payment is awaiting verification.</p><p className="text-sm">Order reference: {receipt.orderReference}</p>
      </div> : <form noValidate onSubmit={submit} className="space-y-4 [&_label]:text-sm" aria-label="Submit advance payment details" data-payment-form>
        <p className="text-sm text-[#74706C]">Never share your PIN or OTP. Submissions are unavailable; payment details will not be saved.</p>
        <fieldset disabled={pending} className="space-y-4">
          <Input id={`${id}-transactionId`} label="Transaction ID" required maxLength={128} autoComplete="off" autoCapitalize="characters" spellCheck={false} value={transactionId} onChange={e => { setTransactionId(e.target.value); setErrors(current => ({ ...current, transactionId: undefined })); }} onBlur={() => setTransactionId(s => s.trim())} error={errors.transactionId} />
          <Input id={`${id}-senderNumber`} label={`Your ${names[provider]} Number`} required type="tel" inputMode="tel" autoComplete="tel" value={senderNumber} onChange={e => { setSenderNumber(e.target.value); setErrors(current => ({ ...current, senderNumber: undefined })); }} error={errors.senderNumber} />
          <Textarea id={`${id}-note`} label="Note (optional)" maxLength={1000} rows={3} value={note} onChange={e => { setNote(e.target.value); setErrors(current => ({ ...current, note: undefined })); }} error={errors.note} />
          {(message || errors.form) && <p role="alert" className="text-sm leading-relaxed text-primary">{message || errors.form}</p>}
          <Button type="submit" fullWidth size="lg" loading={pending} disabled={!breakdown} className="bg-[#400000] hover:bg-[#560000]">Submit Payment</Button>
        </fieldset>
      </form>}
    </section>
  );
}
