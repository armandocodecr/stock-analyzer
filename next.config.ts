import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://static2.finnhub.io/**")],
  },
  reactCompiler: true,
};

export default nextConfig;
