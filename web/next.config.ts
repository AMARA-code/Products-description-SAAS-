import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

// Load env for both workspace and monorepo root.
// `process.cwd()` differs depending on how the dev script is launched.
const devMode = process.env.NODE_ENV !== "production";
loadEnvConfig(process.cwd(), devMode);
loadEnvConfig(path.resolve(process.cwd(), ".."), devMode);

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
