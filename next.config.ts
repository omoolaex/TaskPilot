import type { NextConfig } from "next";
import type { Configuration, ExternalItem } from "webpack";

// Dynamically import because next-pwa uses CommonJS
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable in dev to avoid HMR issues
});

const nextConfig: NextConfig & { webpack?: (config: Configuration) => Configuration } = {
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  reactStrictMode: true,

  webpack(config) {
    // Disable exprContextCritical warnings
    if (config.module) {
      config.module.exprContextCritical = false;
    }

    // Ensure externals is an array
    if (!config.externals) {
      config.externals = [];
    } else if (!Array.isArray(config.externals)) {
      config.externals = [config.externals] as ExternalItem[];
    }

    // Add external to handle ws in supabase/realtime-js for Node
    config.externals.push(
      (
        data: { context: string; request: string },
        callback: (err?: Error | null, result?: any) => void
      ) => {
        if (
          data.context.includes("node_modules/@supabase/realtime-js") &&
          data.request === "ws"
        ) {
          return callback(null, "commonjs ws");
        }
        callback();
      }
    );

    return config;
  },
};

export default withPWA(nextConfig);
