/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: false,
  typescript: {
    // We already use strict TypeScript checks
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
