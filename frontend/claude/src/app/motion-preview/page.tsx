import { notFound } from "next/navigation";
import intake from "@/data/inventory/thrift-shirts.json";
import { ScrollShowcase } from "./ScrollShowcase";
import { MotionPreview } from "./MotionPreview";

export const metadata = { title: "Motion Atelier | Attires Arena", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function MotionPreviewPage({searchParams}:{searchParams:Promise<{lab?:string}>}) {
  // NODE_ENV=production also builds Vercel Previews, so gate on the deployment
  // environment and the existing explicit design-preview flag instead.
  if (process.env.CLAUDE_DESIGN_PREVIEW !== "1" || process.env.VERCEL_ENV === "production") notFound();
  if ((await searchParams).lab === "components") return <MotionPreview />;
  return <ScrollShowcase products={intake.slice(0,8).map(row=>({id:row.source_id,name:row.name,image:row.image_path,priceMinor:row.price_minor}))} />;
}
