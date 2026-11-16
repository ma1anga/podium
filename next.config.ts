import type { NextConfig } from 'next';

const basePath = '/podium';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  devIndicators: false,
  agentRules: false,
  // Keep the artifact consumed by the existing GitHub Pages workflow.
  distDir: 'dist',
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
