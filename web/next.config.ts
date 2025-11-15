import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  async redirects() {
    return [
      {
        source: '/tools',
        destination: '/browse',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
