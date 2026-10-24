import { Banknote, Gem, HeartHandshake, Truck } from "lucide-react";
import type { Metadata } from "next";
import { InfoHeader } from "@/components/info/InfoPage";
import { ButtonLink, SmartImage } from "@/components/ui";

export const metadata: Metadata = { title: "About Us" };

const values = [
  { Icon: Gem, title: "Considered quality", text: "Fabrics and finishes chosen to last through Bangladesh's heat, humidity and monsoon." },
  { Icon: HeartHandshake, title: "Honest pricing", text: "Premium style without inflated mark-ups. What you see is what you pay." },
  { Icon: Truck, title: "Nationwide delivery", text: "Delivered to all 64 districts, with free delivery on orders over ৳2,000." },
  { Icon: Banknote, title: "Pay on delivery", text: "Check your parcel first, then pay the rider. Simple and safe." },
];

export default function AboutPage() {
  return (
    <>
      <InfoHeader title="About Attires Arena" eyebrow="Our Story" intro="Timeless menswear and accessories for the modern Bangladeshi man — curated for everyday confidence." />
      <div className="container space-y-16 py-12">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-[#E2D8CB]">
            <SmartImage src="/images/banners/promo-tonal.svg" alt="Folded shirts in neutral tones" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="prose-policy">
            <h2 className="!mt-0">Style, elevated.</h2>
            <p>Attires Arena began with a simple idea: dressing well in Bangladesh shouldn&apos;t mean choosing between quality, comfort and price. We curate shirts, trousers, sneakers and accessories that work together — pieces you reach for again and again.</p>
            <p>Every item is selected for fit, fabric and finish, and photographed honestly so what arrives at your door matches what you saw on screen.</p>
          </div>
        </section>
        <section>
          <h2 className="mb-8 text-center font-serif text-3xl text-ink sm:text-4xl">What we stand for</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ Icon, title, text }) => (
              <li key={title} className="rounded-card border border-line p-6">
                <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-4 font-serif text-xl text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-card bg-primary-dark px-6 py-12 text-center text-white">
          <h2 className="font-serif text-3xl sm:text-4xl">Find your next favourite</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/70">Explore new arrivals and timeless essentials.</p>
          <ButtonLink href="/shop" variant="secondary" className="mt-6 border-white bg-white">
            Shop the Collection
          </ButtonLink>
        </section>
      </div>
    </>
  );
}
