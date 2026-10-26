import type { ActionResult } from "./commerce";

export type AdvanceProvider = "bkash" | "nagad";
export interface AdvancePolicy {
  insideDhakaMinor: number;
  outsideDhakaMinor: number;
  credit: "against-order-total";
}
export interface PaymentDestination {
  provider: AdvanceProvider;
  recipientNumber: string;
  accountType: "personal" | "merchant";
  /** Approved, account-specific plain text; never executable HTML. */
  transferInstructions: string;
}
export interface ManualPaymentConfiguration {
  available: boolean;
  policy: AdvancePolicy;
  destinations: PaymentDestination[];
}
export interface PaymentSubmissionInput {
  provider: AdvanceProvider;
  transactionId: string;
  senderNumber: string;
  note: string;
  idempotencyKey: string;
  orderReference: string | null;
}
export interface PaymentSubmissionReceipt {
  submissionId: string;
  orderReference: string;
  status: "submitted" | "under_review";
}
export type PaymentSubmissionResult = ActionResult<PaymentSubmissionReceipt>;

/** Immutable purchased-line snapshot returned only by an authorized order service. */
export interface ConfirmedOrderItemSnapshot {
  name: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  size?: string;
  color?: string;
}

export interface ConfirmedOrderDeliverySnapshot {
  recipientName: string;
  addressLines: string[];
  district?: string;
  division?: string;
  zoneLabel?: string;
  estimatedDelivery?: string;
}

/** All amounts here are integer BDT minor units (100 paisa = ৳1). */
export interface VerifiedAdvanceOrder {
  orderId: string;
  orderReference: string;
  createdAt: string;
  orderStatus: "confirmed";
  advanceStatus: "advance_verified";
  provider: AdvanceProvider;
  totalMinor: number;
  advanceMinor: number;
  remainingMinor: number;
  /** Optional trusted snapshots: absent data is never replaced with fixtures. */
  items?: ConfirmedOrderItemSnapshot[];
  delivery?: ConfirmedOrderDeliverySnapshot;
  subtotalMinor?: number;
  deliveryMinor?: number;
  discountMinor?: number;
}
