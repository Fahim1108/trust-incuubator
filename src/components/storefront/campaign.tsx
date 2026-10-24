"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Pause, Play } from "lucide-react";
const campaigns = [
  {
    photo: "photo-main",
    title: ["STYLE", "ELEVATED"],
    copy: "Timeless fashion for the modern you.",
    href: "#arrivals",
  },
  {
    photo: "photo-tailoring",
    title: ["NEW", "ARRIVALS"],
    copy: "A fresh perspective on everyday style.",
    href: "#arrivals",
  },
  {
    photo: "photo-official-cover",
    title: ["ATTIRES", "ARENA"],
    copy: "Style elevated. Our official collection cover.",
    href: "#arrivals",
  },
];
export function Campaign() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (preference.matches) setPaused(true);
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || hovered || focused) return;
    const interval = window.setInterval(() => {
      if (!document.hidden)
        setActive((index) => (index + 1) % campaigns.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [paused, hovered, focused]);
  const campaign = campaigns[active];
  return (
    <section
      className="campaign-grid"
      aria-label="Style Elevated campaign"
      aria-roledescription="carousel"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div
        className={`campaign-main official-campaign${active === 2 ? " is-cover" : ""}`}
      >
        <div className="campaign-stage">
          {active === 2 ? (
            <>
              <h1
                className="sr-only"
                aria-live={paused || focused ? "polite" : "off"}
              >
                ATTIRES ARENA
              </h1>
              <Image
                src="/images/cover pic copy.jpg"
                alt="ATTIRES ARENA — STYLE ELEVATED. Official cover with the original brand lettering, fashion photography and contact details."
                fill
                sizes="(max-width: 767px) 100vw, 72vw"
                preload
                className="official-cover"
              />
            </>
          ) : (
            <>
              <div
                className={`campaign-photo photo-tile ${campaign.photo}`}
                role="img"
                aria-label={`Fashion editorial: ${campaign.title.join(" ")}`}
              />
              <div className="campaign-shade" />
              <div className="campaign-copy">
                <p className="eyebrow">
                  {active === 0 ? "NEW SEASON" : "THE ATTIRES ARENA EDIT"}
                </p>
                <h1 aria-live={paused || focused ? "polite" : "off"}>
                  {campaign.title[0]}
                  <br />
                  {campaign.title[1]}
                </h1>
                <p>{campaign.copy}</p>
                <Link href={campaign.href} className="primary-button">
                  SHOP NOW <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="campaign-toolbar">
          <button
            className="slideshow-toggle"
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <Link href={campaign.href}>
            Explore the collection <ArrowRight size={15} />
          </Link>
          <div
            className="campaign-dots"
            role="group"
            aria-label="Campaign slides"
          >
            {campaigns.map((item, index) => (
              <button
                key={item.photo}
                aria-label={`Show campaign ${index + 1}: ${item.title.join(" ")}`}
                aria-pressed={active === index}
                onClick={() => setActive(index)}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="campaign-side">
        <div className="editorial-panel">
          <div
            className="photo-tile photo-tailoring"
            role="img"
            aria-label="Neutral tailoring editorial"
          />
          <div className="side-copy">
            <h2>
              New
              <br />
              Arrivals
            </h2>
            <Link href="#arrivals">
              EXPLORE <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="small-editorial">
          <div
            className="photo-tile photo-footwear"
            role="img"
            aria-label="White sneakers editorial"
          />
          <div className="side-copy">
            <h2>
              Essential
              <br />
              Footwear
            </h2>
            <Link href="/?category=sneakers#arrivals">
              SHOP NOW <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
export function PromotionalBanners() {
  return (
    <section className="promotional-grid" aria-label="The seasonal edit">
      <article className="promotional-card">
        <div
          className="photo-tile photo-knitwear"
          role="img"
          aria-label="Folded knitwear editorial"
        />
        <div className="side-copy">
          <h2>Tonal Essentials</h2>
          <p>
            Minimal collection for
            <br />
            maximum style.
          </p>
          <Link className="outline-button" href="#categories">
            DISCOVER <ArrowRight size={14} />
          </Link>
        </div>
      </article>
      <article className="promotional-card">
        <div
          className="photo-tile photo-tailoring"
          role="img"
          aria-label="Everyday tailoring editorial"
        />
        <div className="side-copy">
          <h2>Everyday Comfort</h2>
          <p>Elevated style for daily moments.</p>
          <Link className="outline-button" href="#arrivals">
            SHOP NOW <ArrowRight size={14} />
          </Link>
        </div>
      </article>
    </section>
  );
}
