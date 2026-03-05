import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "5000" },
      { protocol: "https", hostname: "teer.club" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
    minimumCacheTTL: 86400, // 24 hours
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5000/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://127.0.0.1:5000/uploads/:path*",
      },
      {
        source: "/blog-images/:path*",
        destination: "http://127.0.0.1:5000/blog-images/:path*",
      },
      {
        source: "/shares/:path*",
        destination: "http://127.0.0.1:5000/shares/:path*",
      },
    ];
  },
};

export default nextConfig;

