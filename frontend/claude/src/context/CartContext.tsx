"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {reconcileCartLines} from "@/lib/cart-catalogue";
import type {Product} from "@/types";
import { commerce } from "@/config";
import { isInsideDhaka } from "@/data/bangladesh";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import type { CartItem, Coupon, OrderSummary } from "@/types";

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
  coupon?: Coupon;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  /** Summary for a given delivery district (defaults to inside Dhaka). */
  getSummary: (district?: string) => OrderSummary;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Local cart state persisted to localStorage.
 * Codex: when a server cart exists, sync `items` with it here (the API of this
 * context can stay the same, so components need no changes).
 */
export function CartProvider({ children, initialItems = [], approvedVariantIds = initialItems.map(i=>i.variantId), approvedProducts=[] }: { children: ReactNode; initialItems?: CartItem[]; approvedVariantIds?: string[]; approvedProducts?:Product[] }) {
  const [approvedIds] = useState(()=>new Set(approvedVariantIds));
  const [initialSeed] = useState(initialItems);
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | undefined>();
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
    const stored = readStorage<CartItem[] | null>(STORAGE_KEYS.cart, null);
    const seeded = readStorage<boolean>(STORAGE_KEYS.cartSeeded, false);
    if (stored) setItems(reconcileCartLines(stored,approvedProducts).filter(item=>approvedIds.has(item.variantId)));
    else if (initialSeed.length && !seeded) {
      setItems(initialSeed);
      writeStorage(STORAGE_KEYS.cartSeeded, true);
    }
    setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [initialSeed, approvedIds, approvedProducts]);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.cart, items);
  }, [items, hydrated]);

  const addItem = useCallback<CartContextValue["addItem"]>((item, quantity = 1) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1 || item.maxQuantity < 1) return;
    const approved=reconcileCartLines([{variantId:item.variantId,quantity}],approvedProducts)[0];
    if(!approved||!approvedIds.has(approved.variantId))return;
    item=approved;
    setItems((current) => {
      const existing = current.find((i) => i.id === item.id);
      if (existing) {
        return current.map((i) => (i.id === item.id ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxQuantity) } : i));
      }
      return [...current, { ...item, quantity: Math.min(quantity, item.maxQuantity) }];
    });
  }, [approvedProducts,approvedIds]);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setItems((current) => current.map((i) => (i.id === lineId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQuantity)) } : i)));
  }, []);

  const removeItem = useCallback((lineId: string) => setItems((current) => current.filter((i) => i.id !== lineId)), []);
  const clear = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const applyCoupon = useCallback(() => ({ok:false,message:'Please sign in to redeem your coupon. Server validation is required.'}), []);

  const getSummary = useCallback(
    (district?: string): OrderSummary => {
      const itemCount = items.reduce((n, i) => n + i.quantity, 0);
      let discount = 0;
      if (coupon?.type === "percent") discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon?.type === "fixed") discount = Math.min(coupon.value, subtotal);
      const baseDelivery = district && !isInsideDhaka(district) ? commerce.deliveryCharges.outsideDhaka : commerce.deliveryCharges.insideDhaka;
      const free = coupon?.type === "free-shipping" || subtotal >= commerce.freeDeliveryThreshold;
      const deliveryCharge = itemCount === 0 || free ? 0 : baseDelivery;
      return { itemCount, subtotal, discount, deliveryCharge, total: Math.max(0, subtotal - discount + deliveryCharge), coupon };
    },
    [items, coupon, subtotal],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      itemCount: items.reduce((n, i) => n + i.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clear,
      coupon,
      applyCoupon,
      removeCoupon: () => setCoupon(undefined),
      getSummary,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [items, hydrated, addItem, updateQuantity, removeItem, clear, coupon, applyCoupon, getSummary, isDrawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
