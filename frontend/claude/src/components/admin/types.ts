import type { StorefrontSettings } from "@/types";

/** Mutate a draft copy of the settings; the editor clones before calling. */
export type Updater = (mutate: (draft: StorefrontSettings) => void) => void;

export interface PanelProps {
  settings: StorefrontSettings;
  update: Updater;
}
