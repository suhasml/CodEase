// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   devIndicators: {
//     buildActivity: false,
//   },
//   eslint: {
//     // This disables ESLint during production builds
//     ignoreDuringBuilds: true,
//   },
//   output: 'standalone',
// };

// export default nextConfig;

import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import webpack from 'webpack';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: false,
  },
  eslint: {
    // This disables ESLint during production builds
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // Ensure client-side libs are transpiled for modern Next.js bundler
  transpilePackages: ['hashconnect', '@hashgraph/sdk'],

  webpack: (config) => {
    // Polyfills for browser compatibility (HashConnect + Hedera SDK)
    config.resolve = config.resolve || { fallback: {} } as any;
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      process: require.resolve('process/browser'),
    };

    config.plugins = config.plugins || [];
    config.plugins.push(
      new (webpack as any).ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: ['process'],
      })
    );

    return config;
  },

  async redirects() {
    return [
      {
        source: '/whitepaper',
        destination: '/whitepaper.pdf',
        permanent: true, // Set to true if this is a permanent redirect
      },
    ];
  },
};

export default nextConfig;