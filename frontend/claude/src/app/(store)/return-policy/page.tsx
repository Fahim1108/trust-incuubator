import type { Metadata } from "next";
import { HelpAside, PolicyArticle } from "@/components/info/InfoPage";
import { policyPages } from "@/content/policies";

const page = policyPages["return-policy"]!;

export const metadata: Metadata = { title: page.title, description: page.intro };

export default function Page() {
  return <PolicyArticle page={page} aside={<HelpAside />} />;
}
