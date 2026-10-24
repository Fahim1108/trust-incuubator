import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function CheckoutSteps({ steps, current, onStepClick }: { steps: string[]; current: number; onStepClick?: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Checkout progress">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-2 last:flex-none">
            <button
              type="button"
              disabled={!done || !onStepClick}
              onClick={() => onStepClick?.(i)}
              aria-current={active ? "step" : undefined}
              className="flex items-center gap-2 disabled:cursor-default"
            >
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", active ? "bg-primary text-white" : done ? "bg-selected text-primary" : "border border-line text-ink-muted")}>
                {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
              </span>
              <span className={cn("text-xs sm:inline sm:text-sm", active ? "font-medium text-primary" : "hidden text-ink-muted")}>{s}</span>
            </button>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-line" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
