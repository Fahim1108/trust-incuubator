import { AttiresArenaLoader } from "./AttiresArenaLoader";

/** Non-modal fallback: shared navigation stays usable while a route streams. */
export function RouteLoading() {
  return (
    <div className="flex min-h-[128px] items-center justify-center py-6" data-route-loader>
      <AttiresArenaLoader size="lg" label="Loading page content" />
    </div>
  );
}
