import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Shirt, Footprints } from "lucide-react";
export function Campaign() {
  return (
    <section className="campaign-grid" aria-label="Style Elevated campaign">
      <div className="campaign-main">
        <Image
          src="/images/campaign.webp"
          alt="Editorial fashion portrait in a maroon overshirt"
          fill
          sizes="(max-width: 767px) 100vw, 70vw"
          preload
          className="campaign-photo"
        />
        <div className="campaign-shade" />
        <div className="campaign-copy">
          <p className="eyebrow">A NEW PERSPECTIVE</p>
          <h1>
            Style
            <br />
            <em>Elevated.</em>
          </h1>
          <p>
            Thoughtful details.
            <br />
            An effortless everyday.
          </p>
          <Link href="#arrivals" className="primary-button">
            Explore the collection <ArrowRight size={17} />
          </Link>
          <span className="campaign-caption">THE ATTIRES ARENA EDIT</span>
        </div>
      </div>
      <div className="campaign-side">
        <div className="editorial-panel">
          <span className="eyebrow">THE WARDROBE EDIT</span>
          <h2>
            Less effort.
            <br />
            <em>More you.</em>
          </h2>
          <p>Discover a considered approach to everyday dressing.</p>
          <Link href="#categories">
            Find your essentials <ArrowUpRight size={18} />
          </Link>
          <Shirt
            className="editorial-icon"
            strokeWidth={0.65}
            aria-hidden="true"
          />
        </div>
        <div className="small-editorial">
          <Footprints size={52} strokeWidth={1} aria-hidden="true" />
          <div>
            <span className="eyebrow">FROM THE GROUND UP</span>
            <h2>A fresh step.</h2>
            <Link href="/?category=sneakers#arrivals">
              Explore sneakers <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
