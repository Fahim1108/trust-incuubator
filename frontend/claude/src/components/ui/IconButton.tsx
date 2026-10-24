import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  badge?: number;
}

/** 44×44 touch target icon button with optional count badge. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ label, badge, className, children, type = "button", ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={badge ? `${label} (${badge})` : label}
      className={cn("relative inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", className)}
      {...props}
    >
      {children}
      {badge ? (
        <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </button>
  );
});
