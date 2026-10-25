"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./AttiresArenaLoader.module.css";

type LoaderProps = {
  size?: "sm" | "md" | "lg";
  active?: boolean;
  fullScreen?: boolean;
  logoSrc?: string;
  label?: string;
};
const overlays: HTMLElement[] = [];
const blocked = new WeakMap<
  HTMLElement,
  { count: number; wasInert: boolean }
>();

/** Route fallbacks unmount immediately when ready. Only an aria-hidden,
 * non-interactive visual copy survives for the short exit fade. No delay gates content. */
function fadeOut(node: HTMLElement) {
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !node.animate
  )
    return;
  const ghost = node.cloneNode(true) as HTMLElement;
  ghost.setAttribute("aria-hidden", "true");
  ghost.removeAttribute("role");
  ghost.removeAttribute("tabindex");
  ghost.removeAttribute("data-aa-loader");
  ghost.dataset.aaLoaderExit = "true";
  ghost
    .querySelectorAll("[role]")
    .forEach((element) => element.removeAttribute("role"));
  ghost.style.pointerEvents = "none";
  ghost.inert = true;
  document.body.append(ghost);
  const animation = ghost.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 140,
    easing: "ease-out",
    fill: "forwards",
  });
  void animation.finished.then(
    () => ghost.remove(),
    () => ghost.remove(),
  );
}

export function AttiresArenaLoader({
  active = true,
  fullScreen = false,
  logoSrc = "/images/BRAND-LOGO.png",
  label = "Loading Attires Arena",
  size = "lg",
}: LoaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!active || !fullScreen || !node) return;
    const previousFocus = document.activeElement;
    const touched: HTMLElement[] = [];
    let branch: HTMLElement = node;
    while (branch.parentElement && branch !== document.body) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (
          !(sibling instanceof HTMLElement) ||
          sibling === branch ||
          ["SCRIPT", "STYLE", "LINK"].includes(sibling.tagName)
        )
          continue;
        const state = blocked.get(sibling) ?? {
          count: 0,
          wasInert: sibling.inert,
        };
        state.count += 1;
        blocked.set(sibling, state);
        sibling.inert = true;
        touched.push(sibling);
      }
      branch = branch.parentElement;
    }
    const overflow = document.body.style.overflow;
    const padding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbar)
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbar}px`;
    document.body.style.overflow = "hidden";
    overlays.push(node);
    node.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab" && overlays.at(-1) === node) {
        event.preventDefault();
        node.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      const index = overlays.indexOf(node);
      if (index >= 0) overlays.splice(index, 1);
      for (const element of touched) {
        const state = blocked.get(element);
        if (!state) continue;
        state.count -= 1;
        if (!state.count) {
          element.inert = state.wasInert;
          blocked.delete(element);
        }
      }
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = padding;
      if (
        !overlays.length &&
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected &&
        !previousFocus.closest("[inert]")
      )
        previousFocus.focus({ preventScroll: true });
      if (!node.isConnected) fadeOut(node);
    };
  }, [active, fullScreen]);
  if (!active) return null;
  return (
    <div
      ref={ref}
      tabIndex={fullScreen ? -1 : undefined}
      className={`${styles.loader} ${styles[size]} ${fullScreen ? styles.fullscreen : styles.inline}`}
      data-loader-size={size}
      data-aa-loader={fullScreen ? "overlay" : "inline"}
    >
      <div className={styles.art} aria-hidden="true">
        <svg
          className={styles.ring}
          viewBox="0 0 185 185"
          fill="none"
          data-loader-ring
        >
          <circle
            cx="92.5"
            cy="92.5"
            r="90.5"
            stroke="#6B0202"
            strokeWidth="4"
            strokeDasharray="480 89"
          />
        </svg>
        <div className={styles.badge} data-loader-badge>
          <Image
            className={styles.logo}
            src={logoSrc}
            alt=""
            width={540}
            height={540}
            unoptimized
            data-loader-logo
          />
        </div>
      </div>
      <span
        className={styles.status}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {label}
      </span>
    </div>
  );
}
