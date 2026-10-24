import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Trailing icons (arrows) slide 5px right on hover/focus. */
function ArrowSlot({ children }: { children: ReactNode }) {
  return <span className="inline-flex transition-transform duration-300 ease-out group-hover/btn:translate-x-[5px] group-focus-visible/btn:translate-x-[5px]">{children}</span>;
}

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-sm",
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
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden /> : leftIcon}
      {children}
      {!loading && rightIcon && <ArrowSlot>{rightIcon}</ArrowSlot>}
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
