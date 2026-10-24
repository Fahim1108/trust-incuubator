"use client";

import { useEffect, useState } from "react";
import { HomepageView, type HomepageData } from "@/components/home/HomepageView";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ThemeStyle } from "@/components/theme/ThemeStyle";
import { StorefrontProvider } from "@/context/StorefrontContext";
import type { StorefrontSettings } from "@/types";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "./preview-protocol";


/** Renders the homepage with settings streamed from the Appearance Editor (same-origin postMessage). */
export function PreviewClient({ initial, data }: { initial: StorefrontSettings; data: HomepageData }) {
  const [settings, setSettings] = useState(initial);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== PREVIEW_MESSAGE) return;
      setSettings(e.data.settings as StorefrontSettings);
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <StorefrontProvider settings={settings}>
      <ThemeStyle theme={settings.theme} />
      <Header />
      <main id="main">
        <HomepageView settings={settings} data={data} />
      </main>
      <Footer />
      <MobileBottomNav />
    </StorefrontProvider>
  );
}
