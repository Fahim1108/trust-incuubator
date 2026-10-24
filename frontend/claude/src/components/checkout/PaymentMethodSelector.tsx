import { Banknote, CreditCard } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PaymentMethod } from "@/types";

export function PaymentMethodSelector({ value, onChange, onlineEnabled }: { value: PaymentMethod; onChange: (m: PaymentMethod) => void; onlineEnabled: boolean }) {
  const options = [
    { id: "cod" as const, title: "Cash on Delivery", description: "Pay in cash when you receive your order.", Icon: Banknote, disabled: false },
    { id: "online" as const, title: "Online Payment", description: onlineEnabled ? "bKash, Nagad, cards" : "bKash, Nagad & cards — coming soon", Icon: CreditCard, disabled: !onlineEnabled },
  ];
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-ink">Payment Method</legend>
      <div className="space-y-2.5" role="radiogroup">
        {options.map(({ id, title, description, Icon, disabled }) => {
          const active = value === id;
          return (
            <label
              key={id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-card border p-4 transition-colors",
                active ? "border-primary bg-selected/60" : "border-line hover:border-ink/30",
                disabled && "cursor-not-allowed opacity-60 hover:border-line",
              )}
            >
              <input type="radio" name="payment" value={id} checked={active} disabled={disabled} onChange={() => onChange(id)} className="h-4 w-4 accent-[rgb(var(--aa-primary))]" />
              <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-ink-muted")} strokeWidth={1.6} aria-hidden />
              <span className="flex-1">
                <span className="block text-sm font-medium text-ink">{title}</span>
                <span className={cn("block text-xs", disabled ? "text-primary" : "text-ink-muted")}>{description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
