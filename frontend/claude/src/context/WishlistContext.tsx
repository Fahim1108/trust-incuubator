"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

interface WishlistContextValue {
  ids: string[];
  hydrated: boolean;
  has: (productId: string) => boolean;
  toggle: (productId: string) => boolean;
  remove: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

/** Wishlist stored in this browser only. Codex: sync with a `wishlists` table for signed-in users. */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
    setIds(readStorage<string[]>(STORAGE_KEYS.wishlist, []));
    setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.wishlist, ids);
  }, [ids, hydrated]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: string) => {
      const adding = !ids.includes(id);
      setIds((cur) => (adding ? [...cur, id] : cur.filter((x) => x !== id)));
      return adding;
    },
    [ids],
  );
  const remove = useCallback((id: string) => setIds((cur) => cur.filter((x) => x !== id)), []);

  const value = useMemo(() => ({ ids, hydrated, has, toggle, remove }), [ids, hydrated, has, toggle, remove]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
