/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    domains: ['firebasestorage.googleapis.com'],
  },
  // Removed 'output: export' to support dynamic API routes and server-side rendering
  webpack: (config, { dev }) => {
    // Add Babel configuration
    config.module.rules.push({
      test: /\.js$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-private-methods', '@babel/plugin-proposal-class-properties']
          }
        }
      ]
    });

    // Disable cache in development to prevent issues
    if (dev) {
      config.cache = false;
    }

    return config;
  }
};

module.exports = nextConfig;