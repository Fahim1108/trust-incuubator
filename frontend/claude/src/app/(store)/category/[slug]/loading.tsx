import { ProductGridSkeleton, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="container py-8">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-5 h-10 w-64" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
