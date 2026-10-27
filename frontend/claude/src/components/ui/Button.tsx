import Link from "next/link";
import { PendingIndicator } from "@/components/ui/LoadingSkeleton";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Trailing icons (arrows) slide 5px right on hover/focus. */
function ArrowSlot({ children }: { children: ReactNode }) {
  return <span className="aa-arrow">{children}</span>;
}

export type ButtonVariant = "primary" | "burgundy" | "secondary" | "outline" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "aa-button aa-press group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-sm",
  burgundy: "bg-[#400000] text-white hover:bg-[#560000] shadow-sm",
  secondary: "bg-selected text-primary hover:bg-primary/10 border border-primary/20",
  outline: "border border-ink/80 text-ink hover:bg-ink hover:text-white",
  ghost: "text-ink hover:bg-ink/5",
  link: "text-primary underline-offset-4 hover:underline px-0 h-auto",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs rounded-control",
  md: "h-11 px-5 text-sm rounded-control",
  lg: "h-12 px-7 text-sm tracking-wide rounded-control",
};

export function buttonClasses({ variant = "primary", size = "md", fullWidth, className }: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string } = {}) {
  return cn(base, variants[variant], variant !== "link" && sizes[size], fullWidth && "w-full", className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, fullWidth, loading, leftIcon, rightIcon, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
      <span className={cn("inline-flex items-center justify-center gap-2", loading && "opacity-0")}>
        {leftIcon}{children}{rightIcon && <ArrowSlot>{rightIcon}</ArrowSlot>}
      </span>
      {loading && <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center"><PendingIndicator label="Working" /></span>}
    </button>
  );
});

interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
}

export function ButtonLink({ href, variant, size, fullWidth, className, children, leftIcon, rightIcon, onClick }: ButtonLinkProps) {
  return (
    <Link href={href} onClick={onClick} className={buttonClasses({ variant, size, fullWidth, className })}>
      {leftIcon}
      {children}
      {rightIcon && <ArrowSlot>{rightIcon}</ArrowSlot>}
    </Link>
  );
}
