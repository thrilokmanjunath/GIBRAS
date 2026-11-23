/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Native Next.js App Router API routes (/app/api/v1/...) serve all endpoints
  // without relying on external host proxying.
  ...(process.env.PROXY_TO_FASTAPI === 'true'
    ? {
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: 'http://127.0.0.1:8050/api/:path*',
            },
          ]
        },
      }
    : {}),
}

module.exports = nextConfig
