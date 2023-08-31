/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        "fs": false,
        "net": false,
        "tls": false
      }
    }
    return config
  },
  images: {
    domains: ['localhost', 'evermore-merchant.s3.eu-west-3.amazonaws.com', 'cdn.shopify.com'],
  },
}

module.exports = nextConfig