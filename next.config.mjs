/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent build from being killed during static generation (fixes Vercel SIGTERM)
  staticPageGenerationTimeout: 180,
  // Allow Supabase Storage avatars (for next/image if used elsewhere; public profile uses <img>)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" && process.env.NEXT_PUBLIC_SUPABASE_URL
          ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
          : "placeholder.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  // Reduce memory pressure during build (helps avoid OOM on Vercel)
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config, { isServer }) => {
    // face-api.js / node-fetch pull in fs/encoding; not used in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        encoding: false,
      };
    }
    return config;
  },
}
export default nextConfig
