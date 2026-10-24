import Image from "next/image";

// Use the supplied artwork, including its original lettering. The surrounding
// empty canvas is clipped in CSS; no part of the symbol or wordmark is cropped.
export function BrandLogo() {
  return (
    <span className="brand-logo">
      <Image
        src="/images/BRAND-LOGO.jpg"
        alt="ATTIRES ARENA — official logo and original wordmark"
        width={540}
        height={540}
        unoptimized
        className="brand-logo-image"
      />
    </span>
  );
}
