/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for Cloudflare Pages static build
  images: {
    domains: ['api.qrserver.com'],
  },
}

export default nextConfig
