"use client";
import { AttiresArenaLoader as SharedLoader } from "../../../../../src/components/ui/AttiresArenaLoader";
export function AttiresArenaLoader({
  active = true,
  fullScreen = false,
}: {
  active?: boolean;
  fullScreen?: boolean;
}) {
  return (
    <SharedLoader
      active={active}
      fullScreen={fullScreen}
      logoSrc="/brand/logo-loader-original.png"
    />
  );
}
