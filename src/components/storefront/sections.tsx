import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function BrandSection() {
  return (
    <section className="brand-section store-section" id="brands">
      <div>
        <p className="eyebrow">DISCOVER SOMETHING DISTINCTIVE</p>
        <h2>Good style has a story.</h2>
        <p>
          Our brand selection is being prepared.
          <br />
          Discover the labels we offer here when they launch.
        </p>
      </div>
      <div className="brand-outline">
        <span>THE BRAND EDIT</span>
        <span>
          Coming into focus <ArrowUpRight size={20} />
        </span>
      </div>
    </section>
  );
}
export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="footer-brand">
        <span className="brand-name">ATTIRES ARENA</span>
        <p>
          Premium fashion.
          <br />A fresh perspective.
        </p>
      </div>
      <div>
        <h2>Discover</h2>
        <Link href="#categories">Our categories</Link>
        <Link href="#brands">The brand edit</Link>
        <Link href="#arrivals">New arrivals</Link>
      </div>
      <div>
        <h2>Here for you</h2>
        <Link href="/account">Your account</Link>
        <Link href="#about">Our story</Link>
        <p>
          Shopping and checkout
          <br />
          are not available yet.
        </p>
      </div>
      <div className="footer-note">
        <h2>From Bangladesh, with style.</h2>
        <p>
          A considered collection is on its way.
          <br />
          Thank you for being here from the start.
        </p>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Attires Arena</span>
        <span>STYLE ELEVATED</span>
      </div>
    </footer>
  );
}
