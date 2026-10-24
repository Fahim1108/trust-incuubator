"use client";

import { Tag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export function CouponField() {
  const { coupon, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-control border border-success/30 bg-success/5 px-3 py-2.5 text-sm">
        <span className="flex items-center gap-2 text-success">
          <Tag className="h-4 w-4" aria-hidden />
          <span>
            <strong>{coupon.code}</strong> applied
          </span>
        </span>
        <button type="button" onClick={removeCoupon} className="rounded p-1 text-ink-muted hover:text-ink" aria-label="Remove coupon">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim()) return setMessage({ ok: false, text: "Enter a coupon code." });
        const r = applyCoupon(code);
        setMessage({ ok: r.ok, text: r.message });
        if (r.ok) setCode("");
      }}
    >
      <div className="flex gap-2">
        <label htmlFor="coupon" className="sr-only">
          Coupon code
        </label>
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="h-11 min-w-0 flex-1 rounded-control border border-line px-3.5 text-sm uppercase placeholder:normal-case placeholder:text-ink-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
        <button type="submit" className="h-11 rounded-control border border-primary px-5 text-sm font-medium text-primary hover:bg-selected">
          Apply
        </button>
      </div>
      {message && (
        <p role="status" className={message.ok ? "mt-1.5 text-xs text-success" : "mt-1.5 text-xs text-danger"}>
          {message.text}
        </p>
      )}
    </form>
  );
}
