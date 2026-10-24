import { discountPercent, formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Price({ price, compareAt, size = "md", showBadge = false, accent = false, className }: { price: number; compareAt?: number; size?: "sm" | "md" | "lg"; showBadge?: boolean; accent?: boolean; className?: string }) {
  const off = discountPercent(price, compareAt);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("font-semibold", accent ? "text-primary" : "text-ink", size === "lg" ? "text-3xl font-medium text-primary" : size === "md" ? "text-sm" : "text-xs")}>
        <span className="sr-only">Price: </span>
        {formatPrice(price)}
      </span>
      {off > 0 && (
        <>
          <span className={cn("text-ink-muted line-through", size === "lg" ? "text-lg" : "text-xs")}>
            <span className="sr-only">Original price: </span>
            {formatPrice(compareAt!)}
          </span>
          {showBadge && <span className="self-center rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">{off}% OFF</span>}
        </>
      )}
    </div>
  );
}
