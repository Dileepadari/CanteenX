import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/:path*', // Adjust 'backend' to your backend service name
      },
    ];
  },
};

export default nextConfig;
