import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  async headers() { return [{source:"/:path*",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"X-Frame-Options",value:"DENY"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"X-Robots-Tag",value:"noindex, nofollow"}]}]; },
  images: {
    // Placeholder artwork ships as local SVG. When real product photography is
    // served from Supabase Storage / a CDN, add its host to `remotePatterns`.
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [],
  },
};

export default nextConfig;
