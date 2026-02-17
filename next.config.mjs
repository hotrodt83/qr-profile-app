/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent build from being killed during static generation (fixes Vercel SIGTERM)
  staticPageGenerationTimeout: 180,
}
export default nextConfig
