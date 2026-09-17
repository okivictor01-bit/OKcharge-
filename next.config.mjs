/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: 'output: export' has been removed. 
  // It must be removed to allow API routes (like /api/verify-payment) to work.
  
  images: {
    domains: ['api.qrserver.com'],
  },
}

export default nextConfig
