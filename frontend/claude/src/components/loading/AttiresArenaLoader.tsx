"use client";
import { AttiresArenaLoader as LoaderVisual } from "./LoaderVisual";
export function AttiresArenaLoader({ active = true, fullScreen = false, size = "lg", label }: {
  active?: boolean;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  return <LoaderVisual active={active} fullScreen={fullScreen} size={size} label={label} logoSrc={size === "lg" ? "/brand/logo-loader-original.png" : "/brand/logo-white.png"} />;
}
