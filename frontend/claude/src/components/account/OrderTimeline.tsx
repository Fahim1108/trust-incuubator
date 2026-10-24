import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import type { OrderTimelineEvent } from "@/types";

export function OrderTimeline({ events }: { events: OrderTimelineEvent[] }) {
  return (
    <ol className="relative space-y-6">
      {events.map((e, i) => {
        const done = Boolean(e.at);
        const cancelled = e.status === "cancelled";
        const isLastDone = done && !events[i + 1]?.at;
        return (
          <li key={`${e.status}-${i}`} className="relative flex gap-4">
            {i < events.length - 1 && <span className={cn("absolute left-[13px] top-7 h-[calc(100%+0.5rem)] w-px", done && events[i + 1]?.at ? "bg-primary" : "bg-line")} aria-hidden />}
            <span
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                cancelled ? "border-danger bg-danger text-white" : done ? "border-primary bg-primary text-white" : "border-line bg-surface",
                isLastDone && !cancelled && "ring-4 ring-primary/15",
              )}
            >
              {done && <Check className="h-3.5 w-3.5" aria-hidden />}
            </span>
            <div className="pt-0.5">
              <p className={cn("text-sm font-medium", done ? "text-ink" : "text-ink-muted")}>{e.label}</p>
              {e.at && <p className="text-xs text-ink-muted">{formatDateTime(e.at)}</p>}
              {e.description && <p className="mt-0.5 text-xs text-ink-muted">{e.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
