/** Safe localStorage helpers — never throw (private mode, SSR, quota). */
export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  cart: "aa.claude-preview.cart.v1",
  cartSeeded: "aa.claude-preview.cart.seeded.v1",
  wishlist: "aa.claude-preview.wishlist.v1",
  recentSearches: "aa.claude-preview.search.recent.v1",
} as const;
