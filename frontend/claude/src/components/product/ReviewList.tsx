"use client";

import { BadgeCheck, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, DemoNotice, Modal, Rating, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types";

export function ReviewList({ reviews, average, count }: { reviews: Review[]; average: number; count: number }) {
  const [filter, setFilter] = useState<number | null>(null);
  const [writeOpen, setWriteOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const distribution = useMemo(() => [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => r.rating === star).length })), [reviews]);
  const shown = filter ? reviews.filter((r) => r.rating === filter) : reviews;

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-heading" className="font-serif text-3xl text-ink">
          Customer Reviews
        </h2>
        <Button variant="outline" size="sm" onClick={() => setWriteOpen(true)}>
          Write a Review
        </Button>
      </div>
      <DemoNotice className="mt-4">Sample reviews for interface demonstration — not real customer feedback.</DemoNotice>

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div>
          <p className="font-serif text-5xl text-ink">{average.toFixed(1)}</p>
          <Rating value={average} className="mt-1" size="md" />
          <p className="mt-1 text-xs text-ink-muted">Based on {count} sample ratings</p>
          <ul className="mt-5 space-y-1.5">
            {distribution.map(({ star, n }) => (
              <li key={star}>
                <button
                  type="button"
                  onClick={() => setFilter((f) => (f === star ? null : star))}
                  aria-pressed={filter === star}
                  className={cn("flex w-full items-center gap-2 rounded px-1 py-0.5 text-xs", filter === star ? "bg-selected text-primary" : "text-ink-muted hover:text-ink")}
                >
                  <span className="w-3">{star}</span>
                  <Star className="h-3 w-3 fill-current" aria-hidden />
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <span className="block h-full bg-[#C9932E]" style={{ width: `${reviews.length ? (n / reviews.length) * 100 : 0}%` }} />
                  </span>
                  <span className="w-4 text-right">{n}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <ul className="divide-y divide-line">
          {shown.map((r) => (
            <li key={r.id} className="py-5 first:pt-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Rating value={r.rating} />
                <span className="text-xs text-ink-muted">{formatDate(r.createdAt)}</span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-ink">{r.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{r.body}</p>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                <span className="text-ink">{r.author}</span>
                {r.location && <span>· {r.location}</span>}
                {r.size && <span>· Size {r.size}</span>}
                {r.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-success">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Sample verified badge
                  </span>
                )}
              </p>
            </li>
          ))}
          {!shown.length && <li className="py-6 text-sm text-ink-muted">No reviews with this rating.</li>}
        </ul>
      </div>

      <Modal
        open={writeOpen}
        onClose={() => setWriteOpen(false)}
        title="Write a Review"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setWriteOpen(false)}>
              Close
            </Button>
            <Button disabled>Submit (backend required)</Button>
          </div>
        }
      >
        <DemoNotice force>Review submission needs the backend and a verified order. Nothing entered here is saved.</DemoNotice>
        <fieldset className="mt-4">
          <legend className="mb-2 text-sm text-ink">Your rating</legend>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} star${i > 1 ? "s" : ""}`} aria-pressed={rating === i} className="p-1">
                <Star className={cn("h-7 w-7", i <= rating ? "fill-[#C9932E] text-[#C9932E]" : "text-ink/20")} />
              </button>
            ))}
          </div>
        </fieldset>
        <Textarea label="Your review" placeholder="How was the fit, fabric and delivery?" wrapperClassName="mt-4" />
      </Modal>
    </section>
  );
}
