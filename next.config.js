/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Image remote patterns for any external images
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
    ],
  },
  // Optimize font loading with next/font when needed
  // Keep Google Fonts in HTML for design fidelity
  async rewrites() {
    return [
      {
        source: '/case-study.html',
        destination: '/case-study',
      },
    ];
  },
};

module.exports = nextConfig;
