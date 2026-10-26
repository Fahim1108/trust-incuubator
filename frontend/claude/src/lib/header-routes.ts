/** Segment-aware header policy; transactional/account pages keep navigation without search. */
const COMPACT_ROOTS = new Set([
  'account', 'auth', 'login', 'register', 'registration', 'signup', 'profile',
  'forgot-password', 'reset-password', 'checkout', 'order-review', 'orders',
  'order', 'payment', 'payments', 'cod-payment', 'online-payment',
  'order-confirmation', 'confirmation',
]);

export function usesCompactHeader(pathname: string): boolean {
  const firstSegment = pathname.split('/').find(Boolean);
  return firstSegment !== undefined && COMPACT_ROOTS.has(firstSegment);
}
