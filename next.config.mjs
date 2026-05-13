/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Cloudflare R2 public URLs (dynoblog 공유 버킷 포함 모든 r2.dev 서브도메인)
      { protocol: "https", hostname: "*.r2.dev" },
      // R2 custom domains (사용 시)
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;
