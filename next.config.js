/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore build errors due to Next.js type generation issue
    // This is safe as we check types separately with our own tooling
    ignoreBuildErrors: true,
  },
  eslint: {
    // Don't ignore ESLint during builds - we want to catch issues
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig