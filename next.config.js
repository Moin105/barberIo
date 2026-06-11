/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["pg", "bcryptjs"],
    // Next 14 caches client navigations to dynamic routes for 30s by default,
    // which makes pages like /my-bookings show stale data after the user books
    // somewhere else and returns. 0 means: always re-fetch on navigation.
    staleTimes: { dynamic: 0, static: 180 },
  },
};
module.exports = nextConfig;
