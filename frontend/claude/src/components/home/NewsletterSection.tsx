import { NewsletterForm } from "./NewsletterForm";

export function NewsletterSection({ title, description }: { title: string; description: string }) {
  return (
    <section aria-labelledby="newsletter-heading" className="container">
      <div className="relative overflow-hidden rounded-card border border-line bg-white px-6 py-12 text-center sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-primary/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full border border-primary/10" aria-hidden />
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-primary">Newsletter</p>
        <h2 id="newsletter-heading" className="mt-3 font-serif text-3xl text-ink sm:text-[42px]">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">{description}</p>
        <NewsletterForm className="mx-auto mt-7 max-w-md text-left" />
      </div>
    </section>
  );
}
