import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  output: "standalone",
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
