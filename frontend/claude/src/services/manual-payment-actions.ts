"use server";

import { validatePaymentDetails } from "@/lib/manual-payment";
import type { PaymentSubmissionResult } from "@/types/manual-payment";
import { dataSource } from "./adapters";

export async function submitManualPaymentAction(input: unknown): Promise<PaymentSubmissionResult> {
  const parsed = validatePaymentDetails(input);
  if (!parsed.ok) return { ok: false, reason: "validation", message: Object.values(parsed.errors)[0] ?? "Check your payment details." };
  const configuration = await dataSource.getManualPaymentConfiguration();
  // Fail closed before any mutation. No UI flag, TrxID, or browser amount can
  // activate payments; the future authenticated adapter must authorize a draft.
  if (!configuration.available || !configuration.destinations.some(d => d.provider === parsed.data.provider)) {
    return { ok: false, reason: "not_connected", message: "Payment submission is unavailable. No payment details were saved and no order was confirmed. Do not send money." };
  }
  if (!parsed.data.orderReference) return { ok: false, reason: "validation", message: "A secure pending-order reference is required before submitting payment." };
  return dataSource.submitManualPayment(parsed.data);
}
