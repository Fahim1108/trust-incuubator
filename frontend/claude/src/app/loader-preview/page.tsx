"use client";
import { useState } from "react";
import { AttiresArenaLoader } from "@/components/loading/AttiresArenaLoader";
export default function LoaderPreview() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function loadBrandAsset() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/brand/logo-loader-original.png", {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Brand asset could not be loaded");
      await response.blob();
      setMessage("Brand asset loaded. The real network request has finished.");
    } catch {
      setMessage("The request failed. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <main id="main" className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-xl font-semibold">Attires Arena loader preview</h1>
      <p className="mt-3 text-sm text-ink-muted">
        The inline example demonstrates the animation. The button shows an
        overlay only while a real brand-image request is pending. No minimum
        loading time is added.
      </p>
      <AttiresArenaLoader />
      <button
        className="rounded border border-primary bg-primary px-5 py-3 text-white"
        disabled={pending}
        onClick={loadBrandAsset}
      >
        Load brand asset
      </button>
      <p className="mt-4 text-sm" data-loader-result>
        {message}
      </p>
      <AttiresArenaLoader active={pending} fullScreen />
    </main>
  );
}
