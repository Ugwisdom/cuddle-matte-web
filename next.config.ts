import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ensure Turbopack uses this folder as the workspace root.
  // This silences the warning about Next.js inferring the wrong workspace root
  // when multiple lockfiles are present on parent folders.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
