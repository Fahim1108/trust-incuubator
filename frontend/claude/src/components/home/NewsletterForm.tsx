"use client";

import { ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";
import { isValidEmail } from "@/lib/validation";
import { subscribeNewsletterAction } from "@/services/actions";
import { cn } from "@/lib/cn";

export function NewsletterForm({ tone = "light", className, compact = false }: { tone?: "light" | "dark"; className?: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dark = tone === "dark";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setStatus({ ok: false, text: "Please enter a valid email address." });
    startTransition(async () => {
      const res = await subscribeNewsletterAction(email);
      setStatus(res.ok ? { ok: true, text: "You're subscribed." } : { ok: false, text: res.message });
    });
  };

  return (
    <form onSubmit={submit} className={className} noValidate>
      <div className={cn("flex overflow-hidden rounded-control border", dark ? "border-white/25 bg-white/5" : "border-line bg-surface")}>
        <label htmlFor={`newsletter-${tone}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-${tone}`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className={cn("min-w-0 flex-1 bg-transparent px-4 text-sm focus:outline-none", compact ? "h-10 text-xs" : "h-12", dark ? "text-white placeholder:text-white/50" : "text-ink placeholder:text-ink-muted/70")}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn("inline-flex items-center gap-2 px-5 text-xs font-semibold transition-colors disabled:opacity-60", !compact && "uppercase tracking-wider", dark ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-white hover:bg-primary-dark")}
        >
          Subscribe {!compact && <ArrowRight className="h-3.5 w-3.5" aria-hidden />}
        </button>
      </div>
      {status && (
        <p role="status" className={cn("mt-2 text-xs", status.ok ? (dark ? "text-white" : "text-success") : dark ? "text-[#FFD8D8]" : "text-warning")}>
          {status.text}
        </p>
      )}
    </form>
  );
}
