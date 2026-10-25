import type { ManualPaymentConfiguration } from "@/types/manual-payment";

// Temporary editable configuration for the isolated Preview. These are public
// receiving details, not gateway credentials. Replace with an authorized DAL.
const temporaryReceivingNumber = "01635706962";
export const paymentReceiving = {
  bkashNumber: temporaryReceivingNumber,
  nagadNumber: temporaryReceivingNumber,
  // Confirmed by the store owner in this session, not a gateway verification.
  bkashAuthorized: true,
  nagadAuthorized: true,
};

export function previewPaymentConfiguration(receiving = paymentReceiving): ManualPaymentConfiguration {
  const destinations: ManualPaymentConfiguration["destinations"] = [];
  if (receiving.bkashAuthorized) destinations.push({ provider: "bkash", recipientNumber: receiving.bkashNumber, accountType: "personal", transferInstructions: "" });
  if (receiving.nagadAuthorized) destinations.push({ provider: "nagad", recipientNumber: receiving.nagadNumber, accountType: "personal", transferInstructions: "" });
  // Recipient approval is NOT an authorization to collect, persist or verify.
  return { available: false, destinations, policy: { insideDhakaMinor: 7000, outsideDhakaMinor: 13000, credit: "against-order-total" } };
}
