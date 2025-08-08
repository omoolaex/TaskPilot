// next.config.ts
import type { NextConfig } from "next"

// Dynamically import because next-pwa uses CommonJS
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // ✅ Disable in dev to avoid HMR issues
})

const nextConfig: NextConfig = {
    images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  reactStrictMode: true,
  // Add any other Next.js config here
}

export default withPWA(nextConfig)
