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
};

module.exports = nextConfig;
