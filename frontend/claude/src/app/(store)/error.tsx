"use client";

import { TriangleAlert } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container py-10">
      <EmptyState icon={<TriangleAlert className="h-7 w-7" />} title="Something went wrong" description="We couldn't load this page. Please try again." action={<Button onClick={reset}>Try again</Button>} />
    </div>
  );
}
