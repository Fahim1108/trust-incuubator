"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StorefrontSettings } from "@/types";

const StorefrontContext = createContext<StorefrontSettings | null>(null);

/** Provides storefront settings to client components (header, footer, cards). */
export function StorefrontProvider({ settings, children }: { settings: StorefrontSettings; children: ReactNode }) {
  return <StorefrontContext.Provider value={settings}>{children}</StorefrontContext.Provider>;
}

export function useStorefront(): StorefrontSettings {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error("useStorefront must be used inside <StorefrontProvider>");
  return ctx;
}
