import type { Product, ProductImage, ProductVariant } from "@/types";

export function imagesForColor(product: Product, colorId?: string): ProductImage[] {
  if (colorId && product.imagesByColor[colorId]?.length) return product.imagesByColor[colorId]!;
  return product.defaultImages;
}

export function findVariant(product: Product, colorId: string, size: string): ProductVariant | undefined {
  return product.variants.find((v) => v.colorId === colorId && v.size === size);
}

export function variantPrice(product: Product, variant?: ProductVariant): number {
  return variant?.price ?? product.price;
}

export function isSizeAvailable(product: Product, colorId: string, size: string): boolean {
  return (findVariant(product, colorId, size)?.stock ?? 0) > 0;
}

export function totalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function firstAvailableSize(product: Product, colorId: string): string | undefined {
  return product.sizes.find((s) => isSizeAvailable(product, colorId, s));
}

/** Builds a cart line (without quantity) from a product + selected variant. */
export function toCartLine(product: Product, variant: ProductVariant, brandName = "") {
  return {
    id: `${product.id}:${variant.id}`,
    productId: product.id,
    productSlug: product.slug,
    variantId: variant.id,
    name: product.name,
    brandName,
    image: imagesForColor(product, variant.colorId)[0] ?? { src: "", alt: product.name },
    colorName: product.colors.find((c) => c.id === variant.colorId)?.name ?? variant.colorId,
    size: variant.size,
    unitPrice: variantPrice(product, variant),
    compareAtPrice: product.compareAtPrice,
    maxQuantity: variant.stock,
  };
}
