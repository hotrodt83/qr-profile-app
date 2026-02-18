/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent build from being killed during static generation (fixes Vercel SIGTERM)
  staticPageGenerationTimeout: 180,
  // Reduce memory pressure during build (helps avoid OOM on Vercel)
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
}
export default nextConfig
