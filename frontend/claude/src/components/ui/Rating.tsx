import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function Rating({ value, count, size = "sm", className }: { value: number; count?: number; size?: "sm" | "md"; className?: string }) {
  const px = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn(px, i <= Math.round(value) ? "fill-[#C9932E] text-[#C9932E]" : "fill-ink/10 text-ink/10")} />
        ))}
      </div>
      <span className="text-xs text-ink-muted">
        <span className="sr-only">Rated </span>
        <span className="font-medium text-ink">{value.toFixed(1)}</span>
        {count !== undefined && <> ({count} reviews)</>}
      </span>
    </div>
  );
}
