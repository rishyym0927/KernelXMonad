/** @type {import('next').NextConfig} */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const nextConfig = {
  webpack: (config: { plugins: any[]; experiments: any; }, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      // Copy WASM file to the server build directory
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(__dirname, 'node_modules/@parity/resolc/dist/resolc/resolc.wasm'),
              to: path.join(__dirname, '.next/server/vendor-chunks/resolc.wasm'),
            },
          ],
        })
      );
    }

    // Handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
  // Ensure WASM files are served properly
  async headers() {
    return [
      {
        source: '/(.*).wasm',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;