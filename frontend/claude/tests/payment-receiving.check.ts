import { describe, expect, it } from "vitest";
import { paymentReceiving, previewPaymentConfiguration } from "../src/config/payment-receiving";
import { manualPaymentBreakdown } from "../src/lib/manual-payment";
import { submitManualPaymentAction } from "../src/services/manual-payment-actions";

describe("central personal recipient configuration", () => {
  it("hides each unconfirmed receiving account", () => {
    expect(previewPaymentConfiguration({ ...paymentReceiving, bkashAuthorized: false, nagadAuthorized: false }).destinations).toEqual([]);
  });
  it("publishes only the provider that has been authorised", () => {
    const configuration = previewPaymentConfiguration({ ...paymentReceiving, bkashAuthorized: true, nagadAuthorized: false });
    expect(configuration.destinations).toEqual([{ provider: "bkash", accountType: "personal", recipientNumber: paymentReceiving.bkashNumber, transferInstructions: "" }]);
    expect(configuration.available).toBe(false);
  });
  it("keeps separate editable numbers and never enables collection from account approval", () => {
    const configuration = previewPaymentConfiguration({ ...paymentReceiving, bkashAuthorized: true, nagadAuthorized: true, nagadNumber: "01700000000" });
    expect(configuration.destinations.map(account => account.recipientNumber)).toEqual([paymentReceiving.bkashNumber, "01700000000"]);
    expect(configuration.available).toBe(false);
    expect(configuration.destinations.every(account => account.transferInstructions === "")).toBe(true);
  });
  it("continues rejecting direct server submissions regardless of public recipient display", async () => {
    const result = await submitManualPaymentAction({ provider: "bkash", transactionId: "TEST1", senderNumber: "01700000000", note: "", orderReference: "forged-reference", idempotencyKey: "11111111-1111-4111-8111-111111111111" });
    expect(result).toMatchObject({ ok: false, reason: "not_connected" });
  });
});

describe("one payment panel for advance and full payment", () => {
  const policy = previewPaymentConfiguration().policy;
  it("uses the COD advance with a remaining balance", () => {
    expect(manualPaymentBreakdown("cod", 200000, "Dhaka", "Dhaka", policy)).toMatchObject({ amountDueMinor: 7000, remainingMinor: 193000 });
    expect(manualPaymentBreakdown("cod", 200000, "Dhaka", "Gazipur", policy)).toMatchObject({ amountDueMinor: 13000, remainingMinor: 187000 });
  });
  it("uses exactly the full total with no remaining COD balance for online preview", () => {
    expect(manualPaymentBreakdown("online", 200050, "Dhaka", "Dhaka", policy)).toEqual({ zone: "inside-dhaka", totalMinor: 200050, amountDueMinor: 200050, remainingMinor: 0 });
  });
  it("does not invent a full-payment quote for missing locations or invalid totals", () => {
    expect(manualPaymentBreakdown("online", 200000, "", "", policy)).toBeNull();
    expect(manualPaymentBreakdown("online", -1, "Dhaka", "Dhaka", policy)).toBeNull();
  });
});
