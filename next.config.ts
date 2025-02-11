import type { NextConfig } from "next";
// import path from 'path'
const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    styledComponents: true,
  },
  // webpack: config => {
  //   config.resolve.alias['@'] = path.resolve(__dirname);
  //   return config;
  // },
  // async redirects() {
  //   return [
  //     // Basic redirect
  //     {
  //       source: '/about',
  //       destination: '/',
  //       permanent: true,
  //     },
  //     // Wildcard path matching
  //     {
  //       source: '/blog/:slug',
  //       destination: '/news/:slug',
  //       permanent: true,
  //     },
  //   ]
  // },
};

export default nextConfig;
