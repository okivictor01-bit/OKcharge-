/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable API routes for static export
  // We'll handle this differently
};

module.exports = nextConfig;
