// next.config.js
const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Alias problematic lit reactive-element paths used by phosphor-icons
  webpack: (config, { isServer }) => {
    // Resolve the standard package location
    config.resolve.alias['@lit/reactive-element'] = path.resolve(
      __dirname,
      'node_modules/@lit/reactive-element'
    );
    // Alias the pnpm intermediate path to the same location
    const problematic = path.resolve(
      __dirname,
      'node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element'
    );
    config.resolve.alias[problematic] = path.resolve(
      __dirname,
      'node_modules/@lit/reactive-element'
    );
    // Alias .mjs files to their .js implementations
    config.resolve.alias['@lit/reactive-element/reactive-element.mjs'] = path.resolve(
      __dirname,
      'node_modules/@lit/reactive-element/reactive-element.js'
    );
    config.resolve.alias['@lit/reactive-element/decorators/property.mjs'] = path.resolve(
      __dirname,
      'node_modules/@lit/reactive-element/decorators/property.js'
    );
    return config;
  },
  // Ensure production build works with Next.js 14
  output: 'standalone',
};
module.exports = nextConfig;
