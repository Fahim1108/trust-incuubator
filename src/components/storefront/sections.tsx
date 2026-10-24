import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { ArrowRight, Mail, Phone } from "lucide-react";
export function BrandSection() {
  return (
    <section className="brand-section store-section" id="brands">
      <div className="section-heading">
        <h2>Shop by Brand</h2>
        <span className="small-label">Our selection is coming soon</span>
      </div>
      <div className="brand-empty">
        <p>Our brand collection is being curated.</p>
        <span>Published labels will appear here when available.</span>
      </div>
    </section>
  );
}
export function StoreFooter() {
  return (
    <footer className="store-footer" id="about">
      <div className="footer-brand">
        <Link href="/" className="brand-link" aria-label="Attires Arena home">
          <BrandLogo />
        </Link>
        <p>
          Style elevated. Everyday essentials.
          <br />A fashion destination for Bangladesh.
        </p>
      </div>
      <div>
        <h2>Explore</h2>
        <Link href="#categories">Shop by Category</Link>
        <Link href="#brands">Shop by Brand</Link>
        <Link href="#arrivals">New Arrivals</Link>
      </div>
      <div>
        <h2>Customer care</h2>
        <Link href="/account">Your account</Link>
        <a href="mailto:attiresarena664@gmail.com">
          <Mail size={13} /> attiresarena664@gmail.com
        </a>
        <a href="tel:+8801886456664">
          <Phone size={13} /> 01886456664
        </a>
      </div>
      <div className="footer-note">
        <h2>The next chapter in everyday style.</h2>
        <p>
          Our store is being prepared. Shopping, wishlist and checkout will open
          after the collection and commerce services are ready.
        </p>
        <Link href="/account">
          Explore your account <ArrowRight size={13} />
        </Link>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Attires Arena. All rights reserved.
        </span>
        <span>STYLE ELEVATED</span>
      </div>
    </footer>
  );
}
