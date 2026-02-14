/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  env: {
    NEXT_PUBLIC_DEV_MODE:
      process.env.DEV_MODE ||
      process.env.NEXT_PUBLIC_DEV_MODE ||
      (process.env.NODE_ENV === "development" && !process.env.VERCEL ? "true" : ""),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;
