/** Shared CSS/JS durations. No timing token delays data or navigation. */
export const motion = {
  fast: 150,
  normal: 220,
  slow: 350,
  reveal: 350,
  loader: 1600,
  panel: 280,
  hero: 600,
} as const;
export const motionEase = "cubic-bezier(0.22, 1, 0.36, 1)";
export const motionVariables = `:root{${Object.entries(motion).map(([key, value]) => `--motion-${key}:${value}ms`).join(";")};--motion-ease:${motionEase}}`;
