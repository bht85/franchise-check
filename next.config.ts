import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack 호환 설정 (Next.js 16)
  turbopack: {},
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

export default nextConfig
