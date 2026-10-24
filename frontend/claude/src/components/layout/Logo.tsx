"use client";

import Image from "next/image";
import Link from "next/link";
import { useStorefront } from "@/context/StorefrontContext";
import { cn } from "@/lib/cn";

/** Official logo. Source files and sizes are configured in src/config/brand.ts. */
export function Logo({ variant = "primary", className, priority, small }: { variant?: "primary" | "inverse"; className?: string; priority?: boolean; small?: boolean }) {
  const { logo, siteName } = useStorefront();
  const src = variant === "inverse" ? logo.inverse : logo.primary;
  return (
    <Link href="/" className={cn("inline-flex flex-col items-center", className)} aria-label={`${siteName} — home`}>
      <Image
        src={src}
        alt={logo.alt}
        width={312}
        height={300}
        priority={priority}
        className={small ? "h-12 w-auto" : "h-[var(--logo-h-m)] w-auto lg:h-[var(--logo-h-d)]"}
        style={{ "--logo-h-m": `${logo.heightMobile}px`, "--logo-h-d": `${logo.heightDesktop}px` } as React.CSSProperties}
      />
      {logo.showWordmarkText && <span className={cn("mt-1 font-serif text-sm tracking-[0.2em]", variant === "inverse" ? "text-white" : "text-primary")}>{siteName.toUpperCase()}</span>}
    </Link>
  );
}
