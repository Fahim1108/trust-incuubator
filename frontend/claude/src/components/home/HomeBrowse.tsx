import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { BrandWordmark } from "@/components/brand/BrandCard";
import { SmartImage } from "@/components/ui";
import type { Brand, Category } from "@/types";
import styles from "./HomeBrowse.module.css";

export function HomeCategories({ categories }: { categories: Category[] }) {
  return (
    <ul className={styles.categories}>
      {categories.map((category) => {
        const image = category.thumbnail ?? category.image;
        return (
          <li key={category.id}>
            <Link href={`/category/${category.slug}`} className={styles.category}>
              <span className={styles.photo}>
                <SmartImage src={image.src} alt="" fill sizes="(min-width: 768px) 16vw, 33vw" className="object-cover" />
              </span>
              <span className={styles.caption}>
                {category.name}
                <span className={styles.arrow}><ChevronRight size={13} aria-hidden /></span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function HomeBrands({ brands }: { brands: Brand[] }) {
  return (
    <ul className={styles.brands}>
      {brands.slice(0, 10).map((brand) => (
        <li key={brand.id}>
          <Link href={`/brand/${brand.slug}`} aria-label={brand.name} className={styles.brand}>
            {brand.logo ? (
              <span className={styles.brandLogo}>
                <SmartImage src={brand.logo.src} alt={brand.name} fill sizes="(min-width: 768px) 18vw, 30vw" className="object-contain" />
              </span>
            ) : (
              <BrandWordmark brand={brand} compact className={styles.wordmark} />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
