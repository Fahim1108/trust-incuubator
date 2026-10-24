import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      {icon && <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-selected text-primary">{icon}</div>}
      <h2 className="font-serif text-2xl text-ink sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
