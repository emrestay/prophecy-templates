import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@prophecy-templates/sdk"],
  webpack(config) {
    // The SDK uses .js extensions in ESM imports (e.g. "./chains.js").
    // Tell webpack to look for .ts/.tsx first when it sees a .js extension.
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
