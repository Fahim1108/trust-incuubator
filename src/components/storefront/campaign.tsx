"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    photo: "photo-footwear",
    title: ["A FRESH", "STEP"],
    copy: "The finishing touch to your everyday.",
    href: "/?category=sneakers#arrivals",
  },
];
export function Campaign() {
  const [active, setActive] = useState(0);
  const campaign = campaigns[active];
  return (
    <section className="campaign-grid" aria-label="Style Elevated campaign">
      <div className="campaign-main">
        <div
          className={`campaign-photo photo-tile ${campaign.photo}`}
          role="img"
          aria-label={`Fashion editorial: ${campaign.title.join(" ")}`}
        />
        <div className="campaign-shade" />
        <div className="campaign-copy">
          <p className="eyebrow">NEW SEASON</p>
          <h1 aria-live="polite">
            {campaign.title[0]}
            <br />
            {campaign.title[1]}
          </h1>
          <p>{campaign.copy}</p>
          <Link href={campaign.href} className="primary-button">
            SHOP NOW <ArrowRight size={16} />
          </Link>
          <div className="campaign-bottom">
            <span>
              Thoughtful details <i /> Curated style <i /> Everyday essentials
            </span>
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
