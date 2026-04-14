import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

// Load env from monorepo root so `npm run dev` works.
loadEnvConfig(path.resolve(process.cwd(), ".."), process.env.NODE_ENV !== "production");

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
