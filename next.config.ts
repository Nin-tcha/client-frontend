import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [new URL("https://nin-tcha.github.io/**")]
  }
};

export default nextConfig;
