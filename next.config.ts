import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/math-kids',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
