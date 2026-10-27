/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  experimental: { optimizePackageImports: ['lucide-react'] },
  turbopack: { root: __dirname },
};

module.exports = nextConfig;
