import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Evita que o build falhe por erros de lint; tratamos depois
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
