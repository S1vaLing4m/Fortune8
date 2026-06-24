import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Turbopack to back off and let the old Node library run as-is
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;