import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Pre-rendered device PNGs live in /public/renders and are already sized;
    // serve them directly rather than through the optimizer.
    unoptimized: true,
  },
};

export default nextConfig;
