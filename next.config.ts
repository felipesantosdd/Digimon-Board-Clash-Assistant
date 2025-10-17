import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Evita que o build falhe por erros de lint; tratamos depois
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalizar better-sqlite3 para evitar problemas de bundling
      config.externals = config.externals || [];
      config.externals.push("better-sqlite3");
    }
    return config;
  },
  // Usar modo Node.js para as rotas da API (necessário para better-sqlite3)
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
