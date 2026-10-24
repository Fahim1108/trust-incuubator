import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui";
import type { PolicyPage } from "@/content/policies";
import { formatDate } from "@/lib/format";

export function InfoHeader({ title, intro, eyebrow }: { title: string; intro?: string; eyebrow?: string }) {
  return (
    <header className="border-b border-line bg-[#FAF9F8]">
      <div className="container py-10 sm:py-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
        {eyebrow && <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">{eyebrow}</p>}
        <h1 className="mt-3 font-serif text-4xl text-ink sm:text-[56px] sm:leading-none">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-muted">{intro}</p>}
      </div>
    </header>
  );
}

export function PolicyArticle({ page, aside }: { page: PolicyPage; aside?: ReactNode }) {
  return (
    <>
      <InfoHeader title={page.title} intro={page.intro} />
      <div className="container grid gap-10 py-10 lg:grid-cols-[1fr_300px]">
        <article className="prose-policy max-w-3xl">
          <p className="!text-xs">Last updated {formatDate(page.updated)}</p>
          {page.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.body?.map((p) => <p key={p}>{p}</p>)}
              {s.list && (
                <ul>
                  {s.list.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
        {aside}
      </div>
    </>
  );
}

export function HelpAside() {
  return (
    <aside className="h-fit rounded-card border border-line p-6 lg:sticky lg:top-28">
      <h2 className="font-serif text-2xl text-ink">Need help?</h2>
      <p className="mt-2 text-sm text-ink-muted">Our team is available Saturday to Thursday, 10 AM – 8 PM.</p>
      <a href="/contact" className="mt-4 inline-flex h-11 items-center rounded-control bg-primary px-5 text-sm font-medium text-white hover:bg-primary-dark">
        Contact Us
      </a>
    </aside>
  );
}
