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
  // Common auth URLs used in email templates and docs. Redirects run before
  // middleware and browsers keep the #fragment, so recovery tokens survive.
  async redirects() {
    return [
      {
        source: '/admin/reset-password',
        destination: '/admin/set-password',
        permanent: false,
      },
      {
        source: '/admin/update-password',
        destination: '/admin/account',
        permanent: false,
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
