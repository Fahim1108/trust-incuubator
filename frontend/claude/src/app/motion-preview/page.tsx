import { notFound } from "next/navigation";
import { MotionPreview } from "./MotionPreview";

export const dynamic = "force-dynamic";

export default function MotionPreviewPage() {
  // NODE_ENV=production also builds Vercel Previews, so gate on the deployment
  // environment and the existing explicit design-preview flag instead.
  if (process.env.CLAUDE_DESIGN_PREVIEW !== "1" || process.env.VERCEL_ENV === "production") notFound();
  return <MotionPreview />;
}
