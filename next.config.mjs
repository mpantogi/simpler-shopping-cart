/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

    return [
      {
        source: "/api/:path*", // Calls to /api/... on your Next app
        destination: `${baseURL}/:path*`, // Proxies to the Docker API (or other service)
      },
    ];
  },
};

export default nextConfig;
