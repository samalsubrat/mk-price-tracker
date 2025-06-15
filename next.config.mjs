// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@supabase/realtime-js');
    }
    return config;
  },
};

export default nextConfig; 