import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "150mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "progressive.lk",
      },
      // Allow S3/MinIO images from any hostname that might be configured
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      }
    ],
  },
  // Add rewrites for backwards compatibility with old upload URLs
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
      {
        source: "/s3-storage/:path*",
        destination: "http://minio:9000/:path*",
      },
    ];
  },
  // Optimize output for production
  output: "standalone",
};

export default nextConfig;
