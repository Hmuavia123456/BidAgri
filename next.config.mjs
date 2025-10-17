/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/signup", destination: "/buyers#register", permanent: true },
      { source: "/auth/signup", destination: "/buyers#register", permanent: true },
    ];
  },
  images: {
    domains: [
      "res.cloudinary.com",
      "images.unsplash.com",
      "cdn.pixabay.com",
      "plus.unsplash.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
  },
  eslint: {
    // Ignore ESLint errors during `next build` to allow production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
