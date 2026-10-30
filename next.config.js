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
  // Static images, video, and fonts in /public rarely change. Let browsers
  // reuse them for a week, then revalidate in the background.
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
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
