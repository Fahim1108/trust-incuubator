import { DIVISIONS } from "@/data/bangladesh";
import { isValidBdPhone, normalizePhone } from "./validation";
import type { AdvancePolicy, PaymentSubmissionInput, VerifiedAdvanceOrder } from "@/types/manual-payment";

export function classifyAdvanceLocation(division: string, district: string) {
  if (!DIVISIONS[division]?.includes(district)) return null;
  // Explicit preview policy: Dhaka district (including its listed thanas),
  // rather than a customer-controlled "inside" label. Live zones need approval.
  return division === "Dhaka" && district === "Dhaka" ? "inside-dhaka" : "outside-dhaka";
}

export function advanceBreakdown(totalMinor: number, division: string, district: string, policy: AdvancePolicy) {
  const zone = classifyAdvanceLocation(division, district);
  if (!zone || !Number.isSafeInteger(totalMinor) || totalMinor < 0 || policy.credit !== "against-order-total") return null;
  const advanceMinor = zone === "inside-dhaka" ? policy.insideDhakaMinor : policy.outsideDhakaMinor;
  if (!Number.isSafeInteger(advanceMinor) || advanceMinor < 0 || advanceMinor > totalMinor) return null;
  return { zone, totalMinor, advanceMinor, remainingMinor: totalMinor - advanceMinor };
}

export function formatPaymentAmount(minor: number) {
  if (!Number.isSafeInteger(minor) || minor < 0) return "Unavailable";
  return `৳${new Intl.NumberFormat("en-BD", { minimumFractionDigits: minor % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(minor / 100)}`;
}

export function validatePaymentDetails(input: unknown):
  | { ok: true; data: PaymentSubmissionInput }
  | { ok: false; errors: Partial<Record<"transactionId" | "senderNumber" | "note" | "form", string>> } {
  if (!input || typeof input !== "object") return { ok: false, errors: { form: "Invalid payment details." } };
  const value = input as Record<string, unknown>;
  const transactionId = typeof value.transactionId === "string" ? value.transactionId.trim() : "";
  const senderNumber = typeof value.senderNumber === "string" ? normalizePhone(value.senderNumber.trim()) : "";
  const note = typeof value.note === "string" ? value.note.trim() : "";
  const errors: Partial<Record<"transactionId" | "senderNumber" | "note" | "form", string>> = {};
  if (!transactionId || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(transactionId) || transactionId.length > 128) errors.transactionId = "Enter the Transaction ID using letters, numbers, dots, hyphens or underscores.";
  if (!isValidBdPhone(senderNumber)) errors.senderNumber = "Enter a valid Bangladesh mobile number.";
  if (note.length > 1000 || (value.note !== undefined && typeof value.note !== "string")) errors.note = "Use up to 1,000 characters.";
  if (value.provider !== "bkash" && value.provider !== "nagad") errors.form = "Choose bKash or Nagad.";
  const idempotencyKey = typeof value.idempotencyKey === "string" ? value.idempotencyKey : "";
  const provider = value.provider === "bkash" || value.provider === "nagad" ? value.provider : null;
  const orderReference = typeof value.orderReference === "string" ? value.orderReference.trim() : null;
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(idempotencyKey)) errors.form = "Reload the page before submitting.";
  if (value.orderReference !== null && (typeof value.orderReference !== "string" || !value.orderReference.trim() || value.orderReference.length > 128)) errors.form = "Invalid order reference.";
  if (Object.keys(errors).length || !provider) return { ok: false, errors };
  return { ok: true, data: { provider, transactionId, senderNumber, note, idempotencyKey, orderReference } };
}

/** Presentation guard only; a live server must authorize and verify the receipt. */
export function canDisplayConfirmedOrder(order: unknown): order is VerifiedAdvanceOrder {
  if (!order || typeof order !== "object" || Array.isArray(order)) return false;
  const value = order as Record<string, unknown>;
  const isMinor = (amount: unknown): amount is number => typeof amount === "number" && Number.isSafeInteger(amount) && amount >= 0;
  return typeof value.orderId === "string" && !!value.orderId.trim() && typeof value.orderReference === "string" && !!value.orderReference.trim() && typeof value.createdAt === "string" && !Number.isNaN(Date.parse(value.createdAt)) &&
    value.orderStatus === "confirmed" && value.advanceStatus === "advance_verified" && (value.provider === "bkash" || value.provider === "nagad") &&
    isMinor(value.totalMinor) && isMinor(value.advanceMinor) && isMinor(value.remainingMinor) && value.advanceMinor > 0 && value.advanceMinor + value.remainingMinor === value.totalMinor;
}
