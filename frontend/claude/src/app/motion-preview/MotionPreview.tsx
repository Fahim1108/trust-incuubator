"use client";

import { OrderTimeline } from "@/components/account/OrderTimeline";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AttiresArenaLoader } from "@/components/loading/AttiresArenaLoader";
import { Button } from "@/components/ui/Button";

const examples = [{ size: "sm", pixels: 24 }, { size: "md", pixels: 40 }, { size: "lg", pixels: 80 }] as const;

export function MotionPreview() {
  const [active, setActive] = useState(false);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function demonstrate() {
    if (timer.current) return;
    setFinished(false);
    setActive(true);
    // Deliberate demonstration time ONLY on this non-production route.
    timer.current = setTimeout(() => {
      setActive(false);
      setFinished(true);
      timer.current = null;
    }, 3000);
  }

  return (
    <main id="main" className="mx-auto max-w-3xl space-y-6 bg-white px-5 py-8 text-[#171717]">
      <Link href="/" className="text-sm text-primary underline">Back to storefront</Link>
      <h1 className="font-display text-3xl">Loading animation preview</h1>
      <p className="text-sm text-ink-muted">Development demonstration only. The official logo stays still while its ring rotates. Reduced-motion preferences stop rotation.</p>
      {(["white", "burgundy"] as const).map(surface => (
        <section key={surface} aria-label={`${surface} loader examples`} data-demo-surface={surface}
          className={`rounded-lg border border-[#EAEAEA] p-5 ${surface === "burgundy" ? "bg-[#400000] text-white" : "bg-white"}`}>
          <h2 className="mb-5 text-sm font-semibold">{surface === "white" ? "White background" : "Burgundy background"}</h2>
          <div className="grid grid-cols-3 items-end gap-4">
            {examples.map(({ size, pixels }) => (
              <div key={size} className="flex flex-col items-center gap-4">
                <AttiresArenaLoader size={size} label={`${pixels}px loader on ${surface}`} />
                <span className="text-xs">{pixels}px</span>
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="space-y-3">
        <Button onClick={demonstrate} disabled={active}>Test Loading Animation</Button>
        <p className="text-sm text-ink-muted">Shows an overlay for three seconds. Real storefront requests have no artificial delay.</p>
        <p role="status" className="min-h-5 text-sm" data-demo-result>{finished ? "Demonstration finished. Storefront interactions use their actual pending state." : ""}</p>
      </div>
      <section className="space-y-5 border-t border-line pt-6" aria-label="Tracking component test">
        <h2 className="font-display text-2xl">Tracking animation test</h2>
        <p className="text-sm text-ink-muted">Isolated component fixture. This is not a customer order or shipment.</p>
        <OrderTimeline status="shipped" events={[
          {status:"pending",label:"Order Placed",at:"2026-10-20T09:00:00Z"},
          {status:"confirmed",label:"Order Confirmed",at:"2026-10-20T10:00:00Z"},
          {status:"packed",label:"Processing",at:"2026-10-21T10:00:00Z"},
          {status:"shipped",label:"Shipped",at:"2026-10-22T10:00:00Z"},
        ]}/>
      </section>
      <AttiresArenaLoader active={active} fullScreen label="Loading animation demonstration" />
    </main>
  );
}
