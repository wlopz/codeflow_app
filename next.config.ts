import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pino', 'pino-pretty'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
        port: "",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        port: "",
      },
    ]
  }
};

export default nextConfig;
