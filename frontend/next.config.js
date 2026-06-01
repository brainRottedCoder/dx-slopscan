/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Netlify/Vercel; standalone when DOCKER_BUILD=1 (see frontend/Dockerfile)
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
