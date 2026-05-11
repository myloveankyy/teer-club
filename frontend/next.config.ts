import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // Performance: Enable compression and optimize output
  compress: true,

  // Remove X-Powered-By header
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "teer.club",
      },
    ],
  },

  // Proxy sitemaps directly to the backend which generates and serves them
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/sitemap.xml`
      },
      {
        source: "/sitemap-:type.xml",
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/sitemap-:type.xml`
      }
    ];
  },

  // Consolidate duplicate routing to prevent SEO indexation issues
  async redirects() {
    return [
      // ── Core route consolidation ──
      {
        source: "/results/:market/live",
        destination: "/live/:market",
        permanent: true, // 301 Redirect for SEO consolidation
      },
      {
        source: "/:marketSlug/previous-results",
        destination: "/results/:marketSlug/previous-results",
        permanent: true,
      },

      // ── Fix ghost market URLs (bare /{MarketName} has no page.tsx → 404) ──
      // These were in old sitemaps and GSC discovered them. Must 301 to valid pages.
      { source: "/Shillong", destination: "/live/shillong", permanent: true },
      { source: "/shillong", destination: "/live/shillong", permanent: true },
      { source: "/Khanapara", destination: "/live/khanapara", permanent: true },
      { source: "/khanapara", destination: "/live/khanapara", permanent: true },
      { source: "/Arunachal", destination: "/live/arunachal", permanent: true },
      { source: "/arunachal", destination: "/live/arunachal", permanent: true },
      { source: "/Ladrymbai", destination: "/live/jowai-ladrymbai", permanent: true },
      { source: "/ladrymbai", destination: "/live/jowai-ladrymbai", permanent: true },
      { source: "/Juwai", destination: "/live/juwai", permanent: true },
      { source: "/juwai", destination: "/live/juwai", permanent: true },
      { source: "/Laitlyngkot", destination: "/live/laitlyngkot", permanent: true },
      { source: "/laitlyngkot", destination: "/live/laitlyngkot", permanent: true },
      { source: "/Manipur", destination: "/live/manipur", permanent: true },
      { source: "/manipur", destination: "/live/manipur", permanent: true },
      { source: "/Bhutan", destination: "/live/bhutan-day", permanent: true },
      { source: "/bhutan", destination: "/live/bhutan-day", permanent: true },
      { source: "/bhutan-day", destination: "/live/bhutan-day", permanent: true },

      // ── Fix legacy broken paths from old sitemap ──
      { source: "/dream-numbers", destination: "/dreams", permanent: true },

      // ── Fix case-sensitivity: uppercase result paths → lowercase ──
      { source: "/results/Shillong/:path*", destination: "/results/shillong/:path*", permanent: true },
      { source: "/results/Khanapara/:path*", destination: "/results/khanapara/:path*", permanent: true },
    ];
  },
  // Headers: Security, caching, and performance
  async headers() {
    return [
      {
        // Security headers for all routes EXCEPT /widget (which needs iframe access)
        source: "/((?!widget).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        // Cache static assets aggressively (hashed filenames)
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache images
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=43200",
          },
        ],
      },
      {
        // Cache fonts
        source: "/(.*)\\.woff2",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
