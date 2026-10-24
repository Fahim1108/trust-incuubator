import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "primary" | "soft" | "neutral" | "success" | "warning" | "outline" | "dark";

const tones: Record<Tone, string> = {
  primary: "bg-primary text-white",
  soft: "bg-selected text-primary",
  neutral: "bg-ink/5 text-ink",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  outline: "border border-line text-ink-muted bg-surface",
  dark: "bg-ink text-white",
};

export function Badge({ tone = "primary", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", tones[tone], className)}>{children}</span>;
}
