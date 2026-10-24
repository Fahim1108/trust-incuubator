import { FlaskConical } from "lucide-react";
import type { ReactNode } from "react";
import { demo } from "@/config";
import { cn } from "@/lib/cn";

/** Clearly marks frontend-only demonstrations. Toggle globally via `demo.showNotices`. */
export function DemoNotice({ children, className, force = false }: { children: ReactNode; className?: string; force?: boolean }) {
  if (!demo.showNotices && !force) return null;
  return (
    <div role="note" className={cn("flex items-start gap-2.5 rounded-control border border-warning/25 bg-warning/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-ink", className)}>
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
