/** Server environment only: a flag, cookie, query string or hostname cannot override Production. */
export function isProductionStorefront(): boolean {
  return process.env.VERCEL_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV);
}
export function reviewInventoryEnabled(): boolean {
  return !isProductionStorefront() && process.env.CLAUDE_DESIGN_PREVIEW === '1' &&
    (!process.env.VERCEL_ENV || ['preview', 'development'].includes(process.env.VERCEL_ENV));
}
export function storefrontEnabled(): boolean {
  return isProductionStorefront() || reviewInventoryEnabled();
}
export function isPreviewOnlyPath(path: string): boolean {
  return ['/motion-preview', '/loader-preview'].some(p => path === p || path.startsWith(p + '/'));
}
