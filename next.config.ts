import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack 호환 설정 (Next.js 16)
  turbopack: {},
  devIndicators: false,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001', 'fc-check.shop', 'www.fc-check.shop'],
    },
  },
  // Allow Cloudflare tunnel hostnames for dev mode
  allowedDevOrigins: ['fc-check.shop', 'www.fc-check.shop'],
}

export default nextConfig
