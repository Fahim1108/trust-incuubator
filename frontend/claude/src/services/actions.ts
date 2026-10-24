"use server";

/**
 * Server Actions callable from client components. Each one delegates to the
 * active data source. With the mock adapter every mutation returns
 * `{ ok: false, reason: "not_connected" }` — the UI shows that honestly.
 *
 * Codex: add auth/session checks and input validation (e.g. zod) here when
 * connecting Supabase.
 */
import type { Address, CheckoutPayload, Customer, StorefrontSettings } from "@/types";
import { dataSource } from "./adapters";

export async function searchSuggestionsAction(term: string) {
  return dataSource.searchSuggestions(term.slice(0, 80), 6);
}

export async function getProductsByIdsAction(ids: string[]) {
  return dataSource.getProductsByIds(ids.slice(0, 100));
}

export async function getOrderByNumberAction(orderNumber: string, phone?: string) {
  return dataSource.getOrderByNumber(orderNumber, phone);
}

export async function placeOrderAction(payload: CheckoutPayload) {
  return dataSource.placeOrder(payload);
}

export async function signInAction(input: { identifier: string; password: string }) {
  return dataSource.signIn(input);
}

export async function registerAction(input: { fullName: string; email: string; phone: string; password: string }) {
  return dataSource.register(input);
}

export async function requestPasswordResetAction(input: { identifier: string }) {
  return dataSource.requestPasswordReset(input);
}

export async function updateProfileAction(input: Pick<Customer, "fullName" | "email" | "phone">) {
  return dataSource.updateProfile(input);
}

export async function saveAddressAction(address: Address) {
  return dataSource.saveAddress(address);
}

export async function deleteAddressAction(addressId: string) {
  return dataSource.deleteAddress(addressId);
}

export async function subscribeNewsletterAction(email: string) {
  return dataSource.subscribeNewsletter(email);
}

export async function submitContactFormAction(input: { name: string; email: string; phone?: string; subject: string; message: string }) {
  return dataSource.submitContactForm(input);
}

export async function saveStorefrontDraftAction(settings: StorefrontSettings) {
  return dataSource.saveStorefrontDraft(settings);
}

export async function publishStorefrontSettingsAction(settings: StorefrontSettings) {
  return dataSource.publishStorefrontSettings(settings);
}

export async function uploadMediaAction(file: { name: string; type: string; size: number }) {
  return dataSource.uploadMedia(file);
}
